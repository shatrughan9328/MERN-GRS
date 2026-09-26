import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
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
        "http://localhost:5000/api/student/login",
        formData
      );

      alert(res.data.msg);

      if (res.data.msg === "Login Successfully") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("studentId", res.data.id);
        localStorage.setItem("role", res.data.role);

        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert("Login Failed");
    }
  };

  return (
    <div className="form-page">
      <div className="form-box login-box">
        <h2>Student Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;