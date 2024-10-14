import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getUserRoleFirestore,
  getPublishedTestimonials,
  submitTestimonialFirestore,
  getCurrentUserId,
  getUserDetails,
  AuditLogger,
  sendNotification,
} from "./firebase.js"; // Assume these functions are defined in your firebase.js
import Swal from "sweetalert2";
import "./about.css";

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

const About = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5); // Default rating
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        setCurrentUserId(userId); // Store current user ID
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");

        // Get user details
        const userDetails = await getUserDetails(userId); // Fetch user details
        if (userDetails) {
          setFirstName(userDetails.firstname || "");
          setLastName(userDetails.lastname || "");
        }
      }
    });

    const fetchTestimonials = async () => {
      const publishedTestimonials = await getPublishedTestimonials(); // Fetch published testimonials

      // Sort testimonials by highest rating first, and then by most recent
      const sortedTestimonials = publishedTestimonials.sort((a, b) => {
        if (b.rating === a.rating) {
          return b.timestamp - a.timestamp; // Sort by most recent if ratings are the same
        }
        return b.rating - a.rating; // Sort by highest rating first
      });

      // Limit to top 4 testimonials
      setTestimonials(sortedTestimonials.slice(0, 4));
    };

    fetchTestimonials();
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if firstName and lastName are set
    if (!firstname || !lastname) {
      Toast.fire({
        icon: "error",
        title: "User details are not available. Please try again later.",
      });
      return;
    }

    // Check if the user has already submitted a testimonial
    const existingTestimonial = testimonials.find(
      (testimonial) => testimonial.userId === currentUserId
    );

    if (existingTestimonial) {
      Toast.fire({
        icon: "error",
        title: "You have already submitted a testimonial.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to submit your testimonial?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
    });

    if (result.isConfirmed) {
      const event = {
        type: "Testimonial",
        userId: currentUserId,
        details: "User submitted a testimonial",
      };
      AuditLogger({ event });

      const title = "Testimonial submitted";
      const content = `A Testimonial has been submitted`;
      const recipient = "admin";

      await sendNotification(title, content, currentUserId, recipient);

      await submitTestimonialFirestore({
        userId: currentUserId, // Include user ID
        firstname,
        lastname,
        comment,
        rating,
        status: "pending", // Default status
      });

      // Clear the form
      setComment("");
      setRating(5);

      // Show success toast
      Toast.fire({
        icon: "success",
        title: "Testimonial request sent successfully!",
      });
    }
  };

  // Render stars based on the current rating
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= rating ? "filled" : "faded"}`}
        onClick={() => setRating(star)} // Set the rating when clicked
        style={{ cursor: "pointer" }} // Make stars clickable
      >
        &#9733; {/* Unicode star character */}
      </span>
    ));
  };

  return (
    <div className="snapping-container content-user">
      <section className="snap-section about-us-section">
        <h2>About Us</h2>
        <h3>Address</h3>
        <p>64 K4th Kamuning, Quezon City</p>
        {/* Embed Google Maps */}
        <iframe
          title="J.ROA Funeral Services"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.28181057950175!2d121.0388392476465!3d14.62702553834181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b70070be2ceb%3A0xf8649452deb2ddac!2sJ.ROA%20FUNERAL%20SERVICES!5e0!3m2!1sen!2sph!4v1723812378194!5m2!1sen!2sph"
          width="400"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
        <br />
        <h3>Contact No.</h3>
        <p>0909 081 3396 / 0935 354 4006</p>
      </section>

      <section className="snap-section testimonials-section">
        <h2>Testimonials</h2>
        <div className="testimonials-grid">
          {testimonials.slice(0, 4).map((testimonial) => (
            <div key={testimonial.id} className="testimonial">
              <div className="testimonial-content">
                <div className="stars">{"⭐".repeat(testimonial.rating)}</div>
                <p className="reviewer-name">{`${testimonial.firstname} ${testimonial.lastname}`}</p>
                <p className="review-description">{testimonial.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isLoggedIn && (
        <section className="submit-testimonial-section section">
          <h3>Add Your Testimonial</h3>
          <form onSubmit={handleSubmit}>
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
            <div className="mb-3 star-rating">{renderStars()}</div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default About;
