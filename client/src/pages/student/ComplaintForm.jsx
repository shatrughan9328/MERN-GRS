import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
} from "lucide-react";

const ComplaintForm = () => {
  const navigate = useNavigate();

  const [complaintTypes, setComplaintTypes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    complaintType: "",
    complaint: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [analyzingDraft, setAnalyzingDraft] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  useEffect(() => {
    fetchComplaintTypes();
  }, []);

  const fetchComplaintTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/complaint-type");
      setComplaintTypes(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Run AI Preview for Category & Priority Insights
  const handleAiPreview = async () => {
    if (!formData.complaint || formData.complaint.trim().length < 10) {
      alert("Please enter at least 10 characters in the complaint description for AI analysis.");
      return;
    }

    setAnalyzingDraft(true);
    try {
      const selectedType = complaintTypes.find((t) => t._id === formData.complaintType);
      const res = await axios.post("http://localhost:5000/api/ai/preview", {
        text: `${formData.title ? formData.title + ": " : ""}${formData.complaint}`,
        categoryName: selectedType?.name || "",
      });

      if (res.data?.success && res.data?.data) {
        setAiPreview(res.data.data);
      }
    } catch (err) {
      console.error("AI preview failed:", err);
    } finally {
      setAnalyzingDraft(false);
    }
  };

  // Auto-apply AI recommended category if a matching category exists
  const applyRecommendedCategory = (recCatName) => {
    if (!recCatName) return;
    const matched = complaintTypes.find(
      (t) =>
        t.name.toLowerCase().includes(recCatName.toLowerCase()) ||
        recCatName.toLowerCase().includes(t.name.toLowerCase())
    );
    if (matched) {
      setFormData((prev) => ({ ...prev, complaintType: matched._id }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!formData.complaintType || !formData.complaint) {
      alert("Please select a complaint type and describe your grievance.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/complaint", {
        complaintType: formData.complaintType,
        complaint: formData.complaint,
        title: formData.title || formData.complaint.slice(0, 50),
        studentId: studentId,
      });

      if (res.data.msg === "Complaint Added Successfully") {
        const priority = res.data.data?.aiAnalysis?.priority || "LOW";
        alert(`Grievance submitted successfully!\nAI Initial Priority: ${priority}`);
        setFormData({
          title: "",
          complaintType: "",
          complaint: "",
        });
        navigate("/my-complaints");
      } else {
        alert(res.data.msg || "Complaint submission failed");
      }
    } catch (error) {
      console.log(error);
      alert("Complaint not submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "HIGH":
        return <span className="ai-priority-badge priority-high">HIGH PRIORITY</span>;
      case "MEDIUM":
        return <span className="ai-priority-badge priority-medium">MEDIUM PRIORITY</span>;
      case "LOW":
      default:
        return <span className="ai-priority-badge priority-low">LOW PRIORITY</span>;
    }
  };

  return (
    <div className="complaint-page">
      <div className="complaint-box">
        <div className="form-header-with-badge">
          <div>
            <h2>Lodge Grievance</h2>
            <p>Submit your issue for institutional review and redressal.</p>
          </div>
          <div className="ai-pill-badge">
            <Sparkles size={14} />
            <span>AI Powered</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Optional Grievance Title */}
          <label className="form-field-label">Grievance Subject / Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Wi-Fi outage in Lab 3 or Admit card error"
            value={formData.title}
            onChange={handleChange}
            className="grs-input-field"
          />

          {/* Grievance Category Selection */}
          <label className="form-field-label">
            Category / Cell <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="complaintType"
            value={formData.complaintType}
            onChange={handleChange}
            required
            className="grs-select-field"
          >
            <option value="">Select Category</option>
            {complaintTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>

          {/* Description Textarea */}
          <label className="form-field-label">
            Detailed Description <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            name="complaint"
            rows="6"
            placeholder="Describe your issue with specific location, date/time, and clear factual details..."
            value={formData.complaint}
            onChange={handleChange}
            required
            className="grs-textarea-field"
          ></textarea>

          {/* AI Pre-submission Assistant Bar */}
          <div className="ai-draft-trigger-bar">
            <button
              type="button"
              className="ai-analyze-draft-btn"
              onClick={handleAiPreview}
              disabled={analyzingDraft || !formData.complaint.trim()}
            >
              <Sparkles size={15} />
              <span>{analyzingDraft ? "Analyzing Draft..." : "Get AI Feedback & Priority Preview"}</span>
            </button>
            <span className="ai-hint-caption">
              Our AI evaluates urgency and suggests the optimal department.
            </span>
          </div>

          {/* AI Insights Card */}
          {aiPreview && (
            <div className={`ai-preview-card ${aiPreview.requiresUrgentReview ? "urgent-border" : ""}`}>
              <div className="ai-preview-header">
                <div className="ai-preview-title">
                  <Sparkles size={16} className="sparkle-accent" />
                  <h4>AI Pre-Analysis Insights</h4>
                </div>
                {getPriorityBadge(aiPreview.priority)}
              </div>

              {aiPreview.requiresUrgentReview && (
                <div className="ai-urgent-notice">
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Urgent Flag:</strong> This issue matches critical safety or welfare indicators and will be expedited for priority review.
                  </span>
                </div>
              )}

              <div className="ai-preview-details-grid">
                <div>
                  <span className="preview-label">Suggested Category</span>
                  <p className="preview-val">{aiPreview.category}</p>
                </div>
                <div>
                  <span className="preview-label">Recommended Department</span>
                  <p className="preview-val">{aiPreview.recommendedDepartment}</p>
                </div>
              </div>

              <div className="ai-preview-reason">
                <Lightbulb size={15} />
                <p>{aiPreview.reason}</p>
              </div>

              {/* Action to auto-apply category */}
              <div className="ai-preview-actions">
                <button
                  type="button"
                  className="ai-apply-cat-btn"
                  onClick={() => applyRecommendedCategory(aiPreview.category)}
                >
                  <span>Auto-Select Category: <strong>{aiPreview.category}</strong></span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="grs-submit-btn" disabled={submitting}>
            {submitting ? (
              <span>Submitting & Analyzing...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link to="/dashboard" className="back-link">
            ← Back to Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;