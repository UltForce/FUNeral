import "./PlanningGuide.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getContentByPage } from "./firebase.js";
import Loader from "./Loader.js";

const PlanningGuide = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation();
  const [planContent, setPlanContent] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        const headerOffset = 10; // Adjust this value based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchPlanContent = async () => {
      try {
        const content = await getContentByPage("plan");
        if (content.length > 0) {
          // Group content by section
          const groupedContent = content.reduce((acc, item) => {
            const section = item.section || "Uncategorized";
            acc[section] = JSON.parse(item.planDetails || "{}");
            return acc;
          }, {});
          setPlanContent(groupedContent); // Update state with grouped content
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchPlanContent();
  }, []);

  const renderStepContent = () => {
    if (!planContent) return null;

    // Sort section keys if necessary (e.g., step1, step2, step3...)
    const sortedSectionKeys = Object.keys(planContent).sort((a, b) => {
      const orderA = parseInt(a.replace("step", ""));
      const orderB = parseInt(b.replace("step", ""));
      return orderA - orderB;
    });

    // Render each section's content in sorted order
    return sortedSectionKeys.map((sectionKey) => {
      const sectionContent = planContent[sectionKey];

      return (
        <div className="steps" id={sectionKey} key={sectionKey}>
          {loading && <Loader />} {/* Display loader while loading */}
          {Object.keys(sectionContent).map((stepKey) => {
            const step = sectionContent[stepKey];

            return (
              <div key={stepKey}>
                <h1>{step.title}</h1>
                <p>{step.description}</p>
                <div className="pov-container">
                  <div className="for-user">
                    <h3 className="label-user">User's Perspective:</h3>
                    <ol>
                      {step.userPerspective.map((perspective, index) => (
                        <li key={index}>
                          <strong>{perspective.title}:</strong>
                          <ul>
                            {perspective.items.map((item, subIndex) => (
                              <li key={subIndex}>{item}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <br />
                  <div className="for-manager">
                    <h3 className="label-manager">
                      Funeral Manager's Perspective:
                    </h3>
                    <ol>
                      {step.managerPerspective.map((perspective, index) => (
                        <li key={index}>
                          <strong>{perspective.title}:</strong>
                          <ul>
                            {perspective.items.map((item, subIndex) => (
                              <li key={subIndex}>{item}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <main className="main-content">
      <section className="planning-guide">
        <div>
          <h1 className="planning-title">PLANNING GUIDE</h1>
          <div className="planning-border"></div>
        </div>
      </section>
      <section className="planning-container">
        <div className="planning-decription">
          <p>
            <b className="FUNeral-title">FUNeral</b> can help you book a meeting
            with <b>J.ROA Funeral Service</b>, where you can discuss your loved
            one's wishes and any essential cultural or religious customs.
            Together, we'll navigate the funeral services, ensuring your needs
            and feelings are prioritized throughout the process. With the help
            of our chatbot, it is just a click away. We are ready to offer tips
            on coping with grief and help you explore our resources. Together,
            we'll ensure that all the logistics are handled carefully,
            prioritizing your needs and emotions throughout this challenging
            time. Let's cherish their memory together.
          </p>
        </div>
        <div className="number">
          <a href="#step1">1</a>
          <a href="#step2">2</a>
          <a href="#step3">3</a>
          <a href="#step4">4</a>
          <a href="#step5">5</a>
        </div>
        <div>{renderStepContent()}</div>
      </section>
    </main>
  );
};

export default PlanningGuide;
