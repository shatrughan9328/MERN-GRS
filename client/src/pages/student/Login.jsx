import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleQuickFill = () => {
    setFormData({
      email: "rahul@gmail.com",
      password: "student123",
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/login",
        formData
      );

      if (res.data.msg === "Login Successfully") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("studentId", res.data.id);
        localStorage.setItem("role", res.data.role);

        navigate("/dashboard");
      } else {
        setErrorMsg(res.data.msg || "Invalid email or password.");
      }
    } catch (error) {
      console.log(error);
      setErrorMsg("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-box student-auth-card">
        {/* Header with Icon */}
        <div className="auth-card-header">
          <div className="auth-brand-badge student-badge-theme">
            <ShieldCheck size={28} />
          </div>
          <h2>Student Portal Login</h2>
          <p>Access your grievance tracker, lodge issues, and chat with AI Redressal.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-error-banner">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Fill Helper */}
        <div className="auth-demo-helper">
          <div className="demo-helper-left">
            <Sparkles size={14} className="sparkle-accent" />
            <span>Need sample login?</span>
          </div>
          <button
            type="button"
            className="demo-fill-btn"
            onClick={handleQuickFill}
            title="Auto-fill sample student credentials"
          >
            <UserCheck size={13} />
            <span>Fill Demo Student</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          {/* Email Field */}
          <div className="auth-input-group">
            <label>Registered Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={17} className="auth-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="e.g. rahul@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-input-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={17} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-primary-submit-btn student-submit-btn"
            disabled={loading}
          >
            <span>{loading ? "Authenticating..." : "Sign In to Student Portal"}</span>
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer-links">
          <p className="auth-register-text">
            Don't have a student account?{" "}
            <Link to="/register" className="auth-accent-link">
              Register here
            </Link>
          </p>

          <Link to="/" className="auth-back-home-link">
            <ArrowLeft size={14} />
            <span>Back to Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;