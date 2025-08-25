"use client"

import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
                  <h3 className="mt-3">Something went wrong</h3>
                  <p className="text-muted">
                    We're sorry, but something unexpected happened. Please refresh the page and try again.
                  </p>
                  <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
