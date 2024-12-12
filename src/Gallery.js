import "./gallery.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import "./gallery.css"; // Import CSS file for styling
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { dba } from "./firebase.js"; // Adjust path to your Firebase config
import Loader from "./Loader.js";
const Gallery = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const thumbnailsPerPage = 3; // Limit number of thumbnails displayed per page

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsRef = collection(dba, "content");
        const q = query(albumsRef, where("page", "==", "gallery"));
        const querySnapshot = await getDocs(q);

        const storage = getStorage();
        const fetchedAlbums = [];

        for (const doc of querySnapshot.docs) {
          const albumData = doc.data();
          const albumId = doc.id;

          // Fetch cover image
          const coverImagesRef = ref(
            storage,
            `content/gallery/${albumId}/thumbnailImage`
          );
          const coverImageUrls = await listAll(coverImagesRef).then((result) =>
            Promise.all(result.items.map((item) => getDownloadURL(item)))
          );

          // Fetch album images
          const albumImagesRef = ref(
            storage,
            `content/gallery/${albumId}/album`
          );
          const albumImageUrls = await listAll(albumImagesRef).then((result) =>
            Promise.all(result.items.map((item) => getDownloadURL(item)))
          );

          fetchedAlbums.push({
            id: albumId,
            title: albumData.title || "Untitled Album",
            coverImage: coverImageUrls[0], // Assuming one cover image per album
            images: albumImageUrls,
          });
        }

        setAlbums(fetchedAlbums);
        console.log(albums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

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
      {loading && <Loader />} {/* Use the Loader component here */}
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
