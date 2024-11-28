import React, { useState } from "react";
import "./PlanningGuide.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PlanningGuide = () => {
  
  
  const navigate = useNavigate(); // Initialize navigate function


  return (
    <main className="main-content">
    <section className="planning-guide">
      <div>
        <h1 className="planning-title">PLANNING GUIDE</h1>
        <div className="planning-border"></div>
      </div>
    </section>
    <section className="planning-container">
      
    </section>
    </main>
  );
};

export default PlanningGuide;
