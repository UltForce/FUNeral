import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "typeface-rubik";
import { RoleProvider } from "./RoleProvider";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RoleProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </RoleProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
