import React, { useState, useEffect } from "react";
import {
  getReportsFromFirestore,
  getUserData,
  getDocs,
  getFirestore,
  deleteReport,
} from "./firebase.js";
import {
  getCurrentUserId,
  getUserRoleFirestore,
  collection,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Reports.css";
import Loader from "./Loader.js";
import { saveAs } from "file-saver"; // Import FileSaver
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

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdminAndLoginStatus = async () => {
      try {
        const userRole = await getUserRoleFirestore(getCurrentUserId());
        if (userRole !== "admin") {
          navigate("/login");
        }
        fetchReports(); // Fetch reports only if user is admin
      } catch (error) {
        console.error("Error checking user role:", error.message);
        navigate("/login");
      }
    };

    checkAdminAndLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, "Reports"));

        const reportsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userData = await getUserData(data.generatedBy);
            const timestamp = data.generatedAt ? data.generatedAt.toDate() : "";
            return {
              id: doc.id,
              reportType: data.reportType,
              generatedAt: timestamp,
              firstname: userData ? userData.firstname : "Unknown",
              lastname: userData ? userData.lastname : "User",
              pdfUrl: data.pdfUrl,
            };
          })
        );

        setReports(reportsData);
        setLoading(false); // Hide loader after data is fetched
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false); // Hide loader even if there's an error
      }
    };

    fetchReports();
  }, []); // Empty dependency array to run only once on component mount

  useEffect(() => {
    if (reports.length > 0) {
      if (!$.fn.DataTable.isDataTable("#reportTable")) {
        $("#reportTable").DataTable({
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
  }, [reports]);

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    if (!dateTimeString) {
      return "N/A";
    }
    const year = dateTime.getFullYear();
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
    const day = ("0" + dateTime.getDate()).slice(-2);
    const dayOfWeek = dateTime.toLocaleDateString("en-US", { weekday: "long" });
    const hour = ("0" + dateTime.getHours()).slice(-2);
    const minutes = ("0" + dateTime.getMinutes()).slice(-2);
    return `${year}-${month}-${day} ${dayOfWeek} ${hour}:${minutes}`;
  };

  // Fetch reports data from Firestore
  const fetchReports = async () => {
    setLoading(true);
    try {
      const reportsData = await getReportsFromFirestore(); // Fetch reports from Firestore
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pdfUrl) => {
    try {
      // Fetch the PDF file
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      // Use FileSaver to trigger the download
      saveAs(blob, pdfUrl.split("/").pop()); // Filename is extracted from URL
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleDelete = async (reportId, e) => {
    e.preventDefault(); // Prevent the default behavior of the button
    try {
      // Show confirmation before deleting
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this report?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setLoading(true); // Hide loader after data is fetched
        // Call deleteReport function to remove the report from Firestore
        await deleteReport(reportId);

        // Show success notification

        Swal.fire({
          title: "success",
          text: "Report deleted successfully",
          icon: "success",
          heightAuto: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Report deleted successfully",
            });
          }
        });
        // Destroy DataTable before updating the state
        if ($.fn.DataTable.isDataTable("#reportTable")) {
          $("#reportTable").DataTable().destroy();
        }
        // Remove the report from the local state to update the UI
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== reportId)
        );
      }
      setLoading(false); // Hide loader after data is fetched
    } catch (error) {
      setLoading(false); // Hide loader after data is fetched
      console.error("Error deleting report:", error.message);
      Toast.fire({
        icon: "error",
        title: "Failed to delete the report",
      });
    }
  };

  return (
    <section className="dashboard-appointment">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="report-dashboard-box">
          <h1 className="centered">Reports</h1>
        </div>
        <div className="customerReport">
          {reports && reports.length > 0 ? (
            <table className="display w3-table" id="reportTable">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Generated by</th>
                  <th>Generated at</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.reportId}>
                    <td>{report.reportType}</td>
                    <td>{`${report.firstname} ${report.lastname}`}</td>
                    <td>{formatDateTime(report.generatedAt)}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>View Report</Tooltip>}
                      >
                        <a
                          href={report.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View PDF"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </a>
                      </OverlayTrigger>
                      &nbsp;
                      <button
                        onClick={() => handleDownload(report.pdfUrl)}
                        title="Download PDF"
                        className="download-pdf-button"

                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Report</Tooltip>}
                      >
                        <button onClick={(e) => handleDelete(report.id, e)} className="delete-report-button">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No reports</p>
          )}
        </div>
        <br />
      </main>
    </section>
  );
};

export default Reports;
