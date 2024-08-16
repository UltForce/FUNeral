// FAQs.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getUserRoleFirestore, auth } from "./firebase.js";
const FAQs = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");
      }
    });

    return () => unsubscribe();
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const handleBookNowClick = () => {
    navigate("/booking"); // Redirect to booking page when "Book now" button is clicked
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  window.addEventListener("scroll", toggleVisibility);

  return (
    <section className="background-image">
      <div>
        <div>
          <h1 className="page-title centered">Frequently Asked Questions</h1>
        </div>
        <div className="accordion-container centered">
          <div className="accordion" id="faqsAccordion">
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="false"
                      aria-controls="collapseOne"
                    >
                      How can I schedule an appointment?
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingOne"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      You can schedule an appointment by calling us, visiting
                      our website, or using our online appointment booking
                      system.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwo">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                      aria-expanded="false"
                      aria-controls="collapseTwo"
                    >
                      Can these products be delivered on my home?
                    </button>
                  </h2>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTwo"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      The products are only for promotion and must be bought
                      onsite on the grooming shop itself.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingThree">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseThree"
                      aria-expanded="false"
                      aria-controls="collapseThree"
                    >
                      Can I schedule more than 2 appointments?
                    </button>
                  </h2>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingThree"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Through the website, a customer can't schedule more than 2
                      appointments until the first one has been finished, if the
                      customer wishes to schedule multiple appointments, the
                      customer has to contact the administrators directly.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFour">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseFour"
                      aria-expanded="false"
                      aria-controls="collapseFour"
                    >
                      What services do you provide?
                    </button>
                  </h2>
                  <div
                    id="collapseFour"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFour"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFive">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseFive"
                      aria-expanded="false"
                      aria-controls="collapseFive"
                    >
                      Is scheduling an appointment through the website
                      necessary?
                    </button>
                  </h2>
                  <div
                    id="collapseFive"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFive"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      While appointments are recommended, we do accept walk-ins
                      based on availability. To ensure your preferred time, it's
                      best to schedule in advance.
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingSix">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseSix"
                      aria-expanded="false"
                      aria-controls="collapseSix"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseSix"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingSix"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingSeven">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseSeven"
                      aria-expanded="false"
                      aria-controls="collapseSeven"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseSeven"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingSeven"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingEight">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseEight"
                      aria-expanded="false"
                      aria-controls="collapseEight"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseEight"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingEight"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingNine">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseNine"
                      aria-expanded="false"
                      aria-controls="collapseNine"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseNine"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingNine"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTen">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTen"
                      aria-expanded="false"
                      aria-controls="collapseTen"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseTen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingEleven">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseEleven"
                      aria-expanded="false"
                      aria-controls="collapseEleven"
                    >
                      Do you offer discounts?
                    </button>
                  </h2>
                  <div
                    id="collapseEleven"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingEleven"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Yes, we offer discounts. Check our website or contact us
                      for information on current specials.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingTwelve">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwelve"
                      aria-expanded="false"
                      aria-controls="collapseTwelve"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseTwelve"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTwelve"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingThirteen">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseThirteen"
                      aria-expanded="false"
                      aria-controls="collapseThirteen"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseThirteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingThirteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFourteen">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseFourteen"
                      aria-expanded="false"
                      aria-controls="collapseFourteen"
                    >
                      Lorem Ipsum
                    </button>
                  </h2>
                  <div
                    id="collapseFourteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFourteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">Lorem Ipsum</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingFifteen">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseFifteen"
                      aria-expanded="false"
                      aria-controls="collapseFifteen"
                    >
                      How do I make a booking?
                    </button>
                  </h2>
                  <div
                    id="collapseFifteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFifteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Bookings can be made conveniently through our online
                      booking portal
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingSixteen">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseSixteen"
                      aria-expanded="false"
                      aria-controls="collapseSixteen"
                    >
                      How long in advance should I make my appointment?
                    </button>
                  </h2>
                  <div
                    id="collapseSixteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingSixteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      We encourage booking your appointment with us at least 1
                      day in advance.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        {isVisible && (
          <button className="back-to-top" onClick={scrollToTop}>
            Back to Top
          </button>
        )}
      </div>
      {/* Floating "Book now" button */}
      {isLoggedIn ? (
        <button className="book-now-button" onClick={handleBookNowClick}>
          Book now
        </button>
      ) : (
        <></>
      )}
    </section>
  );
};

export default FAQs;
