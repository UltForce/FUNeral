import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import './styles.css';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="first-footer-content">
          <div className="jroa-address">
            <p><strong>Address:</strong>
            <br/>
            64 K4th kamuning, Quezon City, Philippines</p>
          </div>
          <br/>
          <div className="contact-info">
            <p><strong>Contact us: </strong>
            <br/>
            0909 081 3396 / 0935 354 4006</p>
          </div>
        </div>
        <div className="second-footer-content">
          <div className="operation-hours">
            <p><strong>Operation Hours:</strong>
            <br/>
            Open for Business 24/7
            </p>
          </div>

          <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Visit our Facebook page</Tooltip>}
          >
          <div className="social-media">
            <p><strong>Get in Touch</strong></p>
            <a
              href="https://www.facebook.com/profile.php?id=61556915982294"
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
      <p className="jroa-copyright">&copy; 2024 J.ROA Funeral Services. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
