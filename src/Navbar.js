import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  auth,
  getCurrentUserId,
  getUserRoleFirestore,
  AuditLogger,
  fetchUserNotifications,
  fetchAdminNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faCog,
  faSignOutAlt,
  faQuestionCircle,
  faInfoCircle,
  faImage,
  faCalendar,
  faTag,
  faAddressBook,
  faClapperboard,
  faClipboard,
  faBox,
  faFileAlt,
  faStar,
  faBell,
  faExchangeAlt,
  faArchive,
  faFile,
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

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userId = getCurrentUserId();
        const userRole = await getUserRoleFirestore(userId);
        setIsAdmin(userRole === "admin");

        // Fetch notifications for the logged-in user
        await fetchNotifications(); // Fetch notifications when user logs in
      } else {
        setNotifications([]); // Clear notifications when user logs out
        setHasUnreadNotifications(false); // Reset red dot
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async () => {
    const userId = getCurrentUserId();
    if (!userId) return; // Exit if userId is not valid

    const userRole = await getUserRoleFirestore(userId);

    let notificationsData = [];

    if (userRole === "admin") {
      notificationsData = await fetchAdminNotifications();
    } else {
      notificationsData = await fetchUserNotifications();
    }

    // Sort notifications by unread status and timestamp (most recent first)
    notificationsData.sort((a, b) => {
      // First, prioritize unread notifications (false is treated as greater than true)
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;

      // If both are the same (both read or both unread), prioritize by most recent (timestamp descending)
      return b.timestamp - a.timestamp;
    });

    // Check if there are unread notifications
    const unreadExists = notificationsData.some(
      (notification) => !notification.isRead
    );
    setHasUnreadNotifications(unreadExists); // Show red dot if there are unread notifications
    setNotifications(notificationsData);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    fetchNotifications(); // Refresh notifications after marking as read
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchNotifications(); // Refresh notifications after deletion
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
          const userId = getCurrentUserId();
          setIsLoggedIn(false);
          setIsAdmin(false);
          setIsDropdownOpen(false);
          setNotifications([]); // Clear notifications on logout
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
                  <img alt=" " src="JROA_Banner.png" height="70px" />
                  <li
                    className={
                      location.pathname === "/dashboard" ? "active" : ""
                    }
                  >
                    <Link to="/dashboard">
                      <span className="nav-label"> Dashboard</span>
                    </Link>
                  </li>

                  <li
                    className={
                      location.pathname === "/appointments" ? "active" : ""
                    }
                  >
                    <Link to="/appointments">
                      <span className="nav-label"> Appointments</span>
                    </Link>
                  </li>
                  <li
                    className={
                      location.pathname === "/transaction" ? "active" : ""
                    }
                  >
                    <Link to="/transaction">
                      <span className="nav-label"> Transaction</span>
                    </Link>
                  </li>
                  <li
                    className={
                      location.pathname === "/inventory" ? "active" : ""
                    }
                  >
                    <Link to="/inventory">
                      <span className="nav-label"> Inventory</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/content" ? "active" : ""}
                  >
                    <Link to="/content">
                      <span className="nav-label"> Content</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/reviews" ? "active" : ""}
                  >
                    <Link to="/reviews">
                      <span className="nav-label"> Reviews</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/reports" ? "active" : ""}
                  >
                    <Link to="/reports">
                      <span className="nav-label"> Reports</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/archive" ? "active" : ""}
                  >
                    <Link to="/archive">
                      <span className="nav-label"> Archive</span>
                    </Link>
                  </li>
                  <li
                    className={location.pathname === "/audit" ? "active" : ""}
                  >
                    <Link to="/audit">
                      <span className="nav-label"> Audit</span>
                    </Link>
                  </li>
                  <li>
                    <a onClick={handleLogout} className="no-transition">
                      <span className="nav-label"> Logout</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      ) : (
        <nav className="top-navbar">
          <img src="JROA.jpg" height="50px" alt="JROA Logo" />
          <ul className="menu">
            <li className={location.pathname === "/homepage" ? "active" : ""}>
              <Link to="/homepage">
                <span className="menu-container"> Home</span>
              </Link>
            </li>
            <li className={location.pathname === "/about" ? "active" : ""}>
              <Link to="/about">
                <span className="menu-container"> About us</span>
              </Link>
            </li>
            <li className={location.pathname === "/gallery" ? "active" : ""}>
              <Link to="/gallery">
                <span className="menu-container"> Gallery</span>
              </Link>
            </li>

            {isLoggedIn && (
              <>
                <li
                  className={location.pathname === "/services" ? "active" : ""}
                >
                  <Link to="/services">
                    <span className="menu-container"> Services</span>
                  </Link>
                </li>
                <li
                  className={location.pathname === "/booking" ? "active" : ""}
                >
                  <Link to="/booking">
                    <span className="menu-container"> Book now</span>
                  </Link>
                </li>
              </>
            )}
            <li className={location.pathname === "/terms" ? "active" : ""}>
              <Link to="/terms">
                <span className="menu-container"> Terms & Conditions</span>
              </Link>
            </li>
            <li className={location.pathname === "/faqs" ? "active" : ""}>
              <Link to="/faqs">
                <span className="menu-container"> FAQs</span>
              </Link>
            </li>

            {isLoggedIn && (
              <li>
                <div className="notification-container">
                  <button onClick={toggleDropdown} className="notify-button">
                    <FontAwesomeIcon icon={faBell} className="bell-icon" />
                    {hasUnreadNotifications && (
                      <span className="red-dot"></span>
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div className="notification-dropdown">
                      {notifications.length === 0 ? (
                        <p>No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification ${
                              notification.isRead ? "read" : "unread"
                            }`}
                          >
                            <div className="notification-info">
                              <h4>{notification.title}</h4>
                              <p>{notification.content}</p>
                              <small>
                                {new Date(
                                  notification.timestamp instanceof Date
                                    ? notification.timestamp
                                    : notification.timestamp.toDate()
                                ).toLocaleString()}
                              </small>

                              <div className="notification-buttons">
                                {/* Conditionally render the mark as read/unread button */}
                                {!notification.isRead ? (
                                  <button
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                    className="read-button"
                                  >
                                    Mark as Read
                                  </button>
                                ) : (
                                  <p> </p>
                                )}

                                <button
                                  onClick={() =>
                                    handleDeleteNotification(notification.id)
                                  }
                                  className="dismiss-button"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </li>
            )}
            {isLoggedIn && (
              <>
                <li
                  className={location.pathname === "/account" ? "active" : ""}
                >
                  <Link to="/account">
                    <FontAwesomeIcon icon={faUser} />
                    <span className="menu-container"> Account</span>
                  </Link>
                </li>
                {isLoggedIn && (
                  <li
                    className={
                      location.pathname === "/userdashboard" ? "active" : ""
                    }
                  >
                    <Link to="/userdashboard">
                      <span className="menu-container"> Dashboard</span>
                    </Link>
                  </li>
                )}
                <li>
                  <a onClick={handleLogout} className="no-transition">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="menu-container"> Logout</span>
                  </a>
                </li>
              </>
            )}
            {!isLoggedIn && (
              <>
                <li className={location.pathname === "/login" ? "active" : ""}>
                  <Link to="/login">
                    <span className="login-button-nav"> LOGIN</span>
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
