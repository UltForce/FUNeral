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
  Timestamp,
} from "firebase/firestore";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // For handling table data
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Firebase configuration for the main app
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
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
        `deathCertificates/${userId}/deathcertificate`
      );
      await uploadBytes(storageRef, file);
      deathCertificateURL = await getDownloadURL(storageRef);
    }

    // Add the userId and deathCertificateURL to the appointment data
    appointmentData.userId = userId;
    appointmentData.DeathCertificate = deathCertificateURL;
    appointmentData.status = appointmentData.status || "pending"; // Set default value to "pending" if status is not provided
    appointmentData.isArchived = false; // Default isArchived to false

    // Create a new document in the "appointments" collection
    const appointmentRef = await addDoc(
      collection(dba, "appointments"),
      appointmentData
    );

    // Get the ID of the newly created appointment document
    const appointmentId = appointmentRef.id;

    // Update the appointment data with the appointmentId
    await updateDoc(appointmentRef, { appointmentId });

    //console.log("Appointment created successfully with ID: ", appointmentId);
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
    return null;
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
  const appointmentsRef = collection(dba, "appointments"); // Reference to the appointments collection
  const q = query(appointmentsRef, where("isArchived", "==", false)); // Query to filter out archived appointments
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const fetchArchivedData = async () => {
  try {
    const archivedData = {
      appointments: [],
      transactions: [],
    };

    // Fetch archived appointments
    const appointmentsSnapshot = await getDocs(
      query(collection(dba, "appointments"), where("isArchived", "==", true))
    );
    appointmentsSnapshot.forEach((doc) => {
      archivedData.appointments.push({ id: doc.id, ...doc.data() });
    });

    // Fetch archived transactions
    const transactionsSnapshot = await getDocs(
      query(collection(dba, "transactions"), where("isArchived", "==", true))
    );
    transactionsSnapshot.forEach((doc) => {
      archivedData.transactions.push({ id: doc.id, ...doc.data() });
    });

    return archivedData;
  } catch (error) {
    console.error("Error fetching archived data:", error.message);
    return { appointments: [], transactions: [] };
  }
};

// Function to update an appointment
const updateAppointment = async (userId, appointmentId, newData) => {
  try {
    // Construct the reference to the appointment document
    const appointmentDocRef = doc(dba, "appointments", appointmentId);

    // Update the appointment document with the new data
    await updateDoc(appointmentDocRef, newData);

    //console.log("Appointment updated successfully!");
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

    //console.log("Appointment updated successfully!");
  } catch (error) {
    console.error("Error updating appointment:", error.message);
  }
};

const deleteAppointment = async (appointmentId) => {
  try {
    // Get the appointment document reference
    const appointmentDocRef = doc(dba, "appointments", appointmentId);
    const appointmentSnapshot = await getDoc(appointmentDocRef);

    // Check if the appointment document exists
    if (!appointmentSnapshot.exists()) {
      console.log("Appointment does not exist.");
      return;
    }

    const appointmentData = appointmentSnapshot.data();

    // If there's a death certificate URL, delete the file from Firebase Storage
    if (appointmentData.DeathCertificate) {
      const deathCertificateRef = ref(
        getStorage(),
        appointmentData.DeathCertificate
      );

      // Delete the death certificate PDF file
      await deleteObject(deathCertificateRef);
      console.log("Death certificate deleted successfully.");
    }

    // Now, delete the Firestore appointment document
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

    //console.log("Reports generated successfully");
  } catch (error) {
    console.error("Error generating reports:", error.message);
  }
};

const generateReportsPDF = async (
  tableData,
  filename = "Appointments_Report"
) => {
  try {
    const userId = getCurrentUserId();
    const doc = new jsPDF();

    // Add header and logo
    const logoUrl = "JROA.jpg";
    doc.addImage(logoUrl, "PNG", 15, 15, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("J.ROA Funeral Service", 45, 25);
    doc.setFont("helvetica", "normal");
    doc.text("Address: 64 K4th kamuning, Quezon City, Philippines", 45, 30);
    doc.text("Phone: 0909 081 3396 / 0935 354 4006", 45, 35);
    doc.line(15, 40, doc.internal.pageSize.width - 15, 40);

    // Add table data to the PDF
    doc.autoTable({
      startY: 45,
      head: [["Name", "Date", "Phone Number", "Plan", "Notes", "Status"]],
      body: tableData,
    });

    // Add footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "Generated by J.ROA Funeral Service",
      15,
      doc.internal.pageSize.height - 10
    );

    // Save the PDF file locally with the specified filename
    const localFilename = `${filename}.pdf`;
    doc.save(localFilename);

    // Generate the PDF as a blob for upload
    const pdfBlob = doc.output("blob");

    const reportData = {
      reportType: "Appointment",
      generatedAt: new Date(),
      generatedBy: userId,
    };
    const reportId = await addReport(reportData, pdfBlob, localFilename);

    console.log("Report generated, downloaded, and saved successfully.");
  } catch (error) {
    console.error("Error generating report:", error.message);
  }
};

