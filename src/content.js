import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // This includes tooltips and other Bootstrap JavaScript
import React, { useState, useEffect } from "react";
import {
  getContent,
  addContent,
  updateContent,
  deleteContent,
  AuditLogger,
  getCurrentUserId,
  getUserRoleFirestore,
} from "./firebase"; // Helper functions for Firestore
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import { Button, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader.js";
import "./content.css";

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

const Content = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    page: "faqs", // Can be faqs or terms
    title: "",
    body: "",
  });

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

  // Fetch content from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const data = await getContent();
      setContent(data);
      setLoading(false); // Hide loader after data is fetched
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (content.length > 0) {
      if (!$.fn.DataTable.isDataTable("#contentTable")) {
        $("#contentTable").DataTable({
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
  }, [content]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowModal = (mode, item = null, event = null) => {
    setModalMode(mode);
    setSelectedContent(item);
    setFormData({
      page: item?.page || "faqs",
      title: item?.title || "",
      body: item?.body || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionText = modalMode === "edit" ? "update" : "add";

    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this content?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true); // Set loading state to true
        if (modalMode === "edit" && selectedContent) {
          const userId = getCurrentUserId();
          const event = {
            type: "Content",
            userId: userId,
            details: "Admin edited a content",
          };
          AuditLogger({ event });

          await updateContent(selectedContent.id, formData);
          Toast.fire({
            icon: "success",
            title: "Content updated successfully",
          });
        } else {
          const userId = getCurrentUserId();
          const event = {
            type: "Content",
            userId: userId,
            details: "Admin added a content",
          };
          AuditLogger({ event });
          await addContent(formData);
          Toast.fire({
            icon: "success",
            title: "Content added successfully",
          });
        }
        const data = await getContent();
        setContent(data);
        handleCloseModal();
        setLoading(false); // Set loading state to true
      } catch (error) {
        console.error("Error managing content:", error.message);
        alert("An error occurred while managing content.");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this content?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true); // Set loading state to true
        const userId = getCurrentUserId();
        const event = {
          type: "Content",
          userId: userId,
          details: "Admin deleted a content",
        };
        AuditLogger({ event });

        await deleteContent(id);
        Toast.fire({
          icon: "success",
          title: "Content deleted successfully",
        });
        // Destroy DataTable before updating the state
        if ($.fn.DataTable.isDataTable("#contentTable")) {
          $("#contentTable").DataTable().destroy();
        }
        const data = await getContent();
        setContent(data);
        setLoading(false); // Set loading state to true
      } catch (error) {
        console.error("Error deleting content:", error.message);
        alert("An error occurred while deleting content.");
      }
    }
  };

  return (
    <section className="manage-content">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="content-dashboard-box">
          <div className="header-container">
            <h1 className="centered">Manage Content</h1>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Add Content</Tooltip>}
            >
              <a
                className="add-inventory"
                onClick={() => handleShowModal("add")}
              >
                <img src="add.png" style={{ height: "30px" }}></img>
              </a>
            </OverlayTrigger>
          </div>
        </div>
        {/* tanggalin na dapat itong button*/}
        <Button
          className="add-button"
          variant="primary"
          onClick={() => handleShowModal("add")}
        ></Button>
        {content.length === 0 ? (
          <p className="text-center">No content available</p>
        ) : (
          <table className="display" id="contentTable">
            <thead>
              <tr>
                <th>Page</th>
                <th>Title</th>
                <th>Body</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item.id}>
                  <td>{item.page}</td>
                  <td>{item.title}</td>
                  <td>{item.body}</td>
                  <td>
                    <div>
                      {/* Edit Button with OverlayTrigger for Tooltip */}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Content</Tooltip>}
                      >
                        <button
                          className="btn btn-warning"
                          type="button"
                          onClick={(event) => {
                            handleShowModal("edit", item, event);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </OverlayTrigger>{" "}
                      {/* Delete Button with OverlayTrigger for Tooltip */}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Content</Tooltip>}
                      >
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={(event) => {
                            handleDelete(item.id, event);
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
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton className="content-header">
            <Modal.Title className="content-title">
              {modalMode === "edit" ? "Edit Content" : "Add Content"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="content-details-box">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formPage">
                <Form.Label className="label-title">Page</Form.Label>
                <Form.Control
                  as="select"
                  className="input-details"
                  name="page"
                  value={formData.page}
                  onChange={handleFormChange}
                  required
                >
                  <option value="faqs">FAQs</option>
                  <option value="terms">Terms and Conditions</option>
                </Form.Control>
              </Form.Group>
              <br />
              <Form.Group controlId="formTitle">
                <Form.Label className="label-title">Title</Form.Label>
                <Form.Control
                  type="text"
                  className="input-details"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="formBody">
                <Form.Label className="label-title">Body</Form.Label>
                <Form.Control
                  as="textarea"
                  className="input-details"
                  name="body"
                  value={formData.body}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <br />
              <Button
                variant="primary"
                type="submit"
                className="edit-content-button"
              >
                {modalMode === "edit" ? "Update" : "Add"} Content
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </main>
    </section>
  );
};

export default Content;
