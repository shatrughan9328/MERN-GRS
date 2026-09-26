import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  PlusCircle,
  ClipboardList,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Eye,
  ExternalLink,
  X,
  Search,
} from "lucide-react";

const Dashboard = () => {
  // Access data passed down from StudentLayout Outlet
  const outletContext = useOutletContext() || {};
  const { student, complaints = [], loading = false } = outletContext;

  // Search & filter state for complaints table
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected complaint for quick-view modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Metrics calculation
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const closedCount = complaints.filter((c) => c.status === "closed").length;
  const notProcessedCount = complaints.filter(
    (c) => c.status === "notProcessed"
  ).length;

  // Filtered complaints for the table
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      (item.complaint || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.complaintType?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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
            <AlertCircle size={13} />
            Not Processed
          </span>
        );
    }
  };

  return (
    <>
      {/* Welcome Banner Card */}
      <div className="grs-welcome-banner">
        <div className="banner-content">
          <div className="banner-pill">
            <Sparkles size={14} />
            <span>Grievance Redressal Portal</span>
          </div>
          <h2>
            Welcome back,{" "}
            <span className="banner-name">{student?.name || "Student"}</span>!
          </h2>
          <p>
            Have questions or issues? Submit your grievance securely. The
            committee reviews all reports within 48–72 operational hours.
          </p>
          <div className="banner-actions">
            <Link to="/submit-complaint" className="banner-primary-btn">
              <PlusCircle size={17} />
              <span>Submit New Complaint</span>
            </Link>
            <Link to="/my-complaints" className="banner-secondary-btn">
              <ClipboardList size={17} />
              <span>Track Status</span>
            </Link>
          </div>
        </div>
        <div className="banner-graphic">
          <div className="shield-emblem">
            <ShieldCheck size={72} />
          </div>
        </div>
      </div>

      {/* ===================== KPI STAT CARDS ===================== */}
      <div className="grs-stats-grid">
        {/* Total Complaints Card */}
        <div className="grs-stat-card card-total">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <FileText size={24} />
            </div>
            <span className="stat-badge total-badge">All Time</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : totalCount}</span>
            <h3 className="stat-title">Total Complaints</h3>
            <p className="stat-desc">All submitted grievance tickets</p>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Pending Complaints Card */}
        <div className="grs-stat-card card-pending">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Clock size={24} />
            </div>
            <span className="stat-badge pending-badge">In Review</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : pendingCount}</span>
            <h3 className="stat-title">Pending</h3>
            <p className="stat-desc">Currently under committee review</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{
                width: `${
                  totalCount > 0
                    ? Math.round((pendingCount / totalCount) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Resolved Complaints Card */}
        <div className="grs-stat-card card-resolved">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={24} />
            </div>
            <span className="stat-badge resolved-badge">Completed</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : closedCount}</span>
            <h3 className="stat-title">Resolved</h3>
            <p className="stat-desc">Successfully resolved complaints</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{
                width: `${
                  totalCount > 0
                    ? Math.round((closedCount / totalCount) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Not Processed Card */}
        <div className="grs-stat-card card-not-processed">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <AlertCircle size={24} />
            </div>
            <span className="stat-badge not-processed-badge">Awaiting Action</span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-number">{loading ? "..." : notProcessedCount}</span>
            <h3 className="stat-title">Not Processed</h3>
            <p className="stat-desc">Waiting for administrative intake</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{
                width: `${
                  totalCount > 0
                    ? Math.round((notProcessedCount / totalCount) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* ===================== QUICK ACTIONS ===================== */}
      <div className="grs-actions-section">
        <div className="section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Fast-track tasks and common student workflows</p>
          </div>
        </div>

        <div className="grs-actions-grid">
          {/* Action Card 1: Submit */}
          <div className="grs-action-card action-submit">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <PlusCircle size={26} />
              </div>
              <div className="action-text">
                <h3>Submit a Complaint</h3>
                <p>
                  Encountering an academic, facility, or campus grievance?
                  Lodge an official ticket directly to the committee.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/submit-complaint" className="action-button primary">
                <span>Lodge Complaint</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Action Card 2: Track */}
          <div className="grs-action-card action-track">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <ClipboardList size={26} />
              </div>
              <div className="action-text">
                <h3>Track Grievances</h3>
                <p>
                  Check the real-time review status, updates, and committee
                  remarks on all your registered complaints.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/my-complaints" className="action-button secondary">
                <span>View All Complaints</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Action Card 3: Profile */}
          <div className="grs-action-card action-profile">
            <div className="action-card-body">
              <div className="action-icon-circle">
                <User size={26} />
              </div>
              <div className="action-text">
                <h3>Student Profile</h3>
                <p>
                  Review your registered course details, session info,
                  college affiliation, and contact details.
                </p>
              </div>
            </div>
            <div className="action-card-footer">
              <Link to="/profile" className="action-button tertiary">
                <span>My Account</span>
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
            <h2>Recent Complaints</h2>
            <p>Overview of your most recently logged grievance records</p>
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
                Resolved ({closedCount})
              </button>
              <button
                className={`filter-pill ${statusFilter === "notProcessed" ? "active" : ""}`}
                onClick={() => setStatusFilter("notProcessed")}
              >
                Unprocessed ({notProcessedCount})
              </button>
            </div>

            <Link to="/my-complaints" className="view-all-link">
              <span>View All</span>
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
              placeholder="Filter recent complaints..."
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
                <th style={{ width: "42%" }}>Complaint Description</th>
                <th style={{ width: "20%" }}>Category</th>
                <th style={{ width: "16%" }}>Date Logged</th>
                <th style={{ width: "14%" }}>Status</th>
                <th style={{ width: "8%" }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.slice(0, 6).map((item) => (
                  <tr key={item._id} className="table-row-hover">
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
                    <td>
                      <div className="date-cell">
                        <Calendar size={13} />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-center">
                      <button
                        className="view-btn"
                        title="View Details"
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
                          ? "No grievances match your current search or filter criteria."
                          : "You have not submitted any complaints yet."}
                      </p>
                      {!(searchTerm || statusFilter !== "all") && (
                        <Link
                          to="/submit-complaint"
                          className="empty-action-btn"
                        >
                          <PlusCircle size={16} />
                          <span>Submit Your First Grievance</span>
                        </Link>
                      )}
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
                <ShieldCheck size={20} className="modal-shield" />
                <h3>Grievance Details</h3>
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
                  <label>Category</label>
                  <span className="category-pill">
                    {selectedComplaint.complaintType?.name || "General"}
                  </span>
                </div>
                <div className="info-field">
                  <label>Date Filed</label>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>
                      {new Date(selectedComplaint.createdAt).toLocaleString(
                        "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-desc-box">
                <label>Complaint Narrative</label>
                <p>{selectedComplaint.complaint}</p>
              </div>

              <div className="modal-ticket-id">
                <span>Ticket ID: </span>
                <code>{selectedComplaint._id}</code>
              </div>
            </div>

            <div className="modal-footer">
              <Link
                to="/my-complaints"
                className="modal-action-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                <span>Go to All Complaints</span>
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

export default Dashboard;