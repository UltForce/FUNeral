import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, auth, getUserRoleFirestore } from "./firebase.js";

const About = () => {
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
      <div className="homepage">
        <header>
          <h1 className="centered">Compassionate care in time of your need.</h1>
        </header>
        <main>
          <div className="centered">
            <p>Lorem ipsum.</p>

            <h3>Address</h3>
            <p>64 K4th Kamuning, Quezon City</p>
            {/* Embed Google Maps */}
            <iframe
              title="J.ROA Funeral Services"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.28181057950175!2d121.0388392476465!3d14.62702553834181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b70070be2ceb%3A0xf8649452deb2ddac!2sJ.ROA%20FUNERAL%20SERVICES!5e0!3m2!1sen!2sph!4v1723812378194!5m2!1sen!2sph"
              width="400"
              height="300"
              style={{ border: 0 }}
              allowfullscreen=""
              loading="lazy"
            ></iframe>
            <br />
            <h3>Contact No.</h3>
            <p>
              0909 081 3396 / 0935 354 4006 <br />
            </p>
            <br />

            <h3>Schedule</h3>
            <p>asdasd</p>
          </div>
        </main>
      </div>
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

export default About;
