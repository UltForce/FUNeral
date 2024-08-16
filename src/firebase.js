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
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase configuration for the main app
const firebaseConfig = {
  apiKey: "AIzaSyBBJDmeNnG_9fF2QXadjQ6imZYIcg-_yaY",
  authDomain: "funeral-e5a57.firebaseapp.com",
  projectId: "funeral-e5a57",
  storageBucket: "funeral-e5a57.appspot.com",
  messagingSenderId: "601009835586",
  appId: "1:601009835586:web:0485ee22862be0c34ea7db",
  measurementId: "G-5TB63CLGD3",
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

// Function to create a new appointment
const createAppointment = async (userId, appointmentData) => {
  try {
    // Add the userId to the appointment data
    appointmentData.userId = userId;
    appointmentData.status = appointmentData.status || "pending"; // Set default value to "pending" if status is not provided
    // Create a new document in the "appointments" collection
    const appointmentRef = await addDoc(
      collection(dba, "appointments"),
      appointmentData
    );

    // Get the ID of the newly created appointment document
    const appointmentId = appointmentRef.id;

    // Add the appointmentId to the appointment data
    appointmentData.appointmentId = appointmentId;

    // Update the appointment document with the appointmentId
    await updateDoc(appointmentRef, { appointmentId: appointmentId });

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
};
