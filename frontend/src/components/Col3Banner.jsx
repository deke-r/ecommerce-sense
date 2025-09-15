import React, { useEffect, useState } from "react";
import axios from "axios";

const Col3Banner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/banners`)
      .then((res) => setBanners(res.data))
      .catch((err) => console.error("Error loading banners:", err));
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        {banners.map((banner) => (
          <div key={banner.id} className="col-md-4">
            <img
              src={`${process.env.REACT_APP_IMAGE_URL}${banner.image_url}`}
              className="d-block w-100"
              style={{ height: "250px", objectFit: "cover" }}
              alt="banner"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Col3Banner;
