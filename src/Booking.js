// Booking.js
import "bootstrap";
import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import "bootstrap-icons/font/bootstrap-icons.css";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import {
  auth,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserRoleFirestore,
  getApprovedAppointments,
  getUserAppointments,
  getCurrentUserId,
  getAllAppointments,
  AuditLogger,
  sendNotification,
  getUserData,
} from "./firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Button, Modal, Form } from "react-bootstrap";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import "./Booking.css";
// Toast configuration for displaying messages
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// Component for booking appointments
const Booking = ({}) => {
  const navigate = useNavigate(); // Initialize navigate function
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const handleShow1 = () => setShowModal1(true);
  const handleClose1 = () => setShowModal1(false);
  const handleShow2 = () => setShowModal2(true);
  const handleClose2 = () => setShowModal2(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleCloseTermsModal = () => setShowTermsModal(false);
  const [termsChecked, setTermsChecked] = useState(false); // State for tracking if terms are checked
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for storing selected date
  const [isFormOpen, setIsFormOpen] = useState(false); // State for controlling form visibility
  const [isValidDaySelected, setIsValidDaySelected] = useState(false); // State for checking if a valid day is selected
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const calendarRef = useRef(null);
  const [appointments, setAppointments] = useState([]); // State for storing appointments
  const [userData, setUserData] = useState(null); // State to store user data from Firestore
  const [user, setUser] = useState(null); // State to store the current user's data
  const [formData, setFormData] = useState({
    // State for form data
    name: "",
    date: "",
    phoneNumber: "",
    notes: "",
    plan: "",
    status: "",
    DeceasedName: "",
    DeceasedAge: "",
    DeceasedBirthday: "",
    DateofDeath: "",
    PlaceofDeath: "",
    DeceasedRelationship: "",
    DeathCertificate: "",
  });

  useEffect(() => {
    // Fetch the current user when the component mounts
    const currentUser = auth.currentUser;
    if (currentUser) {
      // If a user is logged in, set the user data
      setUser(currentUser);
      // Fetch user data from Firestore
      fetchUserData(currentUser.uid);
    } else {
      // If no user is logged in, set user to null
      setUser(null);
      setUserData(null); // Clear user data if no user is logged in
    }
  }, []);

  // Function to fetch user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      const userData = await getUserData(userId);
      setUserData(userData); // Set user data in state
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setUserData(null); // Clear user data in case of error
    }
  };

  const handleNext = () => {
    // Validate first modal fields
    if (formData.plan && formData.phoneNumber && formData.notes) {
      // Phone number validation
      const phoneRegex = /^(09\d{8,9}|9\d{9}|\+639\d{9,10})$/; // Validates phone numbers
      if (!phoneRegex.test(formData.phoneNumber)) {
        Toast.fire({
          icon: "error",
          title:
            "Phone number must start with 9, 09, or +63 and be between 10 to 13 digits long.",
        });
        return; // Prevent moving to the next modal
      }

      setShowModal1(false);
      setShowModal2(true);
    } else {
      Toast.fire({
        icon: "error",
        title: "Please fill in all the fields.",
      });
    }
  };

  // Function to handle showing the terms modal
  const handleNextToTerms = () => {
    console.log(formData);
    // Validation: Birthday should be before Date of Death
    if (new Date(formData.DeceasedBirthday) >= new Date(formData.DateofDeath)) {
      Toast.fire({
        icon: "error",
        title: "The Date of Death cannot be before the Birth Date.",
      });
      return;
    }

    // Validate that the Deceased Name does not contain digits or special characters
    const nameRegex = /^[A-Za-z\s]+$/; // Allows only letters and spaces
    const trimmedDeceasedName = formData.DeceasedName.trim(); // Trim spaces from the name

    // Check if the name is less than 3 characters
    if (trimmedDeceasedName.length < 3) {
      Toast.fire({
        icon: "error",
        title: "Deceased Name must be at least 3 characters long.",
      });
      return; // Prevent moving to the terms modal
    }

    // Check if the name contains digits or special characters
    if (!nameRegex.test(trimmedDeceasedName)) {
      Toast.fire({
        icon: "error",
        title: "Deceased Name must not contain digits or special characters.",
      });
      return; // Prevent moving to the terms modal
    }
    if (
      formData.DeceasedName &&
      formData.DeceasedAge &&
      formData.DeceasedSex &&
      formData.DeceasedBirthday &&
      formData.DateofDeath &&
      formData.PlaceofDeath &&
      formData.DeceasedRelationship &&
      formData.DeathCertificate
    ) {
      handleClose2(); // Close the second modal
      handleShowTermsModal(); // Show the terms modal
    } else {
      Toast.fire({
        icon: "error",
        title: "Please fill in all the fields.",
      });
    }
  };

  // Function to handle returning to the first modal
  const handleReturn = () => {
    handleClose2(); // Close the second modal
    handleShow1(); // Reopen the first modal
  };

  const handleReturn2 = () => {
    handleCloseTermsModal(); // Close the second modal
    handleShow2(); // Reopen the first modal
  };
  // Function to map appointment status to color
  const getStatusColor = (status) => {
    return statusColors[status] || "gray"; // Default color is gray for unknown status
  };
  const clearFormData = async () => {
    setFormData({
      // State for form data
      name: "",
      phoneNumber: "",
      notes: "",
      plan: "",
      DeceasedName: "",
      DeceasedAge: "",
      DeceasedSex: "",
      DeceasedBirthday: "",
      DateofDeath: "",
      PlaceofDeath: "",
      DeceasedRelationship: "",
      DeathCertificate: "",
    });
  };

  // Object mapping appointment status to colors
  const statusColors = {
    pending: "orange",
    canceled: "red",
    approved: "blue",
    completed: "green",
  };

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          navigate("/login"); // Redirect to login page if user is not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error.message);
        navigate("/login"); // Redirect to login page if error occurs
      }
    };

    checkLoggedInStatus();
  }, [navigate]); // Pass navigate as a dependency to useEffect

  // Fetch user ID from local storage when component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);

        setIsAdmin(userRole === "admin");
      }
    });
    fetchAppointments();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loggedInUserId = getCurrentUserId(); // Get logged-in user ID
    const userPendingAppointments = appointments.filter(
      (appointment) =>
        appointment.userId === loggedInUserId &&
        appointment.status === "pending"
    );

    setHasPendingAppointment(userPendingAppointments.length > 0); // Check if there's a pending appointment
  }, [appointments]);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const loggedInUserId = getCurrentUserId(); // Get current user's ID
      const userRole = await getUserRoleFirestore(loggedInUserId);
      const adminAppointments = await getAllAppointments();
      const userAppointments = await getUserAppointments(loggedInUserId); // Fetch user's appointments
      const approvedAppointments = await getApprovedAppointments(); // Fetch approved appointments
      const filteredApprovedAppointments = approvedAppointments.filter(
        // Filter out user's own approved appointments
        (appointment) => appointment.userId !== loggedInUserId
      );

      const allAppointments = [
        // Combine user's own appointments and filtered approved appointments
        ...filteredApprovedAppointments,
        ...userAppointments,
      ];
      if (userRole === "admin") {
        setAppointments(adminAppointments);
      } else {
        setAppointments(allAppointments); // Set appointments
      }
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Fill the name field with logged-in user's full name
    const loggedInUserName = `${userData.firstname} ${userData.lastname}`;
    formData.name = loggedInUserName; // Set the name field to the user's full name
    const loggedInUserId = getCurrentUserId();

    if (formData.appointmentId) {
      // Update appointment
      Swal.fire({
        icon: "question",
        title: "Do you want to edit this appointment?",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `No`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateAppointment(formData.appointmentId, {
            name: formData.name,
            date: formData.date,
            phoneNumber: formData.phoneNumber,
            notes: formData.notes,
            plan: formData.plan,
            DeceasedName: formData.DeceasedName,
            DeceasedAge: formData.DeceasedAge,
            DeceasedSex: formData.DeceasedSex,
            DeceasedBirthday: formData.DeceasedBirthday,
            DateofDeath: formData.DateofDeath,
            PlaceofDeath: formData.PlaceofDeath,
            DeceasedRelationship: formData.DeceasedRelationship,
            DeathCertificate: formData.DeathCertificate,
          });
          // Handle file upload for Death Certificate
          if (formData.DeathCertificate) {
            const storage = getStorage();
            const storageRef = ref(
              storage,
              `deathCertificates/${loggedInUserId}/${formData.appointmentId}.pdf`
            );
            await uploadBytes(storageRef, formData.DeathCertificate);
          }
          const event = {
            type: "Appointment", // Type of event
            userId: loggedInUserId, // User ID associated with the event
            details: "User edited an existing appointment", // Details of the event
          };
          handleCloseTermsModal(); // Close the second modal after submitting
          setIsFormOpen(false); // Close form
          setIsValidDaySelected(false);
          // Call the AuditLogger function with the event object
          AuditLogger({ event });

          const title = "Pending appointment edited";
          const content = `A pending appointment ${formData.appointmentId} has been edited`;
          const recipient = "admin";

          await sendNotification(title, content, loggedInUserId, recipient);

          clearFormData();
          // Show success message
          Swal.fire({
            title: "success",
            text: "Appointment updated successfully",
            icon: "success",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Appointment updated successfully",
              });
            }
          });
          fetchAppointments(); // Fetch appointments
        }
      });
      handleShowTermsModal();
    } else {
      // Create new appointment
      Swal.fire({
        icon: "question",
        title: "Do you want to create this appointment?",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `No`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await createAppointment(loggedInUserId, {
            userId: loggedInUserId,
            name: formData.name,
            date: selectedDate,
            phoneNumber: formData.phoneNumber,
            notes: formData.notes,
            plan: formData.plan,
            DeceasedName: formData.DeceasedName,
            DeceasedAge: formData.DeceasedAge,
            DeceasedSex: formData.DeceasedSex,
            DeceasedBirthday: formData.DeceasedBirthday,
            DateofDeath: formData.DateofDeath,
            PlaceofDeath: formData.PlaceofDeath,
            DeceasedRelationship: formData.DeceasedRelationship,
            DeathCertificate: formData.DeathCertificate,
          });
          const title = "Appointment created";
          const content = `An appointment ${formData.appointmentId} has been created`;
          const recipient = "admin";

          await sendNotification(title, content, loggedInUserId, recipient);
          handleCloseTermsModal(); // Close the second modal after submitting
          setIsFormOpen(false); // Close form
          setIsValidDaySelected(false);
          clearFormData();
          // Show success message
          Swal.fire({
            title: "success",
            text: "Appointment created successfully",
            icon: "success",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Appointment created successfully",
              });
            }
          });
          const event = {
            type: "Appointment", // Type of event
            userId: loggedInUserId, // User ID associated with the event
            details: "User created a new appointment", // Details of the event
          };

          // Call the AuditLogger function with the event object
          AuditLogger({ event });
          fetchAppointments(); // Fetch appointments
        }
      });
      handleShowTermsModal();
    }
  };

  const handleEditClick = () => {
    const loggedInUserId = getCurrentUserId(); // Get the current user's ID
    const pendingAppointment = appointments.find(
      (appointment) =>
        appointment.userId === loggedInUserId &&
        appointment.status === "pending"
    );

    if (pendingAppointment) {
      // Pre-fill form data with the pending appointment's details
      setFormData({
        appointmentId: pendingAppointment.id,
        name: pendingAppointment.name,
        date: pendingAppointment.date,
        phoneNumber: pendingAppointment.phoneNumber,
        notes: pendingAppointment.notes,
        plan: pendingAppointment.plan,
        DeceasedName: pendingAppointment.DeceasedName,
        DeceasedAge: pendingAppointment.DeceasedAge,
        DeceasedSex: pendingAppointment.DeceasedSex,
        DeceasedBirthday: pendingAppointment.DeceasedBirthday,
        DateofDeath: pendingAppointment.DateofDeath,
        PlaceofDeath: pendingAppointment.PlaceofDeath,
        DeceasedRelationship: pendingAppointment.DeceasedRelationship,
      });

      // Open the first modal for editing
      setShowModal1(true);
    } else {
      Toast.fire({
        icon: "error",
        title: "No pending appointment found.",
      });
    }
  };

  // Handle deletion of pending appointment for the currently logged-in user
  const handleDeleteAppointment = async () => {
    try {
      const loggedInUserId = getCurrentUserId(); // Get the current user's ID
      const pendingAppointment = appointments.find(
        (appointment) =>
          appointment.userId === loggedInUserId &&
          appointment.status === "pending"
      );

      // If no pending appointment is found, show an error message
      if (!pendingAppointment) {
        Swal.fire({
          title: "Error",
          text: "No pending appointment found for this user.",
          icon: "error",
          heightAuto: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "error",
              title: "No pending appointment found.",
            });
          }
        });
        return;
      }
      Swal.fire({
        icon: "question",
        title: "Do you want to cancel your pending appointment?",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `No`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Cancel the pending appointment
          await deleteAppointment(pendingAppointment.id);
          setIsFormOpen(false); // Close form
          setIsValidDaySelected(false);
          clearFormData();
          const event = {
            type: "Appointment", // Type of event
            userId: loggedInUserId, // User ID associated with the event
            details: "User canceled a pending appointment", // Details of the event
          };
          AuditLogger({ event }); // Log the event
          const title = "Pending appointment deleted";
          const content = `A pending appointment ${formData.appointmentId}has been deleted`;
          const recipient = "admin";

          await sendNotification(title, content, loggedInUserId, recipient);
          fetchAppointments(); // Fetch updated appointments
          // Show success message
          Swal.fire({
            title: "Success",
            text: "Appointment canceled successfully",
            icon: "success",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Appointment canceled successfully",
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      Toast.fire({
        icon: "error",
        title: "Error deleting appointment",
      });
    }
  };

  // Handle selection of date on calendar
  const handleDateSelect = async (selectInfo) => {
    const loggedInUserId = getCurrentUserId(); // Get the current user's ID
    const startDate3 = selectInfo.startStr; // Get selected date
    const startDate = moment(selectInfo.startStr).tz("Asia/Manila"); // Convert selected date to Singapore Time (GMT+8)
    const currentDate = moment().tz("Asia/Manila"); // Get current date in Singapore Time
    const calendarApi = calendarRef.current.getApi();
    //console.log(startDate2);
    //console.log(currentDate2);
    // Set the selected date for display
    setSelectedDate(startDate.format("MMMM DD h:mm A")); // Format the date as "Month, Day HH AM/PM"
    //console.log(currentDate2);
    if (selectInfo.view.type === "dayGridMonth") {
      //Check if the selected date (day) is in the past
      if (startDate.isBefore(currentDate, "day")) {
        setIsFormOpen(false); // Close form
        setIsValidDaySelected(false); // Set day as invalid
        Toast.fire({
          icon: "error",
          title: "Cannot select past dates.",
        });
        //console.log("Cannot select past dates.");
        return;
      }
      calendarApi.changeView("timeGridDay", startDate3);
    } else if (selectInfo.view.type === "timeGridDay") {
      // Check if the selected hour is in the past
      if (startDate.isBefore(currentDate.clone().add(1, "hour"), "hour")) {
        setIsFormOpen(false); // Close form
        setIsValidDaySelected(false); // Set day as invalid
        Toast.fire({
          icon: "error",
          title: "Cannot select past dates.",
        });
        //console.log("Cannot select past dates.");
        return;
      }
      setIsValidDaySelected(true);
      setSelectedDate(startDate.format("MMMM DD h:mm A")); // Format the date as "Month, Day HH AM/PM"
    } else {
      calendarApi.changeView("timeGridDay", startDate3);
    }

    // Check if selected date is valid
    // Check if the user already has a pending appointment
    const userPendingAppointments = appointments.filter(
      // Filter user's pending appointments
      (appointment) =>
        appointment.userId === loggedInUserId &&
        appointment.status === "pending"
    );
    setSelectedDate(startDate3); // Set selected date
    if (selectInfo.view.type === "timeGridDay") {
      // Open form when day view is selected
      if (!isAdmin) {
        if (userPendingAppointments.length > 0) {
          // Notify the user that they already have a pending appointment
          Swal.fire({
            title: "Information",
            text: "You already have a pending appointment. Please wait for it to be processed.",
            icon: "info",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "info",
                title:
                  "You already have a pending appointment. Please wait for it to be processed.",
              });
            }
          });
          return;
        }
      }
    }
    clearFormData();
  };

  return (
    <section className="booking">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            flex: 1,
            marginTop: "10px",
            marginBottom: "50px",
            marginLeft: "50px",
            marginRight: "50px",
          }}
        >
          <h1 className="appointment-booking-title">APPOINTMENT BOOKING</h1>{" "}
          <div className="booking-border"></div>
          <div className="date-and-buttons">
            <p className="selectedDate">
              Selected Date:{" "}
              <strong>{selectedDate ? selectedDate : "None selected"}</strong>
            </p>
            {/* Only show the Edit button if the user has a pending appointment */}
            {appointments.some(
              (appointment) =>
                appointment.userId === getCurrentUserId() &&
                appointment.status === "pending"
            ) && (
              <>
                <div className="edit-delete-button">
                  <Button
                    variant="warning"
                    className="edit-appointment-button"
                    onClick={handleEditClick}
                  >
                    Edit Appointment
                  </Button>

                  <Button
                    variant="danger"
                    className="delete-appointment-button"
                    onClick={handleDeleteAppointment}
                  >
                    Delete Appointment
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="booking-box">
            <FullCalendar
              ref={calendarRef}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
                bootstrap5Plugin,
              ]}
              themeSystem="bootstrap5"
              initialView="dayGridMonth"
              initialDate={new Date().toISOString()} // Set initial date to current date/time
              timeZone="Asia/Manila" // Set timezone to Asia/Manila
              headerToolbar={{
                left: "prev,next,today",
                center: "title",
                right: "dayGridMonth,timeGridDay,timeGridWeek",
              }}
              events={appointments.map((appointment) => ({
                id: appointment.id,
                title: appointment.status,
                start: appointment.date,
                backgroundColor: getStatusColor(appointment.status), // Set color based on status
              }))}
              editable={false}
              selectable={true}
              select={handleDateSelect}
              allDaySlot={false}
              expandRows={true}
              height="625px"
              eventMinWidth={1000}
              eventTimeFormat={{
                // Set custom time format
                hour: "numeric",
                minute: "numeric",
              }}
              slotDuration="01:00:00" // Set the duration of each time slot to 30 minutes
            />
          </div>
        </div>

        {/* First Modal for Plan, Phone Number, and Notes */}
        <Modal show={showModal1} onHide={handleClose1}>
          <Modal.Header closeButton className="booking-header">
            <Modal.Title className="booking-title">Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <p className="book-date" style={{ marginLeft: "20px" }}>
              Selected Date:{" "}
              <strong>{selectedDate ? selectedDate : "None selected"}</strong>
            </p>
            <Form>
              <Form.Group controlId="formPlan">
                <Form.Label className="label-title">Plan</Form.Label>
                <Form.Select
                  className="plan-select"
                  required
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option value="">Select a plan</option>
                  <option value="Plan 1">Plan 1 - Basic Plan</option>
                  <option value="Plan 2">Plan 2 - Garden Plan</option>
                  <option value="Plan 3">Plan 3 - Garbo Plan</option>
                </Form.Select>
              </Form.Group>
              <br />
              <Form.Group controlId="formPhoneNumber">
                <Form.Label className="label-title">Phone Number</Form.Label>
                <Form.Control
                  className="input-details"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow only digits and the "+" sign
                    const sanitizedValue = inputValue.replace(/[^0-9+]/g, "");
                    setFormData({ ...formData, phoneNumber: sanitizedValue });
                  }}
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formNotes">
                <Form.Label className="label-title">Notes</Form.Label>
                <Form.Control
                  className="input-details"
                  as="textarea"
                  rows={3}
                  placeholder="Enter notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </Form.Group>
              <br />
              <div className="buttons">
                <Button
                  variant="primary"
                  className="close-button"
                  onClick={handleClose1}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="next-button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Second Modal for Post-Mortem Details */}
        <Modal show={showModal2} onHide={handleClose2}>
          <Modal.Header closeButton className="booking-header">
            <Modal.Title className="mortem-title">
              Post-Mortem Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <Form>
              <Form.Group controlId="formDeceasedName">
                <Form.Label className="label-title">Deceased Name</Form.Label>
                <Form.Control
                  className="input-details"
                  type="text"
                  placeholder="Enter deceased's name"
                  value={formData.DeceasedName}
                  onChange={(e) =>
                    setFormData({ ...formData, DeceasedName: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDeceasedAge">
                <Form.Label className="label-title">Deceased Age</Form.Label>
                <Form.Control
                  className="input-details"
                  type="number"
                  placeholder="Enter deceased's age"
                  value={formData.DeceasedAge}
                  onChange={(e) => {
                    const ageValue = e.target.value.replace(/\D/g, "");
                    if (ageValue.length <= 3) {
                      setFormData({ ...formData, DeceasedAge: ageValue });
                    }
                  }}
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDeceasedSex">
                <Form.Label className="label-title">Deceased Sex</Form.Label>
                <Form.Select
                  className="sex-select"
                  required
                  value={formData.DeceasedSex}
                  onChange={(e) =>
                    setFormData({ ...formData, DeceasedSex: e.target.value })
                  }
                >
                  <option value="">Enter deceased's sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>
              <br />
              <Form.Group controlId="formDeceasedBirthday">
                <Form.Label className="label-title">
                  Deceased Birthday
                </Form.Label>
                <Form.Control
                  type="date"
                  className="input-details"
                  value={formData.DeceasedBirthday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      DeceasedBirthday: e.target.value,
                    })
                  }
                  required
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDateofDeath">
                <Form.Label className="label-title">Date of Death</Form.Label>
                <Form.Control
                  type="date"
                  className="input-details"
                  value={formData.DateofDeath}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      DateofDeath: e.target.value,
                    })
                  }
                  required
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formPlaceofDeath">
                <Form.Label className="label-title">Place of Death</Form.Label>
                <Form.Control
                  type="text"
                  className="input-details"
                  placeholder="Enter place of death"
                  value={formData.PlaceofDeath}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      PlaceofDeath: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDeceasedRelationship">
                <Form.Label className="label-title">
                  Deceased's Relationship
                </Form.Label>
                <Form.Control
                  type="text"
                  className="input-details"
                  placeholder="Enter your relationship with the deceased"
                  value={formData.DeceasedRelationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      DeceasedRelationship: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDeathCertificate">
                <Form.Label className="label-title">
                  Death Certificate
                </Form.Label>
                <Form.Control
                  type="file"
                  className="input-details"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      DeathCertificate: e.target.files[0],
                    })
                  }
                  required
                />
              </Form.Group>
              <br />

              {/* Return and Next Buttons */}
              <div className="buttons">
                <Button
                  variant="secondary"
                  className="close-button"
                  onClick={handleReturn}
                >
                  Back
                </Button>
                {""}
                <Button
                  variant="primary"
                  className="next-button"
                  onClick={handleNextToTerms} // Change to Next button
                >
                  Next
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Terms and Conditions Modal */}
        <Modal show={showTermsModal} onHide={handleCloseTermsModal}>
          <Modal.Header closeButton className="booking-header">
            <Modal.Title className="booking-title">
              Terms and Conditions
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <p className="terms-and-conditions-modal">
              Welcome to J.ROA Funeral Services. These Terms and Conditions
              govern your use of our website and services. By accessing or using
              our Site, you agree to comply with and be bound by these Terms. If
              you do not agree with these Terms, please do not use our Site.
              <br />
              <br />
              <strong>1. User Accounts</strong>
              <br />
              To access certain features of the Site, you may be required to
              create an account. You agree to:
              <br />
              - Provide accurate, current, and complete information during the
              registration process.
              <br />
              - Maintain the security of your password and account.
              <br />
              - Notify us immediately of any unauthorized use of your account or
              any other breach of security.
              <br />
              - Take responsibility for all activities that occur under your
              account.
              <br />
              <br />
              <strong>2. Testimonial</strong>
              <br />
              All users can only have one testimonial at a time. All
              testimonials are first subject to approval by J.ROA Funeral
              Services before being published
              <br />
              <br />
              <strong>3. Acceptance of Terms</strong>
              <br />
              By using the Site, you affirm that you are at least 18 years old
              and have the legal capacity to enter into these Terms. If you are
              using the Site on behalf of an organization, you represent that
              you have the authority to bind that organization to these Terms.
              <br />
              <br />
              <strong>4. Appointment Cancellation</strong>
              <br />
              Users can cancel pending appointments as they wish but canceling
              an approved appointment may incur a cancellation fee.
              <br />
              <br />
              <strong>5. Intellectual Property</strong>
              <br />
              All content on the Site, including text, graphics, logos, and
              images, is the property of J.ROA Funeral Services or its licensors
              and is protected by copyright, trademark, and other intellectual
              property laws. You may not reproduce, distribute, or create
              derivative works from any content without our express written
              permission.
              <br />
              <br />
              <strong>6. Changes to Terms and Conditions</strong>
              <br />
              J.ROA Funeral Services reserves the right to modify these Terms
              and Conditions at any time. Users will be notified of significant
              changes. Continued use of the platform after changes indicates
              acceptance of the new terms.
              <br />
              <br />
              <strong>7. Transaction</strong>
              <br />
              The undersigned hereby agrees to pay in full the amount of this
              contract as soon as possible to any authorized representative or
              to office of J.ROA FUNERAL SERVICES so as to avoid unnecessary
              delay of the service, I also agree to pay all attorney's fees and
              court cost in case of lawsuit. Users will receive a transaction
              after a successful appointment. They can view its details and
              status anytime. Cancellation of a processing transaction incurs a
              cancellation fee.
              <br />
              <br />
              <strong>8. General Use of FUNeral</strong>
              <br />
              The FUNeral web application provides users with access to online
              appointment booking, viewing transactions, submitting testimonials
              and browsing service information, galleries, and 3D model renders.
              <br />
              <br />
              <strong>9. User Responsibilities</strong>
              <br />
              You agree to provide accurate and truthful information when
              creating an account, booking appointments, or submitting
              testimonials. You are responsible for maintaining the
              confidentiality of your account credentials.
              <br />
              <br />
              <strong>10. Account Misuse</strong>
              <br />
              Any misuse of the platform, including submitting false information
              or spamming testimonials, may result in account suspension or
              termination.
              <br />
              <br />
              <strong>11. Limitation of Liability</strong>
              <br />
              While we strive to ensure that all information on the platform is
              accurate and up-to-date, J.ROA Funeral Services does not guarantee
              the completeness or accuracy of any content. J.ROA Funeral
              Services is not liable for any losses or damages arising from the
              use of this platform, including but not limited to missed
              appointments, cancellation fees, or inaccuracies in displayed
              information.
              <br />
              <br />
              <strong>12. 3D Model Rendering</strong>
              <br />
              The likeness of the actual product may vary due to technical
              constraints in 3D model rendering. Please take the 3D model
              renders as a reference only. Actual product images are available
              in the gallery section and during the appointment.
              <br />
              <br />
              <strong>13. Pending Appointment Rule</strong>
              <br />
              A user can only have one pending appointment at a time.
              <br />
              <br />
              <strong>14. Appointment Approval</strong>
              <br />
              All appointments are subject to confirmation by J.ROA Funeral
              Services. You will receive a notification upon approval.
              <br />
              <br />
              <strong>15. User Conduct</strong>
              <br />
              You agree not to use the Site for any unlawful purpose or in a way
              that could damage, disable, overburden, or impair the Site. You
              agree not to:
              <br />
              - Harass, threaten, or defame any other user.
              <br />
              - Post or transmit any content that is obscene, offensive, or
              otherwise objectionable.
              <br />
              - Attempt to gain unauthorized access to any part of the Site or
              any other systems or networks connected to the Site.
              <br />
              <br />
              If you have any questions about these Terms, please contact us
              through these numbers 0909 081 3396 / 0935 354 4006 or visit us 64
              K4th Kamuning, Quezon City, Philippines. By using our Site, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms and Conditions. Thank you for visiting J.ROA
              Funeral Services.
            </p>
            <Form.Group controlId="formTermsConditions" className="mt-3">
              <Form.Check
                type="checkbox"
                label={
                  <span>
                    I have Read and Agreed to the Terms and Conditions
                  </span>
                }
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                required
              />
            </Form.Group>
            <br />
            <div className="buttons">
              <Button
                variant="secondary"
                className="close-button"
                onClick={handleReturn2}
              >
                Back
              </Button>
              <Button
                onClick={handleFormSubmit}
                className="next-button"
                disabled={!termsChecked}
              >
                Submit
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </div>
      {/* Conditionally Render "Book Appointment" Button */}
      {isValidDaySelected && !hasPendingAppointment && (
        <Button
          variant="primary"
          className="book-appointment-button"
          onClick={handleShow1}
        >
          Book Appointment
        </Button>
      )}
      <br />

      <br />
    </section>
  );
};

export default Booking;
