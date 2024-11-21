import React, { useState, useEffect, startTransition } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
import "./services.css";
import Modal from "./Modal"; // Modal component

const Casket3D = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);

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
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showInclusionModal, setShowInclusionModal] = useState(false);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [selectedInclusion, setSelectedInclusion] = useState("casket");

  const packages = [
    {
      id: 1,
      title: "Basic Package",
      price: "25,000",
      description:
        "A basic funeral service package with essential items included.",
      modelPaths: {
        wake: "/Plan1.glb",
        inclusions: {
          casket: ["/casket.glb", "Plan1.glb"],
          flowers: ["/casket.glb", "Plan1.glb"],
          candles: ["/casket.glb", "/casket.glb"],
          curtains: ["/casket.glb", "/casket.glb"],
        },
      },
    },
    {
      id: 2,
      title: "Garden Package",
      price: "50,000",
      description: "A premium package with elegant garden-themed items.",
      modelPaths: {
        wake: "/casket.glb",
        inclusions: {
          casket: ["/casket.glb", "/casket.glb"],
          flowers: ["/casket.glb", "/casket.glb"],
          candles: ["/casket.glb", "/casket.glb"],
          curtains: ["/casket.glb", "/casket.glb"],
        },
      },
    },
    {
      id: 3,
      title: "Garbo Package",
      price: "280,000",
      description: "The ultimate funeral service package with luxurious items.",
      modelPaths: {
        wake: "/casket.glb",
        inclusions: {
          casket: ["/casket.glb", "/casket.glb"],
          flowers: ["/casket.glb", "/casket.glb"],
          candles: ["/casket.glb", "/casket.glb"],
          curtains: ["/casket.glb", "/casket.glb"],
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
      setShow3DModal(true);
    });
  };

  const handleShowInclusion3D = (inclusion) => {
    startTransition(() => {
      setSelectedInclusion(inclusion);
      setCurrentModelIndex(0); // Reset to the first model
      setShowInitialModal(false);
      setShowInclusionModal(true);
    });
  };

  const handleNextModel = () => {
    startTransition(() => {
      setCurrentModelIndex((prev) => {
        const totalModels =
          selectedPackage.modelPaths.inclusions[selectedInclusion].length;
        return (prev + 1) % totalModels; // Loop back to first model
      });
    });
  };

  const handlePreviousModel = () => {
    startTransition(() => {
      setCurrentModelIndex((prev) => {
        const totalModels =
          selectedPackage.modelPaths.inclusions[selectedInclusion].length;
        return (prev - 1 + totalModels) % totalModels; // Loop back to last model
      });
    });
  };

  return (
    <div className="snapping-container content-user">
      <section className="snap-section">
        <h1>Funeral Packages</h1>
        <div className="card-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card">
              <h3>{pkg.title}</h3>
              <p>Price: {pkg.price}</p>
              <button onClick={() => handleViewPackage(pkg)}>
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
            <div className="modal-content">
              <div className="modal-description">
                <h2>{selectedPackage.title}</h2>
                <p>{selectedPackage.description}</p>
              </div>
              <div className="modal-buttons">
                <button onClick={handleShow3DWake}>Show Funeral Wake 3D</button>
                <div>
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
            <h2>
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
              <button onClick={handlePreviousModel}>Previous</button>
              <button onClick={handleNextModel}>Next</button>
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
  );
};

export default Services;
