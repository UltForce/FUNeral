import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
import "./homepage.css";
import "typeface-rubik";
import { Carousel } from "react-carousel-minimal";
import { Modal, Button } from "react-bootstrap";
import { Color } from "three";

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
    fontSize: "18px",
    fontWeight: "500",
    fontFamily: 'Rubik',
    Color:"#FCF2D8",
  };
  const slideNumberStyle = {
    fontSize: "20px",
    fontWeight: "500",
    fontFamily: 'Rubik',
    Color:"#FCF2D8",
  };

  const articles = [
    {
      img: "/funeral pics/Blog1.jpg",
      title: "Filipino Beliefs You Should Respect When Attending Wakes",
      content: `
        Attending wakes in the Philippines often involves observing cultural practices 
        rooted in deep respect for the departed and their families. Filipinos place 
        significant importance on honoring their loved ones through traditions that 
        bring comfort and support to the grieving family. Here are some beliefs and 
        practices you should be mindful of:
        
        - Refraining from Wearing Bright Colors: Black or subdued tones are preferred to symbolize mourning and respect. Avoid wearing loud or bright colors that may be seen as inappropriate.

        - Offering Prayers: Prayers, novenas, and religious services are often conducted during the wake. Visitors are encouraged to participate or offer a silent prayer for the deceased.

        - Observing Superstitions: Filipinos have various superstitions, such as not sweeping the floor during the wake, as it is believed to 'sweep away' the soul of the departed. Another common belief is not to go directly home after attending a wake to avoid bringing bad spirits with you.
          
        - Participating in Rituals: Rituals like the “pa-siyam” (nine days of prayers) are held to pray for the soul of the deceased. Visitors may also be invited to take part in these ceremonies, showing solidarity with the grieving family.
          
        By understanding and respecting these beliefs, you contribute to a supportive 
        environment for the family and help preserve these meaningful Filipino traditions.
      `,
    },
    {
      img: "/funeral pics/blog2.jpg",
      title: "What Goes Into A Funeral Package, And How To Choose",
      content: `
        Funeral packages are designed to simplify the process of arranging a funeral, 
        providing families with various options tailored to their needs and budgets. 
        These packages typically include the following components:
        
        - Embalming and Preparation Services: Professional embalming ensures that the body is well-preserved for the wake. This may also include cosmetic enhancements for a peaceful appearance.

        - Viewing Arrangements: This covers the setup of the venue, including caskets, flower arrangements, chairs, and lighting to create a serene atmosphere for visitors.

        - Transportation Services: Hearses or vehicles for transporting the body from the wake to the burial site or crematorium.

        - Burial or Cremation Services: Packages may include the burial plot, gravestone, or cremation services depending on the family's preferences.

        - Add-On Services: Some packages offer additional options like live streaming for those who cannot attend, memorial programs, and catering for guests.
        
        When choosing a package, consider the following:
        - Your family’s budget and what’s included in the package.
        - Any religious or cultural practices that need to be honored.
        - The level of personalization you’d like, such as specific types of flowers 
          or a custom memorial program.
        
        A good funeral package provider will help guide you through the process, 
        ensuring that your loved one’s final journey is handled with dignity and respect.
      `,
    },
    {
      img: "/funeral pics/blog3.jpg",
      title: "What are the Death Traditions in the Philippines?",
      content: `
        Death traditions in the Philippines are a unique blend of indigenous practices 
        and Catholic influences, reflecting the country’s deep spirituality and family-oriented 
        culture. These traditions often aim to honor the deceased, support the grieving, and 
        guide the soul to the afterlife. Key practices include:\n
        
        - Holding Vigils: A vigil, or wake, is typically held in the home of the deceased or a funeral parlor. Family and friends gather to offer prayers, share memories, and provide emotional support to the bereaved family.

        - Offering Food and Hospitality: Visitors to the wake are often served food and drinks, symbolizing gratitude and creating a sense of community. In some cases, food offerings may be placed near the coffin as a sign of respect for the deceased.

        - “Pasiyam” and “Babang Luksa”: The “pasiyam” is a nine-day prayer ritual conducted after the burial, believed to help the soul of the departed find peace. “Babang luksa” marks the end of the formal mourning period, usually one year after the death.

        - Superstitions and Taboos: Filipinos observe various superstitions during wakes and funerals. For example, mirrors are often covered to prevent spirits from lingering, and sharp objects are avoided near the coffin to protect the deceased’s spirit.

        - All Saints’ Day and All Souls’ Day: These special days are reserved for visiting cemeteries, cleaning graves, and lighting candles to honor departed loved ones. Families come together to share meals and stories, creating a sense of continuity with those who have passed on.
        
        These traditions showcase the deep respect Filipinos have for their ancestors, 
        emphasizing the importance of family and faith in the face of loss.
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

  const renderContentWithBoldHeadings = (content) => {
    return content.split('\n').map((line, index) => {
      // Use a regex to find and replace text after '-' and before ':'
      const modifiedLine = line.replace(/- (.*?):/, (match, p1) => `- <strong>${p1}</strong>:`);

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
      <section className="title-section section1">
        <h3>
          <i>{content.homepageText || "A Family’s end needs"}</i>
        </h3>
        <h1>{content.homepageText || "WELCOME TO J.ROA FUNERAL SERVICES"}</h1>
        <p>
          {content.homepageText ||
            "Guiding you through with Compassion and Care "}
        </p>
        <button className="action-button" onClick={handleButtonClick}>
          {isLoggedIn ? "Book Now" : "LOGIN"}
        </button>
      </section>

      <section className="home-snap-section section2">
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

      <section className="home-snap-section section5">
        <h1 className="our-services-title">Our Service</h1>
        <br></br>
        <div class="homepage-row">
          <div class="grid">
            <img src="/ficons/Comforting Hearts.png" alt="Comforting Hearts" />
            <h2>Comforting Hearts </h2>
            <p>
              We provide emotional support and understanding to families during
              their time of loss, ensuring a comforting environment throughout
              the funeral process.
            </p>
          </div>
          <div className="grid">
            <img
              src="/ficons/Respectful Farewells.png"
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
            <img src="/ficons/Cherished Memories.png" alt="Cherished Memories" />
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
            <img src="/ficons/Guidance Grace.png" alt="Guiding Grace" />
            <h2>Guiding Grace</h2>
            <p>
              Our team provides guidance and support every step of the way,
              ensuring all your needs are met with care and compassion.
            </p>
          </div>
        </div>
      </section>
      <section className="home-snap-section section6">
        <h1 className="our-gallery-title">Our Gallery</h1>
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
            <Modal.Header closeButton className="homepage-article-header">
              <Modal.Title className="homepage-article-title">{activeArticle.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="article-details-box">
              <img
                src={activeArticle.img}
                alt={activeArticle.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
              />
              <p>{renderContentWithBoldHeadings(activeArticle.content)}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal} className="close2-button">
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
