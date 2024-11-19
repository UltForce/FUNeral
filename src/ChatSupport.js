// ChatSupport.js
import React, { useState, useEffect, useContext } from "react";
import "./ChatSupport.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getUserRoleFirestore, getCurrentUserId } from "./firebase"; // Import your Firebase helper functions
import { RoleContext } from "./RoleProvider";

const ChatSupport = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin
  const { role } = useContext(RoleContext); // Access the current role

  useEffect(() => {
    console.log(`Chatbot updated for role: ${role}`);
  }, [role]); // React to role changes

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userRole = await getUserRoleFirestore(getCurrentUserId());
        setIsAdmin(userRole === "admin");
      } catch (error) {
        console.error("Error fetching user role:", error.message);
        setIsAdmin(false); // Default to non-admin if there's an error
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div>
      {/* <OverlayTrigger
        placement="left"
        overlay={<Tooltip>Chat with our AI</Tooltip>}
      >
        <button className="chat-icon" onClick={toggleChat}>
          <img
            src="https://img.icons8.com/ios-filled/50/ffffff/chat.png"
            alt="Chat Icon"
          />
        </button>
      </OverlayTrigger> 
      {isChatOpen && (
        <div className="chat-box">
          <iframe
            width="350"
            height="430"
            allow="microphone;"
            src="https://console.dialogflow.com/api-client/demo/embedded/1d3daf65-6838-45ac-b790-c823251bd7a6"
            title="AI Chat"
          ></iframe>
        </div>
      )}*/}

      <df-messenger
        key={role || "user"} // Ensure re-render when role changes
        chat-icon={
          role === "admin"
            ? "./JROA_LOGO.png" // Admin-specific chat icon (ensure the correct path)
            : "https://openmoji.org/data/color/svg/1F56F.svg" // Default SVG icon
        }
        intent="WELCOME"
        chat-title={
          role === "admin"
            ? "FUNeral Admin Assistant Chatbot"
            : "FUNeral User Support Chatbot"
        }
        agent-id={
          role === "admin"
            ? "8454f04a-0be0-4155-8ca7-ec3f41f8f154" // Admin Dialogflow Agent
            : "1d3daf65-6838-45ac-b790-c823251bd7a6" // User Dialogflow Agent
        }
        language-code="en"
      ></df-messenger>
    </div>
  );
};

export default ChatSupport;
