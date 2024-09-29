import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net"; // Make sure you've installed the datatables.net package
import {
  auth,
  getReviewsFirestore,
  updateReviewStatusFirestore,
  deleteReviewFirestore,
} from "./firebase.js"; // Assume these functions are defined in your firebase.js

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
    // Initialize DataTable after reviews are fetched
    if (reviews.length) {
      $("#reviewsTable").DataTable();
    }
  }, [reviews]);

  const handleStatusChange = async (reviewId, newStatus) => {
    await updateReviewStatusFirestore(reviewId, newStatus);
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
  };

  const handleDelete = async (reviewId) => {
    await deleteReviewFirestore(reviewId);
    setReviews(reviews.filter((review) => review.id !== reviewId));
  };

  return (
    <div className="reviews-container content section">
      <h2>Manage Reviews</h2>
      <table id="reviewsTable" className="display">
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
              <td>{`${review.firstName} ${review.lastName}`}</td>
              <td>{review.rating}</td>
              <td>{review.comment}</td>
              <td>{review.status}</td>
              <td>
                <div>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        review.id,
                        review.status === "pending" ? "published" : "pending"
                      )
                    }
                  >
                    {review.status === "pending" ? "Publish" : "Pending"}
                  </button>
                  <button onClick={() => handleDelete(review.id)}>
                    Delete
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
