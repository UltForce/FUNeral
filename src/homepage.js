import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";
import "typeface-rubik";
import { Carousel } from "react-carousel-minimal";
import { Modal, Button } from "react-bootstrap";

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState({
    homepageText: "",
    aboutUsText: "",
    contactText: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);

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

  const handleSeeMore = () => {
    if (isLoggedIn) {
      navigate("/services");
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
    fontSize: "2em",
    fontWeight: "bold",
  };
  const slideNumberStyle = {
    fontSize: "20px",
    fontWeight: "bold",
  };

  const articles = [
    {
      img: "/funeral pics/Blog1.jpg",
      title: "Filipino Beliefs You Should Respect When Attending Wakes",
      content: `
        Attending wakes in the Philippines often involves observing cultural practices 
        rooted in deep respect for the departed and their families. These may include
        refraining from wearing bright colors, offering prayers, and participating in rituals 
        such as the “pa-siyam” or the nine-day novena.
      `,
    },
    {
      img: "/funeral pics/blog2.jpg",
      title: "What Goes Into A Funeral Package, And How To Choose",
      content: `
        Funeral packages typically include essential services such as embalming, viewing arrangements, 
        transportation, and burial. Choosing the right package depends on your family’s needs, 
        budget, and the desired level of customization to honor your loved one.
      `,
    },
    {
      img: "/funeral pics/blog3.jpg",
      title: "What are the Death Traditions in the Philippines?",
      content: `
        Death traditions in the Philippines are a mix of indigenous practices and Catholic influences. 
        These include holding vigils, offering food to visitors, and celebrating the “pasiyam” 
        and “babang luksa” to mark the end of mourning periods.
      `,
    },
  ];

  const handleShowModal = (article) => {
    setActiveArticle(article);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveArticle(null);
  };

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
              Choose from a range of meaningful themes to create a dignified and
              serene environment that honors your loved one’s life and legacy.
            </p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
          <div className="homecard">
            <img src="/funeral pics/flowers.jpg" alt="Floral Arrangement" />
            <h3>FLORAL ARRANGEMENT</h3>
            <p>
              Discover elegant floral arrangements designed to convey love,
              respect, and remembrance during the memorial service.
            </p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
          <div className="homecard">
            <img src="/funeral pics/wake6.jpg" alt="Lights and Candles" />
            <h3>LIGHTS AND CANDLES</h3>
            <p>
              Create a comforting ambiance with expertly curated lighting and
              candle arrangements to reflect peace and warmth.
            </p>
            <button onClick={handleSeeMore}>See More</button>
          </div>
        </div>
      </section>

      <section className="snap-section section4">
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
            <h3>Compassionate Care In Your Time Of Need</h3>
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

      <section className="snap-section section5">
        <h1>Our Service</h1>
        <br></br>
        <div class="homepage-row">
          <div class="grid">
            <img src="/ficons/comfortinghearts.png" alt="Comforting Hearts" />
            <h2>Comforting Hearts </h2>
            <p>
              We provide emotional support and understanding to families during
              their time of loss, ensuring a comforting environment throughout
              the funeral process.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/respectful Farewell.png"
              alt="Respectful Farewells"
            />
            <h2>Respectful Farewells</h2>
            <p>
              Our services are designed to honor your loved one's memory with
              dignity and respect, ensuring a meaningful and heartfelt farewell.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/Dignified Services.png"
              alt="Dignified Services"
            />
            <h2>Dignified Services</h2>
            <p>
              Experience professional and compassionate assistance with every
              aspect of funeral arrangements, tailored to your family's needs.
            </p>
          </div>
          <div className="grid">
            <img src="/ficons/Cherised Memories.png" alt="Cherished Memories" />
            <h2>Cherished Memories</h2>
            <p>
              Create lasting memories with personalized tributes that reflect
              the unique life and legacy of your loved one.
            </p>
          </div>
          <div className="grid">
            <img src="/ficons/Honoring Legacies.png" alt="Honoring Legacies" />
            <h2>Honoring Legacies</h2>
            <p>
              Celebrate the life and achievements of your loved one with
              meaningful ceremonies that honor their legacy.
            </p>
          </div>
          <div className="grid">
            <img src="/ficons/Guiding Grace.png" alt="Guiding Grace" />
            <h2>Guiding Grace</h2>
            <p>
              Our team provides guidance and support every step of the way,
              ensuring all your needs are met with care and compassion.
            </p>
          </div>
        </div>
      </section>
      <section className="snap-section section6">
        <h1>Our Gallery</h1>
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
          {articles.map((article, index) => (
            <div className="article" key={index}>
              <img src={article.img} alt={`${article.title} Image`} />
              <h2>{article.title}</h2>
              <p>{article.content.slice(0, 100)}...</p>
              <button onClick={() => handleShowModal(article)}>
                Read More
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {activeArticle && (
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>{activeArticle.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <img
                src={activeArticle.img}
                alt={activeArticle.title}
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  borderRadius: "8px",
                }}
              />
              <p>{activeArticle.content}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
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
