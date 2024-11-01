import React, { useState, useEffect } from "react";
import {
  auth,
  sendPasswordResetEmail,
  getUserData,
  AuditLogger,
} from "./firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, dba } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { FaEdit } from "react-icons/fa"; // Icon library for edit icon
import { OverlayTrigger, Tooltip } from "react-bootstrap";
const placeholderProfilePicture = "https://via.placeholder.com/150"; // Placeholder profile picture URL

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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureURL, setProfilePictureURL] = useState("");
  const [editableData, setEditableData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState({}); // Store original data for canceling

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

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
    } else {
      setUser(null);
      setUserData(null);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const data = await getUserData(userId);
      setUserData(data);
      setProfilePictureURL(data.profilePictureURL || placeholderProfilePicture);
      const initialEditableData = {
        mobilenumber: data.mobilenumber || "",
        landlinenumber: data.landlinenumber || "",
        region: data.region || "",
        city: data.city || "",
        barangay: data.barangay || "",
        street: data.street || "",
        unit: data.unit || "",
      };
      setEditableData(initialEditableData);
      setOriginalData(initialEditableData); // Store the original data right after setting it
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setUserData(null);
    }
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      handleProfilePictureUpload(e.target.files[0]); // Automatically trigger upload
    }
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profilePictures/${user.uid}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userDocRef = doc(dba, "users", user.uid);
      await updateDoc(userDocRef, { profilePictureURL: downloadURL });

      setProfilePictureURL(downloadURL); // Update the profile picture URL in the component's state
      Swal.fire(
        "Upload Successful",
        "Profile picture uploaded successfully.",
        "success"
      );
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      Swal.fire(
        "Upload Failed",
        "There was an error uploading your profile picture.",
        "error"
      );
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
          const event = {
            type: "Password",
            userId: user.uid,
            details: "Change Password link sent",
          };
          AuditLogger({ event });
          Swal.fire(
            "Success",
            "Password reset link sent successfully.",
            "success"
          );
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    // Confirm save changes
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save these changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const userDocRef = doc(dba, "users", user.uid);
        await updateDoc(userDocRef, editableData);
        Swal.fire("Updated!", "Your information has been updated.", "success");
        fetchUserData(user.uid); // Refresh the user data after saving
        setEditMode(false); // Exit edit mode after saving
      } catch (error) {
        console.error("Error saving user information:", error.message);
        Swal.fire(
          "Update Failed",
          "There was an error updating your information.",
          "error"
        );
      }
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Confirm canceling unsaved changes
      Swal.fire({
        title: "Discard Changes?",
        text: "Are you sure you want to discard your changes?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, discard",
        cancelButtonText: "No, keep editing",
      }).then((result) => {
        if (result.isConfirmed) {
          setEditableData(originalData); // Revert to original data
          setEditMode(false); // Exit edit mode
        }
      });
    } else {
      setOriginalData({ ...editableData }); // Store original data before editing
      setEditMode(true); // Enter edit mode
    }
  };

  return (
    <section className="background-image section content-user">
      <div className="centered page-transition">
        <h1 className="page-title">Account</h1>
        {user && userData && (
          <div className="centered">
            <p className="lead">
              Welcome, {userData.firstname} {userData.lastname}!
            </p>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={profilePictureURL || placeholderProfilePicture}
                alt="Profile"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
                id="profilePictureInput"
              />

              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>Upload your Profile Picture</Tooltip>}
              >
                <label
                  htmlFor="profilePictureInput"
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    cursor: "pointer",
                  }}
                >
                  <FaEdit size={20} color="gray" />
                </label>
              </OverlayTrigger>
            </div>
            <br />
            <table className="account-table">
              <tbody>
                <tr>
                  <th>Email:</th>
                  <td>{user.email}</td>
                </tr>
                {[
                  "mobilenumber",
                  "landlinenumber",
                  "region",
                  "city",
                  "barangay",
                  "street",
                  "unit",
                ].map((field) => (
                  <tr key={field}>
                    <th>{field.replace(/([A-Z])/g, " $1")}</th>
                    <td>
                      <input
                        type="text"
                        name={field}
                        value={editableData[field] || ""}
                        onChange={handleEditChange}
                        style={{ width: "100%" }}
                        readOnly={!editMode} // Set to readonly based on edit mode
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-outline-secondary mt-3 ms-2"
              onClick={toggleEditMode}
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
            {editMode && (
              <button
                className="btn btn-primary mt-3"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            )}
            <button className="btn btn-danger mt-3 ms-2" onClick={handleReset}>
              Change Password
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Account;
