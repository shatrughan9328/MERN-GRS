import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  X,
  Sparkles,
  Building,
  Eye,
  AlertTriangle,
  RotateCcw,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [overridePriority, setOverridePriority] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [assignedDept, setAssignedDept] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/complaint");
      setComplaints(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (selectedComplaint) {
      const p =
        selectedComplaint.priorityOverride?.priority ||
        selectedComplaint.aiAnalysis?.priority ||
        "LOW";
      const d =
        selectedComplaint.departmentAssignment?.department ||
        selectedComplaint.aiAnalysis?.recommendedDepartment ||
        "General Administration";
      setOverridePriority(p);
      setOverrideReason(selectedComplaint.priorityOverride?.reason || "");
      setAssignedDept(d);
      setFeedbackMsg("");
    }
  }, [selectedComplaint]);

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/complaint/status/${id}`,
        { status: status }
      );
      if (res.data?.data) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status } : c))
        );
        if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint((prev) => ({ ...prev, status }));
        }
      }
    } catch (error) {
      console.log(error);
      alert("Status update failed");
    }
  };

  const getStatusText = (status) => {
    if (status === "notProcessed") return "Not Processed";
    if (status === "pending") return "Pending";
    if (status === "closed") return "Closed";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "notProcessed") return "not-processed";
    if (status === "pending") return "pending";
    if (status === "closed") return "resolved";
    return "";
  };

  const getPriorityBadge = (item) => {
    const priority =
      item.priorityOverride?.priority || item.aiAnalysis?.priority || "LOW";
    const isOverridden = Boolean(item.priorityOverride?.priority);

    switch (priority) {
      case "HIGH":
        return (
          <span className="ai-priority-badge priority-high">
            HIGH {isOverridden && <span className="override-tag">OVERRIDE</span>}
          </span>
        );
      case "MEDIUM":
        return (
          <span className="ai-priority-badge priority-medium">
            MEDIUM {isOverridden && <span className="override-tag">OVERRIDE</span>}
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="ai-priority-badge priority-low">
            LOW {isOverridden && <span className="override-tag">OVERRIDE</span>}
          </span>
        );
    }
  };

  // Admin Priority Override
  const handleSavePriorityOverride = async () => {
    if (!selectedComplaint) return;
    const token = localStorage.getItem("token");

    setActionLoading(true);
    setFeedbackMsg("");
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/complaint/${selectedComplaint._id}/priority-override`,
        {
          priority: overridePriority,
          reason: overrideReason || "Manual administrative adjustment.",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setFeedbackMsg("Priority override saved successfully.");
        setSelectedComplaint(res.data.data);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to save priority override.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Assign Department
  const handleAssignDepartment = async () => {
    if (!selectedComplaint) return;
    const token = localStorage.getItem("token");

    setActionLoading(true);
    setFeedbackMsg("");
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/complaint/${selectedComplaint._id}/assign-department`,
        {
          department: assignedDept,
          status: "confirmed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setFeedbackMsg("Department routing confirmed.");
        setSelectedComplaint(res.data.data);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to assign department.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Retry AI
  const handleRetryAi = async () => {
    if (!selectedComplaint) return;
    const token = localStorage.getItem("token");

    setActionLoading(true);
    setFeedbackMsg("");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaint/${selectedComplaint._id}/retry-ai`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setFeedbackMsg("AI analysis re-evaluated successfully.");
        setSelectedComplaint(res.data.data);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to retry AI analysis.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter complaints
  const filtered = complaints.filter((item) => {
    const studentName = item.studentId?.name || "";
    const text = item.complaint || "";
    const categoryName = item.complaintType?.name || item.aiAnalysis?.category || "";
    const dept =
      item.departmentAssignment?.department ||
      item.aiAnalysis?.recommendedDepartment ||
      "";
    const priority =
      item.priorityOverride?.priority || item.aiAnalysis?.priority || "LOW";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "URGENT"
        ? item.aiAnalysis?.requiresUrgentReview
        : priority === priorityFilter);
    const matchesCategory =
      categoryFilter === "all" ||
      categoryName.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(
      complaints
        .map((c) => c.complaintType?.name || c.aiAnalysis?.category)
        .filter(Boolean)
    )
  );

  return (
    <div className="admin-list-page">
      <div className="admin-list-container">
        {/* Header */}
        <div className="admin-list-header">
          <div>
            <h2>Executive Grievances Desk</h2>
            <p>
              Comprehensive AI triage, priority inspection, and departmental resolution workflows.
            </p>
          </div>

          <Link to="/admin-dashboard">
            <button className="banner-secondary-btn">← Back to Dashboard</button>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="admin-triage-filter-box">
          <div className="topbar-search" style={{ maxWidth: "300px", width: "100%" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search student, keyword, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-select-group">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
              <option value="URGENT">⚠️ Urgent Review Flagged</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="notProcessed">Not Processed</option>
              <option value="pending">Under Review</option>
              <option value="closed">Resolved / Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Box */}
        <div className="admin-table-box">
          <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "18%" }}>Student</th>
                <th style={{ width: "27%" }}>Grievance Content</th>
                <th style={{ width: "12%" }}>AI Priority</th>
                <th style={{ width: "16%" }}>Department</th>
                <th style={{ width: "11%" }}>Status</th>
                <th style={{ width: "11%" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px" }}>
                    Loading complaints...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const dept =
                    item.departmentAssignment?.department ||
                    item.aiAnalysis?.recommendedDepartment ||
                    "General Administration";

                  return (
                    <tr key={item._id} className="table-row-hover">
                      <td>{index + 1}</td>

                      <td>
                        <div className="student-meta-cell">
                          <div className="student-mini-avatar">
                            {item.studentId?.name
                              ? item.studentId.name.charAt(0).toUpperCase()
                              : "S"}
                          </div>
                          <div className="student-meta-info">
                            <span className="student-meta-name">
                              {item.studentId?.name || "Unassigned"}
                            </span>
                            <span className="student-meta-sub">
                              {item.studentId?.email || ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="complaint-cell">
                          <span className="complaint-text" title={item.complaint}>
                            {item.complaint}
                          </span>
                          <div className="complaint-tags-row">
                            <span className="mini-cat-tag">
                              {item.complaintType?.name || item.aiAnalysis?.category || "General"}
                            </span>
                            {item.aiAnalysis?.requiresUrgentReview && (
                              <span className="mini-urgent-tag">
                                ⚠️ Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>{getPriorityBadge(item)}</td>

                      <td>
                        <span className="dept-tag">
                          <Building size={12} />
                          <span>{dept}</span>
                        </span>
                      </td>

                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item._id, e.target.value)}
                          className={`status-dropdown ${getStatusClass(item.status)}`}
                        >
                          <option value="notProcessed">Not Processed</option>
                          <option value="pending">Under Review</option>
                          <option value="closed">Resolved</option>
                        </select>
                      </td>

                      <td className="text-center">
                        <button
                          className="inspect-ai-btn"
                          onClick={() => setSelectedComplaint(item)}
                          title="Review AI recommendation, priority override & routing"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px" }}>
                    No complaints match the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== COMPREHENSIVE AI MODAL ===================== */}
      {selectedComplaint && (
        <div
          className="grs-modal-backdrop"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="grs-modal-card ai-admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={18} className="sparkle-accent" />
                <h3>Grievance Intelligence & Redressal Console</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {feedbackMsg && (
                <div className="modal-feedback-toast">
                  <CheckCircle2 size={16} />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {selectedComplaint.aiAnalysis?.requiresUrgentReview && (
                <div className="modal-urgent-banner">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Urgent Review Alert:</strong> AI detected critical indicators
                    requiring prompt administrative attention.
                  </div>
                </div>
              )}

              <div className="modal-info-row">
                <div className="info-field">
                  <label>Student</label>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
                    {selectedComplaint.studentId?.name || "Unassigned"}
                  </p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {selectedComplaint.studentId?.email || ""}
                  </span>
                </div>

                <div className="info-field">
                  <label>Category</label>
                  <span className="category-pill">
                    {selectedComplaint.complaintType?.name || selectedComplaint.aiAnalysis?.category || "General"}
                  </span>
                </div>

                <div className="info-field">
                  <label>Effective Priority</label>
                  <div>{getPriorityBadge(selectedComplaint)}</div>
                </div>
              </div>

              <div className="modal-desc-box">
                <label>Grievance Description</label>
                <p>{selectedComplaint.complaint}</p>
              </div>

              {/* AI Details Card */}
              <div className="modal-ai-box">
                <div className="modal-ai-title">
                  <Sparkles size={16} className="sparkle-accent" />
                  <h4>AI Redressal Recommendation</h4>
                  <span className="ai-model-tag">
                    Model: {selectedComplaint.aiAnalysis?.model || "NLP Heuristic"}
                  </span>
                </div>

                <div className="modal-ai-details-grid">
                  <div>
                    <span className="detail-label">Predicted Priority:</span>
                    <strong style={{ marginLeft: "6px" }}>
                      {selectedComplaint.aiAnalysis?.priority || "LOW"}
                    </strong>
                  </div>
                  <div>
                    <span className="detail-label">Confidence:</span>
                    <strong style={{ marginLeft: "6px" }}>
                      {Math.round((selectedComplaint.aiAnalysis?.confidence || 0.85) * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="detail-label">Recommended Department:</span>
                    <strong style={{ marginLeft: "6px" }}>
                      {selectedComplaint.aiAnalysis?.recommendedDepartment || "General Administration"}
                    </strong>
                  </div>
                </div>

                <div className="modal-ai-reason">
                  <span className="detail-label">Reasoning:</span>
                  <p style={{ margin: "4px 0 0" }}>
                    {selectedComplaint.aiAnalysis?.reason ||
                      "Automated prioritization generated based on grievance text semantics."}
                  </p>
                </div>
              </div>

              {/* Override Note */}
              {selectedComplaint.priorityOverride?.priority && (
                <div className="priority-audit-note">
                  <Check size={14} />
                  <span>
                    <strong>Priority Overridden to {selectedComplaint.priorityOverride.priority}:</strong>{" "}
                    by {selectedComplaint.priorityOverride.changedByName || "Administrator"} on{" "}
                    {new Date(selectedComplaint.priorityOverride.changedAt).toLocaleString()}
                    {selectedComplaint.priorityOverride.reason && ` ("${selectedComplaint.priorityOverride.reason}")`}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="modal-actions-panel">
                <h4>Administrative Actions</h4>

                <div className="admin-actions-split">
                  <div className="action-subgroup">
                    <label>Priority Override</label>
                    <select
                      value={overridePriority}
                      onChange={(e) => setOverridePriority(e.target.value)}
                      className="modal-select-field"
                    >
                      <option value="HIGH">HIGH Priority</option>
                      <option value="MEDIUM">MEDIUM Priority</option>
                      <option value="LOW">LOW Priority</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Reason for change"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="modal-input-field"
                      style={{ marginTop: "6px" }}
                    />

                    <button
                      className="btn-apply-override"
                      onClick={handleSavePriorityOverride}
                      disabled={actionLoading}
                    >
                      Update Priority
                    </button>
                  </div>

                  <div className="action-subgroup">
                    <label>Department Routing</label>
                    <select
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="modal-select-field"
                    >
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Estate & Infrastructure">Estate & Infrastructure</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="IT & Systems">IT & Systems</option>
                      <option value="Student Welfare & Hostel Cell">Student Welfare & Hostel Cell</option>
                      <option value="Disciplinary & Safety Committee">Disciplinary & Safety Committee</option>
                      <option value="Internal Complaints Committee (ICC)">Internal Complaints Committee (ICC)</option>
                      <option value="General Administration">General Administration</option>
                    </select>

                    <button
                      className="btn-confirm-dept"
                      onClick={handleAssignDepartment}
                      disabled={actionLoading}
                      style={{ marginTop: "6px" }}
                    >
                      <Building size={14} />
                      <span>Confirm Department</span>
                    </button>
                  </div>
                </div>

                <div className="modal-status-workflow-bar">
                  <div className="workflow-status-select-wrap">
                    <label>Update Status:</label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => {
                        updateStatus(selectedComplaint._id, e.target.value);
                        setSelectedComplaint((prev) => ({ ...prev, status: e.target.value }));
                      }}
                      className="modal-status-select"
                    >
                      <option value="notProcessed">Not Processed</option>
                      <option value="pending">Under Review</option>
                      <option value="closed">Resolved</option>
                    </select>
                  </div>

                  <button
                    className="btn-retry-ai"
                    onClick={handleRetryAi}
                    disabled={actionLoading}
                  >
                    <RotateCcw size={14} />
                    <span>Re-Evaluate AI</span>
                  </button>
                </div>
              </div>

              <div className="modal-ticket-id">
                <span>Ticket ID: </span>
                <code>{selectedComplaint._id}</code>
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

export default Complaints;