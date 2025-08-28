"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import styles from "../style/Addresses.module.css"

const Addresses = () => {
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ show: false, type: "", message: "" })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/address`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setAddresses(response.data.addresses)
        const defaultAddress = response.data.addresses.find((addr) => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
        return
      }
      showAlert("error", "Failed to fetch addresses")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    reset()
    setShowModal(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    Object.keys(address).forEach((key) => {
      setValue(key, address[key])
    })
    setShowModal(true)
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/address/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          showAlert("success", "Address deleted successfully")
          fetchAddresses()
          if (selectedAddressId === addressId) {
            setSelectedAddressId(null)
          }
        }
      } catch (error) {
        showAlert("error", "Failed to delete address")
      }
    }
  }

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token")
      const addressData = {
        ...data,
        is_default: selectedAddressId === null && addresses.length === 0,
      }

      let response
      if (editingAddress) {
        response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/address/${editingAddress.id}`,
          addressData,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      } else {
        response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/address`, addressData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      if (response.data.success) {
        showAlert("success", editingAddress ? "Address updated successfully" : "Address added successfully")
        setShowModal(false)
        reset()
        fetchAddresses()
      }
    } catch (error) {
      showAlert("error", editingAddress ? "Failed to update address" : "Failed to add address")
    }
  }

  const handleAddressSelect = async (addressId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/address/${addressId}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setSelectedAddressId(addressId)
      fetchAddresses()
    } catch (error) {
      showAlert("error", "Failed to update default address")
    }
  }

  if (loading) {
    return (
      <div className={`container mt-4 ${styles.loadingContainer}`}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`container mt-4 ${styles.addressesContainer}`}>
      {alert.show && (
        <div
          className={`alert alert-${alert.type === "error" ? "danger" : "success"} alert-dismissible fade show ${styles.alertCustom}`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ show: false, type: "", message: "" })}
          ></button>
        </div>
      )}

      <div className={`rounded-4 ${styles.header}`}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className={styles.pageTitle}>Saved Addresses</h4>
          <button className='btn  text-dark border-1 border border-dark f_14 rounded-4 fw-semibold' onClick={handleAddAddress}>
            + Add New Address
          </button>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className={`text-center py-5 ${styles.emptyState}`}>
          <i className="bi bi-geo-alt display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No addresses found</h4>
          <p className="text-muted">Add your first address to get started</p>
          <button className={styles.addButton} onClick={handleAddAddress}>
            Add Address
          </button>
        </div>
      ) : (
        <div>
          {addresses.some((addr) => addr.is_default) && (
            <div>
              <div className={`text-dark  f_13 fw-semibold mb-2 ms-2  text-uppercase`}>Default Address

              </div>
              {addresses
                .filter((address) => address.is_default)
                .map((address) => (
                    <div key={address.id} className={`rounded-4 ${styles.addressCard}`}>
                    <div className={styles.addressContent}>
                      <div className={styles.nameSection}>
                        <span className={`${styles.addressName} text-capitalize`}>{address.full_name}</span>
                        {/* <span className={`${styles.addressType} text-capitalize`}>HOME</span> */}
                      </div>
                      <div className={`${styles.addressDetails} text-capitalize`}>
                        <div>{address.street}</div>
                        <div>{address.landmark}</div>
                        <div>
                          {address.city} - {address.pincode}
                        </div>
                        <div className={`${styles.phoneNumber} text-capitalize`}>
                          Mobile: {address.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                ))}
            </div>
          )}

          {addresses.some((addr) => !addr.is_default) && (
            <div>
              <div className='text-dark f_13 fw-semibold mb-2 ms-2 text-uppercase'>Other addresses
              </div>
              {addresses
                .filter((address) => !address.is_default)
                .map((address) => (
                    <div key={address.id} className={`${styles.addressCard} text-capitalize`}>
                    <div className={styles.addressContent}>
                      <div className={styles.nameSection}>
                        <span className={`${styles.addressName} text-capitalize`}>
                          {address.full_name}
                        </span>
                        {/* <span className={`${styles.addressType} text-capitalize`}>HOME</span> */}
                      </div>
                      <div className={`${styles.addressDetails} text-capitalize`}>
                        <div>{address.street}</div>
                        <div>{address.landmark}</div>
                        <div>
                          {address.city} - {address.pincode}
                        </div>
                        <div>{address.state}</div>
                        <div className={`${styles.phoneNumber} text-capitalize`}>
                          Mobile: {address.phone}
                        </div>
                        <span
                          className={`${styles.makeDefaultText}  text-uppercase fw-semibold f_13 text-decoration-none`}
                          onClick={() => handleAddressSelect(address.id)}
                        >
                          Make This Default
                        </span>
                      </div>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} text-capitalize`}
                        onClick={() => handleEditAddress(address)}
                      >
                        Edit
                      </button>
                      <div className={styles.buttonDivider}></div>
                      <button
                        className={`${styles.actionButton} text-capitalize`}
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className={`modal show d-block ${styles.modalOverlay}`} tabIndex="-1">
          <div className="modal-dialog modal-lg rounded-4">
            <div className={`modal-content ${styles.modalContent}`}>
              <div className={`modal-header ${styles.modalHeader}`}>
                <h5 className="modal-title">{editingAddress ? "Edit Address" : "Add New Address"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={`modal-body ${styles.modalBody}`}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label  ms-2 f_14 fw-semibold ">Full Name *</label>
                      <input
                        type="text"
                        className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.full_name ? "is-invalid" : ""}`}
                        {...register("full_name", { required: "Full name is required" })}
                      />
                      {errors.full_name && <div className="invalid-feedback">{errors.full_name.message}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label  ms-2 f_14 fw-semibold ">Phone Number *</label>
                      <input
                        type="tel"
                        className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.phone ? "is-invalid" : ""}`}
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Please enter a valid 10-digit phone number",
                          },
                        })}
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label  ms-2 f_14 fw-semibold ">Street Address *</label>
                    <textarea
                      className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.street ? "is-invalid" : ""}`}
                      rows="2"
                      {...register("street", { required: "Street address is required" })}
                    ></textarea>
                    {errors.street && <div className="invalid-feedback">{errors.street.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label  ms-2 f_14 fw-semibold ">Landmark (Optional)</label>
                    <input type="text" className="form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted" {...register("landmark")} />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label  ms-2 f_14 fw-semibold ">City *</label>
                      <input
                        type="text"
                        className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.city ? "is-invalid" : ""}`}
                        {...register("city", { required: "City is required" })}
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label  ms-2 f_14 fw-semibold ">State *</label>
                      <input
                        type="text"
                        className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.state ? "is-invalid" : ""}`}
                        {...register("state", { required: "State is required" })}
                      />
                      {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label  ms-2 f_14 fw-semibold ">Pincode *</label>
                      <input
                        type="text"
                        className={`form-control rounded-4 shadow-none py-2 f_14 fw-semibold text-muted ${errors.pincode ? "is-invalid" : ""}`}
                        {...register("pincode", {
                          required: "Pincode is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Please enter a valid 6-digit pincode",
                          },
                        })}
                      />
                      {errors.pincode && <div className="invalid-feedback">{errors.pincode.message}</div>}
                    </div>
                  </div>
                </div>
                <div className={`modal-footer ${styles.modalFooter}`}>
                 
                  <button type="submit" className='btn bg-blue text-light f_14 rounded-4 fw-semibold w-100'>
                    {editingAddress ? "Update Address" : "Add Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses
