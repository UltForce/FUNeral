import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getUserRoleFirestore,
  getPublishedTestimonials,
  submitTestimonialFirestore,
  getCurrentUserId,
  getUserDetails,
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
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
      setTestimonials(publishedTestimonials);
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
      await submitTestimonialFirestore({
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
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial">
            <div className="testimonial-content">
              <div className="stars">{"⭐".repeat(testimonial.rating)}</div>
              <p className="reviewer-name">{`${testimonial.firstname} ${testimonial.lastname}`}</p>
              <p className="review-description">{testimonial.comment}</p>
            </div>
          </div>
        ))}
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
            <div className="mb-3">
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
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
