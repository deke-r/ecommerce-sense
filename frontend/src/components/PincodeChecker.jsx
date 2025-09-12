"use client";
import React, { useState } from "react";
import styles from "../style/PincodeChecker.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit Pincode");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        setResult(data[0].PostOffice[0]); // first PO details
      } else {
        setError("No details found for this Pincode");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className={`card shadow-sm ${styles.cardBox}`}>
            <div className="card-body">
              <h5 className="card-title text-center mb-3">Check Pincode Availability</h5>
              
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleCheck}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Check"}
                </button>
              </div>

              {error && <div className="alert alert-danger p-2">{error}</div>}

              {result && (
                <div className={`alert alert-success p-3 ${styles.resultBox}`}>
                  <h6 className="mb-2">Pincode: {pincode}</h6>
                  <p className="mb-1"><strong>Area:</strong> {result.Name}</p>
                  <p className="mb-1"><strong>District:</strong> {result.District}</p>
                  <p className="mb-1"><strong>State:</strong> {result.State}</p>
                  <p className="mb-0"><strong>Region:</strong> {result.Region}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
