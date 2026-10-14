import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

const Adlogin = () => {
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
      email: "admin@grs.com",
      password: "admin123",
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        formData
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "Admin");

        navigate("/admin-dashboard");
      } else {
        setErrorMsg(res.data.msg || "Invalid admin credentials.");
      }
    } catch (error) {
      console.log(error);
      setErrorMsg("Failed to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container admin-auth-theme">
      <div className="admin-split-card">
        {/* Left Side: Executive Brand Panel */}
        <div className="admin-split-left">
          <div className="admin-badge-row">
            <div className="admin-shield-emblem">
              <ShieldAlert size={32} />
            </div>
            <span className="executive-tag">EXECUTIVE CONSOLE</span>
          </div>

          <h1>GRS Administration</h1>

          <p className="admin-tagline">
            Centralized grievance intelligence, automated AI severity triage,
            departmental ticket routing, and SLA compliance control.
          </p>

          <div className="admin-features-list">
            <div className="feature-item">
              <CheckCircle2 size={16} />
              <span>Automated AI Prioritization (High / Med / Low)</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={16} />
              <span>Intelligent Department & Cell Routing</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={16} />
              <span>Priority Override Audit Logging</span>
            </div>
          </div>

          <div className="admin-left-footer">
            <Link to="/" className="admin-back-btn">
              <ArrowLeft size={15} />
              <span>Return to Public Home</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="admin-split-right">
          <div className="admin-form-header">
            <h2>Admin Sign In</h2>
            <p>Enter your institutional administrator credentials to authenticate.</p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="auth-error-banner">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Fill */}
          <div className="auth-demo-helper">
            <div className="demo-helper-left">
              <Sparkles size={14} className="sparkle-accent" />
              <span>Default admin account:</span>
            </div>
            <button
              type="button"
              className="demo-fill-btn admin-demo-btn"
              onClick={handleQuickFill}
              title="Auto-fill default admin credentials"
            >
              <KeyRound size={13} />
              <span>Fill Default Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-body">
            {/* Email Field */}
            <div className="auth-input-group">
              <label>Administrator Email</label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. admin@grs.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <label>Administrator Password</label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter administrator password"
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
              className="auth-primary-submit-btn admin-submit-btn"
              disabled={loading}
            >
              <span>{loading ? "Verifying Credentials..." : "Authenticate as Administrator"}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="admin-footer-sub">
            <p>Protected institutional session with encrypted token verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adlogin;