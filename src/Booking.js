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
} from "./firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Button, Modal, Form } from "react-bootstrap";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import './Booking.css';
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
  const [termsChecked, setTermsChecked] = useState(false); // State for tracking if terms are checked
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for storing selected date
  const [isFormOpen, setIsFormOpen] = useState(false); // State for controlling form visibility
  const [isValidDaySelected, setIsValidDaySelected] = useState(false); // State for checking if a valid day is selected
  const [hasPendingAppointment, setHasPendingAppointment] = useState(false);
  const calendarRef = useRef(null);
  const [appointments, setAppointments] = useState([]); // State for storing appointments
  const [formData, setFormData] = useState({
    // State for form data
    name: "",
    date: "",
    appointmentType: "",
    serviceType: "",
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
  const handleNext = () => {
    // Validate first modal fields
    if (formData.plan && formData.phoneNumber && formData.notes) {
      setShowModal1(false);
      setShowModal2(true);
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
  // Function to map appointment status to color
  const getStatusColor = (status) => {
    return statusColors[status] || "gray"; // Default color is gray for unknown status
  };
  const clearFormData = async () => {
    setFormData({
      // State for form data
      name: "",
      appointmentType: "",
      serviceType: "",
      phoneNumber: "",
      notes: "",
      plan: "",
      DeceasedName: "",
      DeceasedAge: "",
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

  // Handle click on calendar event
  const handleEventClick = async (eventInfo) => {
    try {
      const loggedInUserId = getCurrentUserId(); // Get the current user's ID

      const appointmentId = eventInfo.event.id;
      const clickedAppointment = appointments.find(
        // Find clicked appointment
        (appointment) => appointment.id === appointmentId
      );

      if (!clickedAppointment) {
        console.error("Appointment not found.");
        return;
      }

      if (
        (clickedAppointment.userId === loggedInUserId &&
          clickedAppointment.status === "pending") || // User owns the appointment
        isAdmin // User is an admin
      ) {
        setFormData({
          // State for form data
          appointmentId: appointmentId,
          name: clickedAppointment.name,
          appointmentType: clickedAppointment.appointmentType,
          serviceType: clickedAppointment.serviceType,
          phoneNumber: clickedAppointment.phoneNumber,
          notes: clickedAppointment.notes,
          plan: clickedAppointment.plan,
          DeceasedName: clickedAppointment.DeceasedName,
          DeceasedAge: clickedAppointment.DeceasedAge,
          DeceasedBirthday: clickedAppointment.DeceasedBirthday,
          DateofDeath: clickedAppointment.DateofDeath,
          PlaceofDeath: clickedAppointment.PlaceofDeath,
          DeceasedRelationship: clickedAppointment.DeceasedRelationship,
          DeathCertificate: clickedAppointment.DeathCertificate,
        });
        setSelectedDate(clickedAppointment.date); // Set selected date
        setIsFormOpen(true); // Open form
      } else {
        // Show error message if user cannot edit/delete appointment
        Swal.fire({
          title: "Error",
          text: "You cannot edit or delete appointments that do not belong to you or are not pending.",
          icon: "error",
          heightAuto: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "error",
              title:
                "You cannot edit or delete appointments that do not belong to you or are not pending.",
            });
          }
        });
      }
    } catch (error) {
      console.error("Error handling event click:", error.message);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Validation: Birthday should be before Date of Death
    if (new Date(formData.DeceasedBirthday) >= new Date(formData.DateofDeath)) {
      Toast.fire({
        icon: "error",
        title: "The Date of Death cannot be before the Birth Date.",
      });
      return;
    }
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
          await updateAppointment(loggedInUserId, formData.appointmentId, {
            name: formData.name,
            date: formData.date,
            appointmentType: formData.appointmentType,
            serviceType: formData.serviceType,
            phoneNumber: formData.phoneNumber,
            notes: formData.notes,
            plan: formData.plan,
            DeceasedName: formData.DeceasedName,
            DeceasedAge: formData.DeceasedAge,
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
          handleClose2(); // Close the second modal after submitting
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
            appointmentType: formData.appointmentType,
            serviceType: formData.serviceType,
            phoneNumber: formData.phoneNumber,
            notes: formData.notes,
            plan: formData.plan,
            DeceasedName: formData.DeceasedName,
            DeceasedAge: formData.DeceasedAge,
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
          handleClose2(); // Close the second modal after submitting
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
        appointmentType: pendingAppointment.appointmentType,
        serviceType: pendingAppointment.serviceType,
        phoneNumber: pendingAppointment.phoneNumber,
        notes: pendingAppointment.notes,
        plan: pendingAppointment.plan,
        DeceasedName: pendingAppointment.DeceasedName,
        DeceasedAge: pendingAppointment.DeceasedAge,
        DeceasedBirthday: pendingAppointment.DeceasedBirthday,
        DateofDeath: pendingAppointment.DateofDeath,
        PlaceofDeath: pendingAppointment.PlaceofDeath,
        DeceasedRelationship: pendingAppointment.DeceasedRelationship,
        DeathCertificate: pendingAppointment.DeathCertificate,
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
    const startDate2 = moment(selectInfo.startStr).tz("Asia/Manila").format(); // Convert selected date to Singapore Time (GMT+8)
    const currentDate2 = moment().tz("Asia/Manila").format(); // Get current date in Singapore Time
    console.log(startDate2);
    console.log(currentDate2);
    // Set the selected date for display
    setSelectedDate(startDate.format("MMMM DD h:mm A")); // Format the date as "Month, Day HH AM/PM"
    console.log(currentDate2);
    if (selectInfo.view.type === "dayGridMonth") {
      //Check if the selected date (day) is in the past
      if (startDate.isBefore(currentDate, "day")) {
        setIsFormOpen(false); // Close form
        setIsValidDaySelected(false); // Set day as invalid
        Toast.fire({
          icon: "error",
          title: "Cannot select past dates.",
        });
        console.log("Cannot select past dates.");
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
        console.log("Cannot select past dates.");
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
          <div class="booking-border"></div>
          <p className="selectedDate" style={{ marginLeft: "20px" }}>
            Selected Date: <strong>{selectedDate ? selectedDate : "None selected"}</strong>
          </p>
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
              title: appointment.name,
              start: appointment.date,
              backgroundColor: getStatusColor(appointment.status), // Set color based on status
            }))}
            editable={true}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            allDaySlot={false}
            expandRows={true}
            height="625px"
            eventMinWidth={1000}
            eventTimeFormat={{
              // Set custom time format
              hour: "numeric",
              minute: "numeric",
            }}
            slotMinTime="08:00:00" // Set the earliest time to 8am
            slotMaxTime="17:30:00" // Set the latest time to 5pm
            slotDuration="01:00:00" // Set the duration of each time slot to 30 minutes
          />
          </div>
        </div>

        {/* First Modal for Plan, Phone Number, and Notes */}
        <Modal show={showModal1} onHide={handleClose1}>
          <Modal.Header closeButton  className="booking-header">
            <Modal.Title className="booking-title">Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <p className="book-date" style={{ marginLeft: "20px" }}>
              Selected Date: <strong>{selectedDate ? selectedDate : "None selected"}</strong>
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
                  <option value="Plan 1">Plan 1</option>
                  <option value="Plan 2">Plan 2</option>
                  <option value="Plan 3">Plan 3</option>
                </Form.Select>
              </Form.Group>
              <br/>
              <Form.Group controlId="formPhoneNumber">
                <Form.Label className="label-title">Phone Number</Form.Label>
                <Form.Control
                  className="input-details"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const phoneValue = e.target.value.replace(/\D/g, "");
                    if (phoneValue.length <= 13) {
                      setFormData({ ...formData, phoneNumber: phoneValue });
                    }
                  }}
                  required
                />
              </Form.Group>
              <br/>
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
              <br/>
              <div className="buttons">
                <Button variant="primary" className="close-button" onClick={handleClose1}>
                  Cancel
                </Button>
                <Button variant="primary" className="next-button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Second Modal for Post-Mortem Details */}
        <Modal show={showModal2} onHide={handleClose2}>
          <Modal.Header closeButton className="booking-header">
            <Modal.Title className="mortem-title">Post-Mortem Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <Form onSubmit={handleFormSubmit}>
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
              <br/>
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
              <br/>
              <Form.Group controlId="formDeceasedBirthday">
                <Form.Label className="label-title">Deceased Birthday</Form.Label>
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
              <br/>
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
              <br/>
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
              <br/>
              <Form.Group controlId="formDeceasedRelationship">
                <Form.Label className="label-title">Deceased's Relationship</Form.Label>
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
              <br/>
              <Form.Group controlId="formDeathCertificate">
                <Form.Label className="label-title">Death Certificate</Form.Label>
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

              {/* Terms and Conditions Checkbox */}
              <Form.Group controlId="formTermsConditions" className="mt-3">
                <Form.Check
                  type="checkbox"
                  label="I have Read and Agreed to the Terms and Conditions"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  required
                />
              </Form.Group>
              <br/>

              {/* Return and Submit Buttons */}
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
                  type="submit"
                  className="next-button"
                  disabled={!termsChecked} // Disable submit button if terms are not agreed to
                >
                  Submit
                </Button>
              </div>

              
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      {/* Conditionally Render "Book Appointment" Button */}
      {isValidDaySelected && !hasPendingAppointment && (
        <Button variant="primary" className="book-appointment-button" onClick={handleShow1}>
          Book Appointment
        </Button>
      )}
      <br />
      {/* Only show the Edit button if the user has a pending appointment */}
      {appointments.some(
        (appointment) =>
          appointment.userId === getCurrentUserId() &&
          appointment.status === "pending"
      ) && (
        <>
          <Button variant="warning" className="edit-appointment-button" onClick={handleEditClick}>
            Edit Appointment
          </Button>
          <br />
          <Button
            variant="danger"
            className="delete-appointment-button"
            onClick={handleDeleteAppointment}
          >
            Delete Appointment
          </Button>
        </>
      )}
      <br />
    </section>
  );
};

export default Booking;
