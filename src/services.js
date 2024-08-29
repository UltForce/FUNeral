import React, { useEffect, useState, startTransition } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
import "./services.css";
import Modal from "./Modal"; // Import the modal component

const Casket3D = () => {
  const { scene, progress } = useGLTF("/casket.glb");

  if (progress < 1) {
    // You can add a loading spinner or indicator here
    return <div>Loading...</div>;
  }

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} intensity={1000} />

      {/* 3D Model */}
      <primitive object={scene} />

      {/* Orbit Controls */}
      <OrbitControls />
    </Canvas>
  );
};

const Services = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const [selectedService, setSelectedService] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [show3DCasket, setShow3DCasket] = useState(false); // For toggling 3D view

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          navigate("/login"); // Redirect to login page if user is not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error.message);
        navigate("/login"); // Redirect to login page if error occurs
      }
    };

    checkLoggedInStatus();
  }, [navigate]); // Pass navigate as a dependency to useEffect

  const services = [
    { id: 1, title: "Service 1", description: "Details of Service 1" },
    { id: 2, title: "Service 2", description: "Details of Service 2" },
    { id: 3, title: "Service 3", description: "Details of Service 3" },
    { id: 4, title: "Service 4", description: "Details of Service 4" },
    { id: 5, title: "Service 5", description: "Details of Service 5" },
    { id: 6, title: "Service 6", description: "Details of Service 6" },
  ];

  const plans = [
    { id: 1, title: "Plan 1", description: "Details of Plan 1" },
    { id: 2, title: "Plan 2", description: "Details of Plan 2" },
    { id: 3, title: "Plan 3", description: "Details of Plan 3" },
    { id: 4, title: "Plan 4", description: "Details of Plan 4" },
    { id: 5, title: "Plan 5", description: "Details of Plan 5" },
    { id: 6, title: "Plan 6", description: "Details of Plan 6" },
  ];

  const handleViewService = (service) => {
    startTransition(() => {
      setSelectedService(service);
      setSelectedPlan(null); // Reset selected plan
    });
  };

  const handleViewPlan = (plan) => {
    startTransition(() => {
      setSelectedPlan(plan);
      setSelectedService(null); // Reset selected service
    });
  };

  const handleReturn = () => {
    startTransition(() => {
      setSelectedService(null);
      setSelectedPlan(null);
      setShow3DCasket(false); // Reset 3D view
    });
  };

  const toggle3DCasket = () => {
    startTransition(() => {
      setShow3DCasket(!show3DCasket);
    });
  };

  return (
    <div className="snapping-container content-user">
      {/* First Snap Section */}
      <section className="snap-section section1">
        <h1>Our Services</h1>
        {selectedService ? (
          <div className="service-details">
            <h2>{selectedService.title}</h2>
            <p>{selectedService.description}</p>
            <button className="view-service-button" onClick={toggle3DCasket}>
              {show3DCasket ? "Hide 3D Casket" : "View 3D Casket"}
            </button>
            <button className="return-button" onClick={handleReturn}>
              Return to Services
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {services.map((service) => (
              <div key={service.id} className="card">
                <h3>{service.title}</h3>
                <button
                  className="view-service-button"
                  onClick={() => handleViewService(service)}
                >
                  View Service
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Second Snap Section */}
      <section className="snap-section section2">
        <h1>Funeral Plans</h1>
        {selectedPlan ? (
          <div className="service-details">
            <h2>{selectedPlan.title}</h2>
            <p>{selectedPlan.description}</p>
            <button className="view-service-button" onClick={toggle3DCasket}>
              {show3DCasket ? "Hide 3D Casket" : "View 3D Casket"}
            </button>
            <button className="return-button" onClick={handleReturn}>
              Return to Plans
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="card">
                <h3>{plan.title}</h3>
                <button
                  className="view-service-button"
                  onClick={() => handleViewPlan(plan)}
                >
                  View Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Render Modal for 3D Casket */}
      <Modal isOpen={show3DCasket} onClose={toggle3DCasket}>
        <Casket3D />
      </Modal>
    </div>
  );
};

export default Services;
