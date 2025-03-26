import emailjs from "emailjs-com"; // Import EmailJS
import React, { useState, useEffect } from "react";
import {
  getCurrentUserId,
  getUserRoleFirestore,
  getUserEmailById,
  fetchArchivedData,
  toggleArchiveStatus,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faArchive, faFile } from "@fortawesome/free-solid-svg-icons";
import "./Archive.css";
import Loader from "./Loader.js";
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

const Archive = () => {
  const [archivedData, setArchivedData] = useState({
    appointments: [],
    transactions: [],
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchArchivedData();
      console.log("Archived data:", data); // Log to check the structure

      setArchivedData(data);
      setLoading(false); // Set loading state to true
    };

    fetchData();
  }, []);

  const handleShowDetails = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedItem(null);
    setSelectedType("");
  };

  const handleToggleArchive = async (item, type) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: `Do you want to ${
        item.isArchived ? "unarchive" : "archive"
      } this item?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      setLoading(true); // Set loading state to true
      await toggleArchiveStatus(
        item.id,
        type === "appointment" ? "appointments" : "transactions",
        !item.isArchived
      );
      Swal.fire({
        title: "success",
        text: "Archive status updated",
        icon: "success",
        heightAuto: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Confirm",
      }).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: "Archive status updated",
          });
        }
      });
      // Destroy DataTable before updating the state
      if ($.fn.DataTable.isDataTable("#appointmentsTable")) {
        $("#appointmentsTable").DataTable().destroy();
      }

      setArchivedData(await fetchArchivedData()); // Refresh data
      setLoading(false); // Set loading state to true
    }
  };

  useEffect(() => {
    if (
      archivedData.appointments.length > 0 ||
      archivedData.transactions.length > 0
    ) {
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
  }, [archivedData]);

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

  const getStatusBadge = (status) => {
    if (status === "pending" || status === "processing") {
      return <span className="badge bg-warning">{status}</span>;
    } else if (status === "approved" || status === "burial") {
      return <span className="badge bg-info">{status}</span>;
    } else if (status === "completed") {
      return <span className="badge bg-success">{status}</span>;
    } else if (status === "canceled") {
      return <span className="badge bg-danger">{status}</span>;
    } else {
      return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <section className="archive">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="archive-dashboard-box">
          <h1 className="centered">Archived Items</h1>
        </div>
        <div className="customerReport">
          <div className="reports"></div>
          {archivedData.appointments.length > 0 ||
          archivedData.transactions.length > 0 ? (
            <table className="display" id="appointmentsTable">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Deceased Name</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {archivedData.appointments.map((item) => (
                  <tr key={item.id}>
                    <td>Appointment</td>
                    <td>{item.name}</td>
                    <td>{item.DeceasedName}</td>
                    <td>{formatDateTime(item.date)}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>View Details</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() => handleShowDetails(item, "appointment")}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Toggle Archive</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() =>
                            handleToggleArchive(item, "appointment")
                          }
                        >
                          <FontAwesomeIcon icon={faArchive} />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
                {archivedData.transactions.map((item) => (
                  <tr key={item.id}>
                    <td>Transaction</td>
                    <td>{item.orderedBy}</td>
                    <td>{item.deceasedName}</td>
                    <td>{formatDateTime(item.dateOfBurial)}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>View Details</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() => handleShowDetails(item, "transaction")}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Toggle Archive</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() =>
                            handleToggleArchive(item, "transaction")
                          }
                        >
                          <FontAwesomeIcon icon={faArchive} />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Archive Items</p>
          )}
        </div>
        <br />
        {/* Appointment Details Modal */}
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton className="transaction-header">
            <Modal.Title className="transaction-title">
              {selectedType === "appointment"
                ? "Appointment Details"
                : "Transaction Details"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="transaction-details-box">
            {selectedItem ? (
              selectedType === "appointment" ? (
                <>
                  <h4 className="admin-appointment-user">
                    {selectedItem.name}
                  </h4>
                  <p className="first-details">
                    <strong>Date:</strong> {formatDateTime(selectedItem.date)}
                    <br />
                    <strong>Phone Number:</strong> {selectedItem.phoneNumber}
                    <br />
                    <strong>Plan:</strong> {selectedItem.plan}
                    <br />
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedItem.status)}
                    <br />
                    <strong>Notes:</strong> {selectedItem.notes || "N/A"}
                    <br />
                    <strong>Appointed Staff:</strong>{" "}
                    {selectedItem.staff || "None Yet"}
                  </p>
                  <br />
                  <h4 className="postmortem-title">Post Mortem Details:</h4>
                  <p className="second-details">
                    <strong>Deceased Name: </strong>
                    {selectedItem.DeceasedName}
                    <br />
                    <strong>Deceased Age: </strong>
                    {selectedItem.DeceasedAge}
                    <br />
                    <strong>Deceased Sex: </strong>
                    {selectedItem.DeceasedSex}
                    <br />
                    <strong>Deceased Birthday: </strong>
                    {selectedItem.DeceasedBirthday}
                    <br />
                    <strong>Date of Death: </strong>
                    {selectedItem.DateofDeath}
                    <br />
                    <strong>Place of Death: </strong>
                    {selectedItem.PlaceofDeath}
                    <br />
                    <strong>Deceased Relationship: </strong>
                    {selectedItem.DeceasedRelationship}

                    <br />
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {selectedItem.DeathCertificate
                            ? "View Death Certificate File"
                            : "No Death Certificate Available"}
                        </Tooltip>
                      }
                    >
                      {selectedItem.DeathCertificate ? (
                        <a
                          href={selectedItem.DeathCertificate}
                          className="appointment-death-cert"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View PDF"
                        >
                          <strong>Death Certificate:</strong>{" "}
                          <FontAwesomeIcon icon={faFile} />
                        </a>
                      ) : (
                        <span className="no-death-certificate">
                          <strong>Death Certificate:</strong> No Death
                          Certificate
                        </span>
                      )}
                    </OverlayTrigger>
                  </p>
                </>
              ) : (
                <>
                  <h4 className="admin-appointment-user">
                    {selectedItem.deceasedName}
                  </h4>

                  <p className="first-details">
                    <strong>Plan:</strong>{" "}
                    {selectedItem.plan}
                    <br/>
                    <strong>Date:</strong>{" "}
                    {formatDateTime(selectedItem.dateOfBurial)}
                    <br />
                    <strong>Time of Burial:</strong> {selectedItem.timeOfBurial}
                    <br />
                    <strong>Ordered By:</strong> {selectedItem.orderedBy}
                    <br />
                    <strong>Viewing Address:</strong> {selectedItem.address}
                    <br />
                    <strong>Cemetery:</strong> {selectedItem.cemetery}
                    <br />
                    <strong>Viewing Glass:</strong> {selectedItem.glassViewing}
                    <br />
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedItem.status)}
                  </p>
                  <br />
                  <div className="transaction-border"></div>
                  <h4 className="particulars-title">Particulars Details:</h4>
                  <p className="second-details">
                    <table>
                      <thead>
                        <tr>
                          <th>Particular</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.particulars.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>₱{item.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </p>
                  <div className="transaction-border"></div>
                  <h4 className="financial-summary-title">
                    Financial Summary:
                  </h4>
                  <p className="financial-summary-details">
                    <strong>Total Amount:</strong> ₱
                    {selectedItem.totalAmount || "0.00"}
                    <br />
                    <strong>Deposit:</strong> ₱{selectedItem.deposit || "0.00"}
                    <br />
                    <strong>Balance:</strong> ₱{selectedItem.balance || "0.00"}
                  </p>
                </>
              )
            ) : (
              <p>No details available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseDetailsModal}
              className="close2-button"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </section>
  );
};

export default Archive;
