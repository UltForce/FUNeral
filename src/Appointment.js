import emailjs from "emailjs-com"; // Import EmailJS
import React, { useState, useEffect } from "react";
import {
  deleteAppointment,
  updateAppointmentStatus,
  generateReportsPDF,
  updateAppointment,
} from "./firebase.js";
import {
  getAppointments,
  getCurrentUserId,
  AuditLogger,
  getUserRoleFirestore,
  sendNotification,
  getUserEmailById,
  toggleArchiveStatus,
  updateAppointmentStaff,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import {
  Dropdown,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
  Form,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFile, faEdit } from "@fortawesome/free-solid-svg-icons";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import "./Appointment.css";
import Loader from "./Loader.js";
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

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const handleShow1 = () => setShowModal1(true);
  const handleClose1 = () => setShowModal1(false);
  const handleShow2 = () => setShowModal2(true);
  const handleClose2 = () => setShowModal2(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // State for controlling form visibility
  const staffList = ["Staff A", "Staff B", "Staff C", "Staff D", "Staff E"];
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

  const navigate = useNavigate();
  useEffect(() => {
    const checkAdminAndLoginStatus = async () => {
      try {
        const userRole = await getUserRoleFirestore(getCurrentUserId());
        if (userRole !== "admin") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking user role:", error.message);
        navigate("/login");
      }
    };

    checkAdminAndLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments = await getAppointments();
        setAppointments(appointments);
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        setLoading(false); // Hide loader after data is fetched
        console.error("Error fetching appointments:", error.message);
      }
    };

    fetchAppointments();
  }, []);

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

  // Modal functions
  const handleShowDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  const fetchAppointments = async () => {
    try {
      const appointments = await getAppointments();
      setAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    }
  };

  useEffect(() => {
    if (appointments.length > 0) {
      if (!$.fn.DataTable.isDataTable("#appointmentsTable")) {
        $("#appointmentsTable").DataTable({
          lengthMenu: [10, 25, 50, 75, 100],
          pagingType: "full_numbers",
          order: [],
          columnDefs: [
            { targets: "no-sort", orderable: false },
            { targets: 1, type: "date-euro" }, // Specify the type of date sorting
          ],
          drawCallback: function () {
            $(this.api().table().container())
              .find("td")
              .css("border", "1px solid #ddd");
          },
          rowCallback: function (row, data, index) {
            $(row).hover(
              function () {
                $(this).addClass("hover");
              },
              function () {
                $(this).removeClass("hover");
              }
            );
          },
          stripeClasses: ["stripe1", "stripe2"],
        });
      }
    }
  }, [appointments]);

  const handleGenerateReports = async () => {
    // Display confirmation dialog before generating reports
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to generate the report?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, generate it!",
    });

    if (result.isConfirmed) {
      try {
        const table = $("#appointmentsTable").DataTable();

        // Use DataTables API to get visible rows with current search and sort applied
        const tableData = [];
        table.rows({ search: "applied" }).every(function () {
          const row = this.node(); // Access the DOM node of the row
          const cells = $(row).find("td"); // Find all <td> elements in the row

          // Push an array of cell text values to tableData, matching PDF columns
          tableData.push([
            $(cells[0]).text(), // Name
            $(cells[1]).text(), // Date
            $(cells[2]).text(), // Phone Number
            $(cells[3]).text(), // Plan
            $(cells[4]).text(), // Notes
            $(cells[5]).text(), // Status
          ]);
        });

        // Pass the formatted table data to generate the PDF
        await generateReportsPDF(tableData);

        // Show success message and log audit event
        Swal.fire(
          "Generated!",
          "Reports successfully generated.",
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Reports successfully generated.",
            });
          }
        });
        const userId = getCurrentUserId();
        const event = {
          type: "Report",
          userId: userId,
          details: "User generated a report",
        };
        AuditLogger({ event });
      } catch (error) {
        console.error("Error generating reports:", error.message);
        alert("An error occurred while generating reports.");
      }
    }
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    if (!dateTimeString) {
      return "N/A";
    }
    const year = dateTime.getFullYear();
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
    const day = ("0" + dateTime.getDate()).slice(-2);
    const dayOfWeek = dateTime.toLocaleDateString("en-US", { weekday: "long" });
    const hour = ("0" + dateTime.getHours()).slice(-2);
    const minutes = ("0" + dateTime.getMinutes()).slice(-2);
    return `${year}-${month}-${day} ${dayOfWeek} ${hour}:${minutes}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning">{status}</span>;
      case "approved":
        return <span className="badge bg-info">{status}</span>;
      case "completed":
        return <span className="badge bg-success">{status}</span>;
      case "canceled":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleAction = async (action, appointmentId) => {
    try {
      // Set up action-specific confirmation messages
      const actionMessages = {
        delete: {
          title: "Are you sure?",
          text: "This will permanently delete the appointment.",
          confirmButtonText: "Yes, delete it!",
        },
        archive: {
          title: "Are you sure?",
          text: "This will archive the appointment.",
          confirmButtonText: "Yes, archive it!",
        },
        status: {
          title: "Are you sure?",
          text: `This will change the status of the appointment to ${action}.`,
          confirmButtonText: "Yes, change it!",
        },
      };

      // Select the appropriate message for the action
      const confirmationMessage =
        action === "delete"
          ? actionMessages.delete
          : action === "archive"
          ? actionMessages.archive
          : actionMessages.status;

      // Show confirmation dialog
      const result = await Swal.fire({
        title: confirmationMessage.title,
        text: confirmationMessage.text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: confirmationMessage.confirmButtonText,
      });

      // Proceed only if the user confirmed
      if (result.isConfirmed) {
        const appointment = appointments.find((r) => r.id === appointmentId);
        setLoading(true); // Set loading state to true
        const userId = getCurrentUserId();
        const recipient = appointment.userId;
        let event, title, content;

        if (action === "delete") {
          event = {
            type: "Appointment",
            userId,
            details: "Admin deleted an appointment",
          };
          title = "Appointment deleted";
          content = "Your appointment has been deleted by an admin";
          await sendNotification(title, content, userId, recipient);
          await deleteAppointment(appointmentId);
          Swal.fire(
            "Deleted!",
            "Appointment deleted successfully",
            "success"
          ).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Appointment deleted successfully",
              });
            }
          });
        } else if (action === "archive") {
          event = {
            type: "Appointment",
            userId,
            details: "Admin archived an appointment",
          };
          title = "Appointment archived";
          content = "Your appointment has been archived by an admin";
          await sendNotification(title, content, userId, recipient);
          await toggleArchiveStatus(appointmentId, "appointments", true);
          Swal.fire(
            "Archived!",
            "Appointment archived successfully",
            "success"
          ).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Appointment archived successfully",
              });
            }
          });
        } else {
          event = {
            type: "Appointment",
            userId,
            details: "Admin changed the status of an appointment",
          };
          title = "Appointment status changed";
          content = `Your appointment status has been changed to ${action}`;
          await sendNotification(title, content, userId, recipient);
          await updateAppointmentStatus(appointmentId, action);

          const appointment = appointments.find((r) => r.id === appointmentId);
          // Fetch user's email and send email notification using EmailJS
          const userEmail = await getUserEmailById(appointment.userId);
          const emailParams = {
            type: "Appointment",
            to_name: appointment.name,
            status: action,
            email: userEmail,
          };
          const serviceID = "service_m5g022b";
          const templateID = "template_g1w6f2a";
          const userID = "0Tz3RouZf3BXZaSmh";

          // Send the email
          await emailjs.send(serviceID, templateID, emailParams, userID);

          Swal.fire(
            "Status!",
            `Appointment status changed to ${action}`,
            "success"
          ).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: `Appointment status changed to ${action}`,
              });
            }
          });
        }

        // Log event and refresh appointments list
        AuditLogger({ event });
        if ($.fn.DataTable.isDataTable("#appointmentsTable")) {
          $("#appointmentsTable").DataTable().destroy();
        }
        await fetchAppointments();
        setLoading(false);
      }
    } catch (error) {
      console.error(`Error handling action (${action}):`, error.message);
      alert(`An error occurred while performing the action (${action}).`);
    }
  };

  const getAvailableActions = (status) => {
    const allActions = [
      "pending",
      "approved",
      "completed",
      "canceled",
      "delete",
      "archive",
    ];
    return allActions.filter((action) => action !== status);
  };

  const handleEditClick = (appointment) => {
    setFormData({
      appointmentId: appointment.id,
      name: appointment.name,
      date: appointment.date,
      phoneNumber: appointment.phoneNumber,
      notes: appointment.notes,
      plan: appointment.plan,
      DeceasedName: appointment.DeceasedName,
      DeceasedAge: appointment.DeceasedAge,
      DeceasedSex: appointment.DeceasedSex,
      DeceasedBirthday: appointment.DeceasedBirthday,
      DateofDeath: appointment.DateofDeath,
      PlaceofDeath: appointment.PlaceofDeath,
      DeceasedRelationship: appointment.DeceasedRelationship,
      DeathCertificate: appointment.DeathCertificate,
    });

    // Open the first modal for editing
    setShowModal1(true);
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
    // Fill the name field with logged-in user's full name
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
          const appointment = appointments.find(
            (r) => r.id === formData.appointmentId
          );
          // Handle file upload for Death Certificate
          if (formData.DeathCertificate) {
            const storage = getStorage();

            const storageRef = ref(
              storage,
              `deathCertificates/${appointment.userId}/${formData.appointmentId}.pdf`
            );
            await uploadBytes(storageRef, formData.DeathCertificate);
          }

          const event = {
            type: "Appointment", // Type of event
            userId: loggedInUserId, // User ID associated with the event
            details: "Admin edited an existing appointment", // Details of the event
          };
          handleClose2(); // Close the second modal after submitting
          setIsFormOpen(false); // Close form

          // Call the AuditLogger function with the event object
          AuditLogger({ event });

          const title = "Appointment edited";
          const content = `Your appointment has been edited by an admin`;
          const recipient = appointment.userId;

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
    }
  };

  const handleRadioChange = (value) => {
    setFormData({
      ...formData,
      hasDeathCertificate: value,
      DeathCertificate: null, // Clear the file if "No" is selected
    });
  };

  const handleAssignStaff = async (appointmentId, staff, event) => {
    try {
      setLoading(true);
      const event = {
        type: "Appointment",
        userId: "admin",
        details: "Admin set a staff for an appointment",
      };

      await updateAppointmentStaff(appointmentId, staff); // Call Firebase function
      // Log event and refresh appointments list
      AuditLogger({ event });
      if ($.fn.DataTable.isDataTable("#appointmentsTable")) {
        $("#appointmentsTable").DataTable().destroy();
      }
      await fetchAppointments();
      setLoading(false);
      Toast.fire({
        icon: "success",
        title: `Staff assigned successfully: ${staff}`,
      });
    } catch (error) {
      console.error("Error assigning staff:", error);
      Toast.fire({
        icon: "error",
        title: "Failed to assign staff.",
      });
    }
  };

  return (
    <section className="dashboard-appointment">
      <main className="main-content">
        {loading && <Loader />}
        <div className="appointments-dashboard-box">
          <h1 className="centered">Appointments</h1>
        </div>
        <div className="customerReport">
          <div className="appointment-reports">
            <table className="appointment-list-table">
              <thead>
                <tr>
                  <th>Pending</th>
                  <th>Approved</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {
                      appointments.filter(
                        (appointment) => appointment.status === "pending"
                      ).length
                    }
                  </td>
                  <td>
                    {
                      appointments.filter(
                        (appointment) => appointment.status === "approved"
                      ).length
                    }
                  </td>
                  <td>
                    {
                      appointments.filter(
                        (appointment) => appointment.status === "completed"
                      ).length
                    }
                  </td>
                  <td>
                    {
                      appointments.filter(
                        (appointment) => appointment.status === "canceled"
                      ).length
                    }
                  </td>
                </tr>
              </tbody>
            </table>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Export to PDF file</Tooltip>}
            >
              <button
                className="generate-report-button"
                onClick={handleGenerateReports}
              >
                Generate Reports
              </button>
            </OverlayTrigger>
          </div>
          {appointments && appointments.length > 0 ? (
            <table className="display" id="appointmentsTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Phone Number</th>
                  <th>Plan</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Staff</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td>{appointment.name}</td>
                    <td>{formatDateTime(appointment.date)}</td>
                    <td>{appointment.phoneNumber}</td>
                    <td>{appointment.plan}</td>
                    <td>{appointment.notes}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <select
                        value={appointment.staff || ""}
                        onChange={(e) =>
                          handleAssignStaff(
                            appointment.appointmentId,
                            e.target.value
                          )
                        }
                      >
                        <option value="">Assign Staff</option>
                        {staffList.map((staff) => (
                          <option key={staff} value={staff}>
                            {staff}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Show Appointment Details</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() => handleShowDetails(appointment)}
                          className="view-details-button"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Appointment</Tooltip>}
                      >
                        <button
                          className="btn btn-warning"
                          type="button"
                          onClick={() => handleEditClick(appointment)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </OverlayTrigger>{" "}
                      <br />
                      <Dropdown className="actions-button">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {getAvailableActions(appointment.status).map(
                            (action) => (
                              <Dropdown.Item
                                key={action}
                                onClick={() =>
                                  handleAction(
                                    action,
                                    appointment.appointmentId
                                  )
                                }
                              >
                                {action.charAt(0).toUpperCase() +
                                  action.slice(1)}
                              </Dropdown.Item>
                            )
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No appointments</p>
          )}
        </div>
        <br />
        {/* Appointment Details Modal */}
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton className="admin-appointment-header">
            <Modal.Title className="admin-appointment-title">
              Appointment Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="admin-appointment-details-box">
            {selectedAppointment ? (
              <>
                <h4 className="admin-appointment-user">
                  {selectedAppointment.name}
                </h4>
                <p className="first-details">
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedAppointment.date)}
                  <br />
                  <strong>Phone Number:</strong>{" "}
                  {selectedAppointment.phoneNumber}
                  <br />
                  <strong>Plan:</strong> {selectedAppointment.plan}
                  <br />
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedAppointment.status)}
                  <br />
                  <strong>Notes:</strong> {selectedAppointment.notes || "N/A"}
                  <br />
                  <strong>Appointed Staff:</strong>{" "}
                  {selectedAppointment.staff || "None Yet"}
                </p>
                <br />
                <h4 className="postmortem-title">Post Mortem Details:</h4>
                <p className="second-details">
                  <strong>Deceased Name: </strong>
                  {selectedAppointment.DeceasedName}
                  <br />
                  <strong>Deceased Age: </strong>
                  {selectedAppointment.DeceasedAge}
                  <br />
                  <strong>Deceased Sex: </strong>
                  {selectedAppointment.DeceasedSex}
                  <br />
                  <strong>Deceased Birthday: </strong>
                  {selectedAppointment.DeceasedBirthday}
                  <br />
                  <strong>Date of Death: </strong>
                  {selectedAppointment.DateofDeath}
                  <br />
                  <strong>Place of Death: </strong>
                  {selectedAppointment.PlaceofDeath}
                  <br />
                  <strong>Deceased Relationship: </strong>
                  {selectedAppointment.DeceasedRelationship}
                  <br />
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        {selectedAppointment.DeathCertificate
                          ? "View Death Certificate File"
                          : "No Death Certificate Available"}
                      </Tooltip>
                    }
                  >
                    {selectedAppointment.DeathCertificate ? (
                      <a
                        href={selectedAppointment.DeathCertificate}
                        className="appointment-death-cert"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View PDF"
                      >
                        <strong>Death Certificate:</strong>{" "}
                        <FontAwesomeIcon icon={faFile} />
                      </a>
                    ) : (
                      <span className="no-death-certificate">
                        <strong>Death Certificate:</strong> No Death Certificate
                      </span>
                    )}
                  </OverlayTrigger>
                </p>
              </>
            ) : (
              <p>No details available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseDetailsModal}
              className="close2-button"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* First Modal for Plan, Phone Number, and Notes */}
        <Modal show={showModal1} onHide={handleClose1}>
          <Modal.Header closeButton className="booking-header">
            <Modal.Title className="booking-title">Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <p className="book-date" style={{ marginLeft: "20px" }}>
              Selected Date: <strong>{formData.date}</strong>
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
                  <option value="Plan 4">Plan 4 - Kid Plan</option>
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
                    const phoneValue = e.target.value.replace(/\D/g, "");
                    if (phoneValue.length <= 13) {
                      setFormData({ ...formData, phoneNumber: phoneValue });
                    }
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
              <Form.Group controlId="formHasDeathCertificate">
                <Form.Label className="label-title">
                  Has Death Certificate?
                </Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name="hasDeathCertificate"
                    value="yes"
                    checked={formData.hasDeathCertificate === "yes"}
                    onChange={() => handleRadioChange("yes")}
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="hasDeathCertificate"
                    value="no"
                    checked={formData.hasDeathCertificate === "no"}
                    onChange={() => handleRadioChange("no")}
                  />
                </div>
              </Form.Group>

              {/* File Upload for Death Certificate */}
              {formData.hasDeathCertificate === "yes" && (
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
                  />
                </Form.Group>
              )}

              <br />

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
                <Button variant="primary" type="submit" className="next-button">
                  Submit
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </main>
    </section>
  );
};

export default Appointments;
