import React, { useState, useEffect } from "react";
import {
  getAppointments,
  getAllUsers,
  getAppointmentsWithStatus,
  getCurrentUserId,
  getUserRoleFirestore,
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
} from "react-bootstrap";
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
  const [appointments, setAppointments] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

  const statusColors = {
    pending: "orange",
    canceled: "red",
    approved: "blue",
    completed: "green",
  };

  const getStatusColor = (status) => {
    return statusColors[status] || "gray";
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
            <h1>Dashboard</h1>
          </div>
          {/*<div class="custom-page-loader" id="page-loader2"></div>*/}
          <Container fluid>
            <Row className="mt-4">
              <Col md={4}>
                <Card
                  className="text-center stats-card"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <Card.Body>
                    <Card.Title>Total Customers</Card.Title>
                    <Card.Text>
                      <h1>{totalUsers}</h1>
                      <p>Till Today</p>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card
                  className="text-center stats-card"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <Card.Body>
                    <Card.Title>Today's Appointments</Card.Title>
                    <Card.Text>
                      <h1>{todaysAppointments.length}</h1>
                      <p>{new Date().toLocaleDateString()}</p>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card
                  className="text-center stats-card"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <Card.Body>
                    <Card.Title>Finished Appointments</Card.Title>
                    <Card.Text>
                      <h1>{completedAppointments}</h1>
                      <p>All Time</p>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={4}>
                <Card style={{ height: "450px", overflowY: "auto" }} className="today-appointments">
                  <Card.Header>Today's Appointments</Card.Header>
                  <ListGroup variant="flush">
                    {todaysAppointments.length === 0 ? (
                      <ListGroup.Item className="text-center">
                        No appointments today
                      </ListGroup.Item>
                    ) : (
                      todaysAppointments.map((appointment) => (
                        <ListGroup.Item className="appointment-list" key={appointment.id}>
                          {appointment.name} - {appointment.plan} -{" "}
                          {formatDateTime(appointment.date)}
                          <Badge
                            bg={getStatusColor(appointment.status)}
                            className="float-right"
                          >
                            {appointment.status}
                          </Badge>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card>
              </Col>

              <Col md={4}>
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
                        <Card.Title>{selectedAppointment.name}</Card.Title>
                        <Card.Text className="next-appointment-details">
                          <strong>Time:</strong>{" "}
                          <div className="date-box">{formatDateTime(selectedAppointment.date)}</div>
                          <br />
                          <strong>Name:</strong> 
                          <div className="next-appointment-name">{selectedAppointment.name}</div>
                        </Card.Text>
                        <Button variant="primary" className="show-more-button" onClick={handleShowMore}>
                          Show More
                        </Button>
                      </>
                    ) : (
                      <Card.Text>No upcoming appointments</Card.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card style={{ height: "450px", width: "100%" }}className="dashboard-calendar">
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
          <Modal.Title className="appointment-title">Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="appointment-details-box">
          {selectedAppointment ? (
            <>
              <h4>{selectedAppointment.name}</h4>
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
          <Button variant="secondary" onClick={handleCloseModal} className="close2-button">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Dashboard;
