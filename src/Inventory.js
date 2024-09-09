import React, { useState, useEffect } from "react";
import {
  addInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
  getInventoryItems,
} from "./firebase.js"; // Assume these functions are defined in firebase.js
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
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

const Inventory = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    description: "",
  });

  // Fetch inventory items
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error("Error fetching inventory items:", error.message);
      }
    };

    fetchInventoryItems();
  }, []);

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
  }, [inventoryItems]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowModal = (mode, item = null) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await addInventoryItem(formData);
        Toast.fire({
          icon: "success",
          title: "Inventory item added successfully",
        });
      } else if (modalMode === "edit" && selectedItem) {
        await updateInventoryItem(selectedItem.id, formData);
        Toast.fire({
          icon: "success",
          title: "Inventory item updated successfully",
        });
      }
      // Fetch inventory items directly here
      const items = await getInventoryItems();
      setInventoryItems(items);
      handleCloseModal();
    } catch (error) {
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} inventory item:`,
        error.message
      );
      alert(
        `An error occurred while ${
          modalMode === "add" ? "adding" : "updating"
        } inventory item.`
      );
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteInventoryItem(itemId);
      Toast.fire({
        icon: "success",
        title: "Inventory item deleted successfully",
      });
      // Fetch inventory items directly here
      const items = await getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error("Error deleting inventory item:", error.message);
      alert("An error occurred while deleting inventory item.");
    }
  };

  return (
    <section className="background-image content section">
      <h1 className="centered">Inventory</h1>

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => handleShowModal("add")}
      >
        Add New Item
      </Button>

      {inventoryItems.length === 0 ? (
        <p className="text-center">No items available</p>
      ) : (
        <table className="display" id="inventoryTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Description</th>
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
            {modalMode === "add" ? "Add New Item" : "Edit Item"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formQuantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Form.Group>
            <br />
            <Button variant="primary" type="submit">
              {modalMode === "add" ? "Add Item" : "Update Item"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Inventory;
