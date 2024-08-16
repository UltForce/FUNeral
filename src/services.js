// homepage.js
import React, { useEffect } from "react";
import "./styles.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
const Services = () => {
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          navigate("/login"); // Redirect to login page if user is not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error.message);
        navigate("/login"); // Redirect to login page if error occurs
      }
    };

    checkLoggedInStatus();
  }, [navigate]); // Pass navigate as a dependency to useEffect

  return (
    <section className="background-image">
      <p>Services goes here</p>
    </section>
  );
};

export default Services;
