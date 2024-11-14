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
      coverImage: "https://via.placeholder.com/300x200?text=Album+Cover+1",
      images: [
        "https://via.placeholder.com/800x600?text=Funeral+Service+1",
        "https://via.placeholder.com/800x600?text=Funeral+Service+2",
        "https://via.placeholder.com/800x600?text=Funeral+Service+3",
        "https://via.placeholder.com/800x600?text=Funeral+Service+4",
      ],
    },
    {
      id: 2,
      title: "Funeral Service Album 2",
      coverImage: "https://via.placeholder.com/300x200?text=Album+Cover+2",
      images: [
        "https://via.placeholder.com/800x600?text=Funeral+Service+5",
        "https://via.placeholder.com/800x600?text=Funeral+Service+6",
        "https://via.placeholder.com/800x600?text=Funeral+Service+7",
        "https://via.placeholder.com/800x600?text=Funeral+Service+8",
      ],
    },
    {
      id: 3,
      title: "Funeral Service Album 3",
      coverImage: "https://via.placeholder.com/300x200?text=Album+Cover+3",
      images: [
        "https://via.placeholder.com/800x600?text=Funeral+Service+9",
        "https://via.placeholder.com/800x600?text=Funeral+Service+10",
        "https://via.placeholder.com/800x600?text=Funeral+Service+11",
        "https://via.placeholder.com/800x600?text=Funeral+Service+12",
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
    <section className="gallery-container section content-user">
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
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip>Return to Album View</Tooltip>}
          >
            <button className="return-button" onClick={returnToGallery}>
              Return to Album Gallery
            </button>
          </OverlayTrigger>
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
        </div>
      )}
    </section>
  );
};

export default Gallery;
