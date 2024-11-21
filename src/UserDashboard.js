import React, { useEffect, useState } from "react";
import {
  auth,
  getUserAppointments,
  getCurrentUserId,
  getUserReviewsFirestore,
  getUserRoleFirestore,
  getUserTransactions,
  updateReviewFirestore,
  AuditLogger,
  sendNotification,
  deleteReviewFirestore,
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
import Loader from "./Loader.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faFile } from "@fortawesome/free-solid-svg-icons";
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
  const [date, setDate] = useState(new Date());
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

        // Sort future appointments by date and pick the first one (most recent upcoming)
        const sortedFutureAppointments = future.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        const mostRecentUpcomingAppointment = sortedFutureAppointments[0]; // Get the most recent upcoming appointment

        setFutureAppointments(
          mostRecentUpcomingAppointment ? [mostRecentUpcomingAppointment] : []
        ); // Set only the first upcoming appointment
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
      const loggedInUserId = getCurrentUserId();
      const event = {
        type: "Testimonial", // Type of event
        userId: loggedInUserId, // User ID associated with the event
        details: "User edited an existing testimonial", // Details of the event
      };
      // Call the AuditLogger function with the event object
      AuditLogger({ event });

      const title = "Pending appointment edited";
      const content = `A pending review ${editReviewId} has been edited`;
      const recipient = "admin";

      await sendNotification(title, content, loggedInUserId, recipient);

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
      }).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: "Testimonial updated successfully",
          });
        }
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

  const handleDeleteReview = async (reviewId, event) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this testimonial?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      if (!reviewId) {
        console.error("No review ID selected for deletion");
        return;
      }

      setLoading(true); // Show loader

      try {
        // Delete the review from Firestore
        await deleteReviewFirestore(reviewId);

        // Log deletion in audit logs
        const loggedInUserId = getCurrentUserId();
        const event = {
          type: "Testimonial",
          userId: loggedInUserId,
          details: "User deleted a testimonial",
        };
        AuditLogger({ event });

        // Send a notification to admin
        const title = "Testimonial deleted";
        const content = `A testimonial with ID ${reviewId} has been deleted`;
        const recipient = "admin";

        await sendNotification(title, content, loggedInUserId, recipient);

        // Refresh the testimonials list and close the modal
        fetchReviews();
        handleCloseEditModal();

        // Show success toast
        Swal.fire({
          icon: "success",
          title: "Testimonial deleted successfully!",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Testimonial deleted successfully",
            });
          }
        });
      } catch (error) {
        console.error("Error deleting testimonial:", error.message);
        Swal.fire({
          icon: "error",
          title: "Failed to delete testimonial",
          text: "An error occurred while trying to delete the testimonial. Please try again later.",
        });
      } finally {
        setLoading(false); // Hide loader
      }
    }
  };

  return (
    <div className="user-dashboard">
      {loading && <Loader />} {/* Use the Loader component here */}
      <div className="user-title-box">
        <h1>Dashboard</h1>
      </div>
      <div className="user-dashboard-info">
        <div
          className="user-dashboard-info-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "10px", // Reduced gap between cards
            width: "100%",
          }}
        >
          <div className="user-cards-total">
            <Card className="past-appointments">
              <Card.Header>Past Appointments</Card.Header>
              <ListGroup variant="flush" className="scrollable-list">
                {pastAppointments.length === 0 ? (
                  <ListGroup.Item className="no-past-appointment-list">
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
                        className="past-appointment-list"
                      >
                        <strong className="past-name">
                          {appointment.name}{" "}
                        </strong>{" "}
                        -{" "}
                        <strong className="past-date">
                          {new Date(appointment.date).toLocaleString()}{" "}
                        </strong>
                        -{" "}
                        <strong className="past-status">
                          {getStatusBadge(appointment.status)}
                        </strong>
                      </ListGroup.Item>
                    </OverlayTrigger>
                  ))
                )}
              </ListGroup>
            </Card>
          </div>

          <div className="user-cards-total">
            <Card className="current-appointments">
              <Card.Header>Current Appointment</Card.Header>
              <ListGroup variant="flush">
                {futureAppointments.length === 0 ? (
                  <ListGroup.Item className="no-current-appointment-list">
                    No current appointment found.
                  </ListGroup.Item>
                ) : (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>View Current Appointment Details</Tooltip>
                    }
                  >
                    <ListGroup.Item
                      key={futureAppointments[0].id} // Ensure we use the first (and only) appointment
                      onClick={() => handleShowDetails(futureAppointments[0])}
                      style={{ cursor: "pointer" }}
                      className="current-appointment-list"
                    >
                      <div className="current-name-date">
                        <strong>{futureAppointments[0].name}</strong>
                        <div className="current-appointment-date">
                          {new Date(
                            futureAppointments[0].date
                          ).toLocaleString()}{" "}
                          {getStatusBadge(futureAppointments[0].status)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  </OverlayTrigger>
                )}
              </ListGroup>
            </Card>
          </div>

          <div className="user-cards-total">
            <Card className="your-reviews">
              <Card.Header>Your Reviews</Card.Header>
              <ListGroup variant="flush">
                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <ListGroup.Item className="no-reviews-list">
                      No reviews found.
                    </ListGroup.Item>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <ListGroup.Item
                      key={review.id}
                      className="your-review-list"
                    >
                      <h5 className="review-title">{review.title}</h5>
                      <p className="review-comment">{review.comment}</p>
                      <p className="review-stars">
                        Rating:{" "}
                        <div className="stars">
                          {"⭐".repeat(review.rating)}
                        </div>
                      </p>
                      <p className="review-status">
                        <strong>Status: </strong>
                        {review.status}
                      </p>
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
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                        </OverlayTrigger>
                      )}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Item</Tooltip>}
                      >
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={(event) => {
                            handleDeleteReview(review.id, event);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </OverlayTrigger>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>

            {/* Modal to edit testimonial */}
            <Modal show={editReviewId !== null} onHide={handleCloseEditModal}>
              <Modal.Header closeButton className="user-testimonial-header">
                <Modal.Title  className="user-testimonial-title">Edit Your Testimonial</Modal.Title>
              </Modal.Header>
              <Modal.Body className="user-testimonial-details-box">
                <form onSubmit={handleEditSubmit}>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${
                          star <= rating ? "filled" : "faded"
                        }`}
                        onClick={() => setRating(star)} // Set the rating when clicked
                        style={{ cursor: "pointer" }} // Make stars clickable
                      >
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Your comment"
                      required
                      className="testimonial-form-control"
                      rows="3"
                    />
                  </div>
                  
                  <div className="testimonial-buttons">
                    <Button
                      variant="secondary"
                      onClick={handleCloseEditModal}
                      className="close-button"
                    >
                      Close
                    </Button>
                    <Button type="submit" variant="primary" className="update-testimonial-button">
                      Update Testimonial
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal>
          </div>

          <div className="user-cards-total">
            <Card className="transaction-details">
              <Card.Header>Transaction Details</Card.Header>
              <ListGroup variant="flush" className="scrollable-list">
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
                        className="user-transaction"
                      >
                        <p className="user-transaction-id">
                          <strong></strong> {transaction.dateOfBurial}
                          {", "}
                          {transaction.timeOfBurial}{" "}
                          {getStatusBadge(transaction.status)}
                        </p>
                        {/* You can add more transaction details here if needed */}
                      </ListGroup.Item>
                    </OverlayTrigger>
                  ))
                ) : (
                  <ListGroup.Item className="no-transactions">
                    No transactions found for the current user.
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </div>

          {/* Appointment Details Modal */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton className="user-appointment-header">
              <Modal.Title className="user-appointment-title">
                Appointment Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="user-appointment-details-box">
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
                      overlay={<Tooltip>View Death Certificate File</Tooltip>}
                    >
                      <a
                        href={selectedAppointment.DeathCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View PDF"
                        className="appointment-death-cert"
                      >
                        <strong>Death Certificate:</strong> <FontAwesomeIcon icon={faFile} />
                      </a>
                    </OverlayTrigger>
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
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="close2-button"
                >
                  Close
                </Button>
              </OverlayTrigger>
            </Modal.Footer>
          </Modal>

          {/* Transaction Details Modal */}
          <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
            <Modal.Header closeButton className="user-transaction-header">
              <Modal.Title className="user-transaction-title">
                Transaction Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="user-transaction-details-box">
              {selectedTransaction ? (
                <>
                  <h4 className="admin-transaction-user">
                    {selectedTransaction.deceasedName || "N/A"}
                  </h4>
                  <p className="first-details">
                    <strong>Date of Burial:</strong>{" "}
                    {selectedTransaction.dateOfBurial}
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
                  <div className="transaction-border"></div>
                  <h4 className="particulars-title">Particulars Details:</h4>
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
                            <td>
                              {selectedTransaction[field]?.amount || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </p>
                  <div className="transaction-border"></div>
                  <h4 className="financial-summary-title">
                    Financial Summary:
                  </h4>
                  <p className="financial-summary-details">
                    <strong>Total Amount:</strong> ₱
                    {selectedTransaction.totalAmount || "0.00"}
                    <br />
                    <strong>Deposit:</strong> ₱
                    {selectedTransaction.deposit || "0.00"}
                    <br />
                    <strong>Balance:</strong> ₱
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
        <div className="user-dashboard-calendar">
          <Card
            style={{ height: "525px", width: "100%" }}
            className="dashboard-calendar"
          >
            <Card.Header>Calendar</Card.Header>
            <Card.Body style={{ height: "100%", padding: 0, width: "100%" }}>
              <Calendar onChange={setDate} value={date} className="calendar" />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
