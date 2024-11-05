import React, { useEffect, useState, useRef } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  getUserData,
  getUserRoleFirestore,
  getCurrentUserId,
} from "./firebase";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "./dashboard.css";
import "./Audit.css";
import Loader from "./Loader"; // Import Loader

const Audit = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const dataTableRef = useRef(null);

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

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, "auditLogs"));
        const logs = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userData = await getUserData(data.userId);
            const timestamp = data.timestamp ? data.timestamp.toDate() : "";
            return {
              id: doc.id,
              firstname: userData ? userData.firstname : "Unknown",
              lastname: userData ? userData.lastname : "User",
              eventType: data.eventType,
              timestamp: timestamp,
              details: data.details,
            };
          })
        );

        setAuditLogs(logs);
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        setLoading(false); // Hide loader even if there's an error
      }
    };

    fetchAuditLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      return ""; 
    }
    const dateTime = new Date(timestamp);
    const year = dateTime.getFullYear();
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
    const day = ("0" + dateTime.getDate()).slice(-2);
    const hour = ("0" + dateTime.getHours()).slice(-2);
    const minutes = ("0" + dateTime.getMinutes()).slice(-2);
    const seconds = ("0" + dateTime.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (auditLogs.length > 0) {
      if ($.fn.DataTable.isDataTable("#auditTable")) {
        dataTableRef.current.clear().rows.add(auditLogs).draw();
      } else {
        initializeDataTable();
      }
    }
  }, [auditLogs]);

  const initializeDataTable = () => {
    const dataTable = $("#auditTable").DataTable({
      lengthMenu: [10, 25, 50, 75, 100],
      pagingType: "full_numbers",
      order: [],
      columnDefs: [{ targets: 2, type: "date" }],
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
    dataTableRef.current = dataTable;
  };

  useEffect(() => {
    return () => {
      if ($.fn.DataTable.isDataTable("#auditTable")) {
        dataTableRef.current.destroy();
      }
    };
  }, []);

  return (
    <section className="audit">
      <main className="main-content">
        {loading && <Loader />} {/* Display loader while loading */}
        <div className="audit-dashboard-box">
          <h1 className="centered">Audit Logs</h1>
        </div>
        <div className="customerReport">
          {auditLogs && auditLogs.length > 0 ? (
            <table id="auditTable" className="display">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Name</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.eventType}</td>
                    <td>{`${log.firstname} ${log.lastname}`}</td>
                    <td>{formatTimestamp(log.timestamp)}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No audits</p>
          )}
        </div>
      </main>
    </section>
  );
};

export default Audit;