const addReport = async (reportData, pdfBlob, filename) => {
  try {
    const reportRef = await addDoc(collection(dba, "Reports"), {
      ...reportData,
      generatedAt: Timestamp.fromDate(new Date()),
    });

    const pdfUrl = await uploadReportPDF(pdfBlob, reportRef.id, filename);

    await updateDoc(reportRef, { pdfUrl });

    console.log("Report added successfully with ID:", reportRef.id);
  } catch (error) {
    console.error("Error adding report:", error.message);
    throw error;
  }
};

const uploadReportPDF = async (file, reportId) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `reports/${reportId}/report.pdf`);

    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    console.log("PDF uploaded successfully. File URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading report PDF:", error.message);
    throw error;
  }
};

const generateTransactionReportsPDF = async (
  tableData,
  filename = "report.pdf"
) => {
  try {
    const userId = getCurrentUserId();
    const doc = new jsPDF();

    // Add header and logo
    const logoUrl = "JROA.jpg";
    doc.addImage(logoUrl, "PNG", 15, 15, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("J.ROA Funeral Service", 45, 25);
    doc.setFont("helvetica", "normal");
    doc.text("Address: 64 K4th kamuning, Quezon City, Philippines", 45, 30);
    doc.text("Phone: 0909 081 3396 / 0935 354 4006", 45, 35);
    doc.line(15, 40, doc.internal.pageSize.width - 15, 40);

    // Add table data to the PDF
    doc.autoTable({
      startY: 45,
      head: [
        [
          "Name of Deceased",
          "Date of Burial",
          "Time of Burial",
          "Address",
          "Cemetery",
          "Status",
        ],
      ],
      body: tableData,
    });

    // Add footer and save/download the PDF
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "Generated by J.ROA Funeral Service",
      15,
      doc.internal.pageSize.height - 10
    );

    // Save the PDF file locally with the specified filename
    const localFilename = `report.pdf`;
    doc.save(localFilename);

    // Generate the PDF as a blob for upload
    const pdfBlob = doc.output("blob");

    const reportData = {
      reportType: "Transaction",
      generatedAt: new Date(),
      generatedBy: userId,
    };
    const reportId = await addReport(reportData, pdfBlob);

    console.log("Report generated, downloaded, and saved successfully.");
  } catch (error) {
    console.error("Error generating transaction report:", error.message);
  }
};

const getReportsFromFirestore = async () => {
  try {
    const reportsCollection = collection(dba, "Reports");
    const reportsSnapshot = await getDocs(reportsCollection);
    const reportsList = reportsSnapshot.docs.map((doc) => {
      const reportData = doc.data();
      return {
        ...reportData,
        id: doc.id,
        generatedAt: reportData.generatedAt
          ? reportData.generatedAt.toDate()
          : null,
      };
    });
    return reportsList;
  } catch (error) {
    console.error("Error fetching reports from Firestore:", error);
    throw error;
  }
};

const deleteReport = async (reportId) => {
  try {
    // Get the reference to the Firestore report document
    const reportRef = doc(dba, "Reports", reportId);

    // Get the report data to retrieve the PDF file URL
    const reportSnapshot = await getDoc(reportRef);
    const reportData = reportSnapshot.data();

    // If the report does not exist or does not have a PDF URL, return early
    if (!reportData || !reportData.pdfUrl) {
      console.error(
        "Report not found or no PDF URL associated with the report."
      );
      return;
    }

    // Get the storage reference from the PDF URL stored in Firestore
    const storage = getStorage();
    const fileRef = ref(storage, reportData.pdfUrl);

    // Delete the file from Firebase Storage using the URL stored in Firestore
    await deleteObject(fileRef);
    console.log("PDF file deleted successfully from Firebase Storage.");

    // Delete the Firestore report document
    await deleteDoc(reportRef);
    console.log("Report document deleted successfully from Firestore.");
  } catch (error) {
    console.error("Error deleting report:", error.message);
    throw error;
  }
};

