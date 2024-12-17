import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {
  getCurrentUserId,
  getUserRoleFirestore,
  auth,
  getContentByPage,
  getContentByPage2,
  getContentByPage4,
} from "./firebase.js";
import "./homepage.css";
import "typeface-rubik";
import { Carousel } from "react-carousel-minimal";
import { Modal, Button } from "react-bootstrap";
import { Color } from "three";
import Loader from "./Loader.js";
const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const [content2, setContent2] = useState({});

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

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const getcontent = await getContentByPage2("home");
        const getcontent2 = await getContentByPage4("blogs");
        setContent2(getcontent2);
        setContent(getcontent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchContent();
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate("/booking");
    } else {
      navigate("/login");
    }
  };

  const handleSeeMore = () => {
    if (isLoggedIn) {
      navigate("/services");
    } else {
      navigate("/login");
    }
  };

  const gallery = [
    {
      image: "/funeral pics/wake1.jpg",
      caption: "Funeral",
    },
    {
      image: "/funeral pics/flowers.jpg",
      caption: "Flowers",
    },
    {
      image: "/funeral pics/wake3.jpg",
      caption: "Funeral",
    },
    {
      image: "/funeral pics/wake5.jpg",
      caption: "Funeral",
    },
    {
      image: "/funeral pics/wake6.jpg",
      caption: "Funeral",
    },
  ];

  const captionStyle = {
    fontSize: "18px",
    fontWeight: "500",
    fontFamily: "Rubik",
    Color: "#FCF2D8",
  };
  const slideNumberStyle = {
    fontSize: "20px",
    fontWeight: "500",
    fontFamily: "Rubik",
    Color: "#FCF2D8",
  };

  const handleShowModal = (article) => {
    setActiveArticle(article);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveArticle(null);
  };

  const renderContentWithBoldHeadings = (bodyContent) => {
    if (!bodyContent) return null; // Handle case where bodyContent is undefined or null

    return bodyContent.split("\n").map((line, index) => {
      // Use regex to bold text after '-' and before ':'
      const modifiedLine = line.replace(
        /- (.*?):/,
        (match, p1) => `- <strong>${p1}</strong>:`
      );

      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: modifiedLine }} />
          <br />
        </span>
      );
    });
  };

  return (
    <div className="homepage-container">
      {loading && <Loader />} {/* Use the Loader component here */}
      <section className="title-section section1">
        <h3 className="homepageTxt">
          <i>"A Family’s end needs"</i>
        </h3>
        <h1 className="homepageTxt">"WELCOME TO J.ROA FUNERAL SERVICES"</h1>
        <p className="homepageTxt">
          "Guiding you through with Compassion and Care "
        </p>
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "LOGIN"}
        </button>
      </section>
      <section className="home-snap-section section2">
        <div className="container">
          <div className="homecard">
            <img src={content.homepage1?.imageUrl} alt="Funeral Theme" />
            <h3>{content.homepage1?.title}</h3>
            <p>{content.homepage1?.body}</p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
          <div className="homecard">
            <img src={content.homepage2?.imageUrl} alt="Floral Arrangement" />
            <h3>{content.homepage2?.title}</h3>
            <p>{content.homepage2?.body}</p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
          <div className="homecard">
            <img src={content.homepage3?.imageUrl} alt="Lights and Candles" />
            <h3>{content.homepage3?.title}</h3>
            <p>{content.homepage3?.body}</p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
        </div>
      </section>
      <section className="home-snap-section section4">
        <section className="care-section">
          <div className="images-container">
            <img
              src="/funeral pics/homepage1.jpg"
              alt="Dignified Funeral Service"
              className="rounded-image"
            />
            <img
              src="/funeral pics/homepage2.jpg"
              alt="Compassionate Floral Arrangements"
              className="rounded-image"
            />
          </div>

          <div className="text-container">
            <h3>Compassionate Care In Your End's Need</h3>
            <p>
              At J.ROA Funeral Services, we are dedicated to providing
              compassionate and personalized support during your most
              challenging moments. Our team understands the importance of
              honoring your loved one's life with dignity and respect.
              <br />
              <br />
              From serene funeral arrangements to thoughtfully curated floral
              displays, we ensure that every detail reflects the warmth and love
              you wish to convey. Our experienced staff is here to guide you
              through each step, offering comfort and understanding as we help
              you create a meaningful tribute.
              <br />
              <br />
              Trust J.ROA Funeral Services to provide unwavering care, helping
              you focus on cherishing the memories that truly matter.
            </p>
          </div>
        </section>
      </section>
      <section className="home-snap-section section5">
        <h1 className="our-services-title">OUR SERVICE</h1>
        <br></br>
        <div class="homepage-row">
          <div class="grid">
            <img src={content.ourServices1?.imageUrl} alt="Comforting Hearts" />
            <h2>{content.ourServices1?.title}</h2>
            <p>{content.ourServices1?.body}</p>
          </div>
          <div className="grid">
            <img
              src={content.ourServices2?.imageUrl}
              alt="Respectful Farewells"
            />
            <h2>{content.ourServices2?.title}</h2>
            <p>{content.ourServices1?.body}</p>
          </div>
          <div className="grid">
            <img
              src={content.ourServices3?.imageUrl}
              alt="Dignified Services"
            />
            <h2>{content.ourServices3?.title}</h2>
            <p>{content.ourServices3?.body}</p>
          </div>
          <div className="grid">
            <img
              src={content.ourServices4?.imageUrl}
              alt="Cherished Memories"
            />
            <h2>{content.ourServices4?.title}</h2>
            <p>{content.ourServices4?.body}</p>
          </div>
          <div className="grid">
            <img src={content.ourServices5?.imageUrl} alt="Honoring Legacies" />
            <h2>{content.ourServices5?.title}</h2>
            <p>{content.ourServices5?.body}</p>
          </div>
          <div className="grid">
            <img src={content.ourServices6?.imageUrl} alt="Guiding Grace" />
            <h2>{content.ourServices6?.title}</h2>
            <p>{content.ourServices6?.body}</p>
          </div>
        </div>
      </section>
      <section className="home-snap-section section6">
        <h1 className="our-gallery-title">OUR GALLERY</h1>
        <div className="gallery-section">
          <div className="gallery-header">
            <p>
              Discover moments captured during our services, showcasing the
              dedication, elegance, and heartfelt care we bring to every
              ceremony. Each image reflects our commitment to creating
              meaningful and serene experiences for families, ensuring their
              loved ones are honored with the utmost respect and grace.
            </p>
          </div>

          <div className="gallery-images">
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  padding: "50 50px",
                }}
              >
                <Carousel
                  data={gallery}
                  time={2000}
                  margin-top="30px"
                  // maxWidth="850px"
                  // minWidth="673px"
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
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="home-snap-section section7">
        <h1 className="blogs-articles-title">BLOGS & ARTICLES</h1>
        <div className="blogs">
          {Object.values(content2).map((content, index) => (
            <div className="article" key={index}>
              <img src={content.imageUrl} alt={`${content.title} Image`} />
              <h2>{content.title}</h2>
              <p>{content.body.slice(0, 100)}...</p>
              <button onClick={() => handleShowModal(content)}>
                Read More
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {activeArticle && (
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton className="homepage-article-header">
              <Modal.Title className="homepage-article-title">
                {activeArticle.title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="article-details-box">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
              />
              <div>{renderContentWithBoldHeadings(activeArticle.body)}</div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="close2-button"
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </section>
    </div>
  );
};

export default Homepage;
