// Terms.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, auth, getUserRoleFirestore } from "./firebase.js";
const Terms = () => {
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
    <section className="background-image section content-user">
      <div className="centered">
        <div>
          <h1 className="page-title">Terms and Conditions</h1>
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
                      Appointment Scheduling
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingOne"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Customers have the option to do walk-ins but online
                      appointment scheduling are recommended. A customer can
                      only schedule one appointment at a time
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
                      Cancellation
                    </button>
                  </h2>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTwo"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      A customer can only request cancellation on appointments
                      not yet approved by the administrators.
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
                      Rescheduling
                    </button>
                  </h2>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingThree"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      In the case that the customer wishes to cancel or
                      reschedule an already approved appointment, please contact
                      0927 882 0488 directly.
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
                      Walk-ins
                    </button>
                  </h2>
                  <div
                    id="collapseFour"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFour"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      For walk-ins, appointments made on the website will be
                      prioritized in the case that a walk-in and online
                      appointment are in the same time slot. In the case that
                      the appointment is canceled or a no-show, the walk-in
                      appointment can take over the time slot.
                    </div>
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
                      Refusal of Service
                    </button>
                  </h2>
                  <div
                    id="collapseFive"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFive"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      The grooming shop reserves the right to refuse service to
                      any client for reasons of including but not limited to
                      aggressive pet behavior, pregnant pet, or injuries or
                      severe health conditions.
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
                      Payment
                    </button>
                  </h2>
                  <div
                    id="collapseSix"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingSix"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Payment can only be made on site of the grooming shop.
                      Cash, Bank Transfer, and GCASH payment are accepted.
                    </div>
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
                      Products
                    </button>
                  </h2>
                  <div
                    id="collapseTen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      The products on the shop page are only for preview and can
                      only be bought on-site at the grooming shop.
                    </div>
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
                      Liability
                    </button>
                  </h2>
                  <div
                    id="collapseEleven"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingEleven"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      The grooming shop will take reasonable care of the
                      customer's pet but will not be liable for any pre-existing
                      conditions. The customers are liable for any damage or
                      injuries that their pet may have caused.
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
                      Photography and Social Media
                    </button>
                  </h2>
                  <div
                    id="collapseTwelve"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingTwelve"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      Customers may be asked by the grooming shop to take
                      pictures of their pets for marketing purposes. The
                      customer may choose to refuse.
                    </div>
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
                      Changes to Terms and Conditions
                    </button>
                  </h2>
                  <div
                    id="collapseThirteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingThirteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      The grooming shop reserves the right to modify these terms
                      and conditions as needed. Customers will be notified of
                      any changes.
                    </div>
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
                      Privacy Policy
                    </button>
                  </h2>
                  <div
                    id="collapseFourteen"
                    className="accordion-collapse collapse  "
                    aria-labelledby="headingFourteen"
                    data-bs-parent="#faqsAccordion"
                  >
                    <div className="accordion-body">
                      We use the personal information provided by our customers
                      to schedule grooming appointments, communicate with them
                      regarding their appointments, understand their pet's
                      grooming needs, and ensure the safety and well-being of
                      their pets during the grooming process. We may also use
                      this information for internal record-keeping and to
                      improve our services. We do not sell, trade, or otherwise
                      transfer personal information to third parties unless we
                      have obtained explicit consent from the customer or are
                      required to do so by law. We take the security of customer
                      data seriously and implement various measures to protect
                      it from unauthorized access, disclosure, alteration, or
                      destruction. Once the data is no longer needed, we
                      securely dispose of it to prevent unauthorized access or
                      misuse.
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
    </section>
  );
};

export default Terms;
