import React, { useState, useEffect, startTransition } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, CameraControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
import "./services.css";
import Modal from "./Modal"; // Modal component
import Loader from "./Loader"; // Import the Loader component

const Casket3D = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      {/* Ambient Light for overall brightness */}
      <ambientLight intensity={1} color="#ffffff" />

      {/* Point Light for local illumination */}
      <pointLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[-5, -5, 5]} intensity={2} />

      {/* Directional Light for consistent shadows and illumination */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Spotlight for focused illumination */}
      <spotLight
        position={[5, 10, 5]}
        angle={0.3}
        penumbra={0.5}
        intensity={1000}
        castShadow
      />

      {/* 3D Model */}
      <primitive object={scene} />

      {/* Orbit Controls */}
      <CameraControls />
    </Canvas>
  );
};

const Services = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showInclusionModal, setShowInclusionModal] = useState(false);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [selectedInclusion, setSelectedInclusion] = useState("casket");
  const [showLoader, setShowLoader] = useState(false); // Loader state

  const packages = [
    {
      id: 1,
      title: "Basic Package",
      price: "25,000",
      description:
        "A basic funeral service package with essential items included.",
      imagePath: "/funeral pics/wake1.jpg", // Unique image
      modelPaths: {
        wake: "/3DModels/Plan1.glb",
        inclusions: {
          casket: ["/3DModels/Plan1_casket.glb"],
          flowers: ["/3DModels/Plan1_flowers.glb"],
          candles: ["/3DModels/Plan1_candles.glb"],
          curtains: ["/3DModels/Plan1_curtain.glb"],
        },
      },
    },
    {
      id: 2,
      title: "Garden Package",
      price: "50,000",
      description: "A premium package with elegant garden-themed items.",
      imagePath: "/JROA.jpg", // Unique image
      modelPaths: {
        wake: "/3DModels/Plan2.glb",
        inclusions: {
          casket: ["/3DModels/Plan2_casket.glb"],
          flowers: ["/3DModels/Plan2_flowers.glb"],
          candles: ["/3DModels/Plan2_candles.glb"],
          curtains: ["/3DModels/Plan2_curtain.glb"],
        },
      },
    },
    {
      id: 3,
      title: "Garbo Package",
      price: "280,000",
      description: "The ultimate funeral service package with luxurious items.",
      imagePath: "/JROA.jpg", // Unique image
      modelPaths: {
        wake: "/3DModels/Plan3.glb",
        inclusions: {
          casket: ["/3DModels/Plan3_casket.glb"],
          flowers: ["/3DModels/Plan3_flowers.glb"],
          candles: ["/3DModels/Plan3_candles.glb"],
          curtains: ["/3DModels/Plan3_curtain.glb"],
        },
      },
    },
  ];

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error.message);
        navigate("/login");
      }
    };
    checkLoggedInStatus();
  }, [navigate]);

  const handleViewPackage = (pkg) => {
    startTransition(() => {
      setSelectedPackage(pkg);
      setShowInitialModal(true);
    });
  };

  const handleShow3DWake = () => {
    startTransition(() => {
      setShowInitialModal(false);
      setShowLoader(true); // Show loader
      setTimeout(() => {
        setShowLoader(false); // Hide loader after delay
        setShow3DModal(true); // Show modal
      }, 1000); // Simulate loading time (adjust as needed)
    });
  };

  const handleShowInclusion3D = (inclusion) => {
    startTransition(() => {
      setSelectedInclusion(inclusion);
      setCurrentModelIndex(0);
      setShowInitialModal(false);
      setShowLoader(true); // Show loader
      setTimeout(() => {
        setShowLoader(false); // Hide loader
        setShowInclusionModal(true); // Show modal
      }, 1000); // Simulate loading time
    });
  };

  return (
    <main className="main-content">
      {showLoader && <Loader />} {/* Render loader conditionally */}
      <section className="services">
        <div>
          <h1 className="services-title">SERVICES</h1>
          <div className="services-border"></div>
        </div>
      </section>
      <div className="services-container">
        <section className="services-section">
          <h1 className="funeral-pack-title">Funeral Packages</h1>
          <div className="card-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card">
                <img src={pkg.imagePath} alt={`${pkg.title} Image`} />{" "}
                {/* Use dynamic image path */}
                <h3>{pkg.title}</h3>
                <p>
                  Price: <strong>{pkg.price}</strong>
                </p>
                <button
                  onClick={() => handleViewPackage(pkg)}
                  className="view-package-button"
                >
                  View Package
                </button>
              </div>
            ))}
          </div>
        </section>

        {selectedPackage && (
          <>
            {/* Initial Modal */}
            <Modal
              isOpen={showInitialModal}
              onClose={() => setShowInitialModal(false)}
            >
              <div className="services-modal-box">
                <div className="funeral-package-details">
                  <img
                    src={selectedPackage.imagePath}
                    alt="funeral-package img"
                  />{" "}
                  {/* Dynamic image */}
                  <div className="modal-description">
                    <h2>{selectedPackage.title}</h2>
                    <p>{selectedPackage.description}</p>
                  </div>
                  <div className="modal-buttons">
                    <button
                      className="show-3d-button"
                      onClick={handleShow3DWake}
                    >
                      Show Funeral Wake 3D
                    </button>
                    <div className="services-inclusion-select">
                      <label htmlFor="inclusion-select">
                        Preview Inclusion Items:
                      </label>
                      <select
                        id="inclusion-select"
                        onChange={(e) => handleShowInclusion3D(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select Inclusion
                        </option>
                        <option value="casket">Casket</option>
                        <option value="flowers">Flowers</option>
                        <option value="candles">Candles</option>
                        <option value="curtains">Curtains</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            {/* Funeral Wake 3D Modal */}
            <Modal isOpen={show3DModal} onClose={() => setShow3DModal(false)}>
              <Casket3D modelPath={selectedPackage.modelPaths.wake} />
              <div className="modal-navigation">
                <button
                  onClick={() =>
                    setShow3DModal(false) || setShowInitialModal(true)
                  }
                >
                  Return
                </button>
              </div>
            </Modal>

            {/* Inclusion Items 3D Modal */}
            <Modal
              isOpen={showInclusionModal}
              onClose={() => setShowInclusionModal(false)}
            >
              <h2 className="inclusion-title">
                {selectedInclusion.charAt(0).toUpperCase() +
                  selectedInclusion.slice(1)}{" "}
                Model
              </h2>
              <Casket3D
                modelPath={
                  selectedPackage.modelPaths.inclusions[selectedInclusion][
                    currentModelIndex
                  ]
                }
              />
              <div className="modal-navigation">
                <button
                  onClick={() =>
                    setShowInclusionModal(false) || setShowInitialModal(true)
                  }
                >
                  Return
                </button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </main>
  );
};

export default Services;
