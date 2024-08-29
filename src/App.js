import logo from "./logo.svg";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Homepage from "./homepage";
import Navbar from "./Navbar";
import Notifications from "./Notifications";
import Services from "./services";
import Booking from "./Booking";
import FAQs from "./FAQs";
import Terms from "./Terms";
import Account from "./account";
import Reset from "./reset";
import Footer from "./Footer";
import About from "./About";
import Gallery from "./Gallery";
import Audit from "./Audit";
import ChatSupport from "./ChatSupport";
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css"; // Import your CSS file for animations

const Layout = ({ children }) => {
  return (
    <>
      {children}
      <ChatSupport /> {/* Chat support available on every page */}
    </>
  );
};

const App = () => {
  const location = useLocation(); // Use location to manage route transitions

  return (
    <SwitchTransition>
      <CSSTransition
        key={location.key}
        classNames="page"
        timeout={300} // Duration of the animation
      >
        <div className="page">
          <Routes location={location}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/account" element={<Account />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="*" element={<Homepage />} />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

function AppWithRouter() {
  return (
    <Router>
      <Layout>
        <Navbar />
        <App />
        <Footer />
        <ToastContainer />
      </Layout>
    </Router>
  );
}

export default AppWithRouter;
