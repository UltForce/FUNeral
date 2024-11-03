import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Visit our Facebook page</Tooltip>}
        >
          <div className="social-media">
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
        <div className="contact-info">
          <p>Contact us: 0909 081 3396 / 0935 354 4006</p>
        </div>
      </div>
      <p>&copy; 2024 J.ROA Funeral Services. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
