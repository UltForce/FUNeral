// Terms.js

import React, { useState, useEffect } from "react";
import { getContent } from "./firebase"; // Import your Firestore helper function
import "./Terms.css";
import Loader from "./Loader";
const Terms = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  useEffect(() => {
    // Fetch content from Firestore
    const fetchData = async () => {
      try {
        const allContent = await getContent();
        // Filter content to show only terms and conditions
        const termsContent = allContent.filter((item) => item.page === "terms");
        setTerms(termsContent);
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        setLoading(false); // Hide loader after data is fetched
        console.error("Error fetching terms and conditions:", error);
      }
    };

    fetchData();
  }, []);

  const [openIndex, setOpenIndex] = useState(null); // Track open accordion index

const handleToggle = (index) => {
  setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
};


  return (
    <div>
      <main className="main-content">
        <section className="terms">
          {loading && <Loader />} {/* Display loader while loading */}
          <div>
            <h1 className="terms-title">TERMS & CONDITIONS</h1>
            <div className="terms-border"></div>
          </div>
        </section>
        <section className="body">
          <div className="welcome-terms">
            <p>
            Welcome to FUNeral, a web-based funeral service planner management and appointment system for J.ROA Funeral Services. 
            These Terms and Conditions govern your use of our website and services. By accessing or using our Site, you agree to 
            comply with and be bound by these Terms. If you do not agree with these Terms, please do not use our Site.
            </p>
          </div>
          <div className="accordion-container centered">
            <div className="accordion" id="termsAccordion">
              <div className="row">
                {terms.length === 0 ? (
                  <p className="no-terms">
                    No Terms and Conditions available at the moment.
                  </p>
                ) : (
                  terms.map((term, index) => (
                    <div className="col-md-6" key={term.id}>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id={`heading${index}`}>
                          <button
                            className={`accordion-button ${index === openIndex ? "" : "collapsed"}`}
                            type="button"
                            onClick={() => handleToggle(index)}
                            aria-expanded={index === openIndex ? "true" : "false"}
                            aria-controls={`collapse${index}`}
                          >
                            {term.title}
                          </button>
                        </h2>
                        <div
                          id={`collapse${index}`}
                          className={`accordion-collapse collapse ${index === openIndex ? "show" : ""}`}
                          aria-labelledby={`heading${index}`}
                          data-bs-parent="#termsAccordion"
                        >
                          <div className="accordion-body">{term.body}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="end-terms">
            <p>
            If you have any questions about these Terms, please contact us through these numbers 0909 081 3396 / 0935 354 4006 
            or visit us 64 K4th Kamuning, Quezon City, Philippines. By using our Site, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and Conditions. Thank you for visiting FUNeral.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Terms;
