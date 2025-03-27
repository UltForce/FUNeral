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
import { Button, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import "./Inventory.css";
import Loader from "./Loader.js";
import { doc, updateDoc } from "firebase/firestore";
import { dba } from "./firebase"; // Adjust the import path to your Firebase configuration
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
  const [loading, setLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    name: "",
    plan: "",
    quantity: 0,
    price: 0,
    description: "",
  });
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [quantityAction, setQuantityAction] = useState("add");

  const openQuantityModal = (itemId, quantity) => {
    setSelectedItemId(itemId);
    setSelectedQuantity(quantity);
    setAdjustment(0); // Reset adjustment field
    setShowQuantityModal(true);
  };

  
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
      setLoading(false); // Hide loader after data is fetched
    } catch (error) {
      setLoading(false); // Hide loader after data is fetched
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
    setModalMode(mode);
    setSelectedItem(item);
    if (item) {
      setFormData({
        name: item.name,
        plan: item.plan,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
      });
    } else {
      setFormData({
        name: "",
        quantity: 0,
        plan: "",
        price: 0,
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
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();
      // Upload image and get URL
      const imageUrl = await uploadImage(itemImage);

      // Parse quantity and price to numbers
      const itemData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
      };

      if (modalMode === "add") {
        const event = {
          type: "Inventory",
          userId: userId,
          details: "Admin added an item",
        };
        AuditLogger({ event });
        await addInventoryItem({ ...itemData, imageUrl }); // Include imageUrl here

        Swal.fire(
          "Added!",
          "Inventory item added successfully",
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Inventory item added successfully",
            });
          }
        });
      } else if (modalMode === "edit" && selectedItem) {
        const event = {
          type: "Inventory",
          userId: userId,
          details: "Admin updated an item",
        };
        AuditLogger({ event });
        await updateInventoryItem(selectedItem.id, { ...itemData, imageUrl }); // Include imageUrl here

        Swal.fire(
          "Updated!",
          "Inventory item updated successfully",
          "success"
        ).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Inventory item updated successfully",
            });
          }
        });
      }
      fetchInventoryItems();
      // Destroy DataTable before updating the state
      if ($.fn.DataTable.isDataTable("#inventoryTable")) {
        $("#inventoryTable").DataTable().destroy();
      }
      handleCloseModal();
      setLoading(false); // Set loading state to true
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
    const confirmedId = await handleDeleteConfirmation(itemId);
    if (!confirmedId) return;

    try {
      setLoading(true); // Set loading state to true
      const userId = getCurrentUserId();
      const logEvent = {
        type: "Inventory",
        userId: userId,
        details: "Admin deleted an item",
      };
      AuditLogger({ event: logEvent });
      await deleteInventoryItem(itemId);
      Swal.fire(
        "Deleted!",
        "Inventory item deleted successfully",
        "success"
      ).then((result) => {
        if (result.isConfirmed) {
          Toast.fire({
            icon: "success",
            title: "Inventory item deleted successfully",
          });
        }
      });

      // Destroy DataTable before updating the state
      if ($.fn.DataTable.isDataTable("#inventoryTable")) {
        $("#inventoryTable").DataTable().destroy();
      }
      fetchInventoryItems();
      setLoading(false); // Set loading state to true
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

  const handleQuantityUpdate = async () => {
    if (adjustment <= 0) {
      Swal.fire("Invalid Amount", "Please enter a valid quantity.", "warning");
      return;
    }
  
    let newQuantity =
      quantityAction === "add"
        ? selectedQuantity + adjustment
        : selectedQuantity - adjustment;
  
    if (newQuantity < 0) {
      Swal.fire("Error", "Quantity cannot be negative.", "error");
      return;
    }
  
    Swal.fire({
      title: "Confirm Quantity Update",
      text: `Are you sure you want to ${quantityAction} ${adjustment} items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const itemDocRef = doc(dba, "inventory", selectedItemId);
          await updateDoc(itemDocRef, { quantity: newQuantity });
  
          // Update state
          setInventoryItems((prevItems) =>
            prevItems.map((item) =>
              item.id === selectedItemId ? { ...item, quantity: newQuantity } : item
            )
          );
  
          Swal.fire("Updated!", "Inventory has been updated.", "success");
          setShowQuantityModal(false);
        } catch (error) {
          Swal.fire("Error", "Failed to update inventory.", "error");
        }
      }
    });
  };
  
  

  return (
    <section className="inventory">
      <main className="main-content">
        {loading && <Loader />} {/* Use the Loader component here */}
        <div className="inventory-dashboard-box">
          <div className="header-container">
            <h1 className="centered">Inventory</h1>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Add Inventory</Tooltip>}
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
        {inventoryItems.length === 0 ? (
          <p className="text-center">No items available</p>
        ) : (
          <table className="display w3-table" id="inventoryTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Plan</th>
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
                  <td>{item.plan}</td>
                 <td>
                 <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modify Quantity</Tooltip>}
                      >
                  <div
                    style={{ cursor: "pointer", textAlign: "center" }}
                    onClick={() => openQuantityModal(item.id, item.quantity)}
                  >
                    <span style={{ color: "blue" }}>
                      {item.quantity}
                    </span>
                  </div>
                  </OverlayTrigger>
                </td>
                  <td>{item.price}</td>
                  <td>{item.description}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Preview Image</Tooltip>}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: "50px", cursor: "pointer", margin: "0 auto" }}
                        onClick={() => zoomImage(item.imageUrl)}
                      />
                    </OverlayTrigger>
                  </td>
                  <td>
                    <div>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit Item</Tooltip>}
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
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Item</Tooltip>}
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
            <Form.Group controlId="formPlan">
              <Form.Label className="label-title">Plan</Form.Label>
              <Form.Select
                className="plan-select"
                required
                value={formData.plan}
                onChange={(e) =>
                  setFormData({ ...formData, plan: e.target.value })
                }
              >
                <option value="">Select a plan</option>
                <option value="Plan 1">Plan 1 - Basic Plan</option>
                <option value="Plan 2">Plan 2 - Garden Plan</option>
                <option value="Plan 3">Plan 3 - Garbo Plan</option>
                <option value="Plan 4">Plan 4 - Kid Plan</option>
                <option value="Any">Any Plan</option>
              </Form.Select>
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
                className="inventory-img"
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

<Modal show={showQuantityModal} onHide={() => setShowQuantityModal(false)}>
  <Modal.Header closeButton className="inventory-header">
    <Modal.Title className="inventory-title">Adjust Quantity</Modal.Title>
  </Modal.Header>
  <Modal.Body className="inventory-details-box">
    <p className="current-quantity">
      Current Quantity: <strong>{selectedQuantity}</strong>
    </p>
    <Form>
      {/* Selection to Add or Subtract */}
      <Form.Group controlId="quantityAction">
        <Form.Label className="label-title">Action</Form.Label>
        <Form.Select
          className="plan-select"
          value={quantityAction}
          onChange={(e) => setQuantityAction(e.target.value)}
          required
        >
          <option value="add">Add</option>
          <option value="subtract">Subtract</option>
        </Form.Select>
      </Form.Group>
      <br />

      {/* Input for Quantity Adjustment */}
      <Form.Group controlId="quantityAdjustment">
        <Form.Label className="label-title">
          Enter Amount to {quantityAction === "add" ? "Add" : "Subtract"}
        </Form.Label>
        <Form.Control
          type="number"
          className="input-details"
          value={adjustment}
          onChange={(e) => setAdjustment(Number(e.target.value))}
          required
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="secondary"
      className="cancel-button"
      onClick={() => setShowQuantityModal(false)}
    >
      Cancel
    </Button>
    <Button
      variant="primary"
      className="edit-item-button"
      onClick={handleQuantityUpdate}
    >
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


    </section>
  );
};

export default Inventory;
