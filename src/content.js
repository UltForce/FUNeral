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
  getExistingContentSections,
  uploadImage2,
  getExistingPlans,
  addContent2,
  deleteContent2,
  updateGalleryContent,
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
  const [contents, setContents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    id: "",
    page: "", // Can be faqs or terms
    title: "",
    body: "",
    inclusions: "",
    price: 0,
    section: "",
    planDetails: "",
  });
  const [selectedPage, setSelectedPage] = useState(formData.page);
  const [existingContentSections, setExistingContentSections] = useState([]);
  const [itemImage, setItemImage] = useState(null);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [albumImage, setAlbumImage] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);

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
      setContents(data);
      setLoading(false); // Hide loader after data is fetched
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const sections = await getExistingContentSections();
      setExistingContentSections(sections);
    };
    const fetchPlans = async () => {
      const plans = await getExistingPlans();
      setExistingPlans(plans);
    };
    fetchPlans();
    fetchSections();
  }, []);

  useEffect(() => {
    if (contents.length > 0) {
      if ($.fn.DataTable.isDataTable("#contentTable")) {
        $("#contentTable").DataTable().destroy(); // Destroy existing instance before re-initializing
      }

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
  }, [contents]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowModal = (mode, item = null, event = null) => {
    setModalMode(mode);
    setSelectedContent(item);
    setFormData({
      page: item?.page || "",
      title: item?.title || "",
      body: item?.body || "",
      inclusions: item?.inclusions || "",
      price: item?.price || "",
      section: item?.section || "",
      planType: item?.planType || "",
      planDetails: item?.planDetails || "",
      thumbnailUrl: item?.thumbnailUrl || "",
      albumUrls: item?.albumUrls || "",
    });
    setSelectedPage(item?.page || "");
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
          console.log(selectedPage);
          if (selectedPage === "services") {
            const imageUrl = await uploadImage2(
              itemImage,
              "services",
              selectedContent.id,
              selectedContent.planType
            );
            const plans = await getExistingPlans();
            setExistingPlans(plans);
            await updateContent(selectedContent.id, { ...formData, imageUrl });
          } else if (selectedPage === "blogs") {
            const imageUrl = await uploadImage2(
              itemImage,
              "blog",
              selectedContent.id
            );
            await updateContent(selectedContent.id, { ...formData, imageUrl });
          } else if (selectedPage === "home") {
            const imageUrl = await uploadImage2(
              itemImage,
              "home",
              selectedContent.id
            );
            const sections = await getExistingContentSections();
            setExistingContentSections(sections);
            await updateContent(selectedContent.id, { ...formData, imageUrl });
          } else if (selectedPage === "footer" || selectedPage === "plan") {
            const sections = await getExistingContentSections();
            setExistingContentSections(sections);
            await updateContent(selectedContent.id, formData);
          } else if (selectedPage === "gallery") {
            const documentId = await updateGalleryContent(
              selectedContent.id,
              formData,
              thumbnailImage, // Single thumbnail image
              albumImage, // Multiple album images
              "gallery" // Page type (gallery)
            );
            delete formData.image; // Remove the file object from formData to avoid storing it
          }
          console.log(selectedPage);
          Swal.fire("updated!", "Content updated successfully", "success").then(
            (result) => {
              if (result.isConfirmed) {
                Toast.fire({
                  icon: "success",
                  title: "Content updated successfully",
                });
              }
            }
          );
        } else {
          const userId = getCurrentUserId();
          const event = {
            type: "Content",
            userId: userId,
            details: "Admin added a content",
          };
          if (selectedPage === "blogs") {
            const documentId = await addContent(formData, itemImage, "blog");
            delete formData.image; // Remove the file object from formData to avoid storing it
          } else if (selectedPage === "services") {
            const documentId = await addContent(
              formData,
              itemImage,
              "services",
              formData.planType
            );
            delete formData.image; // Remove the file object from formData to avoid storing it
            const plans = await getExistingPlans();
            setExistingPlans(plans);
          } else if (selectedPage === "home") {
            const documentId = await addContent(formData, itemImage, "home");
            delete formData.image; // Remove the file object from formData to avoid storing it
            const sections = await getExistingContentSections();
            setExistingContentSections(sections);
          } else if (selectedPage === "gallery") {
            const documentId = await addContent2(
              formData,
              thumbnailImage, // Single thumbnail image
              albumImage, // Multiple album images
              "gallery" // Page type (gallery)
            );
            delete formData.image; // Remove the file object from formData to avoid storing it
          } else {
            const documentId = await addContent(formData);
          }
          if (selectedPage === "footer" || selectedPage === "plan") {
            const sections = await getExistingContentSections();
            setExistingContentSections(sections);
          }
          AuditLogger({ event });

          Swal.fire("added!", "Content added successfully", "success").then(
            (result) => {
              if (result.isConfirmed) {
                Toast.fire({
                  icon: "success",
                  title: "Content added successfully",
                });
              }
            }
          );
        }
        const data = await getContent();
        setContents(data);
        // Destroy the current DataTable instance before updating
        if ($.fn.DataTable.isDataTable("#contentTable")) {
          $("#contentTable").DataTable().destroy();
        }
        handleCloseModal();
        setLoading(false); // Set loading state to true
      } catch (error) {
        console.error("Error managing content:", error.message);
        alert("An error occurred while managing content.");
      }
    }
  };

  const handleDelete = async (id, page) => {
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
        if (page === "gallery") {
          await deleteContent2(id);
        } else {
          await deleteContent(id);
        }

        Swal.fire("deleted!", "Content deleted successfully", "success").then(
          (result) => {
            if (result.isConfirmed) {
              Toast.fire({
                icon: "success",
                title: "Content deleted successfully",
              });
            }
          }
        );

        // Destroy DataTable before updating the state
        if ($.fn.DataTable.isDataTable("#contentTable")) {
          $("#contentTable").DataTable().destroy();
        }
        setContents((prevContents) =>
          prevContents.filter((content) => content.id !== id)
        );
        setLoading(false); // Set loading state to true
      } catch (error) {
        console.error("Error deleting content:", error.message);
        alert("An error occurred while deleting content.");
      }
    }
  };

  const handlePageChange = (e) => {
    const { value } = e.target;
    setSelectedPage(value);
    handleFormChange(e); // Update the form data state
  };

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleThumbnailChange = (e) => {
    setThumbnailImage(e.target.files[0]);
  };

  const handleAlbumChange = (e) => {
    // Convert to array if it's not already an array (it could be a single file or multiple files)
    setAlbumImage(Array.from(e.target.files));
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
        {contents.length === 0 ? (
          <p className="text-center">No content available</p>
        ) : (
          <table className="display" id="contentTable">
            <thead>
              <tr>
                <th>Page</th>
                <th>Title</th>
                <th>Section</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => (
                <tr key={content.id}>
                  <td>{content.page}</td>
                  <td>{content.title || "N/A"}</td>
                  <td>{content.section || "N/A"}</td>
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
                            handleShowModal("edit", content, event);
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
                            // Pass content.id and content.page to handleDelete
                            handleDelete(content.id, content.page, event);
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
              {/* Page Selector */}

              <Form.Group controlId="formPage">
                <Form.Label className="label-title">Page</Form.Label>
                <Form.Control
                  as="select"
                  className="input-details"
                  name="page"
                  value={modalMode === "edit" ? formData.page : selectedPage}
                  onChange={handlePageChange}
                  placeholder="Select a Page"
                  disabled={modalMode === "edit"}
                  required
                >
                  <option value="">Select a Page</option>
                  <option value="faqs">FAQs</option>
                  <option value="terms">Terms and Conditions</option>
                  <option value="home">Home Page</option>
                  <option value="gallery">Gallery Page</option>
                  <option value="blogs">Blogs and Articles</option>
                  <option value="footer">Footers</option>
                  <option value="about">About Us</option>
                  <option value="services">Services Page</option>
                  <option value="plan">Funeral Planning Guide</option>
                </Form.Control>
              </Form.Group>

              <br />
              {/* Section Selector for Home or Footer */}
              {["home", "footer"].includes(selectedPage) && (
                <Form.Group controlId="formSection">
                  <Form.Label className="label-title">Section</Form.Label>
                  <Form.Control
                    as="select"
                    className="input-details"
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                    required
                  >
                    {selectedPage === "home" && (
                      <>
                        {[
                          { value: "", label: "Select a section" },
                          { value: "homepage1", label: "Homepage 1" },
                          { value: "homepage2", label: "Homepage 2" },
                          { value: "homepage3", label: "Homepage 3" },
                          { value: "homepage4", label: "Homepage 4" },
                          { value: "ourServices1", label: "Our Services 1" },
                          { value: "ourServices2", label: "Our Services 2" },
                          { value: "ourServices3", label: "Our Services 3" },
                          { value: "ourServices4", label: "Our Services 4" },
                          { value: "ourServices5", label: "Our Services 5" },
                          { value: "ourServices6", label: "Our Services 6" },
                        ].map((section) => (
                          <option
                            key={section.value}
                            value={section.value}
                            disabled={existingContentSections.includes(
                              section.value
                            )}
                          >
                            {section.value === ""
                              ? section.label // Don't add "Already exists" for the empty value
                              : existingContentSections.includes(section.value)
                              ? `${section.label} - Already exists`
                              : section.label}
                          </option>
                        ))}
                      </>
                    )}
                    {selectedPage === "footer" && (
                      <>
                        {[
                          { value: "", label: "Select a section" },
                          { value: "section1", label: "Section 1" },
                          { value: "section2", label: "Section 2" },
                          { value: "section3", label: "Section 3" },
                          { value: "section4", label: "Section 4" },
                          { value: "section5", label: "Section 5" },
                        ].map((section) => (
                          <option
                            key={section.value}
                            value={section.value}
                            disabled={existingContentSections.includes(
                              section.value
                            )}
                          >
                            {section.value === ""
                              ? section.label // Don't add "Already exists" for the empty value
                              : existingContentSections.includes(section.value)
                              ? `${section.label} - Already exists`
                              : section.label}
                          </option>
                        ))}
                      </>
                    )}
                  </Form.Control>
                </Form.Group>
              )}
              {["home"].includes(selectedPage) && (
                <Form.Group controlId="formImage">
                  <Form.Label className="label-title">Image</Form.Label>
                  <Form.Control
                    type="file"
                    className="input-details"
                    name="image"
                    onChange={handleImageChange}
                    required
                  />
                </Form.Group>
              )}
              {/* Plan Selector for Services */}
              {selectedPage === "services" && modalMode !== "edit" && (
                <Form.Group controlId="formPlanType">
                  <Form.Label className="label-title">Plan</Form.Label>
                  <Form.Control
                    as="select"
                    className="input-details"
                    name="planType" // Correct name attribute
                    value={formData.planType} // Correct state property
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a Plan</option>
                    <option
                      value="plan 1"
                      disabled={existingPlans.includes("plan 1")}
                    >
                      {existingPlans.includes("plan 1")
                        ? "Plan 1 - Basic - Already exists"
                        : "Plan 1 - Basic"}
                    </option>
                    <option
                      value="plan 2"
                      disabled={existingPlans.includes("plan 2")}
                    >
                      {existingPlans.includes("plan 2")
                        ? "Plan 2 - Garden - Already exists"
                        : "Plan 2 - Garden"}
                    </option>
                    <option
                      value="plan 3"
                      disabled={existingPlans.includes("plan 3")}
                    >
                      {existingPlans.includes("plan 3")
                        ? "Plan 3 - Garbo - Already exists"
                        : "Plan 3 - Garbo"}
                    </option>
                  </Form.Control>
                </Form.Group>
              )}

              {/* Step Selector for Funeral Planning Guide */}
              {selectedPage === "plan" && (
                <Form.Group controlId="formStep">
                  <Form.Label className="label-title">Step</Form.Label>
                  <Form.Control
                    as="select"
                    className="input-details"
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a step number</option>
                    <option
                      value="step1"
                      disabled={existingContentSections.includes("step1")}
                    >
                      {existingContentSections.includes("step1")
                        ? "Step 1 - Already exists"
                        : "Step 1"}
                    </option>
                    <option
                      value="step2"
                      disabled={existingContentSections.includes("step2")}
                    >
                      {existingContentSections.includes("step2")
                        ? "Step 2 - Already exists"
                        : "Step 2"}
                    </option>
                    <option
                      value="step3"
                      disabled={existingContentSections.includes("step3")}
                    >
                      {existingContentSections.includes("step3")
                        ? "Step 3 - Already exists"
                        : "Step 3"}
                    </option>
                    <option
                      value="step4"
                      disabled={existingContentSections.includes("step4")}
                    >
                      {existingContentSections.includes("step4")
                        ? "Step 4 - Already exists"
                        : "Step 4"}
                    </option>
                    <option
                      value="step5"
                      disabled={existingContentSections.includes("step5")}
                    >
                      {existingContentSections.includes("step5")
                        ? "Step 5 - Already exists"
                        : "Step 5"}
                    </option>
                  </Form.Control>
                </Form.Group>
              )}

              {/* Title and Content for Specific Pages */}
              {["faqs", "terms", "home", "footer", "about"].includes(
                selectedPage
              ) && (
                <>
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
                    <Form.Label className="label-title">Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      className="input-details"
                      name="body"
                      value={formData.body}
                      onChange={handleFormChange}
                      required
                      rows="10"
                    />
                  </Form.Group>
                  <br />
                </>
              )}

              {/* Gallery Page */}
              {selectedPage === "gallery" && (
                <>
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
                  <Form.Group controlId="formThumbnail">
                    <Form.Label className="label-title">
                      Thumbnail Image
                    </Form.Label>
                    <Form.Control
                      type="file"
                      className="input-details"
                      name="thumbnail"
                      onChange={handleThumbnailChange}
                      required
                    />
                  </Form.Group>
                  <br />
                  <Form.Group controlId="formImages">
                    <Form.Label className="label-title">Images</Form.Label>
                    <Form.Control
                      type="file"
                      className="input-details"
                      name="images"
                      onChange={handleAlbumChange}
                      multiple
                    />
                  </Form.Group>
                  <br />
                </>
              )}

              {/* Blogs and Articles */}
              {selectedPage === "blogs" && (
                <>
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
                  <Form.Group controlId="formImage">
                    <Form.Label className="label-title">Image</Form.Label>
                    <Form.Control
                      type="file"
                      className="input-details"
                      name="image"
                      onChange={handleImageChange}
                      required
                    />
                  </Form.Group>
                  <br />
                  <Form.Group controlId="formBody">
                    <Form.Label className="label-title">Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      className="input-details"
                      name="body"
                      value={formData.body}
                      onChange={handleFormChange}
                      required
                      rows="10"
                    />
                  </Form.Group>
                  <br />
                </>
              )}

              {/* Services Page */}
              {selectedPage === "services" && (
                <>
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
                  <Form.Group controlId="formImage">
                    <Form.Label className="label-title">Image</Form.Label>
                    <Form.Control
                      type="file"
                      className="input-details"
                      name="image"
                      onChange={handleImageChange}
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
                  <Form.Group controlId="formInclusions">
                    <Form.Label className="label-title">Inclusions</Form.Label>
                    <Form.Control
                      as="textarea"
                      className="input-details"
                      name="inclusions"
                      value={formData.inclusions}
                      onChange={handleFormChange}
                      required
                      rows="5"
                    />
                  </Form.Group>
                  <br />
                </>
              )}

              {selectedPage === "plan" && (
                <Form.Group controlId="formPlan">
                  <Form.Label className="label-title">Plan Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    className="input-details"
                    name="planDetails"
                    value={formData.planDetails}
                    onChange={handleFormChange}
                    placeholder={`Enter JSON for structured content, e.g.:
{
  "step1": {
    "title": "Step 1: Set Appointment",
    "description": "This is the first and crucial step...",
    "userPerspective": [
      {
        "title": "Login/Registration",
        "items": ["Register for an account...", "Login can be simplified..."]
      }
    ],
    "managerPerspective": [
      {
        "title": "Receive Appointment Request",
        "items": ["Review the appointment...", "Validate the requested dates..."]
      }
    ]
  }
}`}
                    required
                    rows="10"
                  />
                </Form.Group>
              )}

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
