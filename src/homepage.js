import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";
import "typeface-rubik";
import { Carousel } from 'react-carousel-minimal';

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

    // const fetchContent = async () => {
    //   const db = getFirestore();
    //   const contentDoc = doc(db, "staticContent", "content");
    //   try {
    //     const docSnap = await getDoc(contentDoc);
    //     if (docSnap.exists()) {
    //       setContent(docSnap.data());
    //     } else {
    //       //console.log("No content found");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching content:", error);
    //   }
    // };

    // fetchContent();

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

  const gallery = [
    {
      image: "/funeral pics/wake1.jpg",
      caption: "Funeral"
    },
    {
      image: "/funeral pics/flowers.jpg",
      caption: "Flowers"
    },
    {
      image: "/funeral pics/wake3.jpg",
      caption: "Funeral"
    },
    {
      image: "/funeral pics/wake5.jpg",
      caption: "Funeral"
    },
    {
      image: "/funeral pics/wake6.jpg",
      caption: "Funeral"
    },
    

  ];

  const captionStyle = {
    fontSize: '2em',
    fontWeight: 'bold',
  }
  const slideNumberStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
  }

  return (
    <div className="snapping-container content-user">
      <section className="snap-section section1">
        <h3>
          <i>{content.homepageText || "A Family’s end needs"}</i>
        </h3>
        <h1>{content.homepageText || "Welcome to J.ROA Funeral Services"}</h1>
        <p>
          {content.homepageText ||
            "Guiding you through with Compassion and Care "}
        </p>
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "LOGIN"}
        </button>
      </section>

      <section className="snap-section section2">
        <div className="container">
          <div className="homecard">
            <img src="/funeral pics/homepage2.jpg" alt="Funeral Theme" />
            <h3>FUNERAL THEME</h3>
            <p>
              Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing elit. Sed Do
              Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna
              Aliqua.
            </p>
            <button>See More</button>
          </div>
          <div className="homecard">
            <img
              src="/funeral pics/flowers.jpg"
              alt="Floral Arrangement"
            />
            <h3>FLORAL ARRANGEMENT</h3>
            <p>
              Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Ellit. Sed Do
              Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna
              Aliqua.
            </p>
            <button>See More</button>
          </div>
          <div className="homecard">
            <img
              src="/funeral pics/wake6.jpg"
              alt="Lights and Candles"
            />
            <h3>LIGHTS AND CANDLES</h3>
            <p>
              Lorem Ipsum Dolor Sit Amet. Consectetur Adipiscing Elit. Sed Do
              Eiusmod tempor incididunt ut Labore Et Dolore Magna Aliqua, Magna
              Aliqua.
            </p>
            <button>See More</button>
          </div>
        </div>
      </section>
      
      <section className="snap-section section4">
        <section className="care-section">
      <div className="images-container">
        <img src="/funeral pics/homepage1.jpg" alt="Service Image 1" className="rounded-image" />
        <img src="funeral pics/homepage2.jpg" alt="Service Image 2" className="rounded-image" />
      </div>
      


      <div className="text-container">
        <h3>Compassionate Care In Your Time Of Need</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          <br /><br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
        </p>
      </div>
    </section>
      </section>

      <section className="snap-section section5">
        <h1>Our Service</h1>
        <br></br>
        <div class="homepage-row">
          <div class="grid">
            <img
              src="/ficons/comfortinghearts.png"
              alt="Comforting Hearts"
            />
            <h2>Comforting Hearts </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/respectful Farewell.png"
              alt="Respectful Farewells"
            />
            <h2>Respectful Farewells</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/Dignified Services.png"
              alt="Dignified Services"
            />
            <h2>Dignified Services</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/Cherised Memories.png"
              alt="Cherished Memories"
            />
            <h2>Cherished Memories</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/Honoring Legacies.png"
              alt="Honoring Legacies"
            />
            <h2>Honoring Legacies</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
          <div className="grid">
            <img src="/ficons/Guiding Grace.png" alt="Guiding Grace" />
            <h2>Guiding Grace</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
          </div>
        </div>
      </section>
      <section className="snap-section section6">
        <h1>Our Gallery</h1>
        <div className="gallery-section">
      <div className="gallery-header">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
        </p>
      </div>

      <div className="gallery-images">
      <div style={{ textAlign: "center" }}>
        
        <div style={{
          padding: "50 50px"
        }}>
          <Carousel
            data={gallery}
            time={2000}
            margin-top="30px" 
            width="850px"
            height="400px"
            captionStyle={captionStyle}
            radius="10px"
            slideNumber={true}
            slideNumberStyle={slideNumberStyle}
            captionPosition="bottom"
            automatic={true}
            dots={true}
            pauseIconColor="white"
            pauseIconSize="40px"
            slideBackgroundColor="darkgrey"
            slideImageFit="cover"
            thumbnails={true}
            thumbnailWidth="100px"
            style={{
              textAlign: "center",
              maxWidth: "850px",
              maxHeight: "500px",
              margin: "40px auto",
            }}
          />
        </div>
      </div>
    
      </div>
    </div>
      </section>
      <section className="snap-section section7">
        <h1>BLOGS & ARTICLES</h1>
        <div className="blogs">
          <div className="article">
            <img src="/funeral pics/Blog1.jpg" alt="Blog1 Image" />
            <h2>Filipino Beliefs You Should Respect When Attending Wakes</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
            <button>Read More</button>
          </div>
          <div className="article">
            <img
              src="/funeral pics/blog2.jpg"
              alt="Blog2 Image"
            />
            <h2>What Goes Into A Funeral Package, And How To Choose </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
            <button>Read More</button>
          </div>
          <div className="article">
            <img
              src="/funeral pics/blog3.jpg"
              alt="Lights and Candles"
            />
            <h2>What are the Death Traditions in the Phillippines?</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua, magna
              aliqua.
            </p>
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
