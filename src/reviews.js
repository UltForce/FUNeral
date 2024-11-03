import emailjs from "emailjs-com"; // Import EmailJS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Tooltip } from "bootstrap";
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
  getUserEmailById, // Add a function to get the user's email by their ID
} from "./firebase.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './reviews.css';

const MySwal = withReactContent(Swal);

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

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
    };
    fetchReviews();
  }, []);

  // Initialize DataTable
  useEffect(() => {
    if (reviews.length) {
      $("#reviewsTable").DataTable();
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipTriggerList.forEach(
        (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
      );
    }
  }, [reviews]);

  const hideTooltips = () => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      const tooltipInstance = Tooltip.getInstance(tooltipTriggerEl);
      if (tooltipInstance) {
        tooltipInstance.hide();
      }
    });
  };

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
        "0Tz3RouZf3BXZaSmh" // Replace with your EmailJS user ID
      );
      //console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleStatusChange = async (reviewId, newStatus, event) => {
    hideTooltips(); // Hide tooltips before showing SweetAlert

    const result = await MySwal.fire({
      title: `Are you sure you want to ${
        newStatus === "published" ? "publish" : "set to pending"
      } this review?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      const userId = getCurrentUserId();
      const review = reviews.find((r) => r.id === reviewId);
      const event = {
        type: "Testimonial",
        userId: userId,
        details: "Admin updated a testimonial",
      };
      AuditLogger({ event });

      await updateReviewStatusFirestore(reviewId, newStatus);

      // Fetch the review owner's email
      const recipientEmail = await getUserEmailById(review.userId);
      const recipientName = `${review.firstname} ${review.lastname}`;

      // Send a notification
      const title = "Testimonial Status Updated";
      const content = `The status of your testimonial has been changed to ${newStatus}.`;
      const recipient = review.userId;

      await sendNotification(title, content, userId, recipient);

      /* 
      // Send an email notification to the review owner
      if (newStatus === "published") {
        await sendEmailNotification(recipientEmail, recipientName, newStatus);
      }
*/

      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        )
      );
      MySwal.fire({
        icon: "success",
        title: "Review status updated successfully",
      });
    }
  };

  const handleDelete = async (reviewId, event) => {
    hideTooltips();

    const result = await MySwal.fire({
      title: "Are you sure you want to delete this review?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
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

      setReviews(reviews.filter((review) => review.id !== reviewId));
      MySwal.fire({
        icon: "success",
        title: "Review deleted successfully",
      });
    }
  };

  return (
    <section className="reviews">
      <main className="main-content">
        <div className="review-dashboard-box">
          <h1 className="centered">Manage Content</h1>
        </div>
      <table id="reviewsTable" className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{`${review.firstname} ${review.lastname}`}</td>
              <td>{review.rating}</td>
              <td>{review.comment}</td>
              <td>{review.status}</td>
              <td>
                <div>
                  <button
                    className="btn btn-success"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={
                      review.status === "pending" ? "Publish" : "Set to Pending"
                    }
                    onClick={(e) =>
                      handleStatusChange(
                        review.id,
                        review.status === "pending" ? "published" : "pending",
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
                  </button>{" "}
                  <button
                    className="btn btn-danger"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Delete Review"
                    onClick={(e) => handleDelete(review.id, e)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </main>
    </section>
  );
};

export default Reviews;
