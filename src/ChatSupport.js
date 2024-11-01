// ChatSupport.js
import React, { useState } from "react";
import "./ChatSupport.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
const ChatSupport = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="chat-support">
      <OverlayTrigger
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
      )}
    </div>
  );
};

export default ChatSupport;
