import React, { useState } from "react";
import "./gallery.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Gallery = () => {
  
  
  const navigate = useNavigate(); // Initialize navigate function

  // Sample album data with placeholder funeral-related images
  const albums = [
    {
      id: 1,
      title: "Funeral Service Album 1",
      coverImage: "/gallery/funeral/fun_gallery (1)",
      images: [
        "/gallery/funeral/fun_gallery (1)",
        "/gallery/funeral/fun_gallery (2)",
        "/gallery/funeral/fun_gallery (3)",
        "/gallery/funeral/fun_gallery (4)",
        "/gallery/funeral/fun_gallery (5)",
        "/gallery/funeral/fun_gallery (6)",
        "/gallery/funeral/fun_gallery (7)",
        "/gallery/funeral/fun_gallery (8)",
        "/gallery/funeral/fun_gallery (9)",
        "/gallery/funeral/fun_gallery (10)",
        "/gallery/funeral/fun_gallery (11)",
        "/gallery/funeral/fun_gallery (12)",
        "/gallery/funeral/fun_gallery (13)",
        "/gallery/funeral/fun_gallery (14)",
        
      ],
    },
    {
      id: 2,
      title: "Funeral Service Album 2",
      coverImage: "/gallery/flower arrangement/flower_gallery(1)",
      images: [
        "/gallery/flower arrangement/flower_gallery(1)",
        "/gallery/flower arrangement/flower_gallery(2)",
        "/gallery/flower arrangement/flower_gallery(3)",
        "/gallery/flower arrangement/flower_gallery(4)",
        "/gallery/flower arrangement/flower_gallery(5)",
        "/gallery/flower arrangement/flower_gallery(6)",
        
      ],
    },
    {
      id: 3,
      title: "Funeral Service Album 3",
      coverImage: "/gallery/lights and cars/ lights(1)",
      images: [
        "/gallery/lights and cars/ lights(1)",
        "/gallery/lights and cars/ lights(2)",
        "/gallery/lights and cars/ lights(3)",
        "/gallery/lights and cars/ lights(4)",
        "/gallery/lights and cars/ lights(5)",
      ],
    },
  ];

  const [selectedAlbum, setSelectedAlbum] = useState(null); // No album selected by default
  const [previewImage, setPreviewImage] = useState(null); // No preview image by default
  const [thumbnailIndex, setThumbnailIndex] = useState(0); // For paginating thumbnails

  const thumbnailsPerPage = 3; // Limit number of thumbnails displayed per page

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setPreviewImage(album.images[0]); // Set the first image as the preview when an album is selected
    setThumbnailIndex(0); // Reset thumbnail index to show the first set
  };

  const handleThumbnailClick = (image) => {
    setPreviewImage(image);
  };

  const returnToGallery = () => {
    setSelectedAlbum(null); // Reset selected album
    setPreviewImage(null); // Reset preview image
  };

  const handleNext = () => {
    if (thumbnailIndex + thumbnailsPerPage < selectedAlbum.images.length) {
      setThumbnailIndex(thumbnailIndex + thumbnailsPerPage);
    }
  };

  const handlePrevious = () => {
    if (thumbnailIndex - thumbnailsPerPage >= 0) {
      setThumbnailIndex(thumbnailIndex - thumbnailsPerPage);
    }
  };

  return (
    <main className="main-content">
    <section className="gallery">
      <div>
        <h1 className="gallery-title">GALLERY</h1>
        <div className="gallery-border"></div>
      </div>
    </section>
    <section className="gallery-container">
      {!selectedAlbum ? (
        <div className="album-selector">
          {albums.map((album) => (
            <OverlayTrigger
              key={album.id} // Key is now on OverlayTrigger
              placement="right"
              overlay={<Tooltip>View Album</Tooltip>}
            >
              <div
                className="album-cover"
                onClick={() => handleAlbumClick(album)}
              >
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="album-image"
                />
                <p className="album-title">{album.title}</p>
              </div>
            </OverlayTrigger>
          ))}
        </div>
      ) : (
        <div className="album-preview">
          <div className="preview-container">
            <img src={previewImage} alt="Preview" className="preview-image" />
          </div>

          <div className="thumbnail-pagination">
            <button
              className="pagination-button"
              onClick={handlePrevious}
              disabled={thumbnailIndex === 0}
            >
              {"<"}
            </button>

            <div className="thumbnail-container">
              {selectedAlbum.images
                .slice(thumbnailIndex, thumbnailIndex + thumbnailsPerPage)
                .map((image) => (
                  <img
                    key={image} // Use `image` URL as the key
                    src={image}
                    alt="Thumbnail"
                    className={`thumbnail ${
                      previewImage === image ? "active" : ""
                    }`}
                    onClick={() => handleThumbnailClick(image)}
                  />
                ))}
            </div>

            <button
              className="pagination-button"
              onClick={handleNext}
              disabled={
                thumbnailIndex + thumbnailsPerPage >=
                selectedAlbum.images.length
              }
            >
              {">"}
            </button>
          </div>

          <OverlayTrigger
            placement="right"
            overlay={<Tooltip>Return to Album View</Tooltip>}
          >
            <button className="return-button" onClick={returnToGallery}>
              Return to Album Gallery
            </button>
          </OverlayTrigger>
        </div>
      )}
    </section>
    </main>
  );
};

export default Gallery;
