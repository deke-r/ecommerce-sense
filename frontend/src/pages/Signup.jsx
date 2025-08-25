"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authAPI } from "../services/api"

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const password = watch("password")

  const onSubmit = async (data) => {
    setError("")

    try {
      const response = await authAPI.signup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      navigate("/")
      window.location.reload() // Refresh to update navbar
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed")
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow rounded-4">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus display-4 text-blue"></i>
                <h2 className="mt-2">Sign Up</h2>
                <p className="text-muted">Create your account to get started.</p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control rounded-4 shadow-none py-2 ${errors.name ? "is-invalid" : ""}`}
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

                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control rounded-4 shadow-none py-2 ${errors.email ? "is-invalid" : ""}`}
                    id="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className={`form-control rounded-4 shadow-none py-2 ${errors.phone ? "is-invalid" : ""}`}
                    id="phone"
                    {...register("phone", {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be 10 digits",
                      },
                    })}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control rounded-4 shadow-none py-2 ${errors.password ? "is-invalid" : ""}`}
                    id="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label text-muted  ms-2 f_14 fw-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`form-control rounded-4 shadow-none py-2 ${errors.confirmPassword ? "is-invalid" : ""}`}
                    id="confirmPassword"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn bg-blue text-light py-2 rounded-4" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>

              <hr />

              <div className="text-center">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-decoration-none">
                  Login here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
