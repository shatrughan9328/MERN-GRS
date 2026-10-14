import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  X,
  Building,
  ShieldAlert,
} from "lucide-react";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    fetchComplaints(studentId);
  }, [navigate]);

  const fetchComplaints = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/complaint/student/${studentId}`
      );
      setComplaints(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "closed":
        return "Resolved";
      case "pending":
        return "Under Review";
      case "notProcessed":
      default:
        return "Not Processed";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "closed":
        return (
          <span className="status-badge status-resolved">
            <span className="status-dot"></span>
            Resolved
          </span>
        );
      case "pending":
        return (
          <span className="status-badge status-pending">
            <span className="status-dot"></span>
            Under Review
          </span>
        );
      case "notProcessed":
      default:
        return (
          <span className="status-badge status-not-processed">
            <span className="status-dot"></span>
            Not Processed
          </span>
        );
    }
  };

  const getPriorityBadge = (item) => {
    const priority = item.priorityOverride?.priority || item.aiAnalysis?.priority || "LOW";
    switch (priority) {
      case "HIGH":
        return (
          <span className="ai-priority-badge priority-high" title="Flagged for prompt attention">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="ai-priority-badge priority-medium">
            MEDIUM
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="ai-priority-badge priority-low">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="my-complaints-page">
      <div className="complaints-container">
        <div className="complaints-header">
          <div>
            <h2>My Grievances</h2>
            <p>Track progress, priority ratings, and institutional responses.</p>
          </div>

          <Link to="/submit-complaint">
            <button className="primary-action-btn">+ Lodge Grievance</button>
          </Link>
        </div>

        <div className="complaints-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: "6%" }}>#</th>
                <th style={{ width: "34%" }}>Grievance Description</th>
                <th style={{ width: "16%" }}>Category</th>
                <th style={{ width: "12%" }}>AI Priority</th>
                <th style={{ width: "18%" }}>Assigned Cell</th>
                <th style={{ width: "14%" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "36px" }}>
                    Loading your grievances...
                  </td>
                </tr>
              ) : complaints.length > 0 ? (
                complaints.map((item, index) => (
                  <tr
                    key={item._id}
                    className="clickable-row"
                    onClick={() => setSelectedComplaint(item)}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="complaint-desc-cell">
                        <span className="desc-main-text" title={item.complaint}>
                          {item.complaint}
                        </span>
                        <span className="desc-date">
                          Filed on {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">
                        {item.complaintType?.name || item.aiAnalysis?.category || "General"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {getPriorityBadge(item)}
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">
                        <Building size={12} />
                        <span>
                          {item.departmentAssignment?.department ||
                            item.aiAnalysis?.recommendedDepartment ||
                            "General Administration"}
                        </span>
                      </span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="grs-empty-state">
                      <FileText size={36} />
                      <h4>No Grievances Lodged Yet</h4>
                      <p>You have not registered any grievance tickets in the system.</p>
                      <Link to="/submit-complaint" style={{ marginTop: "12px", display: "inline-block" }}>
                        Submit your first grievance →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link to="/dashboard" className="back-dashboard">
          ← Back to Student Dashboard
        </Link>
      </div>

      {/* Grievance Quick Inspection Modal */}
      {selectedComplaint && (
        <div
          className="grs-modal-backdrop"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="grs-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={18} className="sparkle-accent" />
                <h3>Grievance Details & AI Redressal Track</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info-row">
                <div className="info-field">
                  <label>Status</label>
                  <div>{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div className="info-field">
                  <label>Assigned Priority</label>
                  <div>{getPriorityBadge(selectedComplaint)}</div>
                </div>
                <div className="info-field">
                  <label>Designated Cell</label>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>
                    {selectedComplaint.departmentAssignment?.department ||
                      selectedComplaint.aiAnalysis?.recommendedDepartment ||
                      "General Administration"}
                  </p>
                </div>
              </div>

              <div className="modal-desc-box">
                <label>Grievance Text</label>
                <p>{selectedComplaint.complaint}</p>
              </div>

              {/* AI Justification */}
              {selectedComplaint.aiAnalysis?.reason && (
                <div className="modal-ai-box">
                  <div className="modal-ai-title">
                    <Sparkles size={14} />
                    <span>AI Redressal Justification</span>
                  </div>
                  <p>{selectedComplaint.aiAnalysis.reason}</p>
                </div>
              )}

              <div className="modal-ticket-id">
                <span>Ticket ID: </span>
                <code>{selectedComplaint._id}</code>
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
                  Submitted on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-dismiss-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;