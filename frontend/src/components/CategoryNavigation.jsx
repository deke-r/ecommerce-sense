"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import styles from "../style/CategoryNavigation.module.css"
import { useNavigate } from "react-router-dom"

const CategoryNavigation = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const navigate = useNavigate()


    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/categories`)


            setCategories(response.data.categories)

        } catch (err) {
            setError(err.response?.data?.message || err.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryClick = (id, name) => {
        const encodedName = encodeURIComponent(name) // safe encode for URL
        navigate(`/products/${id}/${encodedName}`)
      }

    if (loading) {
        return (
            <div className="container-fluid py-3">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-fluid py-3">
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-danger" role="alert">
                            Error loading categories: {error}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid py-3">
            <div className="row mx-md-1">
                <div className="col-12">
                    <div
                        className={`${styles.categoryContainer} d-flex flex-wrap justify-content-center justify-content-md-start gap-3`}
                    >
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className={`${styles.categoryItem} d-flex flex-column align-items-center text-decoration-none`}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleCategoryClick(category.id, category.name)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleCategoryClick(category.id)
                                    }
                                }}

                            >
                                <div className={styles.categoryImageContainer}>
                                    <img
                                        src={`${process.env.REACT_APP_IMAGE_URL}/${category.image_url}`}
                                        alt={category.name}
                                        className={`${styles.categoryImage} img-fluid`}
                                    // onError={(e) => {
                                    //   e.target.src = "/abstract-categories.png"
                                    // }}
                                    />
                                </div>
                                <span className={`${styles.categoryLabel} text-center mt-2 fw-semibold`}>{category.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryNavigation
