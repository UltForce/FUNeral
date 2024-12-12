import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./styles.css";
import { getContentByPage2 } from "./firebase.js";
import React, { useEffect, useState } from "react";

const Footer = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const getcontent = await getContentByPage2("footer");
        setContent(getcontent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="first-footer-content">
          <div className="jroa-address">
            <p>
              <strong>{content.section1?.title}</strong>
              <br />
              {content.section1?.body}
            </p>
          </div>
          <br />
          <div className="contact-info">
            <p>
              <strong>{content.section3?.title}</strong>
              <br />
              {content.section3?.body}
            </p>
          </div>
        </div>
        <div className="second-footer-content">
          <div className="operation-hours">
            <p>
              <strong>{content.section2?.title}</strong>
              <br />
              {content.section2?.body}
            </p>
          </div>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Visit our Facebook page</Tooltip>}
          >
            <div className="social-media">
              <p>
                <strong>{content.section4?.title}</strong>
              </p>
              <a
                href={content.section4?.body}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebook} />
                <span className="social-media-label"> Facebook</span>
              </a>
              <br />
            </div>
          </OverlayTrigger>
        </div>
      </div>
      <p className="jroa-copyright">{content.section5?.title}</p>
    </footer>
  );
};

export default Footer;
