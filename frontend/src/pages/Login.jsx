"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authAPI } from "../services/api"

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setError("")

    try {
      const response = await authAPI.login(data)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      navigate("/")
      window.location.reload() // Refresh to update navbar
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow rounded-4">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle display-4 text-blue"></i>
                <h2 className="mt-2">Login</h2>
                <p className="text-muted">Welcome back! Please login to your account.</p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
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
                <label htmlFor="password" className="form-label text-muted ms-2 f_14 fw-semibold">
                  Password
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control rounded-4 shadow-none py-2 pe-5 ${errors.password ? "is-invalid" : ""}`}
                    id="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="btn position-absolute border-0 top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} fs-5`}></i>
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>

                <div className="d-grid">
                  <button type="submit" className="btn bg-blue text-light rounded-4 py-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <Link to="/forgot-password" className="text-decoration-none f_14">
                  Forgot Password?
                </Link>
              </div>

              <hr />

              <div className="text-center">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/signup" className="text-decoration-none">
                  Sign up here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
