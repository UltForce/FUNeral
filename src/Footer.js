import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
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
        <div className="contact-info">
          <p>Contact us: 0909 081 3396 / 0935 354 4006</p>
        </div>
      </div>
      <p>&copy; 2024 J.ROA Funeral Services. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
