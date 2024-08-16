import React, { useState, useEffect } from "react";
import { generateReports } from "./firebase.js";
import {
  getAppointments,
  getCurrentUserId,
  AuditLogger,
  getUserRoleFirestore,
} from "./firebase.js";
import "./dashboard.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";

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

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdminAndLoginStatus = async () => {
      try {
        const userRole = await getUserRoleFirestore(getCurrentUserId());
        if (userRole !== "admin") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking user role:", error.message);
        navigate("/login");
      }
    };

    checkAdminAndLoginStatus();
  }, [navigate]);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments = await getAppointments();
        setAppointments(appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      if (!$.fn.DataTable.isDataTable("#appointmentsTable")) {
        $("#appointmentsTable").DataTable({
          lengthMenu: [10, 25, 50, 75, 100],
          pagingType: "full_numbers",
          order: [],
          columnDefs: [
            { targets: "no-sort", orderable: false },
            { targets: 1, type: "date-euro" }, // Specify the type of date sorting
          ],
          drawCallback: function () {
            $(this.api().table().container())
              .find("td")
              .css("border", "1px solid #ddd");
          },
          rowCallback: function (row, data, index) {
            $(row).hover(
              function () {
                $(this).addClass("hover");
              },
              function () {
                $(this).removeClass("hover");
              }
            );
          },
          stripeClasses: ["stripe1", "stripe2"],
        });
      }
    }
  }, [appointments]);

  const handleGenerateReports = async () => {
    try {
      await generateReports();
      Toast.fire({
        icon: "success",
        title: "Reports successfully generated..",
      });
      const userId = getCurrentUserId();
      const event = {
        type: "Report",
        userId: userId,
        details: "User generated a report",
      };
      AuditLogger({ event });
    } catch (error) {
      console.error("Error generating reports:", error.message);
      alert("An error occurred while generating reports.");
    }
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    // Check if dateTimeString is not applicable
    if (!dateTimeString) {
      return "N/A";
    }
    // Extract date, day of the week, and hour
    const year = dateTime.getFullYear();
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Adding leading zero for single digit months
    const day = ("0" + dateTime.getDate()).slice(-2); // Adding leading zero for single digit days
    const dayOfWeek = dateTime.toLocaleDateString("en-US", { weekday: "long" });
    const hour = ("0" + dateTime.getHours()).slice(-2); // Adding leading zero for single digit hours
    const minutes = ("0" + dateTime.getMinutes()).slice(-2); // Adding leading zero for single digit hours
    // Format date string with spaces and without minutes and seconds
    return `${year}-${month}-${day} ${dayOfWeek} ${hour}:${minutes}`;
  };

  const vaccinationformatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    // Check if dateTimeString is not applicable
    if (!dateTimeString) {
      return "N/A";
    }
    // Extract date, day of the week, and hour
    const year = dateTime.getFullYear();
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Adding leading zero for single digit months
    const day = ("0" + dateTime.getDate()).slice(-2); // Adding leading zero for single digit days
    const dayOfWeek = dateTime.toLocaleDateString("en-US", { weekday: "long" });

    // Format date string with spaces and without minutes and seconds
    return `${year}-${month}-${day} ${dayOfWeek}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning">{status}</span>;
      case "approved":
        return <span className="badge bg-info">{status}</span>;
      case "completed":
        return <span className="badge bg-success">{status}</span>;
      case "canceled":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <section className="background-image">
      <h1 className="centered">Dashboard</h1>

      <div className="customerReport">
        <div className="report-header">
          <h3>
            Appointment List
            <button
              className="btn btn-outline-primary ml-5"
              onClick={handleGenerateReports}
            >
              Generate Reports
            </button>
          </h3>
          <table className="w3-table col-md-4">
            <thead>
              <tr>
                <th>Pending</th>
                <th>Approved</th>
                <th>Completed</th>
                <th>Cancelled</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    appointments.filter(
                      (appointment) => appointment.status === "pending"
                    ).length
                  }
                </td>
                <td>
                  {
                    appointments.filter(
                      (appointment) => appointment.status === "approved"
                    ).length
                  }
                </td>
                <td>
                  {
                    appointments.filter(
                      (appointment) => appointment.status === "completed"
                    ).length
                  }
                </td>
                <td>
                  {
                    appointments.filter(
                      (appointment) => appointment.status === "cancelled"
                    ).length
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {appointments && appointments.length > 0 ? (
          <table id="appointmentsTable" className="display">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.appointmentId}>
                  <td>{appointment.name}</td>
                  <td>{formatDateTime(appointment.date)}</td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.serviceType}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No appointments</p>
        )}
      </div>
      <br />
    </section>
  );
};

export default Dashboard;
