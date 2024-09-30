import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // This includes tooltips and other Bootstrap JavaScript
import { Tooltip } from "bootstrap"; // Explicitly import Tooltip from Bootstrap
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import $ from "jquery";
import "datatables.net";
import {
  auth,
  getReviewsFirestore,
  updateReviewStatusFirestore,
  deleteReviewFirestore,
} from "./firebase.js"; // Assume these functions are defined in your firebase.js
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsData = await getReviewsFirestore(); // Fetch reviews from Firestore
      setReviews(reviewsData);
    };
    fetchReviews();
  }, []);

  // Initialize DataTable
  useEffect(() => {
    if (reviews.length) {
      $("#reviewsTable").DataTable();

      // Initialize Bootstrap tooltips
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
      await updateReviewStatusFirestore(reviewId, newStatus);
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
    hideTooltips(); // Hide tooltips before showing SweetAlert

    const result = await MySwal.fire({
      title: "Are you sure you want to delete this review?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      await deleteReviewFirestore(reviewId);
      setReviews(reviews.filter((review) => review.id !== reviewId));
      MySwal.fire({
        icon: "success",
        title: "Review deleted successfully",
      });
    }
  };

  return (
    <div className="reviews-container content section">
      <h2 className="centered">Manage Reviews</h2>
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
                  {/* Publish/Unpublish Button */}
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
                        e // Pass the event to handle tooltip
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
                  {/* Delete Button */}
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
    </div>
  );
};

export default Reviews;
