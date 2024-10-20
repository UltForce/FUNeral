import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";
import "typeface-rubik";


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

  const Card = ({ image, title, description }) => {
    return (
      <div className="card">
        <img src={image} alt={title} />
        <h2>{title}</h2>
        <p>{description}</p>
        <button className="button">See More</button>
      </div>
    );
  };

  return (
    <div className="snapping-container content-user">
      <section className="snap-section section1">
        <h3><i>{content.homepageText ||  "A Family’s end needs"}</i></h3>
        <h1>{content.homepageText ||  "Welcome to J.ROA Funeral Services"}</h1>
        <p>{content.homepageText ||  "Guiding you through with Compassion and Care "}</p>
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "LOGIN"}
        </button>
      </section>


      <section className="snap-section section2">
      <div className="container">
      <div className="homecard">
        <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Funeral Theme" />
        <h3>FUNERAL THEME</h3>
        <p>Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing elit. Sed Do Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna Aliqua.</p>
        <button>See More</button>
      </div>
      <div className="homecard">
        <img src="https://i.imgur.com/yV44L6G.jpg" alt="Floral Arrangement" />
        <h3>FLORAL ARRANGEMENT</h3>
        <p>Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Ellit. Sed Do Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna Aliqua.</p>
        <button>See More</button>
      </div>
      <div className="homecard">
        <img src="https://i.imgur.com/C4k6X3A.jpg" alt="Lights and Candles" />
        <h3>LIGHTS AND CANDLES</h3>
        <p>Lorem Ipsum Dolor Sit Amet. Consectetur Adipiscing Elit. Sed Do Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna Aliqua.</p>
        <button>See More</button>
      </div>
    </div>

   
      </section>



      <section className="snap-section section3">
        <h1>{content.aboutUsText || "About Us"}</h1>
      </section>
      <section className="snap-section section4">
        <h1>Compassionate Care in Your Time of Need</h1>
      </section>

      <section className="snap-section section5">
        <h1>Our Service</h1> 
        <br></br>
        <div class="row">
          <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Comforting Hearts" />
            <h2>Comforting Hearts </h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
        <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Respectful Farewells" />
            <h2>Respectful Farewells</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
        <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Dignified Services" />
          <h2>Dignified Services</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
          <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Cherished Memories" />
            <h2>Cherished Memories</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
        <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Honoring Legacies" />
            <h2>Honoring Legacies</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
        <div class="grid">
          <img src="https://i.imgur.com/K7N8bDq.jpg" alt="Guiding Grace" />
            <h2>Guiding Grace</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
          </div>
        </div>
      </section>
      <section className="snap-section section6">
        <h1>Our Gallery</h1>
      </section>
      <section className="snap-section section7">
        <h1>BLOGS & ARTICLES</h1>
        <div class="blogs">
                <div class="article">
                <img src="https://i.imgur.com/C4k6X3A.jpg" alt="Funeral Theme" />
                  <h2>Filipino Beliefs You Should Respect When Attending Wakes</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
                  <button>Read More</button>
                </div>
                <div class="article">
                <img src="https://i.imgur.com/C4k6X3A.jpg" alt="Floral Arrangement" />
                  <h2>What Goes Into A Funeral Package, And How To Choose </h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
                  <button>Read More</button>
                </div>
                <div class="article">
                <img src="https://i.imgur.com/C4k6X3A.jpg" alt="Lights and Candles" />
                  <h2>What are the Death Traditions in the Phillippines?</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, magna aliqua.</p>
                  <button>Read More</button>
                </div>
              </div>
      </section>
      <section className="snap-section section7">
        <h1>Testimonials</h1>
      </section>
    </div>
  );
};

export default Homepage;
