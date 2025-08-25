import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card">
            <div className="card-body py-5">
              <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
              <h1 className="display-4 mt-3">404</h1>
              <h3>Page Not Found</h3>
              <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
              <Link to="/" className="btn btn-primary">
                <i className="bi bi-house me-2"></i>
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
