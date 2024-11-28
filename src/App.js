import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Homepage from "./homepage";
import Navbar from "./Navbar";
import Services from "./services";
import Booking from "./Booking";
import FAQs from "./FAQs";
import Terms from "./Terms";
import Account from "./account";
import Reset from "./reset";
import Footer from "./Footer";
import About from "./About";
import PlanningGuide from "./PlanningGuide";
import Gallery from "./Gallery";
import Audit from "./Audit";
import Appointments from "./Appointment";
import ChatSupport from "./ChatSupport";
import Inventory from "./Inventory";
import Content from "./content";
import Reviews from "./reviews";
import UserDashboard from "./UserDashboard";
import Transaction from "./Transaction";
import Archive from "./Archive";
import Reports from "./Reports";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";
import "./App.css"; // Import your CSS file for animations

const Layout = ({ showFooter, children }) => (
  <>
    <Navbar />
    {children}
    <ChatSupport />
    {showFooter && <Footer />}
    <ToastContainer />
  </>
);

const App = () => {
  const location = useLocation();

  // Define paths where the footer should NOT appear
  const pathsWithoutFooter = [
    "/dashboard",
    "/appointments",
    "/content",
    "/reviews",
    "/transaction",
    "/archive",
    "/reports",
    "/audit",
    "/inventory",
  ];

  // Determine whether the footer should be displayed
  const showFooter = !pathsWithoutFooter.includes(location.pathname);

  const nodeRef = useRef(null);

  return (
    <Layout showFooter={showFooter}>
      <SwitchTransition>
        <CSSTransition
          key={location.key}
          classNames="page"
          timeout={300} // No transition during logout
          nodeRef={nodeRef}
        >
          <div className="page" ref={nodeRef}>
            <Routes location={location}>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/about" element={<About />} />
              <Route path="/planningguide" element={<PlanningGuide />} />
              <Route path="/gallery" element={<Gallery />} />

              <Route path="/services" element={<Services />} />
              <Route
                path="/booking"
                element={<Booking element={<Booking />} />}
              />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/account" element={<Account />} />
              <Route path="/reset" element={<Reset />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/content" element={<Content />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/userdashboard" element={<UserDashboard />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Homepage />} />
            </Routes>
          </div>
        </CSSTransition>
      </SwitchTransition>
    </Layout>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
