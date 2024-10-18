// Login.js
import "./styles.css"; // Import CSS file for styling
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  signInWithEmailAndPassword,
  getUserRoleFirestore,
  AuditLogger,
} from "./firebase";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordInputRef = useRef(null); // Create a ref for the password input field
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Check if email or password is empty
    if (!email) {
      Toast.fire({
        icon: "error",
        title: "Please enter your email",
      });
      return; // Exit early if fields are empty
    } else if (!password) {
      Toast.fire({
        icon: "error",
        title: "Please enter your password.",
      });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Display success notification
      Toast.fire({
        icon: "success",
        title: "Successfully Login",
      });
      const event = {
        type: "Login", // Type of event
        userId: user.uid, // User ID associated with the event
        details: "User logged in with Email and Password", // Details of the event
      };

      // Call the AuditLogger function with the event object
      AuditLogger({ event });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Username or Password is incorrect.",
      });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Check if the pressed key is Enter
      if (event.target.id === "floatingInput") {
        // If the Enter key is pressed on the email input field
        passwordInputRef.current.focus(); // Move focus to the password input field
      } else {
        handleLogin(); // Call handleLogin function when Enter key is pressed on password field
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch user role from Firestore
          const userRole = await getUserRoleFirestore(user.uid);
          if (userRole === "admin") {
            navigate("/dashboard"); // Redirect admin to the dashboard
          } else {
            navigate("/homepage"); // Redirect regular user to the homepage
          }
        } catch (error) {
          console.error("Error getting user role:", error.message);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Display success notification
      Toast.fire({
        icon: "success",
        title: "Successfully logged in with Google",
      });

      // Log the login event
      const event = {
        type: "Login",
        userId: user.uid,
        details: "User logged in with Google",
      };
      AuditLogger({ event });

      // Check user role and redirect
      const userRole = await getUserRoleFirestore(user.uid);
      if (userRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      Toast.fire({
        icon: "error",
        title: "An error occurred with Google Sign-In. Please try again later.",
      });
    }
  };
  return (
    <section className="login">
      <div className="box">
        <img src="JROA.jpg" height="200px" />
        <h2>LOGIN</h2>
        <div class="inputs">
          <input
            type="email"
            id="floatingInput"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress} // Call handleKeyPress function on key press
          />
        </div>
        <div class="inputs">
          <input
            type="password"
            id="floatingPassword"
            placeholder="Password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress} // Call handleKeyPress function on key press
            ref={passwordInputRef} // Set the ref to the password input field
          />
        </div>
        <br />
        <button class="login-button" onClick={handleLogin}>
          Login
        </button>
        <br></br>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <FaGoogle /> - Google Login
        </button>   
        <p className="links">
          Forgot Password? <Link to="/reset">Recover</Link>
        </p>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
