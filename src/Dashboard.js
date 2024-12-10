import React, { useState, useEffect } from "react";
import {
  auth,
  getAppointments,
  getAllUsers,
  getAppointmentsWithStatus,
  getCurrentUserId,
  getUserRoleFirestore,
  fetchAdminNotifications,
  fetchUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./firebase.js";
import "./dashboard.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Badge,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUsers,
  faCalendarDay,
  faCheckCircle,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");

        // Fetch notifications for the logged-in user
        await fetchNotifications(); // Fetch notifications when user logs in
      } else {
        setNotifications([]); // Clear notifications when user logs out
        setHasUnreadNotifications(false); // Reset red dot
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) return; // Exit if userId is not valid

    const userRole = await getUserRoleFirestore(userId);

    let notificationsData = [];

    if (userRole === "admin") {
      notificationsData = await fetchAdminNotifications();
    } else {
      notificationsData = await fetchUserNotifications();
    }

    // Sort notifications by unread status and timestamp (most recent first)
    notificationsData.sort((a, b) => {
      // First, prioritize unread notifications (false is treated as greater than true)
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;

      // If both are the same (both read or both unread), prioritize by most recent (timestamp descending)
      return b.timestamp - a.timestamp;
    });

    // Check if there are unread notifications
    const unreadExists = notificationsData.some(
      (notification) => !notification.isRead
    );
    setHasUnreadNotifications(unreadExists); // Show red dot if there are unread notifications
    setNotifications(notificationsData);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    fetchNotifications(); // Refresh notifications after marking as read
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchNotifications(); // Refresh notifications after deletion
  };

  // window load
  $(window).on("load", function (e) {
    // set active page on sidebar
    var pgurl = window.location.href.substr(
      window.location.href.indexOf("/") + 2
    );
    pgurl = pgurl.substr(pgurl.indexOf("/") + 1);
    pgurl = pgurl.replace(".aspx", "");

    var active = $('a[href$="' + pgurl + '"]');
    active.addClass("active");

    if (active.parent().parent().parent().is("li")) {
      active.parent().parent().parent().addClass("open");
    }

    // hide page loader
    setTimeout(function () {
      //$("#page-loader").fadeOut(200);
      $("#page-loader2").fadeOut(10);
    }, 800);
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments = await getAppointments();
        setAppointments(appointments);

        // Count appointments for today
        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = appointments.filter(
          (appointment) =>
            new Date(appointment.date).toISOString().split("T")[0] === today
        );
        setTodaysAppointments(todayAppointments);

        // Find the soonest appointment
        const soonestAppointment = getSoonestAppointment(appointments);
        setSelectedAppointment(soonestAppointment);

        // Count completed appointments
        const completedAppointments = await getAppointmentsWithStatus(
          "completed"
        );
        setCompletedAppointments(completedAppointments.length);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setTotalUsers(users.length);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchAppointments();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      if (!$.fn.DataTable.isDataTable("#appointmentsTable")) {
        $("#appointmentsTable").DataTable({
          lengthMenu: [10, 25, 50, 75, 100],
          pagingType: "full_numbers",
          order: [],
          columnDefs: [
            { targets: "no-sort", orderable: false },
            { targets: 1, type: "date-euro" },
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

  const handleShowMore = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const getSoonestAppointment = (appointments) => {
    const today = new Date();
    const futureAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today;
    });

    return futureAppointments.reduce((soonest, current) => {
      const soonestDate = new Date(soonest.date);
      const currentDate = new Date(current.date);
      return currentDate < soonestDate ? current : soonest;
    }, futureAppointments[0]);
  };

  return (
    <section>
      <section className="admin-dashboard">
        <main className="main-content">
          <div className="admin-title-box">
            <div className="title-notification-container">
              <h1>Dashboard</h1>
              <div className="notification-container">
                <button
                  onClick={toggleDropdown}
                  className="admin-notify-button"
                >
                  <FontAwesomeIcon icon={faBell} className="bell-icon" />
                  {hasUnreadNotifications && <span className="red-dot"></span>}
                </button>
                {isDropdownOpen && (
                  <div className="notification-dropdown">
                    {notifications.length === 0 ? (
                      <p>No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification ${
                            notification.isRead ? "read" : "unread"
                          }`}
                        >
                          <div className="notification-info">
                            <h4>{notification.title}</h4>
                            <p>{notification.content}</p>
                            <small>
                              {new Date(
                                notification.timestamp instanceof Date
                                  ? notification.timestamp
                                  : notification.timestamp.toDate()
                              ).toLocaleString()}
                            </small>

                            <div className="notification-buttons">
                              {/* Conditionally render the mark as read/unread button */}
                              {!notification.isRead ? (
                                <button
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="read-button"
                                >
                                  Mark as Read
                                </button>
                              ) : (
                                <p> </p>
                              )}
                              <button
                                onClick={() =>
                                  handleDeleteNotification(notification.id)
                                }
                                className="dismiss-button"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/*<div className="custom-page-loader" id="page-loader2"></div>*/}
          <Container fluid>
            <Row className="cards-row">
              <Col className="cards-total">
                <Card
                  className="text-center stats-card"
                  style={{ overflowY: "auto" }}
                >
                  <Card.Body>
                    <div className="stats-first-column">
                      <div className="stats-icon">
                        <FontAwesomeIcon
                          icon={faUsers}
                          size="4x"
                          className="stats-icons"
                        />
                      </div>
                    </div>
                    <div className="stats-second-column">
                      <Card.Title>Total Customers</Card.Title>
                      <Card.Text>
                        <h1>{totalUsers}</h1>
                        <p>Till Today</p>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="cards-total">
                <Card
                  className="text-center stats-card"
                  style={{ overflowY: "auto" }}
                >
                  <Card.Body>
                    <div className="stats-first-column">
                      <div className="stats-icon">
                        <FontAwesomeIcon icon={faCalendarDay} size="4x" />
                      </div>
                    </div>
                    <div className="stats-second-column">
                      <Card.Title>Today's Appointments</Card.Title>
                      <Card.Text>
                        <h1>{todaysAppointments.length}</h1>
                        <p>{new Date().toLocaleDateString()}</p>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col className="cards-total">
                <Card
                  className="text-center stats-card"
                  style={{ overflowY: "auto" }}
                >
                  <Card.Body>
                    <div className="stats-first-column">
                      <div className="stats-icon">
                        <FontAwesomeIcon icon={faCheckCircle} size="4x" />
                      </div>
                    </div>
                    <div className="stats-second-column">
                      <Card.Title>Finished Appointments</Card.Title>
                      <Card.Text>
                        <h1>{completedAppointments}</h1>
                        <p>All Time</p>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="bottom-cards-row">
              <Col className="bottom-cards-total">
                <Card
                  style={{ height: "450px", overflowY: "auto" }}
                  className="today-appointments"
                >
                  <Card.Header>Today's Appointments</Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {todaysAppointments.length === 0 ? (
                        <ListGroup.Item className="today-appointment-list">
                          No appointments today
                        </ListGroup.Item>
                      ) : (
                        todaysAppointments.map((appointment) => (
                          <ListGroup.Item
                            className="appointment-list"
                            key={appointment.id}
                          >
                            <div className="today-appointment-name">
                              <strong>{appointment.name}</strong>
                            </div>

                            <div className="plan-date-status">
                              <p className="appointment-plan">
                                {appointment.plan}
                              </p>
                              <p className="appointment-date">
                                {" "}
                                {formatDateTime(appointment.date)}
                              </p>
                              <p> {getStatusBadge(appointment.status)}</p>
                            </div>
                          </ListGroup.Item>
                        ))
                      )}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              <Col className="bottom-cards-total">
                <Card
                  style={{
                    height: "450px",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >
                  <Card.Header>Next Appointment Details</Card.Header>
                  <Card.Body>
                    {selectedAppointment ? (
                      <>
                        <Card.Title className="next-appointment-user-name">
                          {selectedAppointment.name}
                        </Card.Title>
                        <Card.Text className="next-appointment-details">
                          <strong>Time:</strong>{" "}
                          <div className="date-box">
                            {formatDateTime(selectedAppointment.date)}
                          </div>
                          <br />
                          <strong>Name:</strong>
                          <div className="next-appointment-name">
                            {selectedAppointment.name}
                          </div>
                        </Card.Text>
                        <OverlayTrigger
                          placement="right"
                          overlay={<Tooltip>Show Appointment Details</Tooltip>}
                        >
                          <Button
                            variant="primary"
                            className="show-more-button"
                            onClick={handleShowMore}
                          >
                            Show More
                          </Button>
                        </OverlayTrigger>
                      </>
                    ) : (
                      <Card.Text>No upcoming appointments</Card.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col className="bottom-cards-total">
                <Card
                  style={{ height: "450px", width: "100%" }}
                  className="dashboard-calendar"
                >
                  <Card.Header>Calendar</Card.Header>
                  <Card.Body
                    style={{ height: "100%", padding: 0, width: "100%" }}
                  >
                    <Calendar
                      onChange={setDate}
                      value={date}
                      className="calendar"
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>
      </section>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton className="appointment-header">
          <Modal.Title className="appointment-title">
            Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="appointment-details-box">
          {selectedAppointment ? (
            <>
              <h4 className="appointment-details-user-name">
                {selectedAppointment.name}
              </h4>
              <p className="first-details">
                <strong>Date:</strong>{" "}
                {formatDateTime(selectedAppointment.date)}
                <br />
                <strong>Phone Number:</strong> {selectedAppointment.phoneNumber}
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
            onClick={handleCloseModal}
            className="close2-button"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Dashboard;
