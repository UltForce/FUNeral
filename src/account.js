import React, { useState, useEffect } from "react";
import {
  auth,
  sendPasswordResetEmail,
  getUserData,
  AuditLogger,
} from "./firebase"; // Make sure to import the necessary Firebase authentication and Firestore functions
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "./firebase.js";
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

const Account = () => {
  const navigate = useNavigate(); // Initialize navigate function

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
  const [user, setUser] = useState(null); // State to store the current user's data
  const [userData, setUserData] = useState(null); // State to store user data from Firestore

  useEffect(() => {
    // Fetch the current user when the component mounts
    const currentUser = auth.currentUser;
    if (currentUser) {
      // If a user is logged in, set the user data
      setUser(currentUser);
      // Fetch user data from Firestore
      fetchUserData(currentUser.uid);
    } else {
      // If no user is logged in, set user to null
      setUser(null);
      setUserData(null); // Clear user data if no user is logged in
    }
  }, []);

  // Function to fetch user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      const userData = await getUserData(userId);
      setUserData(userData); // Set user data in state
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setUserData(null); // Clear user data in case of error
    }
  };

  const handleReset = async () => {
    Swal.fire({
      icon: "question",
      title: "Do you want to send a change password link to this email?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPasswordResetEmail(auth, user.email);
          // Example event object
          const event = {
            type: "Password", // Type of event
            userId: user.uid, // User ID associated with the event
            details: "Change Password link sent", // Details of the event
          };

          // Call the AuditLogger function with the event object
          AuditLogger({ event });
          Swal.fire({
            title: "success",
            text: "Password reset link sent successfully.",
            icon: "success",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Password reset link has been sent to email.",
              });
            }
          });
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: "Please login first.",
          });
          console.error("Error sending password reset email:", error.message);
        }
      }
    });
  };

  return (
    <section className="background-image section">
      <div className="centered page-transition">
        <h1 className="page-title">Account</h1>
        {user && userData && (
          <div className="centered">
            <p className="lead">
              Welcome, {userData.firstname} {userData.lastname}!
            </p>
            <table className="account-table">
              <tbody>
                <tr>
                  <th>Email:</th>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <th>Mobile Number:</th>
                  <td>{userData.mobilenumber}</td>
                </tr>
                <tr>
                  <th>Landline Number:</th>
                  <td>{userData.landlinenumber}</td>
                </tr>
                <tr>
                  <th>Region:</th>
                  <td>{userData.region}</td>
                </tr>
                <tr>
                  <th>City:</th>
                  <td>{userData.city}</td>
                </tr>
                <tr>
                  <th>Barangay:</th>
                  <td>{userData.barangay}</td>
                </tr>
                <tr>
                  <th>Street:</th>
                  <td>{userData.street}</td>
                </tr>
                <tr>
                  <th>Unit:</th>
                  <td>{userData.unit}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <br></br>
        <button class="btn btn-outline-primary" onClick={handleReset}>
          Send Change Password Email
        </button>
      </div>
    </section>
  );
};

export default Account;
