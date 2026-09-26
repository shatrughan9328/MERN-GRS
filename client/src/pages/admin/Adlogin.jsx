import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Adlogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        formData
      );

      alert(res.data.msg);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "Admin");

        navigate("/admin-dashboard");
      }
    } catch (error) {
      console.log(error);
      alert("Admin Login Failed");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">

        <div className="admin-login-left">
          <h1>GRS Admin</h1>

          <p>
            Manage student grievances, complaint types,
            colleges, sessions and complaint status from
            one centralized dashboard.
          </p>

          <Link to="/">
            <button className="admin-home-btn">
              Back to Home
            </button>
          </Link>
        </div>

        <div className="admin-login-right">
          <h2>Admin Login</h2>

          <p>
            Login to access the administration panel.
          </p>

          <form onSubmit={handleSubmit}>

            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit">
              Login as Admin
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Adlogin;