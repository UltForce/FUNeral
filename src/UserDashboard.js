import React, { useEffect, useState } from "react";
import {
  auth,
  getUserAppointments,
  getCurrentUserId,
  getUserReviewsFirestore,
  getUserRoleFirestore,
} from "./firebase.js";
import {
  Card,
  ListGroup,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [futureAppointments, setFutureAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const checkUserLoginStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      setIsLoggedIn(true);
      const userId = getCurrentUserId();
      const userRole = await getUserRoleFirestore(userId);
      if (userRole !== "user") {
        navigate("/login");
      }
    };

    checkUserLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = getCurrentUserId();
      try {
        const userAppointments = await getUserAppointments(userId);
        const userReviews = await getUserReviewsFirestore(userId);
        const currentDate = new Date();

        const future = userAppointments.filter(
          (appointment) => new Date(appointment.date) >= currentDate
        );
        const past = userAppointments.filter(
          (appointment) => new Date(appointment.date) < currentDate
        );

        setFutureAppointments(future);
        setPastAppointments(past);
        setReviews(userReviews);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleShowDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

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

  return (
    <div className="section content-user">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "10px", // Reduced gap between cards
        }}
      >
        <div>
          <Card>
            <Card.Header>Past Appointments</Card.Header>
            <ListGroup variant="flush">
              {pastAppointments.length === 0 ? (
                <ListGroup.Item className="text-center">
                  No past appointments found.
                </ListGroup.Item>
              ) : (
                pastAppointments.map((appointment) => (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>View Past Appointment Details</Tooltip>}
                  >
                    <ListGroup.Item
                      key={appointment.id}
                      onClick={() => handleShowDetails(appointment)}
                      style={{ cursor: "pointer" }}
                    >
                      {appointment.name} -{" "}
                      {new Date(appointment.date).toLocaleString()}
                    </ListGroup.Item>
                  </OverlayTrigger>
                ))
              )}
            </ListGroup>
          </Card>
        </div>

        <div>
          <Card>
            <Card.Header>Current Appointment</Card.Header>
            <ListGroup variant="flush">
              {futureAppointments.length === 0 ? (
                <ListGroup.Item className="text-center">
                  No current appointment found.
                </ListGroup.Item>
              ) : (
                futureAppointments.map((appointment) => (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>View Current Appointment Details</Tooltip>
                    }
                  >
                    <ListGroup.Item
                      key={appointment.id}
                      onClick={() => handleShowDetails(appointment)}
                      style={{ cursor: "pointer" }}
                    >
                      {appointment.name} -{" "}
                      {new Date(appointment.date).toLocaleString()}
                    </ListGroup.Item>
                  </OverlayTrigger>
                ))
              )}
            </ListGroup>
          </Card>
        </div>

        <div>
          <Card>
            <Card.Header>Your Reviews</Card.Header>
            <ListGroup variant="flush">
              {reviews.length === 0 ? (
                <ListGroup.Item className="text-center">
                  No reviews found.
                </ListGroup.Item>
              ) : (
                reviews.map((review) => (
                  <ListGroup.Item key={review.id}>
                    <h5>{review.title}</h5>
                    <p>{review.comment}</p>
                    <p>
                      Rating:{" "}
                      <div className="stars">{"⭐".repeat(review.rating)}</div>
                    </p>
                    <p>Status: {review.status}</p>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </div>

        <div>
          <Card>
            <Card.Header>Transaction Details</Card.Header>
            <Card.Body>
              <p>This section is reserved for transaction details.</p>
            </Card.Body>
          </Card>
        </div>

        {/* Appointment Details Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
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
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Close the details modal</Tooltip>}
            >
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </OverlayTrigger>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default UserDashboard;
