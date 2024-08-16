import React from "react";
import "./styles.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
import { useEffect } from "react";

const Gallery = () => {
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <section className="background-shadow">
      <p>Gallery goes here</p>
    </section>
  );
};

export default Gallery;
