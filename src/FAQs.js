import React, { useState, useEffect } from "react";
import { getContent } from "./firebase"; // Import your Firestore helper function
import "./FAQs.css";
import Loader from "./Loader";
const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  useEffect(() => {
    // Fetch content from Firestore
    const fetchData = async () => {
      try {
        const allContent = await getContent();
        // Filter content to show only FAQs
        const faqsContent = allContent.filter((item) => item.page === "faqs");
        setFaqs(faqsContent);
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        setLoading(false); // Hide loader after data is fetched
        console.error("Error fetching FAQs:", error);
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
      <section className="faqs">
        {loading && <Loader />} {/* Display loader while loading */}
        <div>
          <h1 className="faqs-title">FREQUENTLY ASKED QUESTIONS</h1>
          <div className="faqs-border"></div>
        </div>
      </section>
      <section className="body-faqs">
        <div className="accordion-container centered">
          <div className="accordion" id="faqsAccordion">
            <div className="row">
              {faqs.length === 0 ? (
                <p className="no-faqs">No FAQs available at the moment.</p>
              ) : (
                faqs.map((faq, index) => (
                  <div className="col-md-6" key={faq.id}>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id={`heading${index}`}>
                        <button
                          className={`accordion-button ${index === openIndex ? "" : "collapsed"}`}
                          type="button"
                          onClick={() => handleToggle(index)}
                          aria-expanded={index === openIndex ? "true" : "false"}
                          aria-controls={`collapse${index}`}
                        >
                          {faq.title}
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className={`accordion-collapse collapse ${index === openIndex ? "show" : ""}`}
                        aria-labelledby={`heading${index}`}
                        data-bs-parent="#faqsAccordion"
                      >
                        <div className="accordion-body">{faq.body}</div>
                      </div>
                    </div>
                    <br />
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

export default FAQs;
