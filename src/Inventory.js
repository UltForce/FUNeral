import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // This includes tooltips and other Bootstrap JavaScript
import React, { useState, useEffect, useCallback } from "react";
import {
  addInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
  getInventoryItems,
  AuditLogger,
  getCurrentUserId,
  getUserRoleFirestore,
  uploadImage,
} from "./firebase.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import { Button, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "bootstrap";
import "./Inventory.css";

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

const Inventory = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    description: "",
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

  // Fetch inventory items
  const fetchInventoryItems = useCallback(async () => {
    try {
      const items = await getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error.message);
      Toast.fire({
        icon: "error",
        title: "Failed to fetch inventory items",
      });
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  useEffect(() => {
    if (inventoryItems.length > 0) {
      if (!$.fn.DataTable.isDataTable("#inventoryTable")) {
        $("#inventoryTable").DataTable({
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
      // Initialize Bootstrap tooltips
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipTriggerList.forEach(
        (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
      );
    }
  }, [inventoryItems]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleShowModal = (mode, item = null, event = null) => {
    // Hide tooltip before changing status
    if (event) {
      const tooltipElement = event.currentTarget;
      const tooltipInstance = Tooltip.getInstance(tooltipElement);
      if (tooltipInstance) {
        tooltipInstance.hide();
      }
    }
    setModalMode(mode);
    setSelectedItem(item);
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
      });
    } else {
      setFormData({
        name: "",
        quantity: "",
        price: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleAddEditConfirmation = async (mode, event) => {
    const actionText = mode === "add" ? "add" : "update";
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this item?`,
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
      const userId = getCurrentUserId();
      // Upload image and get URL
      const imageUrl = await uploadImage(itemImage);

      if (modalMode === "add") {
        const event = {
          type: "Inventory",
          userId: userId,
          details: "Admin added an item",
        };
        AuditLogger({ event });
        await addInventoryItem({ ...formData, imageUrl }); // Include imageUrl here
        Toast.fire({
          icon: "success",
          title: "Inventory item added successfully",
        });
      } else if (modalMode === "edit" && selectedItem) {
        const event = {
          type: "Inventory",
          userId: userId,
          details: "Admin updated an item",
        };
        AuditLogger({ event });
        await updateInventoryItem(selectedItem.id, { ...formData, imageUrl }); // Include imageUrl here
        Toast.fire({
          icon: "success",
          title: "Inventory item updated successfully",
        });
      }

      fetchInventoryItems(); // Fetch items directly here
      handleCloseModal();
    } catch (error) {
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} inventory item:`,
        error.message
      );
      Toast.fire({
        icon: "error",
        title: `An error occurred while ${
          modalMode === "add" ? "adding" : "updating"
        } inventory item.`,
      });
    }
  };

  const handleDeleteConfirmation = async (itemId) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this item?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });
    return result.isConfirmed ? itemId : null;
  };

  const handleDelete = async (itemId, event = null) => {
    // Hide tooltip before changing status
    if (event) {
      const tooltipElement = event.currentTarget;
      const tooltipInstance = Tooltip.getInstance(tooltipElement);
      if (tooltipInstance) {
        tooltipInstance.hide();
      }
    }

    const confirmedId = await handleDeleteConfirmation(itemId);
    if (!confirmedId) return;

    try {
      const userId = getCurrentUserId();
      const logEvent = {
        type: "Inventory",
        userId: userId,
        details: "Admin deleted an item",
      };
      AuditLogger({ event: logEvent });
      await deleteInventoryItem(itemId);
      Toast.fire({
        icon: "success",
        title: "Inventory item deleted successfully",
      });
      fetchInventoryItems();
    } catch (error) {
      console.error("Error deleting inventory item:", error.message);
      Toast.fire({
        icon: "error",
        title: "An error occurred while deleting inventory item.",
      });
    }
  };

  const zoomImage = (imageUrl) => {
    // Logic for zooming in on the image (e.g., opening in a modal)
    window.open(imageUrl, "_blank"); // Simple example to open the image in a new tab
  };

  return (
    <section className="inventory">
      <main className="main-content">
        <div className="inventory-dashboard-box">
          <div className="header-container">
            <h1 className="centered">Inventory</h1>
            <a className="add-inventory" onClick={() => handleShowModal("add")}>
              <img src="add.png" style={{ height: "30px" }}></img>
            </a>
          </div>
        </div>

        {/* tanggalin na dapat itong button*/}
        <Button
          variant="primary"
          className="add-button"
          onClick={() => handleShowModal("add")}
        ></Button>

        {inventoryItems.length === 0 ? (
          <p className="text-center">No items available</p>
        ) : (
          <table className="display w3-table" id="inventoryTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Description</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>{item.description}</td>
                  <td>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "50px", cursor: "pointer" }}
                      onClick={() => zoomImage(item.imageUrl)}
                    />
                  </td>
                  <td>
                    <div>
                      {/* Edit Button with Tooltip */}
                      <button
                        className="btn btn-warning"
                        type="button"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Edit Item"
                        onClick={(event) => {
                          handleShowModal("edit", item, event);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>{" "}
                      {/* Delete Button with Tooltip */}
                      <button
                        className="btn btn-danger"
                        type="button"
                        data-bs-toggle="tooltip"
                        title="Delete Item"
                        onClick={(event) => {
                          handleDelete(item.id, event);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton className="inventory-header">
          <Modal.Title className="inventory-title">
            {modalMode === "add" ? "Add New Item" : "Edit Item"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="inventory-details-box">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label className="label-title">Name</Form.Label>
              <Form.Control
                type="text"
                className="input-details"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="formQuantity">
              <Form.Label className="label-title">Quantity</Form.Label>
              <Form.Control
                type="number"
                className="input-details"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="formPrice">
              <Form.Label className="label-title">Price</Form.Label>
              <Form.Control
                type="number"
                className="input-details"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="formDescription">
              <Form.Label className="label-title">Description</Form.Label>
              <Form.Control
                as="textarea"
                className="input-details"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="formImage">
              <Form.Label className="label-title">Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>
            <br />
            <Button
              variant="primary"
              type="submit"
              className="edit-item-button"
            >
              {modalMode === "add" ? "Add Item" : "Save Changes"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Inventory;
