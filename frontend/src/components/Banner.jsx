import React, { useState, useEffect } from "react"
import { carouselAPI } from "../services/adminAPI"

export const Banner = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCarouselImages()
  }, [])

  const fetchCarouselImages = async () => {
    try {
      const response = await carouselAPI.getActive()
      setImages(response.data.images)
    } catch (error) {
      console.error("Error fetching carousel images:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="container-fluid">
        <div className="row mx-md-1">

    <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            {image.link_url ? (
              <a href={image.link_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={image.image_url}
                  className="d-block w-100 "
                  alt={image.title || `Carousel image ${index + 1}`}
                  style={{ height: "450px", objectFit: "cover" }}
                />
              </a>
            ) : (
              <img
                src={image.image_url}
                className="d-block w-100 "
                alt={image.title || `Carousel image ${index + 1}`}
                style={{ height: "450px", objectFit: "cover" }}
              />
            )}
            {(image.title || image.description) && (
              <div className="carousel-caption d-none text-uppercase bg-dark bg-opacity-50 rounded-3 p-2 d-md-block">
                {image.title && <h5>{image.title}</h5>}
                {image.description && <p>{image.description}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleFade"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
    </div>
    </div>

  )
}
