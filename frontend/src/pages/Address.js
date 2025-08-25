"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { addressAPI, ordersAPI } from "../services/api"

const Address = () => {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll()
      setAddresses(response.data.addresses)
      if (response.data.addresses.length > 0) {
        setSelectedAddress(response.data.addresses[0].id)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await addressAPI.create(data)
      reset()
      setShowForm(false)
      fetchAddresses()
    } catch (error) {
      console.error("Error adding address:", error)
      alert("Error adding address")
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address")
      return
    }

    setPlacing(true)
    try {
      const response = await ordersAPI.create(selectedAddress)
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Order placed successfully!")
      navigate("/orders")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Error placing order")
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button className="btn btn-link p-0" onClick={() => navigate("/")}>
                  Home
                </button>
              </li>
              <li className="breadcrumb-item">
                <button className="btn btn-link p-0" onClick={() => navigate("/cart")}>
                  Cart
                </button>
              </li>
              <li className="breadcrumb-item active">Address</li>
            </ol>
          </nav>
          <h2 className="mb-4">
            <i className="bi bi-geo-alt me-2"></i>
            Select Delivery Address
          </h2>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Saved Addresses</h5>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                <i className="bi bi-plus-circle me-1"></i>
                Add New Address
              </button>
            </div>
            <div className="card-body">
              {showForm && (
                <form onSubmit={handleSubmit(onSubmit)} className="mb-4 p-3 bg-light rounded">
                  <h6 className="mb-3">Add New Address</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        id="name"
                        {...register("name", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        id="phone"
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be 10 digits",
                          },
                        })}
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="street" className="form-label">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.street ? "is-invalid" : ""}`}
                      id="street"
                      {...register("street", {
                        required: "Street address is required",
                        minLength: {
                          value: 5,
                          message: "Street address must be at least 5 characters",
                        },
                      })}
                    />
                    {errors.street && <div className="invalid-feedback">{errors.street.message}</div>}
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="city" className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? "is-invalid" : ""}`}
                        id="city"
                        {...register("city", {
                          required: "City is required",
                          minLength: {
                            value: 2,
                            message: "City must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="pincode" className="form-label">
                        Pincode
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                        id="pincode"
                        {...register("pincode", {
                          required: "Pincode is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Pincode must be 6 digits",
                          },
                        })}
                      />
                      {errors.pincode && <div className="invalid-feedback">{errors.pincode.message}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="state" className="form-label">
                        State
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.state ? "is-invalid" : ""}`}
                        id="state"
                        {...register("state", {
                          required: "State is required",
                          minLength: {
                            value: 2,
                            message: "State must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Address"
                      )}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-geo-alt display-4 text-muted"></i>
                  <p className="text-muted mt-2">No addresses saved. Please add a new address.</p>
                </div>
              ) : (
                <div className="row">
                  {addresses.map((address) => (
                    <div key={address.id} className="col-md-6 mb-3">
                      <div
                        className={`card h-100 ${selectedAddress === address.id ? "border-primary" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <div className="card-body">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="address"
                              checked={selectedAddress === address.id}
                              onChange={() => setSelectedAddress(address.id)}
                            />
                            <label className="form-check-label">
                              <strong>{address.name}</strong>
                            </label>
                          </div>
                          <p className="mb-1">{address.phone}</p>
                          <p className="mb-0 text-muted">
                            {address.street}, {address.city}
                            <br />
                            {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">Review your order and place it.</p>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || placing}
                >
                  {placing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Place Order
                    </>
                  )}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/cart")}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Address
