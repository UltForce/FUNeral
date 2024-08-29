import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  auth,
  getCurrentUserId,
  getUserRoleFirestore,
  AuditLogger,
} from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faCog,
  faBell,
  faSignOutAlt,
  faQuestionCircle,
  faInfoCircle,
  faImage,
  faCalendar,
  faTag,
  faAddressBook,
  faClapperboard,
  faClipboard,
  faBriefcase,
  faBox,
  faFileAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./navbar.css";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const Navbar = ({ notifications, setNotifications }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const storedNotifications = sessionStorage.getItem("notifications");
    if (storedNotifications) {
      const notifications = JSON.parse(storedNotifications);
      const hasUnread = notifications.some(
        (notification) => !notification.read
      );
      setHasUnreadNotifications(hasUnread);
    }
  }, [notifications]);

  const handleMarkAllRead = () => {
    const updatedNotifications = notifications.map((notification) => {
      return { ...notification, read: true };
    });
    setNotifications(updatedNotifications);
    sessionStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  const handleLogout = async () => {
    Swal.fire({
      icon: "question",
      title: "Do you want to logout?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          sessionStorage.removeItem("notifications");

          const userId = getCurrentUserId();
          setIsLoggedIn(false);
          setIsAdmin(false);
          await auth.signOut();
          navigate("/login");
          Toast.fire({
            icon: "success",
            title: "Successfully Logout",
          });
          const event = {
            type: "Logout",
            userId: userId,
            details: "User logged out",
          };
          AuditLogger({ event });
          setNotifications([]);
        } catch (error) {
          console.error("Error logging out:", error.message);
        }
        Swal.fire({
          title: "Success",
          text: "Account successfully logged out.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Account successfully logged out.",
            });
          }
        });
      }
    });
  };

  return (
    <>
      {isAdmin ? (
        <div className="sidebar-container">
          <nav className="sidebar">
            <ul>
              {isLoggedIn && (
                <>
                  <li
                    className={
                      location.pathname === "/dashboard" ? "active" : ""
                    }
                  >
                    <Link to="/dashboard">
                      <FontAwesomeIcon icon={faClapperboard} />
                      <span className="nav-label"> Dashboard</span>
                    </Link>
                  </li>
                  <li
                    className={
                      location.pathname === "/appointments" ? "active" : ""
                    }
                  >
                    <Link to="/appointments">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span className="nav-label"> Appointments</span>
                    </Link>
                  </li>
                  <li
                    className={
                      location.pathname === "/inventory" ? "active" : ""
                    }
                  >
                    <Link to="/inventory">
                      <FontAwesomeIcon icon={faBox} />
                      <span className="nav-label"> Inventory</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/content" ? "active" : ""}
                  >
                    <Link to="/content">
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span className="nav-label"> Content</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/reviews" ? "active" : ""}
                  >
                    <Link to="/reviews">
                      <FontAwesomeIcon icon={faStar} />
                      <span className="nav-label"> Reviews</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/reports" ? "active" : ""}
                  >
                    <Link to="/reports">
                      <FontAwesomeIcon icon={faBriefcase} />
                      <span className="nav-label"> Reports</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/audit" ? "active" : ""}
                  >
                    <Link to="/audit">
                      <FontAwesomeIcon icon={faClipboard} />
                      <span className="nav-label"> Audit</span>
                    </Link>
                  </li>
                  <li>
                    <Link onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span className="nav-label"> Logout</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      ) : (
        <nav className="top-navbar">
          <img src="JROA.jpg" height="50px" alt="JROA Logo" />
          <ul className="centeredNav">
            <li className={location.pathname === "/homepage" ? "active" : ""}>
              <Link to="/homepage">
                <FontAwesomeIcon icon={faHome} />
                <span className="nav-label"> Home</span>
              </Link>
            </li>
            <li className={location.pathname === "/about" ? "active" : ""}>
              <Link to="/about">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span className="nav-label"> About us</span>
              </Link>
            </li>
            <li className={location.pathname === "/gallery" ? "active" : ""}>
              <Link to="/gallery">
                <FontAwesomeIcon icon={faImage} />
                <span className="nav-label"> Gallery</span>
              </Link>
            </li>
            {isLoggedIn && (
              <>
                <li
                  className={location.pathname === "/services" ? "active" : ""}
                >
                  <Link to="/services">
                    <FontAwesomeIcon icon={faTag} />
                    <span className="nav-label"> Services</span>
                  </Link>
                </li>
                <li
                  className={location.pathname === "/booking" ? "active" : ""}
                >
                  <Link to="/booking">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span className="nav-label"> Book now</span>
                  </Link>
                </li>
              </>
            )}
            <li className={location.pathname === "/terms" ? "active" : ""}>
              <Link to="/terms">
                <FontAwesomeIcon icon={faCog} />
                <span className="nav-label"> Terms & Conditions</span>
              </Link>
            </li>
            <li className={location.pathname === "/faqs" ? "active" : ""}>
              <Link to="/faqs">
                <FontAwesomeIcon icon={faQuestionCircle} />
                <span className="nav-label"> FAQs</span>
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="nav-label"> Logout</span>
                </Link>
              </li>
            )}
            {!isLoggedIn && (
              <>
                <li className={location.pathname === "/login" ? "active" : ""}>
                  <Link to="/login">
                    <FontAwesomeIcon icon={faUser} />
                    <span className="nav-label"> Login</span>
                  </Link>
                </li>
                <li
                  className={location.pathname === "/register" ? "active" : ""}
                >
                  <Link to="/register">
                    <FontAwesomeIcon icon={faAddressBook} />
                    <span className="nav-label"> Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navbar;
