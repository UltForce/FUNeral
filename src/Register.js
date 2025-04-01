// Register.js

import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  dba,
  doc,
  setDoc,
  AuditLogger,
  getUserRoleFirestore,
} from "./firebase";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import {
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  OAuthProvider,
  getAuth,
} from "firebase/auth";
import { FaGoogle, FaYahoo } from "react-icons/fa"; // Import FontAwesome icons
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./Register.css";

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

const Register = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mobilenumber, setMobilenumber] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const LastNameInputRef = useRef(null);
  const MobileNumberInputRef = useRef(null);
  const RegionInputRef = useRef(null);
  const CityInputRef = useRef(null);
  const BarangayInputRef = useRef(null);
  const StreetInputRef = useRef(null);
  const UnitInputRef = useRef(null);
  const PasswordInputRef = useRef(null);
  const ConfirmPasswordInputRef = useRef(null);
  const navigate = useNavigate();
  const [termsChecked, setTermsChecked] = useState(false); // State htmlFor tracking if terms are checked

  const handleGoogleSignIn = async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    // Trim the first name and last name
    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();

    if (!confirmPassword || !password || !firstname || !lastname) {
      Toast.fire({
        icon: "error",
        title: "Please fill in all the fields.",
      });
      return; // Exit early if fields are empty
    }

    // Validate first name and last name
    if (trimmedFirstname.length === 0) {
      Toast.fire({
        icon: "error",
        title: "First Name cannot be empty or just spaces.",
      });
      return;
    }

    if (trimmedLastname.length === 0) {
      Toast.fire({
        icon: "error",
        title: "Last Name cannot be empty or just spaces.",
      });
      return;
    }

    if (!passwordRegex.test(password)) {
      Toast.fire({
        icon: "error",
        title:
          "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
      return; // Exit early if password does not meet the criteria
    }

    if (password !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title: "Passwords do not match.",
      });
      return;
    }

    Swal.fire({
      icon: "question",
      title: "Do you want to register this account?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          // Retrieve email from Google signup
          const googleEmail = user.email;

          // Compare Google email with user-entered email

          // Proceed with registration
          const userDocRef = doc(dba, "users", user.uid);
          await setDoc(userDocRef, {
            userId: user.uid,
            role: "user",
            firstname,
            lastname,

            email: googleEmail,
          });
          //await createUserWithEmailAndPassword(auth, googleEmail, password);
          // Link Google account to the newly created email/password account
          await linkWithCredential(
            user,
            EmailAuthProvider.credential(googleEmail, password)
          );
          const event = {
            type: "Register",
            userId: user.uid,
            details: "User registered",
          };
          await sendEmailVerification(user);
          AuditLogger({ event });
          if (!user.emailVerified) {
            Swal.fire({
              icon: "warning",
              title: "Email Verification Required",
              text: "Please verify your email before logging in.",
              confirmButtonText: "OK",
            }).then(async () => {
              await auth.signOut();
              navigate("/login");
            });
          
            return; // Prevent login
          }
          navigate("/homepage");

          Swal.fire({
            title: "success",
            text: "Account registered successfully",
            icon: "success",
            heightAuto: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Account registered successfully",
              });
            }
          });
        } catch (error) {
          //console.log("Firebase error:", error.code);
          if (error.code === "auth/email-already-in-use") {
            Toast.fire({
              icon: "error",
              title: "Email is already registered.",
            });
          } else if (error.code === "auth/provider-already-linked") {
            Toast.fire({
              icon: "error",
              title: "Email is already registered.",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: "An error occurred. Please try again later.",
            });
          }

          return false;
        }
      }
    });
  };

  const handleYahooSignIn = async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();

    if (!confirmPassword || !password || !firstname || !lastname) {
      Toast.fire({
        icon: "error",
        title: "Please fill in all the fields.",
      });
      return;
    }

    if (trimmedFirstname.length === 0 || trimmedLastname.length === 0) {
      Toast.fire({
        icon: "error",
        title: "First Name and Last Name cannot be empty or just spaces.",
      });
      return;
    }

    if (!passwordRegex.test(password)) {
      Toast.fire({
        icon: "error",
        title:
          "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title: "Passwords do not match.",
      });
      return;
    }

    Swal.fire({
      icon: "question",
      title: "Do you want to register this account?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const provider = new OAuthProvider("yahoo.com");
          provider.addScope("openid");
          provider.addScope("profile");
          provider.addScope("email");

          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          console.log("Sign-in successful", user);

          const yahooEmail = user.email;

          const userDocRef = doc(dba, "users", user.uid);
          await setDoc(userDocRef, {
            userId: user.uid,
            role: "user",
            firstname,
            lastname,
            email: yahooEmail,
          });

          await linkWithCredential(
            user,
            EmailAuthProvider.credential(yahooEmail, password)
          );

          const event = {
            type: "Register",
            userId: user.uid,
            details: "User registered with Yahoo",
          };
          await sendEmailVerification(user);
          AuditLogger({ event });
          if (!user.emailVerified) {
            Swal.fire({
              icon: "warning",
              title: "Email Verification Required",
              text: "Please verify your email before logging in.",
              confirmButtonText: "OK",
            }).then(async () => {
              await auth.signOut();
              navigate("/login");
            });
          
            return; // Prevent login
          }
          navigate("/homepage");

          Swal.fire({
            title: "Success",
            text: "Account registered successfully",
            icon: "success",
            confirmButtonText: "Confirm",
          }).then((result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Account registered successfully",
              });
            }
          });
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            Toast.fire({
              icon: "error",
              title: "Email is already registered.",
            });
          } else if (error.code === "auth/provider-already-linked") {
            Toast.fire({
              icon: "error",
              title: "Email is already registered.",
            });
          } else {
            Toast.fire({
              icon: "error",
              title: "An error occurred. Please try again later.",
            });
          }
        }
      }
    });
  };

  // Handle terms checkbox change
  const handleTermsChange = (e) => {
    setTermsChecked(e.target.checked); // Set terms checked
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Check if the pressed key is Enter
      if (event.target.id === "floatingFirst") {
        LastNameInputRef.current.focus();
      } else {
        handleGoogleSignIn();
      }
    }
  };

  return (
    <section className="register">
      <div className="register-box">
        <h2 className="register-title">Register</h2>
        <p className="register-info">
          Fill Out The Form Carefully For Registration
        </p>
        <br />
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <div className="row">
              <div className="form-floating mb-3 col-md-6">
                <input
                  type="text"
                  className="form-control"
                  id="floatingFirst"
                  placeholder="First Name"
                  value={firstname}
                  onKeyPress={handleKeyPress}
                  onChange={(e) => {
                    const firstnamevalue = e.target.value;
                    if (firstnamevalue.length <= 128) {
                      // Check if the value is positive or zero
                      setFirstname(firstnamevalue);
                    }
                  }}
                />
                <label className="register-label" htmlFor="floatingFirst">
                  First Name
                </label>
              </div>
              <div className="  form-floating mb-3  col-md-6">
                <input
                  type="text"
                  className="form-control"
                  id="floatingLast"
                  placeholder="Last Name"
                  value={lastname}
                  onKeyPress={handleKeyPress}
                  ref={LastNameInputRef}
                  onChange={(e) => {
                    const lastnamevalue = e.target.value;
                    if (lastnamevalue.length <= 128) {
                      // Check if the value is positive or zero
                      setLastname(lastnamevalue);
                    }
                  }}
                />
                <label className="register-label" htmlFor="floatingLast">
                  Last Name
                </label>
              </div>

              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip>
                    Must be 8 characters long, have an uppercase, lowercase,
                    special, and numeric character
                  </Tooltip>
                }
              >
                <div className=" form-floating mb-3  col-md-6">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPass"
                    placeholder="Password"
                    value={password}
                    onKeyPress={handleKeyPress}
                    ref={PasswordInputRef}
                    onChange={(e) => {
                      const passwordvalue = e.target.value;
                      if (passwordvalue.length <= 128) {
                        // Check if the value is positive or zero
                        setPassword(passwordvalue);
                      }
                    }}
                  />
                  <label className="register-label" htmlFor="floatingPass">
                    Password
                  </label>
                </div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Must match password</Tooltip>}
              >
                <div className="form-floating mb-3  col-md-6">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingConfirmPass"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onKeyPress={handleKeyPress}
                    ref={ConfirmPasswordInputRef}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label
                    className="register-label"
                    htmlFor="floatingConfirmPass"
                  >
                    Confirm Password
                  </label>
                </div>
              </OverlayTrigger>
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>

        <div className="agree-terms">
          <input
            className="checkbox"
            type="checkbox"
            checked={termsChecked}
            onChange={handleTermsChange}
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>See Terms and Conditions page</Tooltip>}
            >
              <a href="/terms">Terms and Conditions</a>
            </OverlayTrigger>
          </label>
        </div>
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip>Verify with Google</Tooltip>}
        >
          <button
            className="register-button"
            type="submit"
            onClick={handleGoogleSignIn}
            disabled={!termsChecked}
          >
            <FaGoogle /> - Register
          </button>
        </OverlayTrigger>
        <br />
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip>Verify with Yahoo</Tooltip>}
        >
          <button
            className="register-button"
            type="submit"
            disabled={!termsChecked}
            onClick={handleYahooSignIn}
          >
            <FaYahoo /> - Register
          </button>
        </OverlayTrigger>
        <br />
        <p className="login-account">
          Already have an account?{" "}
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip>See Login page</Tooltip>}
          >
            <Link to="/login">Login here</Link>
          </OverlayTrigger>
        </p>
      </div>
      <div className="col-md-1"></div>
    </section>
  );
};

export default Register;
