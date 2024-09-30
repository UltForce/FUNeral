// firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  where,
  query,
} from "firebase/firestore";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase configuration for the main app
const firebaseConfig = {
  apiKey: "AIzaSyDWwBbQ29OasLNPDgJyuct1X55gkiNXGYI",
  authDomain: "funeral-81aff.firebaseapp.com",
  projectId: "funeral-81aff",
  storageBucket: "funeral-81aff.appspot.com",
  messagingSenderId: "938666208645",
  appId: "1:938666208645:web:5afa1086623efe668268ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(); // Get authentication instance directly using getAuth
const dba = getFirestore(); // Use dba as Firestore instance

const getCurrentUserId = () => {
  // Check if a user is currently signed in
  const user = auth.currentUser;

  // If a user is signed in, return the user's UID (user ID)
  // If no user is signed in, return null or handle it according to your app logic
  return user ? user.uid : null;
};

// Function to retrieve the user's role from Firestore
const getUserRoleFirestore = async (userId) => {
  try {
    // Construct reference to the user document
    const userDocRef = doc(dba, "users", userId);

    // Get user document snapshot
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Extract user data and return the user's role (default to "user" if not present)
      const userData = userDocSnapshot.data();
      return userData.role || "user"; // Return the user's role, defaulting to "user" if not present
    } else {
      console.error("User document not found in Firestore.");
      return "user"; // Default to "user" role if the document doesn't exist
    }
  } catch (error) {
    console.error("Error fetching user role from Firestore:", error.message);
    throw error; // You can handle this error in the calling code
  }
};

