import emailjs from "emailjs-com"; // Import EmailJS
import { React, useState, useEffect, useCallback } from "react";
import {
  getCurrentUserId,
  AuditLogger,
  getUserRoleFirestore,
  sendNotification,
  getUserEmailById,
  getUsersWithCompletedAppointments,
  addTransaction,
  updateTransaction,
  getTransactions,
  deleteTransaction,
  updateTransactionStatus,
  toggleArchiveStatus,
  generateTransactionReportsPDF,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import {
  Dropdown,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Transaction.css";
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

const Transaction = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [showModal2, setShowModal2] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose1 = () => setShowModal(false);
  const handleShow2 = () => setShowModal2(true);
  const handleClose2 = () => setShowModal2(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [transactions, setTransactions] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    deceasedName: "",
    date: "",
    dateOfBurial: "",
    timeOfBurial: "",
    orderedBy: "",
    orderedById: "",
    address: "",
    cemetery: "",
    casket: { particulars: "", amount: "" },
    hearse: { particulars: "", amount: "" },
    funServicesArrangements: { particulars: "", amount: "" },
    permits: { particulars: "", amount: "" },
    embalming: { particulars: "", amount: "" },
    cemeteryExpenses: { particulars: "", amount: "" },
    otherExpenses: { particulars: "", amount: "" },
    totalAmount: 0,
    deposit: 0,
    balance: 0,
    status: "",
  });

  // Calculate the total amount based on item amounts
  useEffect(() => {
    const total = Object.keys(formData)
      .filter((key) => formData[key].amount)
      .reduce((acc, key) => acc + parseFloat(formData[key].amount || 0), 0);

    const balance = total - parseFloat(formData.deposit || 0);

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      balance: balance,
    }));
  }, [
    formData.casket,
    formData.hearse,
    formData.funServicesArrangements,
    formData.permits,
    formData.embalming,
    formData.cemeteryExpenses,
    formData.otherExpenses,
    formData.deposit,
    formData,
  ]);

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

  const fetchTransactions = useCallback(async () => {
    try {
      const transactions = await getTransactions();
      setTransactions(transactions);
      setLoading(false); // Hide loader after data is fetched
    } catch (error) {
      setLoading(false); // Hide loader after data is fetched
      console.error("Error fetching transactions:", error.message);
      Toast.fire({
        icon: "error",
        title: "Failed to fetch transactions",
      });
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      if (!$.fn.DataTable.isDataTable("#transactionTable")) {
        $("#transactionTable").DataTable({
          lengthMenu: [10, 25, 50, 75, 100],
          pagingType: "full_numbers",
          order: [],
          columnDefs: [{ targets: "no-sort", orderable: false }],
          drawCallback: function () {
            $(this.api().table().container())
              .find("td")
              .css("border", "1px solid #ddd");
          },
          rowCallback: function (row) {
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
  }, [transactions]);

  useEffect(() => {
    const fetchUsers = async () => {
      const completedUsers = await getUsersWithCompletedAppointments();
      setUsers(completedUsers);
    };
    fetchUsers();
  }, []);

  const handleNext = () => {
    // Validate first modal fields
    if (
      formData.deceasedName &&
      formData.dateOfBurial &&
      formData.timeOfBurial &&
      formData.orderedBy &&
      formData.address &&
      formData.cemetery
    ) {
      setShowModal(false);
      setShowModal2(true);
    } else {
      Toast.fire({
        icon: "error",
        title: "Please fill in all the fields.",
      });
    }
  };

  // Function to handle returning to the first modal
  const handleReturn = () => {
    handleClose2(); // Close the second modal
    handleShow(); // Reopen the first modal
  };

  const clearFormData = async () => {
    setFormData({
      // State for form data
      deceasedName: "",
      date: "",
      dateOfBurial: "",
      timeOfBurial: "",
      orderedBy: "",
      orderedById: "",
      address: "",
      cemetery: "",
      casket: { particulars: "", amount: "" },
      hearse: { particulars: "", amount: "" },
      funServicesArrangements: { particulars: "", amount: "" },
      permits: { particulars: "", amount: "" },
      embalming: { particulars: "", amount: "" },
      cemeteryExpenses: { particulars: "", amount: "" },
      otherExpenses: { particulars: "", amount: "" },
      totalAmount: 0,
      deposit: 0,
      balance: 0,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "processing":
        return <span className="badge bg-warning">{status}</span>;
      case "burial":
        return <span className="badge bg-info">{status}</span>;
      case "completed":
        return <span className="badge bg-success">{status}</span>;
      case "canceled":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleAction = async (action, transactionId) => {
    try {
      // Show SweetAlert confirmation first
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to change the transaction status to "${action}". This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
      });

      // If the user confirms, proceed with the action
      if (!result.isConfirmed) {
        return; // Exit if the user canceled
      }

      setLoading(true); // Set loading state to true
      const transaction = transactions.find((r) => r.id === transactionId);

      const userId = getCurrentUserId();
      const event = {
        type: "Transaction",
        userId: userId,
        details: "Admin changed the status of a transaction",
      };
      AuditLogger({ event });
      const title = "Transaction status changed";
      const content = `Your Transaction status has been changed to ${action}`;
      const recipient = transaction.orderedById;
      await sendNotification(title, content, userId, recipient);

      // Check if the action is "archive"
      if (action === "archive") {
        await toggleArchiveStatus(transactionId, "transactions", true);
        // Destroy DataTable before updating the state
        if ($.fn.DataTable.isDataTable("#transactionTable")) {
          $("#transactionTable").DataTable().destroy();
        }
        await fetchTransactions(); // Refresh the appointments list
        Swal.fire(
          "Archived!",
          `Transaction archived successfully.`,
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: `Transaction archived successfully.`,
            });
          }
        });
        setLoading(false); // Set loading state to false
        return; // Exit the function early to prevent further actions
      }

      await updateTransactionStatus(transactionId, action);

      // Fetch the user's email based on userId
      const userEmail = await getUserEmailById(userId);

      // Send email notification using EmailJS
      const emailParams = {
        to_name: transaction.name, // Name of the recipient
        status: action, // New status
        email: userEmail, // Email of the recipient retrieved from userId
      };

      // Replace these with your actual EmailJS credentials
      const serviceID = "service_5f3k3ms";
      const templateID = "template_g1w6f2a";
      const userID = "0Tz3RouZf3BXZaSmh"; // Use your User ID

      // Uncomment the following to send the email (if required)
      // await emailjs.send(serviceID, templateID, emailParams, userID);

      Swal.fire(
        "Updated!",
        `Transaction status changed to ${action}`,
        "success"
      ).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: `Transaction status changed to ${action}`,
          });
        }
      });

      await fetchTransactions(); // Refresh the appointments list
      setLoading(false); // Set loading state to false
    } catch (error) {
      console.error(`Error handling action (${action}):`, error.message);
      alert(`An error occurred while performing the action (${action}).`);
    }
  };

  const getAvailableActions = (status) => {
    const allActions = [
      "processing",
      "burial",
      "completed",
      "canceled",
      "archive",
    ];
    return allActions.filter((action) => action !== status);
  };

  const handleShowModal = (mode, transaction = null, event = null) => {
    // Hide tooltip before changing status

    setModalMode(mode);
    setSelectedTransaction(transaction);
    if (transaction) {
      setFormData({
        deceasedName: transaction.deceasedName,
        date: transaction.date,
        dateOfBurial: transaction.dateOfBurial,
        timeOfBurial: transaction.timeOfBurial,
        orderedBy: transaction.orderedBy,
        orderedById: transaction.orderedById,
        address: transaction.address,
        cemetery: transaction.cemetery,
        casket: {
          particulars: transaction.casket.particulars,
          amount: transaction.casket.amount,
        },
        hearse: {
          particulars: transaction.hearse.particulars,
          amount: transaction.hearse.amount,
        },
        funServicesArrangements: {
          particulars: transaction.funServicesArrangements.particulars,
          amount: transaction.funServicesArrangements.amount,
        },
        permits: {
          particulars: transaction.permits.particulars,
          amount: transaction.permits.amount,
        },
        embalming: {
          particulars: transaction.embalming.particulars,
          amount: transaction.embalming.amount,
        },
        cemeteryExpenses: {
          particulars: transaction.cemeteryExpenses.particulars,
          amount: transaction.cemeteryExpenses.amount,
        },
        otherExpenses: {
          particulars: transaction.otherExpenses.particulars,
          amount: transaction.otherExpenses.amount,
        },
        totalAmount: transaction.totalAmount,
        deposit: transaction.deposit,
        balance: transaction.balance,
      });
    } else {
      clearFormData();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleAddEditConfirmation = async (mode, event) => {
    const actionText = mode === "add" ? "add" : "update";
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this transaction?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });
    return result.isConfirmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = await handleAddEditConfirmation(modalMode);
    if (!confirmed) return;

    try {
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();

      if (modalMode === "add") {
        const event = {
          type: "Transaction",
          userId: userId,
          details: "Admin added a Transaction",
        };
        await addTransaction({ ...formData });
        AuditLogger({ event });
        Swal.fire("Added!", "Transaction added successfully", "success").then(
          (result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Transaction added successfully",
              });
            }
          }
        );
      } else if (modalMode === "edit" && selectedTransaction) {
        const event = {
          type: "Transaction",
          userId: userId,
          details: "Admin updated a Transaction",
        };
        AuditLogger({ event });
        await updateTransaction(selectedTransaction.id, { ...formData }); // Include imageUrl here
        Swal.fire(
          "Updated!",
          "Transaction updated successfully",
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Transaction updated successfully",
            });
          }
        });
      }
      fetchTransactions();
      handleCloseModal();
      handleClose2();
      clearFormData();
      setLoading(false); // Set loading state to true
    } catch (error) {
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} transaction:`,
        error.message
      );
      Toast.fire({
        icon: "error",
        title: `An error occurred while ${
          modalMode === "add" ? "adding" : "updating"
        } transaction.`,
      });
    }
  };

  const handleDeleteConfirmation = async (transactionId) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this transaction?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });
    return result.isConfirmed ? transactionId : null;
  };

  const handleDelete = async (transactionId, event = null) => {
    const confirmedId = await handleDeleteConfirmation(transactionId);
    if (!confirmedId) return;

    try {
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();
      const logEvent = {
        type: "Transaction",
        userId: userId,
        details: "Admin deleted a transaction",
      };
      AuditLogger({ event: logEvent });

      await deleteTransaction(transactionId);
      Swal.fire("Deleted!", "Transaction deleted successfully", "success").then(
        (result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Transaction deleted successfully",
            });
          }
        }
      );
      // Destroy DataTable before updating the state
      if ($.fn.DataTable.isDataTable("#transactionTable")) {
        $("#transactionTable").DataTable().destroy();
      }
      fetchTransactions();
      setLoading(false); // Set loading state to true
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      Toast.fire({
        icon: "error",
        title: "An error occurred while deleting transaction.",
      });
    }
  };

  // Modal functions
  const handleShowDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

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

  const handleDepositChange = (value) => {
    setFormData({
      ...formData,
      deposit: parseFloat(value),
    });
  };

  const handleGenerateReports = async () => {
    try {
      // Show SweetAlert confirmation first
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to generate the transaction report. Do you want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, generate report",
        cancelButtonText: "Cancel",
      });

      // If the user cancels, exit the function
      if (!result.isConfirmed) {
        return; // Exit the function if the user canceled
      }

      // If the user confirms, proceed with generating the report
      const table = $("#transactionTable").DataTable();

      // Use DataTables API to get visible rows with current search and sort applied
      const tableData = [];
      table.rows({ search: "applied" }).every(function () {
        const row = this.node(); // Access the DOM node of the row
        const cells = $(row).find("td"); // Find all <td> elements in the row

        // Push an array of cell text values to tableData, matching PDF columns
        tableData.push([
          $(cells[0]).text(),
          $(cells[1]).text(),
          $(cells[2]).text(),
          $(cells[3]).text(),
          $(cells[4]).text(),
          $(cells[5]).text(),
        ]);
      });

      // Pass the formatted table data to generate the PDF
      await generateTransactionReportsPDF(tableData);

      Swal.fire("Generated!", "Reports successfully generated", "success").then(
        (result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Reports successfully generated",
            });
          }
        }
      );

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

  return (
    <section className="transaction">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="transaction-dashboard-box">
          <div className="header-container">
            <h1 className="centered">Transactions</h1>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Add Transaction</Tooltip>}
            >
              <a className="add-transaction" onClick={handleShow}>
                <img src="add.png" style={{ height: "30px" }}></img>
              </a>
            </OverlayTrigger>
          </div>
        </div>
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip>Export to PDF file</Tooltip>}
        >
          <button
            className="transaction-generate-report-button"
            onClick={handleGenerateReports}
          >
            Generate Reports
          </button>
        </OverlayTrigger>
        {transactions.length === 0 ? (
          <p className="text-center">No transactions available</p>
        ) : (
          <table className="display w3-table" id="transactionTable">
            <thead>
              <tr>
                <th>Name of Deceased</th>
                <th>Date of Burial</th>
                <th>Time of Burial</th>
                <th>Address</th>
                <th>Cemetery</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.deceasedName}</td>
                  <td>{transaction.dateOfBurial}</td>
                  <td>{transaction.timeOfBurial}</td>
                  <td>{transaction.address}</td>
                  <td>{transaction.cemetery}</td>
                  <td>{getStatusBadge(transaction.status)}</td>
                  <td>
                    <div className="transaction-buttons">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Show Appointment Details</Tooltip>}
                      >
                        <Button
                          variant="link"
                          onClick={() => handleShowDetails(transaction)}
                          className="view-details-button"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </OverlayTrigger>
                      <Dropdown className="actions-button">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {getAvailableActions(transaction.status).map(
                            (action) => (
                              <Dropdown.Item
                                key={action}
                                onClick={() =>
                                  handleAction(action, transaction.id)
                                }
                              >
                                {action.charAt(0).toUpperCase() +
                                  action.slice(1)}
                              </Dropdown.Item>
                            )
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                      {/* Edit Button with OverlayTrigger for Tooltip */}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Transaction</Tooltip>}
                      >
                        <button
                          className="btn btn-warning"
                          type="button"
                          onClick={(event) => {
                            handleShowModal("edit", transaction, event);
                          }}                         
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </OverlayTrigger>{" "}
                      {/* Delete Button with OverlayTrigger for Tooltip */}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Transaction</Tooltip>}
                      >
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={(event) => {
                            handleDelete(transaction.id, event);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br />
        {/* First Modal */}
        <Modal show={showModal} onHide={handleClose1}>
          <Modal.Header closeButton className="transaction-header">
            <Modal.Title className="transaction-title">
              {modalMode === "add" ? "Add New Transaction" : "Edit Transaction"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <Form>
              <Form.Group controlId="formDeceasedName">
                <Form.Label className="label-title">
                  Name of Deceased
                </Form.Label>
                <Form.Control
                  className="input-details"
                  type="text"
                  placeholder="Enter deceased's name"
                  value={formData.deceasedName}
                  onChange={(e) =>
                    setFormData({ ...formData, deceasedName: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formDeceasedBirthday">
                <Form.Label className="label-title">Date of Burial</Form.Label>
                <Form.Control
                  type="date"
                  className="input-details"
                  value={formData.dateOfBurial}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateOfBurial: e.target.value,
                    })
                  }
                  required
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formTimeOfBurial">
                <Form.Label className="label-title">Time of Burial</Form.Label>
                <Form.Control
                  type="time"
                  className="input-details"
                  value={formData.timeOfBurial}
                  onChange={(e) =>
                    setFormData({ ...formData, timeOfBurial: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formOrderedBy">
                <Form.Label className="label-title">Ordered By</Form.Label>
                <Form.Control
                  as="select"
                  className="input-details"
                  value={formData.orderedById}
                  onChange={(e) => {
                    const selectedUserId = e.target.value;
                    const selectedUser = users.find(
                      (user) => user.id === selectedUserId
                    );
                    setFormData({
                      ...formData,
                      orderedById: selectedUserId, // Set user ID
                      orderedBy: selectedUser
                        ? `${selectedUser.firstname} ${selectedUser.lastname}`
                        : "", // Set display name
                    });
                  }}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstname} {user.lastname}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <br />
              <Form.Group controlId="formAddress">
                <Form.Label className="label-title">Address</Form.Label>
                <Form.Control
                  className="input-details"
                  type="text"
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formCemetery">
                <Form.Label className="label-title">Cemetery</Form.Label>
                <Form.Control
                  className="input-details"
                  type="text"
                  placeholder="Enter Cemetery"
                  value={formData.cemetery}
                  onChange={(e) =>
                    setFormData({ ...formData, cemetery: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <br />
              <div className="buttons">
                <Button
                  variant="primary"
                  className="close-button"
                  onClick={handleClose1}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="next-button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        {/* Second Modal for Particulars */}
        <Modal show={showModal2} onHide={handleClose2}>
          <Modal.Header closeButton className="transaction-header">
            <Modal.Title className="transaction-particulars-title">Particulars</Modal.Title>
          </Modal.Header>
          <Modal.Body className="details-box">
            <Form onSubmit={handleSubmit}>
              <table bordered className="particulars-table">
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "casket",
                    "hearse",
                    "funServicesArrangements",
                    "permits",
                    "embalming",
                    "cemeteryExpenses",
                    "otherExpenses",
                  ].map((item) => (
                    <tr key={item}>
                      <td>
                        <Form.Group controlId={`${item}Particulars`}>
                          <Form.Label className="label-title">
                            {item.replace(/([A-Z])/g, " $1")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter particulars"
                            className="input-details"
                            value={formData[item].particulars}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [item]: {
                                  ...formData[item],
                                  particulars: e.target.value,
                                },
                              })
                            }
                          />
                        </Form.Group>
                      </td>
                      <td>
                        <Form.Group controlId={`${item}Amount`}>
                          <Form.Control
                            type="number"
                            placeholder="Enter amount"
                            className="amount-input-details"
                            value={formData[item].amount}
                            onChange={(e) => {
                              const newAmount = e.target.value;
                              setFormData({
                                ...formData,
                                [item]: {
                                  ...formData[item],
                                  amount: newAmount,
                                },
                              });
                            }}
                          />
                        </Form.Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" style={{ textAlign: "right" }} className="total-amount">
                      <strong>Total Amount:</strong> $
                      {formData.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center" }}>
                      <Form.Group controlId="depositAmount">
                        <Form.Label className="deposit-title">
                          <strong>Deposit:</strong>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter deposit amount"
                          className="deposit-input"
                          value={formData.deposit}
                          onChange={(e) => handleDepositChange(e.target.value)}
                        />
                      </Form.Group>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center" }} className="balance">
                      <strong>Balance:</strong> ${formData.balance.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <div className="add-transaction-buttons">
                <Button variant="secondary" onClick={handleReturn}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="edit-transaction-button"
                >
                  {modalMode === "add" ? "Add Transaction" : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        {/* Appointment Details Modal */}
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
          <Modal.Header closeButton className="admin-appointment-header">
            <Modal.Title className="admin-appointment-title">
              Transaction Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="admin-appointment-details-box">
            {selectedTransaction ? (
              <>
                <h4 className="admin-appointment-user">
                  {selectedTransaction.deceasedName}
                </h4>
                <p className="first-details">
                  <strong>Date:</strong>{" "}
                  {formatDateTime(selectedTransaction.dateOfBurial)}
                  <br />
                  <strong>Time of Burial:</strong>{" "}
                  {selectedTransaction.timeOfBurial}
                  <br />
                  <strong>Ordered By:</strong> {selectedTransaction.orderedBy}
                  <br />
                  <strong>Address:</strong> {selectedTransaction.address}
                  <br />
                  <strong>Cemetery:</strong> {selectedTransaction.cemetery}
                  <br />
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedTransaction.status)}
                </p>
                <br />
                <h4 className="postmortem-title">Particulars Details:</h4>
                <p className="second-details">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Particulars</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "casket",
                        "hearse",
                        "funServicesArrangements",
                        "permits",
                        "embalming",
                        "cemeteryExpenses",
                        "otherExpenses",
                      ].map((field) => (
                        <tr key={field}>
                          <td>{field.replace(/([A-Z])/g, " $1")}</td>
                          <td>
                            {selectedTransaction[field]?.particulars
                              ? `${selectedTransaction[field].particulars}`
                              : "N/A"}
                          </td>
                          <td>
                            {selectedTransaction[field]?.amount
                              ? `${selectedTransaction[field].amount}`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </p>
                <br />
                <h4 className="financial-summary-title">Financial Summary:</h4>
                <p className="financial-summary-details">
                  <strong>Total Amount:</strong> $
                  {selectedTransaction.totalAmount || "0.00"}
                  <br />
                  <strong>Deposit:</strong> $
                  {selectedTransaction.deposit || "0.00"}
                  <br />
                  <strong>Balance:</strong> $
                  {selectedTransaction.balance || "0.00"}
                </p>
              </>
            ) : (
              <p>No details available</p>
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

export default Transaction;
