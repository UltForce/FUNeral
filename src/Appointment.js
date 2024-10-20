import emailjs from "emailjs-com"; // Import EmailJS
import React, { useState, useEffect } from "react";
import {
  generateReports,
  deleteAppointment,
  updateAppointmentStatus,
} from "./firebase.js";
import {
  getAppointments,
  getCurrentUserId,
  AuditLogger,
  getUserRoleFirestore,
  sendNotification,
  getUserEmailById,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import { Dropdown, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import "./Appointment.css";

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
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    };

    fetchAppointments();
  }, []);

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
    try {
      await generateReports();
      Toast.fire({
        icon: "success",
        title: "Reports successfully generated..",
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
      const appointment = appointments.find((r) => r.id === appointmentId);
      if (action === "delete") {
        const userId = getCurrentUserId();
        const event = {
          type: "Appointment",
          userId: userId,
          details: "Admin deleted an appointment",
        };
        AuditLogger({ event });

        const title = "Appointment deleted";
        const content = `Your appointment has been deleted by an admin`;
        const recipient = appointment.userId;

        await sendNotification(title, content, userId, recipient);

        await deleteAppointment(appointmentId);
        Toast.fire({
          icon: "success",
          title: "Appointment deleted successfully",
        });
      } else {
        const userId = getCurrentUserId();
        const event = {
          type: "Appointment",
          userId: userId,
          details: "Admin changed the status of an appointment",
        };
        AuditLogger({ event });
        const title = "Appointment status changed";
        const content = `Your appointment status has been changed to ${action}`;
        const recipient = appointment.userId;

        await sendNotification(title, content, userId, recipient);

        await updateAppointmentStatus(appointmentId, action);

        // Fetch the user's email based on userId
        const userEmail = await getUserEmailById(userId);

        // Send email notification using EmailJS
        const emailParams = {
          to_name: appointment.name, // Name of the recipient
          status: action, // New status
          email: userEmail, // Email of the recipient retrieved from userId
        };

        // Replace these with your actual EmailJS credentials
        const serviceID = "service_5f3k3ms";
        const templateID = "template_g1w6f2a";
        const userID = "0Tz3RouZf3BXZaSmh"; // Use your User ID

        /*
        // Send the email
        await emailjs.send(serviceID, templateID, emailParams, userID);
*/
        Toast.fire({
          icon: "success",
          title: `Appointment status changed to ${action}`,
        });
      }
      await fetchAppointments(); // Refresh the appointments list
      const userId = getCurrentUserId();
      const event = {
        type: "Appointment",
        userId: userId,
        details: `Appointment ${
          action === "delete" ? "deleted" : `status changed to ${action}`
        }`,
      };
      AuditLogger({ event });
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
    ];
    return allActions.filter((action) => action !== status);
  };

  return (
    <section className="dashboard-appointment">
      <main className="main-content">
        <div className="appointments-dashboard-box">
          <h1 className="centered">Appointments</h1>
        </div>

        <div className="customerReport">
          <div className="appointment-reports">
            {/* <h3>
            Appointment List
          </h3> */}
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
            <button
              className="generate-report-button"
              onClick={handleGenerateReports}
            >
              Generate Reports
            </button>
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
                      <Button
                        variant="link"
                        onClick={() => handleShowDetails(appointment)}
                        className="view-details-button"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Dropdown className="action-button">
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
          <Modal.Header closeButton>
            <Modal.Title>Appointment Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="appointment-details-box">
            {selectedAppointment ? (
              <>
                <h4>{selectedAppointment.name}</h4>
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
                </p>
              </>
            ) : (
              <p>No details available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailsModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </section>
  );
};

export default Appointments;
