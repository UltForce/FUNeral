import React, { useEffect, useState } from "react";
import {
  auth,
  getUserAppointments,
  getCurrentUserId,
  getUserReviewsFirestore,
  getUserRoleFirestore,
  getUserTransactions,
  updateReviewFirestore,
} from "./firebase.js";
import {
  Card,
  ListGroup,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import Loader from "./Loader.js";
import Swal from "sweetalert2";

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

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [futureAppointments, setFutureAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [editReviewId, setEditReviewId] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
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
        const transactions = await getUserTransactions(userId);
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
        setUserTransactions(transactions);
        setLoading(false); // Set loading state to true
      } catch (error) {
        setLoading(false); // Set loading state to true
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, []);

  const fetchReviews = async () => {
    const currentUserId = getCurrentUserId();
    const userReviews = await getUserReviewsFirestore(currentUserId);
    setReviews(userReviews);
  };

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

  const handleShowDetailsModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  // Function to handle updating the testimonial
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your testimonial?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (result.isConfirmed) {
      setLoading(false); // Set loading state to true
      const updatedReview = {
        comment,
        rating,
        status: "pending", // Keep status as pending (you can customize this based on your requirements)
      };

      await updateReviewFirestore(editReviewId, updatedReview);

      // Clear the form and reset the state
      setComment("");
      setRating(5);
      setEditReviewId(null);
      fetchReviews();
      handleCloseEditModal();
      setLoading(true); // Set loading state to true
      // Show success toast
      Swal.fire({
        icon: "success",
        title: "Testimonial updated successfully!",
      });
    }
    setLoading(false); // Set loading state to true
  };

  // Function to start editing a review
  const startEditReview = (review) => {
    setEditReviewId(review.id);
    setComment(review.comment);
    setRating(review.rating);
  };

  const handleCloseEditModal = () => {
    setEditReviewId(null); // Close the modal by setting editReviewId to null
    setComment("");
    setRating(5); // Reset the form fields if necessary
  };

  return (
    <div className="section content-user">
      {loading && <Loader />} {/* Use the Loader component here */}
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
                    {/* Show Edit button only if the review is still pending */}
                    {review.status === "pending" && (
                      <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip>Edit your review</Tooltip>}
                      >
                        <Button
                          variant="warning"
                          onClick={() => startEditReview(review)}
                        >
                          Edit
                        </Button>
                      </OverlayTrigger>
                    )}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>

          {/* Modal to edit testimonial */}
          <Modal show={editReviewId !== null} onHide={handleCloseEditModal}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Your Testimonial</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Your comment"
                    required
                    className="form-control"
                    rows="3"
                  />
                </div>
                <div className="mb-3 star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? "filled" : "faded"}`}
                      onClick={() => setRating(star)} // Set the rating when clicked
                      style={{ cursor: "pointer" }} // Make stars clickable
                    >
                      &#9733;
                    </span>
                  ))}
                </div>
                <Button type="submit" variant="primary">
                  Update Testimonial
                </Button>
              </form>
            </Modal.Body>
          </Modal>
        </div>

        <div>
          <Card>
            <Card.Header>Transaction Details</Card.Header>
            <ListGroup variant="flush">
              {userTransactions.length > 0 ? (
                userTransactions.map((transaction) => (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>View Transaction Details</Tooltip>}
                  >
                    <ListGroup.Item
                      key={transaction.id}
                      onClick={() => handleShowDetailsModal(transaction)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Transaction ID:</strong> {transaction.id}
                      {/* You can add more transaction details here if needed */}
                    </ListGroup.Item>
                  </OverlayTrigger>
                ))
              ) : (
                <ListGroup.Item className="text-center">
                  No transactions found for the current user.
                </ListGroup.Item>
              )}
            </ListGroup>
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

        {/* Transaction Details Modal */}
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton className="admin-appointment-header">
            <Modal.Title className="admin-appointment-title">
              Transaction Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="admin-appointment-details-box">
            {selectedTransaction ? (
              <>
                <h4 className="admin-appointment-user">
                  {selectedTransaction.deceasedName || "N/A"}
                </h4>
                <p className="first-details">
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedTransaction.dateOfBurial)}
                  <br />
                  <strong>Time of Burial:</strong>{" "}
                  {selectedTransaction.timeOfBurial}
                  <br />
                  <strong>Ordered By:</strong> {selectedTransaction.orderedBy}
                  <br />
                  <strong>Address:</strong> {selectedTransaction.address}
                  <br />
                  <strong>Cemetery:</strong> {selectedTransaction.cemetery}
                  <br />
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedTransaction.status)}
                </p>
                <br />
                <h4 className="postmortem-title">Particulars Details:</h4>
                <p className="second-details">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Particulars</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "casket",
                        "hearse",
                        "funServicesArrangements",
                        "permits",
                        "embalming",
                        "cemeteryExpenses",
                        "otherExpenses",
                      ].map((field) => (
                        <tr key={field}>
                          <td>{field.replace(/([A-Z])/g, " $1")}</td>
                          <td>
                            {selectedTransaction[field]?.particulars || "N/A"}
                          </td>
                          <td>{selectedTransaction[field]?.amount || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </p>
                <br />
                <h4 className="financial-summary-title">Financial Summary:</h4>
                <p className="financial-summary-details">
                  <strong>Total Amount:</strong> $
                  {selectedTransaction.totalAmount || "0.00"}
                  <br />
                  <strong>Deposit:</strong> $
                  {selectedTransaction.deposit || "0.00"}
                  <br />
                  <strong>Balance:</strong> $
                  {selectedTransaction.balance || "0.00"}
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
      </div>
    </div>
  );
};

export default UserDashboard;
