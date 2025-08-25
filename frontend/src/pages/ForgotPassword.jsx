"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { authAPI } from "../services/api"

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [email, setEmail] = useState("")

  const emailForm = useForm()
  const otpForm = useForm()
  const passwordForm = useForm()

  // Watch password field for confirmation validation
  const newPassword = passwordForm.watch("newPassword")

  const handleEmailSubmit = async (data) => {
    setError("")
    setEmail(data.email)

    try {
      const response = await authAPI.forgotPassword(data.email)
      setSuccess("OTP sent to your email. Please check your inbox.")
      setStep(2)
      // In development, show the OTP in console
      if (response.data.otp) {
        console.log("OTP:", response.data.otp)
        alert(`Development Mode - OTP: ${response.data.otp}`)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP")
    }
  }

  const handleOTPSubmit = async (data) => {
    setError("")

    try {
      await authAPI.verifyOTP(email, data.otp)
      setSuccess("OTP verified successfully. Please set your new password.")
      setStep(3)
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP")
    }
  }

  const handlePasswordSubmit = async (data) => {
    setError("")

    try {
      await authAPI.resetPassword(email, otpForm.getValues("otp"), data.newPassword)
      setSuccess("Password reset successfully. You can now login with your new password.")
      setStep(4)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password")
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow rounded-4">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-key display-4 text-primary"></i>
                <h2 className="mt-2">Reset Password</h2>
                <p className="text-muted">
                  {step === 1 && "Enter your email to receive OTP"}
                  {step === 2 && "Enter the OTP sent to your email"}
                  {step === 3 && "Set your new password"}
                  {step === 4 && "Password reset complete"}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-muted  ms-2 f_14 fw-semibold ">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control rounded-4 shadow-none py-2 ${emailForm.formState.errors.email ? "is-invalid" : ""}`}
                      id="email"
                      {...emailForm.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {emailForm.formState.errors.email && (
                      <div className="invalid-feedback">{emailForm.formState.errors.email.message}</div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn  text-light bg-blue rounded-4 py-2" disabled={emailForm.formState.isSubmitting}>
                      {emailForm.formState.isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label text-muted  ms-2 f_14 fw-semibold">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      className={`form-control rounded-4 shadow-none py-2 ${otpForm.formState.errors.otp ? "is-invalid" : ""}`}
                      id="otp"
                      maxLength="6"
                      {...otpForm.register("otp", {
                        required: "OTP is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "OTP must be 6 digits",
                        },
                      })}
                    />
                    {otpForm.formState.errors.otp && (
                      <div className="invalid-feedback">{otpForm.formState.errors.otp.message}</div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn text-light bg-blue rounded-4 py-2" disabled={otpForm.formState.isSubmitting}>
                      {otpForm.formState.isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label text-muted  ms-2 f_14 fw-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      className={`form-control rounded-4 shadow-none py-2 ${passwordForm.formState.errors.newPassword ? "is-invalid" : ""}`}
                      id="newPassword"
                      {...passwordForm.register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <div className="invalid-feedback">{passwordForm.formState.errors.newPassword.message}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label text-muted  ms-2 f_14 fw-semibold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className={`form-control rounded-4 shadow-none py-2 ${passwordForm.formState.errors.confirmPassword ? "is-invalid" : ""}`}
                      id="confirmPassword"
                      {...passwordForm.register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) => value === newPassword || "Passwords do not match",
                      })}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <div className="invalid-feedback">{passwordForm.formState.errors.confirmPassword.message}</div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn text-light bg-blue rounded-4 py-2" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div className="text-center">
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Password reset successfully!
                  </div>
                  <Link to="/login" className="btn text-light bg-blue rounded-4 py-2">
                    Go to Login
                  </Link>
                </div>
              )}

              <hr />

              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
