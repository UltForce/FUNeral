import React, { useState, useEffect, startTransition } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, CameraControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getContentByPage3 } from "./firebase.js";
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
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const getcontent = await getContentByPage3("services");
        setContent(getcontent);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plan content:", error);
      }
    };

    fetchContent();
  }, []);

  const packages = [
    {
      id: 1,
      title: content["plan 1"]?.title,
      info: "A basic funeral service package with essential items included.",
      price: "PHP " + content["plan 1"]?.price,
      description:
        "The basic funeral service package is designed for families seeking a simple yet heartfelt farewell for their loved ones. It ensures that all essential aspects of the service, from preparation to final disposition, are handled professionally and with care.",

      inclusionslist: (
        <ul style={{ textAlign: "left" }}>
          <i>
            <strong>Prices are subject to change depending on inclusion</strong>
          </i>

          <li>
            <strong>Casket</strong> - Wood features, Full Glass, Basic Interiors
            and Handles.
          </li>
          <li>
            <strong>Curtain</strong> - Simple Fabric focusing on simplicity
          </li>
          <li>
            <strong>Flower Arrangements</strong> - Simple and understated flower
            stand
          </li>
          <li>
            <strong>Carpet</strong> - Durable and Plain
          </li>
          <li>
            <strong>Set of Lights and Candles</strong> - Minimalist without
            ornate details
          </li>
          <li>
            <strong>Traditional Filipino Clothing</strong> - Barong Tagalog for
            Male, Baro't Saya for Female
          </li>
        </ul>
      ),

      imagePath: content["plan 1"]?.imageUrl, // Unique image
      modelPaths: {
        wake: "/3DModels/Plan1.glb",
        inclusions: {
          casket: ["/3DModels/Plan1_casket.glb"],
          flowers: ["/3DModels/Plan1_flowers.glb"],
          candles: ["/3DModels/Plan1_candles.glb"],
          curtains: ["/3DModels/Plan1_curtain.glb"],
          tarp: ["/3DModels/tarp.glb"],
          car: ["/3DModels/basiccar.glb"],
        },
      },
    },
    {
      id: 2,
      title: content["plan 2"]?.title,
      info: "A premium package with elegant garden-themed items.",
      price: "PHP " + content["plan 2"]?.price,
      description:
        "The premium package, designed specifically for funeral wakes, features an exquisite selection of garden-themed items. This collection includes beautifully arranged floral displays and tasteful decorative accents that evoke a sense of peace and serenity, providing a comforting atmosphere for your loved one's farewell.",
      inclusionslist: (
        <ul style={{ textAlign: "left" }}>
          <li>
            <strong>Casket</strong> - Wood features, Full Glass, Detailed
            Interiors, and Handles.
          </li>
          <li>
            <strong>Curtain</strong> - Serene and Flowy Fabrics
          </li>
          <li>
            <strong>Flower Arrangements</strong> - Emulate Garden Theme with
            Floral sprays top of casket
          </li>
          <li>
            <strong>Carpet</strong> - Subtle Carpet Design
          </li>
          <li>
            <strong>Set of Lights and Candles</strong> - Suitable for standard
            ceremonies with a modest style.
          </li>
          <li>
            <strong>Traditional Filipino Clothing</strong> - Barong Tagalog for
            Male, Baro't Saya for Female
          </li>
        </ul>
      ),
      imagePath: content["plan 2"]?.imageUrl, // Unique image
      modelPaths: {
        wake: "/3DModels/Plan2.glb",
        inclusions: {
          casket: ["/3DModels/Plan2_casket.glb"],
          flowers: ["/3DModels/Plan2_flowers.glb"],
          candles: ["/3DModels/Plan2_candles.glb"],
          curtains: ["/3DModels/Plan2_curtain.glb"],
          tarp: ["/3DModels/tarp.glb"],
          car: ["/3DModels/gardencar.glb"],
        },
      },
    },
    {
      id: 3,
      title: content["plan 3"]?.title,
      info: "The ultimate funeral service package with luxurious items.",
      price: "PHP " + content["plan 3"]?.price,
      description:
        "The ultimate funeral service package offers a comprehensive selection of luxurious items designed to provide comfort and dignity during a difficult time. This package includes elegant caskets, beautifully crafted memorial displays, personalized cabinetry, and premium floral arrangements. Each element is carefully chosen to reflect the unique life and legacy of your loved one, ensuring that every aspect of the service is a proper tribute.",
      inclusionslist: (
        <ul style={{ textAlign: "left" }}>
          <li>
            <strong>Casket</strong> - Wood features, Full Glass, Detailed
            Interiors, and Handles.
          </li>
          <li>
            <strong>Curtain</strong> - High-quality fabrics for a Luxurious
            appearance
          </li>
          <li>
            <strong>Flower Arrangements</strong> - Arranged in large casket
            floral sprays, cascading wreaths, or opulent urn-style displays
          </li>
          <li>
            <strong>Carpet</strong> - Subtle Carpet Design
          </li>
          <li>
            <strong>Set of Lights and Candles</strong> - Incorporates organic
            elements like floral and engraved symbols
          </li>
          <li>
            <strong>Traditional Filipino Clothing</strong> - Barong Tagalog for
            Male, Baro't Saya for Female
          </li>
        </ul>
      ),
      imagePath: content["plan 3"]?.imageUrl, // Unique image
      modelPaths: {
        wake: "/3DModels/Plan3.glb",
        inclusions: {
          casket: ["/3DModels/Plan3_casket.glb"],
          flowers: ["/3DModels/Plan3_flowers.glb"],
          candles: ["/3DModels/Plan3_candles.glb"],
          curtains: ["/3DModels/Plan3_curtain.glb"],
          tarp: ["/3DModels/garbostand.glb"],
          car: ["/3DModels/garbocar.glb"],
        },
      },
    },
    {
      id: 4,
      title: content["plan 4"]?.title,
      info: "Kid Package",
      price: "PHP " + content["plan 4"]?.price,
      description: "Our Kids' Funeral Package is thoughtfully designed to honor the life and memory of your beloved child with care and sensitivity. A small package that we provide for grieving family that having difficult time to grief with their children. Having a service that reflects your child’s personality and the love they brought into the world.",
      imagePath: content["plan 4"]?.imageUrl, // Unique image
      modelPaths: {
        wake: "/3DModels/Plan4.glb",
        inclusions: {
          casket: ["/3DModels/small casket.glb"],
          flowers: ["/3DModels/small flowers.glb"],
          candles: ["/3DModels/small lights.glb"],
          curtains: ["/3DModels/small curtain.glb"],
          tarp: ["/3DModels/tarp.glb"],
          car: ["/3DModels/basiccar.glb"],
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
          <p className="funeral-description">
            Funeral packages are thoughtfully crafted service bundles designed
            to ease the planning and organization of a funeral. These
            comprehensive packages play a crucial role in honoring the memory of
            a loved one, tailored to accommodate a wide range of personal
            preferences and financial considerations. By offering a customizable
            selection of services, we ensure that the distinctive needs of every
            family are met, providing a streamlined and compassionate approach
            to commemorating their loved ones. This allows families to celebrate
            the life and legacy of the deceased with the dignity and respect
            they deserve, creating a meaningful tribute.{" "}
          </p>
          <div className="card-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card">
                <img src={pkg.imagePath} alt={`${pkg.title} Image`} />{" "}
                {/* Use dynamic image path */}
                <h3>{pkg.title}</h3>
                <p>{pkg.info}</p>
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
                  <div className="funeral-desc-inclusion">
                    <div className="modal-description">
                      <h2>{selectedPackage.title}</h2>
                      <p className="package-desc">
                        {selectedPackage.description}
                      </p>
                      <p className="inclusion-list">
                        <strong>Inclusion: </strong>
                        {selectedPackage.inclusionslist}
                      </p>
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
                          onChange={(e) =>
                            handleShowInclusion3D(e.target.value)
                          }
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select Inclusion
                          </option>
                          <option value="casket">Casket</option>
                          <option value="flowers">Flowers</option>
                          <option value="candles">Candles</option>
                          <option value="curtains">Curtains</option>
                          <option value="tarp">Tarps</option>
                          <option value="car">Cars</option>
                        </select>
                      </div>
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
