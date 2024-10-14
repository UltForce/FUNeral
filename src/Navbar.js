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
  markNotificationAsUnread,
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
  faBriefcase,
  faBox,
  faFileAlt,
  faStar,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import "./navbar.css";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useContext } from "react";
import { LogoutContext } from "./LogoutContext"; // Update the path as necessary

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

const Navbar = ({}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setLogoutInProgress } = useContext(LogoutContext); // Use the context
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
    console.log("User ID:", userId); // Check if userId is valid
    if (!userId) return; // Exit if userId is not valid

    const userRole = await getUserRoleFirestore(userId);
    console.log("User Role:", userRole); // Check if userRole is valid

    if (userRole === "admin") {
      const notificationsData = await fetchAdminNotifications();
      console.log("Admin Notifications:", notificationsData); // Check notifications data
      // Check if there are unread notifications
      const unreadExists = notificationsData.some(
        (notification) => !notification.isRead
      );
      setHasUnreadNotifications(unreadExists); // Show red dot if there are unread notifications
      setNotifications(notificationsData);
    } else {
      const notificationsData = await fetchUserNotifications();
      console.log("User Notifications:", notificationsData); // Check notifications data
      // Check if there are unread notifications
      const unreadExists = notificationsData.some(
        (notification) => !notification.isRead
      );
      setHasUnreadNotifications(unreadExists); // Show red dot if there are unread notifications
      setNotifications(notificationsData);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    fetchNotifications(); // Refresh notifications after marking as read
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchNotifications(); // Refresh notifications after deletion
  };

  const handleMarkAsUnread = async (notificationId) => {
    await markNotificationAsRead(notificationId); // Mark as unread
    fetchNotifications(); // Refresh notifications after marking as unread
  };

  const handleLogout = async () => {
    setLogoutInProgress(true); // Set the logout in progress
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
                  <li>
                    <div className="notification-container">
                      <button onClick={toggleDropdown}>
                        <FontAwesomeIcon icon={faBell} />
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
                                <h4>{notification.title}</h4>
                                <p>{notification.content}</p>
                                <small>
                                  {new Date(
                                    notification.timestamp instanceof Date
                                      ? notification.timestamp
                                      : notification.timestamp.toDate()
                                  ).toLocaleString()}
                                </small>
                                <br />

                                {/* Conditionally render the mark as read/unread button */}
                                {!notification.isRead ? (
                                  <button
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                  >
                                    Mark as Read
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleMarkAsUnread(notification.id)
                                    }
                                  >
                                    Mark as Unread
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    handleDeleteNotification(notification.id)
                                  }
                                >
                                  Dismiss
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
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
                    <Link onClick={handleLogout} className="no-transition">
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
                <div className="notification-container">
                  <button onClick={toggleDropdown}>
                    <FontAwesomeIcon icon={faBell} />
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
                            <h4>{notification.title}</h4>
                            <p>{notification.content}</p>
                            <small>
                              {new Date(
                                notification.timestamp instanceof Date
                                  ? notification.timestamp
                                  : notification.timestamp.toDate()
                              ).toLocaleString()}
                            </small>
                            <br />

                            {/* Conditionally render the mark as read/unread button */}
                            {!notification.isRead ? (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                Mark as Read
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleMarkAsUnread(notification.id)
                                }
                              >
                                Mark as Unread
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                            >
                              Dismiss
                            </button>
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
                    <span className="nav-label"> Account</span>
                  </Link>
                </li>
                <li>
                  <Link onClick={handleLogout} className="no-transition">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="nav-label"> Logout</span>
                  </Link>
                </li>
              </>
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
