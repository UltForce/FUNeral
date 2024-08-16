// homepage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";

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

  const handleBookNowClick = () => {
    navigate("/booking"); // Redirect to booking page when "Book now" button is clicked
  };

  return (
    <section className="background-image">
      <p>Homepage goes here</p>
      {/* Floating "Book now" button */}
      {isLoggedIn ? (
        <button className="book-now-button" onClick={handleBookNowClick}>
          Book now
        </button>
      ) : (
        <></>
      )}
    </section>
  );
};

export default Homepage;
