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
  getUserReviewsFirestore,
  getContentByPage2,
} from "./firebase.js"; // Assume these functions are defined in your firebase.js
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";
import "./about.css";
import Loader from "./Loader.js";
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
  const [loading, setLoading] = useState(false); // Add loading state
  const [profilePictureURL, setProfilePictureURL] = useState(""); // Add state for profile picture URL
  const [hasSubmittedTestimonial, setHasSubmittedTestimonial] = useState(false);
  const [flipped, setFlipped] = useState(Array(5).fill(false)); // Track which images are flipped
  const [selectedPlan, setSelectedPlan] = useState("");
  const [content, setContent] = useState({});

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
          // Fetch the profile picture URL
          setProfilePictureURL(userDetails.profilePictureURL || ""); // Ensure the userDetails have this field
        }

        // Check if the user has already submitted a testimonial
        const userReviews = await getUserReviewsFirestore(userId);
        setHasSubmittedTestimonial(userReviews.length > 0);
      }
    });

    const fetchTestimonials = async () => {
      const publishedTestimonials = await getPublishedTestimonials(); // Fetch published testimonials

      // Sort testimonials by highest rating first, then by most recent timestamp
      const sortedTestimonials = publishedTestimonials.sort((a, b) => {
        if (b.rating === a.rating) {
          return b.timestamp - a.timestamp; // Sort by most recent if ratings are the same
        }
        return b.rating - a.rating; // Sort by highest rating first
      });

      // Shuffle the sorted testimonials randomly
      const shuffledTestimonials = sortedTestimonials.sort(
        () => 0.5 - Math.random()
      );

      // Limit to a maximum of 5 testimonials
      setTestimonials(shuffledTestimonials.slice(0, 5));
    };

    fetchTestimonials();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const getcontent = await getContentByPage2("about");
        setContent(getcontent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchContent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if firstName and lastName are set
    if (!firstname || !lastname || !selectedPlan) {
      Toast.fire({
        icon: "error",
        title: "User details are not available. Please try again later.",
      });
      return;
    }

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
      setLoading(true);
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
        userId: currentUserId,
        firstname,
        lastname,
        selectedPlan,
        comment,
        rating,
        profilePictureURL, // Include profile picture URL in the submission
        status: "pending",
      });

      // Clear the form
      setComment("");
      setRating(5);
      setSelectedPlan("");

      // Show success toast
      Toast.fire({
        icon: "success",
        title: "Testimonial request sent successfully!",
      });
      setHasSubmittedTestimonial(true);
      setLoading(false);
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

  // Function to handle the flipping of an image
  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  // List of images and text to display
  const images = [
    {
      src: "/steps/step1.png",
      text: "<h1><strong>STEP 1:</strong></h1><br/> Set a date to appoint the deceased's wishes and service types while confirming the wake to burial schedules.",
      stepId: "step1",
    },
    {
      src: "/steps/step2.png",
      text: "<h1><strong>STEP 2:</strong></h1><br/> Finalize the funeral package that fits your budget, and make the necessary financial arrangements, considering payment plans if needed.",
      stepId: "step2",
    },
    {
      src: "/steps/step3.png",
      text: "<h1><strong>STEP 3:</strong></h1><br/> Participate in the seven-day wake, where friends and family gather to honor the deceased, share memories, and observe cultural or religious rites.",
      stepId: "step3",
    },
    {
      src: "/steps/step4.png",
      text: "<h1><strong>STEP 4:</strong></h1><br/> Attend the burial session; this marks the final farewell of our beloved deceased to a designated cemetery.",
      stepId: "step4",
    },
    {
      src: "/steps/step5.png",
      text: "<h1><strong>STEP 5:</strong></h1><br/> Grieving continues after the burial. Honor your emotions and create a healing environment for the bereaved.",
      stepId: "step5",
    },
  ];

  // Function to handle navigation to the Planning Guide
  const handleSeeMore = (stepId) => {
    console.log("Navigating to:", stepId); // Debugging line
    if (stepId) {
      navigate(`/planningguide#${stepId}`);
    } else {
      console.error("Step ID is undefined");
    }
  };

  return (
    <main className="main-content">
      <section className="about-us">
        {loading && <Loader />} {/* Display loader while loading */}
        <div>
          <h1 className="about-title">ABOUT US</h1>
          <div className="about-border"></div>
        </div>
      </section>
      <div className="about-container">
        <section className="snap-section about-section">
          <div className="JROA-about-us">
            <img src="JROA.jpg" alt="JROA" />
            <div className="JROA-info">
              <h2>J.ROA FUNERAL SERVICES</h2>
              <p>
                J.ROA Funeral Services is a trusted name in providing
                compassionate and professional funeral services throughout the
                Philippines. Conveniently located at{" "}
                <strong>64 K-4th St., Kamuning, Quezon City</strong>, we are
                dedicated to supporting families during difficult times with
                care and dignity.
              </p>
              <p>
                Our services include funeral arrangements, embalming, burial
                services, cremation, and other memorial needs. We pride
                ourselves on offering personalized and culturally appropriate
                services tailored to meet the unique wishes of every family we
                serve.
              </p>
              <p>
                <strong>Open 24/7</strong>, we are here to provide assistance
                and guidance whenever you need us. Whether you require immediate
                services or are planning ahead, our compassionate team is always
                ready to help.
              </p>
              <p>
                At J.ROA Funeral Services, we aim to create meaningful and
                respectful farewells, honoring the lives of your loved ones in
                the most memorable way.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section with Flippable Images (now after Testimonials) */}
        <div className="steps-section">
          <h2>STEPS</h2>
          <div className="steps-container">
            {images.map((image, index) => (
              <div
                key={index}
                className="image-wrapper"
                onClick={() => handleFlip(index)}
              >
                <div className={`flip-card ${flipped[index] ? "flipped" : ""}`}>
                  <div
                    className="front"
                    style={{ backgroundImage: `url(${image.src})` }}
                  ></div>
                  <div className="back">
                    <p dangerouslySetInnerHTML={{ __html: image.text }} />
                    <button
                      className="see-more-button"
                      onClick={() => handleSeeMore(image.stepId)}
                    >
                      See More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section
          className={`snap-section testimonials-section ${
            testimonials.length === 1 ? "single-testimonial" : ""
          }`}
        >
          <h2>TESTIMONIALS</h2>
          <div
            className={`testimonials-grid ${
              testimonials.length === 1 ? "single-testimonial" : ""
            }`}
          >
            {testimonials.slice(0, 4).map((testimonial) => (
              <div key={testimonial.id} className="testimonial">
                <div className="testimonial-content">
                  {/* Display profile picture or placeholder */}
                  <img
                    src={testimonial.profilePictureURL || "/placeholder.jpg"} // Replace with your placeholder image path
                    alt={`${testimonial.firstname} ${testimonial.lastname}`}
                    className="profile-picture"
                  />
                  <div className="user-review-info">
                    <p className="review-plan">{testimonial.selectedPlan}</p>
                    <div className="stars">
                      {"⭐".repeat(testimonial.rating)}
                    </div>
                    <p className="reviewer-name">{`${testimonial.firstname} ${testimonial.lastname}`}</p>
                    <p className="review-description">{testimonial.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isLoggedIn && !hasSubmittedTestimonial && (
          <section className="submit-testimonial-section section">
            <h3>ADD YOUR TESTIMONIAL</h3>
            <form onSubmit={handleSubmit} className="submit-testimonial">
              <div className="plan-rating">
                <div className="plan-form-group">
                  {/* Plan Selection */}
                  {/* <label htmlFor="planSelect">Select a plan to review:</label> */}
                  <select
                    id="planSelect"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="">-- Select a Plan --</option>
                    <option value="Plan 1">Plan 1 Basic</option>
                    <option value="Plan 2">Plan 2 Garden</option>
                    <option value="Plan 3">Plan 3 Garbo</option>
                    <option value="Plan 4">Plan 4 Kid</option>
                  </select>
                </div>
                <div className="star-rating">{renderStars()}</div>
              </div>

              <div className="testimonial-submit">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Your comment..."
                  required
                  className="submitted-form-control"
                  rows="6"
                />
              </div>

              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>Send for approval</Tooltip>}
              >
                <button type="submit" className="submit-button">
                  Submit
                </button>
              </OverlayTrigger>
            </form>
          </section>
        )}

        <section className="snap-section about-us-section">
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
      </div>
    </main>
  );
};

export default About;
