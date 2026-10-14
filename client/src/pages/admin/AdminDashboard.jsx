import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useOutletContext } from "react-router-dom";
import {
  ClipboardList,
  Tag,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Eye,
  ExternalLink,
  Users,
  Search,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";

const AdminDashboard = () => {
  const outletContext = useOutletContext() || {};
  const { complaints = [], students = [], loading = false, refreshData } = outletContext;

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Admin action states inside modal
  const [overridePriority, setOverridePriority] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [assignedDept, setAssignedDept] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // When selected complaint changes, sync modal state
  useEffect(() => {
    if (selectedComplaint) {
      const currentPriority =
        selectedComplaint.priorityOverride?.priority ||
        selectedComplaint.aiAnalysis?.priority ||
        "LOW";
      const currentDept =
        selectedComplaint.departmentAssignment?.department ||
        selectedComplaint.aiAnalysis?.recommendedDepartment ||
        "General Administration";

      setOverridePriority(currentPriority);
      setOverrideReason(selectedComplaint.priorityOverride?.reason || "");
      setAssignedDept(currentDept);
      setFeedbackMsg("");
    }
  }, [selectedComplaint]);

  // Compute Metrics from Real Authorized Data
  const totalCount = complaints.length;

  const highCount = complaints.filter(
    (c) => (c.priorityOverride?.priority || c.aiAnalysis?.priority) === "HIGH"
  ).length;

  const medCount = complaints.filter(
    (c) => (c.priorityOverride?.priority || c.aiAnalysis?.priority) === "MEDIUM"
  ).length;

  const lowCount = complaints.filter(
    (c) =>
      (c.priorityOverride?.priority || c.aiAnalysis?.priority) === "LOW" ||
      !(c.priorityOverride?.priority || c.aiAnalysis?.priority)
  ).length;

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const notProcessedCount = complaints.filter((c) => c.status === "notProcessed").length;
  const closedCount = complaints.filter((c) => c.status === "closed").length;
  const awaitingReviewCount = pendingCount + notProcessedCount;

  const aiAnalyzedCount = complaints.filter(
    (c) => c.aiAnalysis?.status === "success" || c.aiAnalysis?.status === "fallback"
  ).length;

  const urgentReviewCount = complaints.filter(
    (c) => c.aiAnalysis?.requiresUrgentReview
  ).length;

  // Department distribution
  const departmentCounts = {};
  complaints.forEach((c) => {
    const d =
      c.departmentAssignment?.department ||
      c.aiAnalysis?.recommendedDepartment ||
      "General Administration";
    departmentCounts[d] = (departmentCounts[d] || 0) + 1;
  });

  // Filter complaints
  const filteredComplaints = complaints.filter((item) => {
    const studentName = item.studentId?.name || "";
    const complaintText = item.complaint || "";
    const typeName = item.complaintType?.name || "";
    const dept =
      item.departmentAssignment?.department ||
      item.aiAnalysis?.recommendedDepartment ||
      "";
    const itemPriority =
      item.priorityOverride?.priority || item.aiAnalysis?.priority || "LOW";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaintText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "URGENT"
        ? item.aiAnalysis?.requiresUrgentReview
        : itemPriority === priorityFilter);

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  // Admin Action: Save Priority Override
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
          reason: overrideReason || "Administrative re-assessment.",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setFeedbackMsg("Priority override saved successfully.");
        setSelectedComplaint(res.data.data);
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to save priority override.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Action: Confirm or Assign Department
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setFeedbackMsg("Department confirmed successfully.");
        setSelectedComplaint(res.data.data);
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to update department.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Action: Retry AI Analysis
  const handleRetryAi = async () => {
    if (!selectedComplaint) return;
    const token = localStorage.getItem("token");

    setActionLoading(true);
    setFeedbackMsg("");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaint/${selectedComplaint._id}/retry-ai`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setFeedbackMsg("AI analysis re-evaluated successfully.");
        setSelectedComplaint(res.data.data);
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to retry AI analysis.");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Action: Quick Update Status
  const handleUpdateStatus = async (statusVal) => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/complaint/status/${selectedComplaint._id}`,
        { status: statusVal }
      );
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setFeedbackMsg(`Status updated to ${statusVal}.`);
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Admin Welcome Banner */}
      <div className="grs-welcome-banner admin-banner">
        <div className="banner-content">
          <div className="banner-pill">
            <Sparkles size={14} />
            <span>AI-Powered Executive Grievance Console</span>
          </div>
          <h2>
            Grievance Redressal <span className="banner-name">Intelligence HQ</span>
          </h2>
          <p>
            Real-time automated ticket prioritization, smart department routing,
            urgent safety mitigation, and institutional resolution SLAs.
          </p>
          <div className="banner-actions">
            <Link to="/admin-complaints" className="banner-primary-btn">
              <ClipboardList size={17} />
              <span>Grievance Desk</span>
            </Link>
            <Link to="/admin-complaint-types" className="banner-secondary-btn">
              <Tag size={17} />
              <span>Complaint Categories</span>
            </Link>
          </div>
        </div>
        <div className="banner-graphic">
          <div className="shield-emblem admin-shield">
            <ShieldAlert size={72} />
          </div>
        </div>
      </div>

      {/* ===================== AI KPI SUMMARY CARDS ===================== */}
      <div className="grs-stats-grid ai-kpi-grid">
        {/* Total Complaints */}
        <div className="grs-stat-card card-total">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <FileText size={22} />
            </div>
            <span className="stat-badge total-badge">All Tickets</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : totalCount}</span>
            <h3 className="stat-title">Total Complaints</h3>
            <p className="stat-desc">All registered cases in database</p>
          </div>
        </div>

        {/* High Priority Complaints */}
        <div className="grs-stat-card card-high-priority">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper high-priority-icon">
              <ShieldAlert size={22} />
            </div>
            <span className="stat-badge high-badge">Urgent Attention</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number text-high">{loading ? "..." : highCount}</span>
            <h3 className="stat-title">High Priority</h3>
            <p className="stat-desc">Safety & urgent disruption cases</p>
          </div>
        </div>

        {/* Medium Priority */}
        <div className="grs-stat-card card-pending">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Clock size={22} />
            </div>
            <span className="stat-badge pending-badge">Timely Review</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number text-medium">{loading ? "..." : medCount}</span>
            <h3 className="stat-title">Medium Priority</h3>
            <p className="stat-desc">Academic & accounts disruptions</p>
          </div>
        </div>

        {/* Low Priority */}
        <div className="grs-stat-card card-low-priority">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper low-priority-icon">
              <Layers size={22} />
            </div>
            <span className="stat-badge low-badge">Routine</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number text-low">{loading ? "..." : lowCount}</span>
            <h3 className="stat-title">Low Priority</h3>
            <p className="stat-desc">General suggestions & maintenance</p>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="grs-stat-card card-awaiting">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Activity size={22} />
            </div>
            <span className="stat-badge awaiting-badge">Active Queue</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : awaitingReviewCount}</span>
            <h3 className="stat-title">Awaiting Review</h3>
            <p className="stat-desc">Unprocessed or in committee review</p>
          </div>
        </div>

        {/* AI Analyzed Tickets */}
        <div className="grs-stat-card card-ai-analyzed">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper ai-analyzed-icon">
              <Sparkles size={22} />
            </div>
            <span className="stat-badge ai-badge">AI Powered</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number text-ai">{loading ? "..." : aiAnalyzedCount}</span>
            <h3 className="stat-title">AI Analyzed</h3>
            <p className="stat-desc">Automatic NLP priority & routing</p>
          </div>
        </div>

        {/* Urgent Safety Review Flag */}
        <div className="grs-stat-card card-urgent-alert">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper urgent-icon">
              <AlertTriangle size={22} />
            </div>
            <span className="stat-badge urgent-badge">Human Review</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number text-urgent">{loading ? "..." : urgentReviewCount}</span>
            <h3 className="stat-title">Urgent Review</h3>
            <p className="stat-desc">Safety & harassment alerts</p>
          </div>
        </div>
      </div>

      {/* ===================== AI ANALYTICS & VISUAL METERS ===================== */}
      <div className="ai-analytics-section">
        <div className="section-header">
          <div>
            <h2>AI Redressal Analytics</h2>
            <p>Live workload distribution, automated priority metrics, and department queues</p>
          </div>
        </div>

        <div className="analytics-visual-grid">
          {/* Card 1: Priority Distribution Meter */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div className="analytics-card-title">
                <BarChart3 size={18} />
                <h3>Priority Distribution</h3>
              </div>
              <span className="analytics-sub">Automated & Overridden</span>
            </div>

            <div className="priority-meter-wrap">
              {/* Stacked Bar */}
              <div className="multi-progress-bar">
                <div
                  className="bar-seg high"
                  style={{
                    width: `${totalCount > 0 ? (highCount / totalCount) * 100 : 0}%`,
                  }}
                  title={`High: ${highCount}`}
                ></div>
                <div
                  className="bar-seg medium"
                  style={{
                    width: `${totalCount > 0 ? (medCount / totalCount) * 100 : 0}%`,
                  }}
                  title={`Medium: ${medCount}`}
                ></div>
                <div
                  className="bar-seg low"
                  style={{
                    width: `${totalCount > 0 ? (lowCount / totalCount) * 100 : 0}%`,
                  }}
                  title={`Low: ${lowCount}`}
                ></div>
              </div>

              {/* Legend & Stats */}
              <div className="priority-legend-grid">
                <div className="legend-item">
                  <div className="legend-indicator high-dot"></div>
                  <div className="legend-text">
                    <span className="legend-name">High Priority</span>
                    <span className="legend-val">
                      {highCount} (
                      {totalCount > 0 ? Math.round((highCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="legend-item">
                  <div className="legend-indicator medium-dot"></div>
                  <div className="legend-text">
                    <span className="legend-name">Medium Priority</span>
                    <span className="legend-val">
                      {medCount} (
                      {totalCount > 0 ? Math.round((medCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="legend-item">
                  <div className="legend-indicator low-dot"></div>
                  <div className="legend-text">
                    <span className="legend-name">Low Priority</span>
                    <span className="legend-val">
                      {lowCount} (
                      {totalCount > 0 ? Math.round((lowCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Department Workload Distribution */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div className="analytics-card-title">
                <Building size={18} />
                <h3>Department Routing</h3>
              </div>
              <span className="analytics-sub">Recommended & Confirmed</span>
            </div>

            <div className="dept-distribution-list">
              {Object.keys(departmentCounts).length > 0 ? (
                Object.entries(departmentCounts).map(([dept, count]) => {
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={dept} className="dept-dist-row">
                      <div className="dept-dist-info">
                        <span className="dept-dist-name">{dept}</span>
                        <span className="dept-dist-count">
                          {count} tickets ({pct}%)
                        </span>
                      </div>
                      <div className="dept-dist-bar">
                        <div
                          className="dept-dist-fill"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  No complaints categorized yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== COMPLAINT MANAGEMENT TABLE ===================== */}
      <div className="grs-recent-section">
        <div className="recent-header">
          <div className="recent-header-titles">
            <h2>Grievance Triage & Resolution Table</h2>
            <p>Inspect AI prioritization, override assignments, and manage resolution workflows</p>
          </div>

          <div className="recent-controls">
            {/* Filter Pills */}
            <div className="status-filter-pills">
              <button
                className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({totalCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Under Review ({pendingCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "notProcessed" ? "active" : ""}`}
                onClick={() => setStatusFilter("notProcessed")}
              >
                Unprocessed ({notProcessedCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "closed" ? "active" : ""}`}
                onClick={() => setStatusFilter("closed")}
              >
                Resolved ({closedCount})
              </button>
            </div>

            <Link to="/admin-complaints" className="view-all-link">
              <span>Full Complaints Desk</span>
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>

        {/* Priority & Search Filters Bar */}
        <div className="table-filter-bar">
          <div className="topbar-search" style={{ maxWidth: "340px", width: "100%" }}>
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

          <div className="priority-quick-filters">
            <span className="filter-label">Priority Filter:</span>
            <button
              className={`p-filter-btn ${priorityFilter === "all" ? "active" : ""}`}
              onClick={() => setPriorityFilter("all")}
            >
              All
            </button>
            <button
              className={`p-filter-btn high ${priorityFilter === "HIGH" ? "active" : ""}`}
              onClick={() => setPriorityFilter("HIGH")}
            >
              High ({highCount})
            </button>
            <button
              className={`p-filter-btn medium ${priorityFilter === "MEDIUM" ? "active" : ""}`}
              onClick={() => setPriorityFilter("MEDIUM")}
            >
              Medium ({medCount})
            </button>
            <button
              className={`p-filter-btn low ${priorityFilter === "LOW" ? "active" : ""}`}
              onClick={() => setPriorityFilter("LOW")}
            >
              Low ({lowCount})
            </button>
            {urgentReviewCount > 0 && (
              <button
                className={`p-filter-btn urgent ${priorityFilter === "URGENT" ? "active" : ""}`}
                onClick={() => setPriorityFilter("URGENT")}
              >
                ⚠️ Urgent Review ({urgentReviewCount})
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="grs-table-container">
          <table className="grs-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Student</th>
                <th style={{ width: "28%" }}>Grievance Summary</th>
                <th style={{ width: "13%" }}>AI Priority</th>
                <th style={{ width: "15%" }}>Department</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "12%" }} className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((item) => {
                  const dept =
                    item.departmentAssignment?.department ||
                    item.aiAnalysis?.recommendedDepartment ||
                    "General Administration";

                  return (
                    <tr key={item._id} className="table-row-hover">
                      <td>
                        <div className="student-meta-cell">
                          <div className="student-mini-avatar">
                            {item.studentId?.name
                              ? item.studentId.name.charAt(0).toUpperCase()
                              : "S"}
                          </div>
                          <div className="student-meta-info">
                            <span className="student-meta-name">
                              {item.studentId?.name || "Unassigned Student"}
                            </span>
                            <span className="student-meta-sub">
                              {item.studentId?.email || "No email"}
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

                      <td>{getStatusBadge(item.status)}</td>

                      <td className="text-center">
                        <button
                          className="inspect-ai-btn"
                          title="Inspect AI Insights & Override"
                          onClick={() => setSelectedComplaint(item)}
                        >
                          <Eye size={15} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="grs-empty-state">
                      <FileText size={38} />
                      <h4>No Grievances Match Selection</h4>
                      <p>
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                          ? "Try modifying your search or clearing the priority and status filters."
                          : "No student grievances have been registered in the system."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== COMPREHENSIVE AI INSPECTION & OVERRIDE MODAL ===================== */}
      {selectedComplaint && (
        <div
          className="grs-modal-backdrop"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="grs-modal-card ai-admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={20} className="sparkle-accent" />
                <h3>Grievance Intelligence & Redressal Console</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {feedbackMsg && (
                <div className="modal-feedback-toast">
                  <CheckCircle2 size={16} />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* Urgent Review Banner */}
              {selectedComplaint.aiAnalysis?.requiresUrgentReview && (
                <div className="modal-urgent-banner">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Urgent Review Alert:</strong> AI detected critical indicators
                    (safety/harassment) requiring prompt administrative action.
                  </div>
                </div>
              )}

              {/* Student & Ticket Meta */}
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
                  <label>Current Status</label>
                  <div style={{ marginTop: "4px" }}>
                    {getStatusBadge(selectedComplaint.status)}
                  </div>
                </div>

                <div className="info-field">
                  <label>Effective Priority</label>
                  <div style={{ marginTop: "4px" }}>
                    {getPriorityBadge(selectedComplaint)}
                  </div>
                </div>
              </div>

              {/* Grievance Full Description */}
              <div className="modal-desc-box">
                <label>Grievance Description</label>
                <p>{selectedComplaint.complaint}</p>
              </div>

              {/* AI Analysis Diagnostic Card */}
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
                  <div>
                    <span className="detail-label">Category:</span>
                    <strong style={{ marginLeft: "6px" }}>
                      {selectedComplaint.aiAnalysis?.category || "Other"}
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

              {/* Audit Trail Note if Priority was Overridden */}
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

              {/* Administrative Actions Form */}
              <div className="modal-actions-panel">
                <h4>Administrative Actions & Overrides</h4>

                <div className="admin-actions-split">
                  {/* Left: Priority Override */}
                  <div className="action-subgroup">
                    <label>Priority Override</label>
                    <select
                      value={overridePriority}
                      onChange={(e) => setOverridePriority(e.target.value)}
                      className="modal-select-field"
                    >
                      <option value="HIGH">HIGH Priority (Urgent Safety/Hazard)</option>
                      <option value="MEDIUM">MEDIUM Priority (Academic/Disruption)</option>
                      <option value="LOW">LOW Priority (Routine Maintenance)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Reason for priority change (optional)"
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
                      <span>Update Priority</span>
                    </button>
                  </div>

                  {/* Right: Department Confirmation & Routing */}
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
                      <span>Confirm Department Assignment</span>
                    </button>
                  </div>
                </div>

                {/* Status Workflow & AI Retry Bar */}
                <div className="modal-status-workflow-bar">
                  <div className="workflow-status-select-wrap">
                    <label>Update Status:</label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="modal-status-select"
                      disabled={actionLoading}
                    >
                      <option value="notProcessed">Not Processed</option>
                      <option value="pending">Under Review</option>
                      <option value="closed">Resolved / Closed</option>
                    </select>
                  </div>

                  <button
                    className="btn-retry-ai"
                    onClick={handleRetryAi}
                    disabled={actionLoading}
                    title="Re-run AI classification on this grievance"
                  >
                    <RotateCcw size={14} />
                    <span>Re-Evaluate with AI</span>
                  </button>
                </div>
              </div>

              <div className="modal-ticket-id">
                <span>Ticket ID: </span>
                <code>{selectedComplaint._id}</code>
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
                  Submitted on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <Link
                to="/admin-complaints"
                className="modal-action-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <span>Open in Complaints Desk</span>
                <ArrowRight size={15} />
              </Link>
              <button
                className="modal-dismiss-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;