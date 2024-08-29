// homepage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";

const Homepage = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate("/booking"); // Redirect to booking page when logged in
    } else {
      navigate("/login"); // Redirect to login page when not logged in
    }
  };

  return (
    <div className="snapping-container content-user">
      <section className="snap-section section1">
        <h1>Welcome to J.ROA Funeral Services</h1>{" "}
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "Login"}
        </button>
      </section>
      <section className="snap-section section2">
        <h1>Products</h1>
      </section>
      <section className="snap-section section3">
        <h1>About Us</h1>
      </section>
      <section className="snap-section section4">
        <h1>Our Services</h1>
      </section>
      <section className="snap-section section5">
        <h1>Gallery</h1>
      </section>
      <section className="snap-section section6">
        <h1>Blogs and Articles</h1>
      </section>
      <section className="snap-section section7">
        <h1>Testimonials</h1>
      </section>
      {/*
      <iframe
        width="350"
        height="430"
        allow="microphone;"
        src="https://console.dialogflow.com/api-client/demo/embedded/1d3daf65-6838-45ac-b790-c823251bd7a6"
      ></iframe>
*/}
    </div>
  );
};

export default Homepage;
