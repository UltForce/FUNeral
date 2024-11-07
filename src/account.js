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
import "./account.css";
import Loader from "./Loader";
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
  const [loading, setLoading] = useState(true); // Add loading state
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
      setLoading(false); // Hide loader after data is fetched
    } catch (error) {
      setLoading(false); // Hide loader after data is fetched
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
      setLoading(true); // Hide loader after data is fetched
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
      ).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: "Profile Picture updated successfully",
          });
        }
      });
      setLoading(false); // Hide loader after data is fetched
    } catch (error) {
      setLoading(false); // Hide loader after data is fetched
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
        setLoading(true); // Hide loader after data is fetched
        const userDocRef = doc(dba, "users", user.uid);
        await updateDoc(userDocRef, editableData);
        Swal.fire(
          "Updated!",
          "Your information has been updated.",
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Account updated successfully",
            });
          }
        });
        fetchUserData(user.uid); // Refresh the user data after saving
        setEditMode(false); // Exit edit mode after saving
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        setLoading(false); // Hide loader after data is fetched
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
    <section className="account">
      {loading && <Loader />} {/* Display loader while loading */}
      <div className="account-contents">
        <h1 className="account-profile-title">USER PROFILE</h1>
        <div className="account-details-box">
          {user && userData && (
            <div className="account-details">
              <div className="first-account-details">
                <p className="account-username">
                  Welcome, <br />
                  <strong>
                    {userData.firstname} {userData.lastname}
                  </strong>
                  !
                </p>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={profilePictureURL || placeholderProfilePicture}
                    alt="Profile"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                    }}
                    className="user-profile-pic"
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
              </div>
              <br />
              {/* Ensure the second-account-details div is also wrapped within the first-account-details */}
              <div className="second-account-details">
                <table className="account-table">
                  <tbody className="account-table-details">
                    <tr>
                      <th className="account-table-label">Email:</th>
                      <td className="user-account-email">{user.email}</td>
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
                        <th className="account-table-label">
                          {field.replace(/([A-Z])/g, " $1")}
                        </th>
                        <td>
                          <input
                            type="text"
                            name={field}
                            value={editableData[field] || ""}
                            className="account-table-info"
                            onChange={handleEditChange}
                            style={{ width: "100%" }}
                            readOnly={!editMode} // Set to readonly based on edit mode
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="account-buttons">
                  <button
                    className="cancel-edit-button"
                    onClick={toggleEditMode}
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                  {editMode && (
                    <button
                      className="save-changes-button"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                  )}
                  <button className="change-pass-button" onClick={handleReset}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Account;