const createAppointment = async (userId, appointmentData) => {
  try {
    const storage = getStorage();
    let deathCertificateURL = "";

    // Check if a DeathCertificate file is provided
    if (appointmentData.DeathCertificate) {
      const file = appointmentData.DeathCertificate;
      const storageRef = ref(
        storage,
        `deathCertificates/${userId}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      deathCertificateURL = await getDownloadURL(storageRef);
    }

    // Add the userId and deathCertificateURL to the appointment data
    appointmentData.userId = userId;
    appointmentData.DeathCertificate = deathCertificateURL;
    appointmentData.status = appointmentData.status || "pending"; // Set default value to "pending" if status is not provided

    // Create a new document in the "appointments" collection
    const appointmentRef = await addDoc(
      collection(dba, "appointments"),
      appointmentData
    );

    // Get the ID of the newly created appointment document
    const appointmentId = appointmentRef.id;

    // Update the appointment data with the appointmentId
    await updateDoc(appointmentRef, { appointmentId });

    console.log("Appointment created successfully with ID: ", appointmentId);
  } catch (error) {
    console.error("Error creating appointment:", error.message);
  }
};
const getUserAppointments = async (userId) => {
  try {
    // Query the "appointments" collection where userId matches the logged-in user's ID
    const appointmentsQuery = query(
      collection(dba, "appointments"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(appointmentsQuery);
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return appointments;
  } catch (error) {
    console.error("Error getting user appointments:", error.message);
    return [];
  }
};
// Function to get appointments with both pending and approved status
const getAppointmentsWithStatus = async (status) => {
  try {
    // Query the "appointments" collection where status is the specified status
    const appointmentsQuery = query(
      collection(dba, "appointments"),
      where("status", "==", status)
    );
    const snapshot = await getDocs(appointmentsQuery);
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return appointments;
  } catch (error) {
    console.error(`Error getting ${status} appointments:`, error.message);
    return [];
  }
};

// Function to get both pending and approved appointments
const getApprovedAppointments = async () => {
  try {
    // Fetch both pending and approved appointments separately
    const pendingAppointments = await getAppointmentsWithStatus("pending");
    const approvedAppointments = await getAppointmentsWithStatus("approved");

    // Combine both lists of appointments
    const allAppointments = [...pendingAppointments, ...approvedAppointments];

    return allAppointments;
  } catch (error) {
    console.error("Error getting approved appointments:", error.message);
    return [];
  }
};

// Function to retrieve all appointments
const getAllAppointments = async () => {
  try {
    // Query the "appointments" collection where status is approved
    const appointmentsQuery = query(collection(dba, "appointments"));
    const snapshot = await getDocs(appointmentsQuery);
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return appointments;
  } catch (error) {
    console.error("Error getting approved appointments:", error.message);
    return [];
  }
};

const getAllUsers = async () => {
  try {
    // Query the "appointments" collection
    const usersQuery = collection(dba, "users");
    const snapshot = await getDocs(usersQuery);
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error getting appointments:", error.message);
    return [];
  }
};

const getAllData = async () => {
  try {
    const dataQuery = collection(dba, "users", "appointments");
    const snapshot = await getDocs(dataQuery);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error getting appointments:", error.message);
    return [];
  }
};
const getUserData = async (userId) => {
  try {
    // Construct reference to the user document
    const userDocRef = doc(dba, "users", userId);

    // Get user document snapshot
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Return user data
      return userDocSnapshot.data();
    } else {
      console.error("User document not found in Firestore.");
      return null; // Return null if user document doesn't exist
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error.message);
    throw error; // You can handle this error in the calling code
  }
};

const getData = async () => {
  const data = await getAllData();
  return data;
};

const getUsers = async () => {
  const users = await getAllUsers();
  return users;
};

const getAppointments = async () => {
  const appointments = await getAllAppointments();
  return appointments;
};

// Function to update an appointment
const updateAppointment = async (userId, appointmentId, newData) => {
  try {
    // Construct the reference to the appointment document
    const appointmentDocRef = doc(dba, "appointments", appointmentId);

    // Update the appointment document with the new data
    await updateDoc(appointmentDocRef, newData);

    console.log("Appointment updated successfully!");
  } catch (error) {
    console.error("Error updating appointment:", error.message);
  }
};

const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    // Construct the reference to the appointment document
    const appointmentDocRef = doc(dba, "appointments", appointmentId);

    // Update the appointment document with the new status
    await updateDoc(appointmentDocRef, { status: newStatus });

    console.log("Appointment updated successfully!");
  } catch (error) {
    console.error("Error updating appointment:", error.message);
  }
};

// Function to delete an appointment
const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentDocRef = doc(dba, "appointments", appointmentId);
    await deleteDoc(appointmentDocRef);
    console.log("Appointment deleted successfully!");
  } catch (error) {
    console.error("Error deleting appointment:", error.message);
  }
};

const generateReports = async () => {
  try {
    // Query the appointments collection
    const appointmentsQuery = await getDocs(collection(dba, "appointments"));

    // Extract appointment data from query snapshot
    const appointmentsData = appointmentsQuery.docs.map((doc) => doc.data());

    // Query the users collection
    const usersQuery = await getDocs(collection(dba, "users"));

    // Extract user data from query snapshot
    const usersData = usersQuery.docs.map((doc) => doc.data());

    // Define Excel workbook and worksheets
    const wb = XLSX.utils.book_new();
    const appointmentsWs = XLSX.utils.json_to_sheet(appointmentsData);
    const usersWs = XLSX.utils.json_to_sheet(usersData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, appointmentsWs, "Appointments");
    XLSX.utils.book_append_sheet(wb, usersWs, "Users");
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Convert Excel buffer to Blob
    const excelBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    // Save Blob as Excel file
    saveAs(excelBlob, "reports.xlsx");

    console.log("Reports generated successfully");
  } catch (error) {
    console.error("Error generating reports:", error.message);
  }
};

const AuditLogger = async ({ event }) => {
  try {
    console.log("Event object:", event); // Log the event object
    if (!event || !event.type || !event.userId || !event.details) {
      throw new Error("Invalid event object");
    }
    // Log the event by adding a document to the "auditLogs" collection
    const auditLogRef = await addDoc(collection(dba, "auditLogs"), {
      eventType: event.type,
      userId: event.userId,
      timestamp: new Date(),
      details: event.details,
    });

    console.log("Audit log added successfully with ID: ", auditLogRef.id);
  } catch (error) {
    console.error("Error adding audit log:", error.message);
  }
};

// Retrieve the email of the appointment owner using userId
const getUserEmail = async (userId) => {
  try {
    const userDoc = await getDoc(doc(dba, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().email;
    } else {
      throw new Error("User document not found");
    }
  } catch (error) {
    console.error("Error getting user email:", error.message);
    throw error;
  }
};

// Function to retrieve the user email using userID
const getUserEmailById = async (userId) => {
  try {
    // Get the user document based on the userID
    const userDoc = await getDoc(doc(dba, "users", userId));

    if (userDoc.exists()) {
      // Return the email from the user document
      return userDoc.data().email;
    } else {
      console.error("User document not found for userID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error getting user email by ID:", error.message);
    throw error;
  }
};

// Function to add an inventory item
const addInventoryItem = async (itemData) => {
  try {
    // Create a new document in the "inventory" collection
    const inventoryRef = await addDoc(collection(dba, "inventory"), itemData);
    console.log("Inventory item added successfully with ID: ", inventoryRef.id);
  } catch (error) {
    console.error("Error adding inventory item:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to get all inventory items
const getInventoryItems = async () => {
  try {
    // Query the "inventory" collection
    const snapshot = await getDocs(collection(dba, "inventory"));
    const inventoryItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return inventoryItems;
  } catch (error) {
    console.error("Error getting inventory items:", error.message);
    return []; // Return an empty array in case of error
  }
};

// Function to update an inventory item
const updateInventoryItem = async (itemId, newData) => {
  try {
    // Construct the reference to the inventory item document
    const itemDocRef = doc(dba, "inventory", itemId);

    // Update the inventory item document with the new data
    await updateDoc(itemDocRef, newData);
    console.log("Inventory item updated successfully!");
  } catch (error) {
    console.error("Error updating inventory item:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to delete an inventory item
const deleteInventoryItem = async (itemId) => {
  try {
    // Construct the reference to the inventory item document
    const itemDocRef = doc(dba, "inventory", itemId);

    // Delete the inventory item document
    await deleteDoc(itemDocRef);
    console.log("Inventory item deleted successfully!");
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to get published testimonials
const getPublishedTestimonials = async () => {
  try {
    const testimonialsQuery = query(
      collection(dba, "testimonials"),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(testimonialsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching published testimonials:", error.message);
    return [];
  }
};

const submitTestimonialFirestore = async (testimonialData) => {
  try {
    await addDoc(collection(dba, "testimonials"), testimonialData);
    console.log("Testimonial submitted successfully!");
  } catch (error) {
    console.error("Error submitting testimonial:", error.message);
  }
};

// Function to get reviews
const getReviewsFirestore = async () => {
  try {
    const reviewsQuery = collection(dba, "testimonials");
    const snapshot = await getDocs(reviewsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching testimonials:", error.message);
    return [];
  }
};

// Function to update review status
const updateReviewStatusFirestore = async (reviewId, newStatus) => {
  try {
    const reviewDocRef = doc(dba, "testimonials", reviewId);
    await updateDoc(reviewDocRef, { status: newStatus });
    console.log("Testimonial status updated successfully!");
  } catch (error) {
    console.error("Error updating testimonial status:", error.message);
  }
};

// Function to delete a review
const deleteReviewFirestore = async (reviewId) => {
  try {
    const reviewDocRef = doc(dba, "testimonials", reviewId);
    await deleteDoc(reviewDocRef);
    console.log("Review deleted successfully!");
  } catch (error) {
    console.error("Error deleting testimonial:", error.message);
  }
};

export const addContent = async (contentData) => {
  try {
    const docRef = await addDoc(collection(dba, "content"), contentData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding content: ", e);
    throw new Error("Failed to add content");
  }
};

export const getContent = async () => {
  const contentCollection = collection(dba, "content");
  const contentSnapshot = await getDocs(contentCollection);
  return contentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateContent = async (contentId, updatedData) => {
  const contentRef = doc(dba, "content", contentId);
  try {
    await updateDoc(contentRef, updatedData);
  } catch (e) {
    console.error("Error updating content: ", e);
    throw new Error("Failed to update content");
  }
};

export const deleteContent = async (contentId) => {
  try {
    await deleteDoc(doc(dba, "content", contentId));
  } catch (e) {
    console.error("Error deleting content: ", e);
    throw new Error("Failed to delete content");
  }
};

const getUserDetails = async (userId) => {
  try {
    const userDocRef = doc(dba, "users", userId);
    const userDocSnapshot = await getDoc(userDocRef);
    return userDocSnapshot.exists() ? userDocSnapshot.data() : null;
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    return null;
  }
};

export {
  getAuth,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getUserRoleFirestore,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateEmail,
  createAppointment,
  getUserAppointments,
  getApprovedAppointments,
  updateAppointment,
  deleteAppointment,
  dba,
  where,
  query,
  getFirestore,
  getDocs,
  collection,
  getAllAppointments,
  getCurrentUserId,
  generateReports,
  getAllUsers,
  getUsers,
  getAppointments,
  getData,
  getAllData,
  getUserData,
  AuditLogger,
  getUserEmail,
  getUserEmailById,
  getStorage,
  getAppointmentsWithStatus,
  updateAppointmentStatus,
  addInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  getPublishedTestimonials,
  submitTestimonialFirestore,
  getReviewsFirestore,
  updateReviewStatusFirestore,
  deleteReviewFirestore,
  getUserDetails,
};
