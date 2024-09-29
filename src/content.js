import React, { useState, useEffect } from "react";
import {
  getContent,
  addContent,
  updateContent,
  deleteContent,
} from "./firebase"; // Helper functions for Firestore
import Swal from "sweetalert2";
import $ from "jquery";
import "datatables.net";
import { Dropdown, Button, Modal, Form } from "react-bootstrap";

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
  const [content, setContent] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [selectedContent, setSelectedContent] = useState(null);
  const [formData, setFormData] = useState({
    page: "faqs", // Can be faqs or terms
    title: "",
    body: "",
  });

  // Fetch content from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const data = await getContent();
      setContent(data);
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

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedContent(item);
    if (item) {
      setFormData({
        page: item.page || "faqs", // Could be faqs or terms
        title: item.title || "",
        body: item.body || "",
      });
    } else {
      setFormData({
        page: "faqs",
        title: "",
        body: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionText = modalMode === "edit" ? "update" : "add";

    // Confirm before adding or editing
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this content?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        if (modalMode === "edit" && selectedContent) {
          await updateContent(selectedContent.id, formData);
          Toast.fire({
            icon: "success",
            title: "Content updated successfully",
          });
        } else {
          await addContent(formData);
          Toast.fire({
            icon: "success",
            title: "Content added successfully",
          });
        }
        const data = await getContent();
        setContent(data);
        handleCloseModal();
      } catch (error) {
        console.error("Error managing content:", error.message);
        alert("An error occurred while managing content.");
      }
    }
  };

  const handleDelete = async (id) => {
    // Confirm before deleting
    const result = await Swal.fire({
      title: "Are you sure you want to delete this content?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await deleteContent(id);
        Toast.fire({
          icon: "success",
          title: "Content deleted successfully",
        });
        const data = await getContent();
        setContent(data);
      } catch (error) {
        console.error("Error deleting content:", error.message);
        alert("An error occurred while deleting content.");
      }
    }
  };

  return (
    <section className="background-image content section">
      <h1 className="centered">Manage Content</h1>
      <Button
        className="mb-3"
        variant="primary"
        onClick={() => handleShowModal("add")}
      >
        Add New Content
      </Button>

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
                  <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => handleShowModal("edit", item)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(item.id)}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "edit" ? "Edit Content" : "Add Content"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formPage">
              <Form.Label>Page</Form.Label>
              <Form.Control
                as="select"
                name="page"
                value={formData.page}
                onChange={handleFormChange}
                required
              >
                <option value="faqs">FAQs</option>
                <option value="terms">Terms and Conditions</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formBody">
              <Form.Label>Body</Form.Label>
              <Form.Control
                as="textarea"
                name="body"
                value={formData.body}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <br />
            <Button variant="primary" type="submit">
              {modalMode === "edit" ? "Update" : "Add"} Content
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Content;
