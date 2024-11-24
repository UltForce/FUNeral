import emailjs from "emailjs-com"; // Import EmailJS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import $ from "jquery";
import "datatables.net";
import {
  getReviewsFirestore,
  updateReviewStatusFirestore,
  deleteReviewFirestore,
  AuditLogger,
  getCurrentUserId,
  getUserRoleFirestore,
  sendNotification,
  getUserEmailById,
} from "./firebase.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./reviews.css";
import Loader from "./Loader"; // Import the Loader component
import { OverlayTrigger, Tooltip } from "react-bootstrap";
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

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

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
    const fetchReviews = async () => {
      const reviewsData = await getReviewsFirestore();
      setReviews(reviewsData);
      setLoading(false); // Hide loader after data is fetched
    };

    fetchReviews();
  }, []);

  // Initialize DataTable
  useEffect(() => {
    if (reviews.length) {
      $("#reviewsTable").DataTable();
    }
  }, [reviews]);

  const sendEmailNotification = async (
    recipientEmail,
    recipientName,
    status
  ) => {
    const emailParams = {
      to_name: recipientName,
      to_email: recipientEmail,
      status: status,
    };

    try {
      await emailjs.send(
        "service_5f3k3ms", // Replace with your EmailJS service ID
        "template_g1w6f2a", // Replace with your EmailJS template ID
        emailParams,
        "0Tz3RouM2ClDa9JZ3" // Replace with your EmailJS user ID
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  };

  const handleStatusChange = async (reviewId, newStatus, event) => {
    const result = await Swal.fire({
      title: `Are you sure you want to ${
        newStatus === "published" ? "publish" : "set to pending"
      } this review?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();
      const review = reviews.find((r) => r.id === reviewId);
      const event = {
        type: "Testimonial",
        userId: userId,
        details: "Admin updated a testimonial",
      };
      AuditLogger({ event });

      await updateReviewStatusFirestore(reviewId, newStatus);

      // Send a notification
      const title = "Testimonial Status Updated";
      const content = `The status of your testimonial has been changed to ${newStatus}.`;
      const recipient = review.userId;

      await sendNotification(title, content, userId, recipient);

      // Fetch the review owner's email
      const recipientEmail = await getUserEmailById(review.userId);
      const recipientName = `${review.firstname} ${review.lastname}`;

      // Fetch the user's email based on userId
      const userEmail = await getUserEmailById(userId);

      // Send email notification using EmailJS
      const emailParams = {
        type: "Review",
        to_name: recipientName, // Name of the recipient
        status: newStatus, // New status
        email: recipientEmail, // Email of the recipient retrieved from userId
      };

      // Replace these with your actual EmailJS credentials
      const serviceID = "service_5f3k3ms";
      const templateID = "template_g1w6f2a";
      const userID = "0Tz3RouZf3BXZaSmh"; // Use your User ID

      // Uncomment the following to send the email (if required)
      await emailjs.send(serviceID, templateID, emailParams, userID);

      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        )
      );
      Swal.fire(
        "updated!",
        "Review status updated successfully",
        "success"
      ).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: "Review status updated successfully",
          });
        }
      });
    }
    setLoading(false); // Set loading state to false after completion
  };

  const handleDelete = async (reviewId, event) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this review?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();
      const review = reviews.find((r) => r.id === reviewId);
      const event = {
        type: "Testimonial",
        userId: userId,
        details: "Admin deleted a testimonial",
      };
      AuditLogger({ event });

      const title = "Testimonial deleted";
      const content = `Your testimonial has been deleted by an admin.`;
      const recipient = review.userId;

      await sendNotification(title, content, userId, recipient);
      await deleteReviewFirestore(reviewId);
      // Destroy DataTable before updating the state
      if ($.fn.DataTable.isDataTable("#reviewsTable")) {
        $("#reviewsTable").DataTable().destroy();
      }
      setReviews(reviews.filter((review) => review.id !== reviewId));
      Swal.fire("deleted!", "Review deleted successfully", "success").then(
        (result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Review deleted successfully",
            });
          }
        }
      );
    }
    setLoading(false); // Set loading state to false after completion
  };

  return (
    <section className="reviews">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="review-dashboard-box">
          <h1 className="centered">Manage Reviews</h1>
        </div>
        <table id="reviewsTable" className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Plan</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{`${review.firstname} ${review.lastname}`}</td>
                  <td>{review.selectedPlan}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>{review.status}</td>
                  <td>
                    <div className="reviews-buttons">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Toggle Status</Tooltip>}
                      >
                        <span className="publish-review-button">
                          <button
                            className="btn btn-success"
                            title={
                              review.status === "pending"
                                ? "Publish"
                                : "Set to Pending"
                            }
                            onClick={(e) =>
                              handleStatusChange(
                                review.id,
                                review.status === "pending"
                                  ? "published"
                                  : "pending",
                                e
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                review.status === "pending"
                                  ? faCheckCircle
                                  : faTimesCircle
                              }
                            />
                          </button>
                        </span>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Review</Tooltip>}
                      >
                        <span className="delete-review-button">
                          <button
                            className="btn btn-danger"
                            title="Delete Review"
                            onClick={(e) => handleDelete(review.id, e)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </span>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No reviews available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </section>
  );
};

export default Reviews;
