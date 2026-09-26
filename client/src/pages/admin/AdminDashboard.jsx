import React, { useState } from "react";
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
} from "lucide-react";

const AdminDashboard = () => {
  // Access data passed down from AdminLayout Outlet
  const outletContext = useOutletContext() || {};
  const { complaints = [], students = [], loading = false } = outletContext;

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected complaint for quick-view modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const closedCount = complaints.filter((c) => c.status === "closed").length;
  const notProcessedCount = complaints.filter(
    (c) => c.status === "notProcessed"
  ).length;

  const filteredComplaints = complaints.filter((item) => {
    const studentName = item.studentId?.name || "";
    const complaintText = item.complaint || "";
    const typeName = item.complaintType?.name || "";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaintText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "closed":
        return (
          <span className="status-badge status-resolved">
            <span className="status-dot"></span>
            <CheckCircle2 size={13} />
            Resolved
          </span>
        );
      case "pending":
        return (
          <span className="status-badge status-pending">
            <span className="status-dot"></span>
            <Clock size={13} />
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

  return (
    <>
      {/* Admin Welcome Banner */}
      <div className="grs-welcome-banner admin-banner">
        <div className="banner-content">
          <div className="banner-pill">
            <Sparkles size={14} />
            <span>Executive Grievance Control</span>
          </div>
          <h2>
            Grievance Management <span className="banner-name">HQ</span>
          </h2>
          <p>
            Monitor incoming grievances, manage college directories, streamline
            academic sessions, and enforce resolution SLAs across all
            departments.
          </p>
          <div className="banner-actions">
            <Link to="/admin-complaints" className="banner-primary-btn">
              <ClipboardList size={17} />
              <span>Review All Grievances</span>
            </Link>
            <Link to="/admin-complaint-types" className="banner-secondary-btn">
              <Tag size={17} />
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>
        <div className="banner-graphic">
          <div className="shield-emblem admin-shield">
            <ShieldAlert size={72} />
          </div>
        </div>
      </div>

      {/* ===================== KPI STAT CARDS ===================== */}
      <div className="grs-stats-grid">
        {/* Total Complaints */}
        <div className="grs-stat-card card-total">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <FileText size={24} />
            </div>
            <span className="stat-badge total-badge">All Grievances</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">
              {loading ? "..." : complaints.length}
            </span>
            <h3 className="stat-title">Total Complaints</h3>
            <p className="stat-desc">All registered cases in database</p>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="grs-stat-card card-pending">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Clock size={24} />
            </div>
            <span className="stat-badge pending-badge">In Review</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : pendingCount}</span>
            <h3 className="stat-title">Pending Review</h3>
            <p className="stat-desc">Awaiting committee resolution</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{
                width: `${
                  complaints.length > 0
                    ? Math.round((pendingCount / complaints.length) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Closed / Resolved */}
        <div className="grs-stat-card card-resolved">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={24} />
            </div>
            <span className="stat-badge resolved-badge">Closed</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : closedCount}</span>
            <h3 className="stat-title">Closed Complaints</h3>
            <p className="stat-desc">Successfully redressed grievances</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{
                width: `${
                  complaints.length > 0
                    ? Math.round((closedCount / complaints.length) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Students */}
        <div className="grs-stat-card card-not-processed">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Users size={24} />
            </div>
            <span className="stat-badge not-processed-badge">Enrolled</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">
              {loading ? "..." : students.length}
            </span>
            <h3 className="stat-title">Registered Students</h3>
            <p className="stat-desc">Active student accounts</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* ===================== QUICK MANAGEMENT CARDS ===================== */}
      <div className="grs-actions-section">
        <div className="section-header">
          <div>
            <h2>Quick Management</h2>
            <p>Configure institution entities and system parameters</p>
          </div>
        </div>

        <div className="grs-actions-grid admin-actions-grid">
          {/* Card 1: Complaint Types */}
          <div className="grs-action-card action-submit">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <Tag size={26} />
              </div>
              <div className="action-text">
                <h3>Complaint Types</h3>
                <p>
                  Add, modify, or archive grievance categories such as Hostel,
                  Academics, Exam, and Infrastructure.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/admin-complaint-types" className="action-button primary">
                <span>Manage Categories</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 2: Colleges */}
          <div className="grs-action-card action-track">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <Building2 size={26} />
              </div>
              <div className="action-text">
                <h3>Colleges & Campuses</h3>
                <p>
                  Maintain affiliated colleges, campus entities, and
                  institutional units participating in GRS.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/admin-colleges" className="action-button secondary">
                <span>Manage Colleges</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 3: Sessions */}
          <div className="grs-action-card action-profile">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <Calendar size={26} />
              </div>
              <div className="action-text">
                <h3>Academic Sessions</h3>
                <p>
                  Configure academic year sessions and batch durations for
                  accurate student cohort mapping.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/admin-sessions" className="action-button tertiary">
                <span>Manage Sessions</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 4: Students Directory */}
          <div className="grs-action-card action-students">
            <div className="action-card-body">
              <div className="action-icon-circle admin-student-icon">
                <GraduationCap size={26} />
              </div>
              <div className="action-text">
                <h3>Student Directory</h3>
                <p>
                  Audit student profiles, verify course details, and manage
                  registered user accounts.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/admin-students" className="action-button quaternary">
                <span>View All Students</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== RECENT COMPLAINTS TABLE ===================== */}
      <div className="grs-recent-section">
        <div className="recent-header">
          <div className="recent-header-titles">
            <h2>Recent Complaints Overview</h2>
            <p>Live stream of grievance tickets across all student cohorts</p>
          </div>

          <div className="recent-controls">
            {/* Status Filter Tabs */}
            <div className="status-filter-pills">
              <button
                className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({complaints.length})
              </button>
              <button
                className={`filter-pill ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "closed" ? "active" : ""}`}
                onClick={() => setStatusFilter("closed")}
              >
                Closed ({closedCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "notProcessed" ? "active" : ""}`}
                onClick={() => setStatusFilter("notProcessed")}
              >
                Unprocessed ({notProcessedCount})
              </button>
            </div>

            <Link to="/admin-complaints" className="view-all-link">
              <span>View All Grievances</span>
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>

        {/* Live Search Bar for Table */}
        <div style={{ padding: "14px 28px 0" }}>
          <div className="topbar-search" style={{ width: "100%", maxWidth: "340px" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search student, issue, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="grs-table-container">
          <table className="grs-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Student</th>
                <th style={{ width: "36%" }}>Complaint Summary</th>
                <th style={{ width: "18%" }}>Category</th>
                <th style={{ width: "14%" }}>Status</th>
                <th style={{ width: "10%" }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.slice(0, 6).map((item) => (
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
                        <div className="complaint-icon-bullet">
                          <FileText size={16} />
                        </div>
                        <span className="complaint-text" title={item.complaint}>
                          {item.complaint}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">
                        {item.complaintType?.name || "General"}
                      </span>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-center">
                      <button
                        className="view-btn"
                        title="Inspect Details"
                        onClick={() => setSelectedComplaint(item)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="grs-empty-state">
                      <div className="empty-icon-wrap">
                        <FileText size={38} />
                      </div>
                      <h4>No Complaints Found</h4>
                      <p>
                        {searchTerm || statusFilter !== "all"
                          ? "No complaints match your search query or filter selection."
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

      {/* ===================== COMPLAINT DETAIL MODAL ===================== */}
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
                <ShieldAlert size={20} className="modal-shield admin-shield-color" />
                <h3>Grievance Inspection</h3>
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
                  <label>Student</label>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5 }}>
                    {selectedComplaint.studentId?.name || "Unknown"}
                  </p>
                </div>
                <div className="info-field">
                  <label>Category</label>
                  <span className="category-pill">
                    {selectedComplaint.complaintType?.name || "General"}
                  </span>
                </div>
                <div className="info-field">
                  <label>Status</label>
                  <div>{getStatusBadge(selectedComplaint.status)}</div>
                </div>
              </div>

              <div className="modal-desc-box">
                <label>Grievance Text</label>
                <p>{selectedComplaint.complaint}</p>
              </div>

              <div className="modal-ticket-id">
                <span>Ticket ID: </span>
                <code>{selectedComplaint._id}</code>
              </div>
            </div>

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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;