const AuditLogger = async ({ event }) => {
  try {
    //console.log("Event object:", event); // Log the event object
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

    //console.log("Audit log added successfully with ID: ", auditLogRef.id);
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
    //console.log("Inventory item added successfully with ID: ", inventoryRef.id);
  } catch (error) {
    console.error("Error adding inventory item:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

const uploadImage = async (file) => {
  const storage = getStorage();
  const storageRef = ref(storage, `inventoryImages/${file.name}`);

  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  return imageUrl; // Return the URL for saving in Firestore
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
    //console.log("Inventory item updated successfully!");
  } catch (error) {
    console.error("Error updating inventory item:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to delete an inventory item, including its image from Firebase Storage
const deleteInventoryItem = async (itemId) => {
  try {
    // Construct the reference to the inventory item document
    const itemDocRef = doc(dba, "inventory", itemId);

    // Get the inventory item document data
    const itemSnapshot = await getDoc(itemDocRef);
    const itemData = itemSnapshot.data();

    // If the item doesn't exist or has no imageURL, log a warning and return
    if (!itemData || !itemData.imageUrl) {
      console.error("Item not found or no imageURL associated with the item.");
      return;
    }

    // Delete the image from Firebase Storage using the imageURL stored in Firestore
    const storage = getStorage();
    const imageRef = ref(storage, itemData.imageUrl);

    // Attempt to delete the image
    await deleteObject(imageRef);
    console.log("Image deleted successfully from Firebase Storage.");

    // Now delete the Firestore inventory item document
    await deleteDoc(itemDocRef);
    console.log("Inventory item document deleted successfully from Firestore.");
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
    //console.log("Testimonial submitted successfully!");
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
// Function to get reviews
const getUserReviewsFirestore = async (userId) => {
  try {
    const reviewsQuery = query(
      collection(dba, "testimonials"),
      where("userId", "==", userId)
    );
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
    //console.log("Testimonial status updated successfully!");
  } catch (error) {
    console.error("Error updating testimonial status:", error.message);
  }
};

// Function to update a review
export const updateReviewFirestore = async (reviewId, updatedData) => {
  try {
    const reviewDocRef = doc(dba, "testimonials", reviewId);
    await updateDoc(reviewDocRef, updatedData);
    console.log("Review updated successfully!");
  } catch (error) {
    console.error("Error updating testimonial:", error.message);
  }
};

const deleteReviewFirestore = async (reviewId) => {
  if (!reviewId) {
    console.error("Invalid review ID");
    return;
  }

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
export const sendNotification = async (title, content, userId, recipient) => {
  try {
    const notification = {
      title,
      content,
      userId,
      recipient,
      isRead: false,
      timestamp: Timestamp.now(),
    };

    // Add the notification to the 'notifications' collection
    await addDoc(collection(dba, "notifications"), notification);
    //console.log("Notification sent successfully:", notification);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const fetchUserNotifications = async () => {
  try {
    const userId = getCurrentUserId();
    const notificationsQuery = query(
      collection(dba, "notifications"),
      where("recipient", "==", userId)
    );
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return [];
  }
};

const fetchAdminNotifications = async () => {
  try {
    const notificationsQuery = query(
      collection(dba, "notifications"),
      where("recipient", "==", "admin")
    );
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  const notificationRef = doc(dba, "notifications", notificationId); // Reference to the specific notification
  await updateDoc(notificationRef, { isRead: true }); // Update the document
  //console.log("Notification marked as read!");
};

export const markNotificationAsUnread = async (notificationId) => {
  const notificationRef = doc(dba, "notifications", notificationId); // Reference to the specific notification
  await updateDoc(notificationRef, { isRead: false }); // Update the document
  //console.log("Notification marked as unread!");
};

export const deleteNotification = async (notificationId) => {
  const notificationRef = doc(dba, "notifications", notificationId); // Reference to the specific notification
  await deleteDoc(notificationRef); // Delete the document
  //console.log("Notification deleted!");
};

export const updateProfilePictureUrl = async (userId, downloadUrl) => {
  const userRef = doc(dba, "users", userId);
  await updateDoc(userRef, { profilePictureUrl: downloadUrl });
};

// Function to add a transaction
export const addTransaction = async (transactionData) => {
  try {
    const newTransaction = {
      ...transactionData,
      status: "processing", // Default status
      date: Timestamp.now(), // Current date as default
      isArchived: false, // Default isArchived to false
    };

    // Create a new document in the "transaction" collection
    const transactionRef = await addDoc(
      collection(dba, "transactions"),
      newTransaction
    );
    console.log("Transaction added successfully with ID: ", transactionRef.id);
  } catch (error) {
    console.error("Error adding transaction:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to get all non-archived transactions
export const getTransactions = async () => {
  try {
    // Query the "transactions" collection for non-archived transactions
    const transactionsRef = collection(dba, "transactions");
    const q = query(transactionsRef, where("isArchived", "==", false)); // Only fetch transactions where isArchived is false
    const snapshot = await getDocs(q); // Execute the query
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return transactions; // Return the filtered transactions
  } catch (error) {
    console.error("Error getting transactions:", error.message);
    return []; // Return an empty array in case of error
  }
};

// Function to update a transaction
export const updateTransaction = async (transactionId, newData) => {
  try {
    // Construct the reference to the transaction document
    const transactionDocRef = doc(dba, "transactions", transactionId);

    // Update the transaction document with the new data
    await updateDoc(transactionDocRef, newData);
    console.log("Transaction updated successfully!");
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to delete a transaction
export const deleteTransaction = async (transactionId) => {
  try {
    // Construct the reference to the transaction document
    const transactionDocRef = doc(dba, "transactions", transactionId);

    // Delete the transaction document
    await deleteDoc(transactionDocRef);
    console.log("Transaction deleted successfully!");
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    throw error; // Re-throw the error to be handled in the calling code
  }
};

// Function to get users with role "user" who have an appointment with status "completed"
export const getUsersWithCompletedAppointments = async () => {
  try {
    // Step 1: Get users with role "user"
    const usersQuery = query(
      collection(dba, "users"),
      where("role", "==", "user")
    );
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Step 2: Get appointments with status "completed"
    const completedAppointmentsQuery = query(
      collection(dba, "appointments"),
      where("status", "==", "completed")
    );
    const appointmentsSnapshot = await getDocs(completedAppointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Step 3: Filter users who have a "completed" appointment
    const usersWithCompletedAppointments = users.filter((user) =>
      appointments.some((appointment) => appointment.userId === user.id)
    );

    return usersWithCompletedAppointments;
  } catch (error) {
    console.error(
      "Error getting users with completed appointments:",
      error.message
    );
    return [];
  }
};

const updateTransactionStatus = async (transactionId, newStatus) => {
  try {
    // Construct the reference to the appointment document
    const transactionDocRef = doc(dba, "transactions", transactionId);

    // Update the appointment document with the new status
    await updateDoc(transactionDocRef, { status: newStatus });

    //console.log("Appointment updated successfully!");
  } catch (error) {
    console.error("Error updating transaction:", error.message);
  }
};

// Function to get transactions for the currently logged-in user
export const getUserTransactions = async (userId) => {
  try {
    // Query the "transaction" collection where the userId matches
    const q = query(
      collection(dba, "transactions"),
      where("orderedById", "==", userId)
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return transactions;
  } catch (error) {
    console.error("Error getting user transactions:", error.message);
    return []; // Return an empty array in case of error
  }
};

const toggleArchiveStatus = async (docId, collectionName, isArchived) => {
  try {
    // Verify that the collection name is either "appointments" or "transactions"
    if (!["appointments", "transactions"].includes(collectionName)) {
      throw new Error(
        "Invalid collection name. Use 'appointments' or 'transactions'."
      );
    }

    // Reference to the document in the specified collection
    const docRef = doc(dba, collectionName, docId);

    // Update the isArchived status
    await updateDoc(docRef, { isArchived });

    console.log(
      `Document in ${collectionName} with ID ${docId} archive status set to ${isArchived}`
    );
  } catch (error) {
    console.error(
      `Error updating archive status for ${collectionName}:`,
      error.message
    );
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
  fetchUserNotifications,
  fetchAdminNotifications,
  getUserReviewsFirestore,
  uploadImage,
  updateTransactionStatus,
  fetchArchivedData,
  toggleArchiveStatus,
  generateReportsPDF,
  generateTransactionReportsPDF,
  addReport,
  getReportsFromFirestore,
  deleteReport,
};
