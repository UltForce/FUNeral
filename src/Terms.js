// Terms.js

import React, { useState, useEffect } from "react";
import { getContent } from "./firebase"; // Import your Firestore helper function
import './Terms.css';
const Terms = () => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    // Fetch content from Firestore
    const fetchData = async () => {
      try {
        const allContent = await getContent();
        // Filter content to show only terms and conditions
        const termsContent = allContent.filter((item) => item.page === "terms");
        setTerms(termsContent);
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
    <section className="terms">
      <div>
        <h1 className="terms-title">TERMS & CONDITIONS</h1>
        <div className="terms-border"></div>
      </div>
    </section>
    <section className="body">
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
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse${index}`}
                        >
                          {term.title}
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className="accordion-collapse collapse"
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
        </section>
    </div>
  );
};

export default Terms;
