import React, { useState, useEffect } from "react";
import { getContent } from "./firebase"; // Import your Firestore helper function

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Fetch content from Firestore
    const fetchData = async () => {
      try {
        const allContent = await getContent();
        // Filter content to show only FAQs
        const faqsContent = allContent.filter((item) => item.page === "faqs");
        setFaqs(faqsContent);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="background-image section content-user">
      <div>
        <h1 className="page-title centered">Frequently Asked Questions</h1>
        <div className="accordion-container centered">
          <div className="accordion" id="faqsAccordion">
            <div className="row">
              {faqs.length === 0 ? (
                <p className="text-center">No FAQs available at the moment.</p>
              ) : (
                faqs.map((faq, index) => (
                  <div className="col-md-6" key={faq.id}>
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
                          {faq.title}
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading${index}`}
                        data-bs-parent="#faqsAccordion"
                      >
                        <div className="accordion-body">{faq.body}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
