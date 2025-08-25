const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const spinnerSize = size === "sm" ? "spinner-border-sm" : size === "lg" ? "spinner-border-lg" : ""

  return (
    <div className="text-center p-4">
      <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="mt-2 text-muted">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
