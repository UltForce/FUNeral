import "./Blog.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { getContentByPage4 } from "./firebase.js";
import Loader from "./Loader.js";
const Blog = () => {
  const [activeArticle, setActiveArticle] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const handleShowModal = (article) => {
    setActiveArticle(article);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveArticle(null);
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const getcontent = await getContentByPage4("blogs");
        setContent(getcontent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchContent();
  }, []);

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

  return (
    <main className="main-content">
      <section className="blog">
        <div>
          <h1 className="blog-title">BLOGS & ARTICLES</h1>
          <div className="blog-border"></div>
        </div>
      </section>
      <section className="home-snap-section section7">
        <div className="blogs">
          {Object.values(content).map((content, index) => (
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
    </main>
  );
};

export default Blog;
