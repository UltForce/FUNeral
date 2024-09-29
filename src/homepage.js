import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState({
    homepageText: "",
    aboutUsText: "",
    contactText: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");
      }
    });

    const fetchContent = async () => {
      const db = getFirestore();
      const contentDoc = doc(db, "staticContent", "content");
      try {
        const docSnap = await getDoc(contentDoc);
        if (docSnap.exists()) {
          setContent(docSnap.data());
        } else {
          console.log("No content found");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchContent();

    return () => unsubscribe();
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate("/booking");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="snapping-container content-user">
      <section className="snap-section section1">
        <h1>{content.homepageText || "Welcome to J.ROA Funeral Services"}</h1>
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "Login"}
        </button>
      </section>
      <section className="snap-section section2">
        <h1>Products</h1>
      </section>
      <section className="snap-section section3">
        <h1>{content.aboutUsText || "About Us"}</h1>
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
    </div>
  );
};

export default Homepage;
