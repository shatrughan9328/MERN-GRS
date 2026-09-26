import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Tag,
  Building2,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShieldAlert,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("grs_admin_sidebar_collapsed") === "true";
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [complaintRes, studentRes] = await Promise.all([
        axios.get("http://localhost:5000/api/complaint"),
        axios.get("http://localhost:5000/api/student"),
      ]);

      setComplaints(complaintRes.data.data || []);
      setStudents(studentRes.data.data || []);
    } catch (error) {
      console.error("Error fetching admin layout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("grs_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const pendingCount = complaints.filter((c) => c.status === "pending").length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("admin-complaints")) return "Manage Grievances";
    if (path.includes("admin-students")) return "Registered Students";
    if (path.includes("admin-complaint-types")) return "Complaint Categories";
    if (path.includes("admin-colleges")) return "Colleges & Campuses";
    if (path.includes("admin-sessions")) return "Academic Sessions";
    return "Admin Dashboard";
  };

  return (
    <div className={`grs-dashboard-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="grs-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ===================== PERSISTENT ADMIN SIDEBAR ===================== */}
      <aside
        className={`grs-sidebar admin-sidebar-theme ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="grs-sidebar-header">
          <NavLink to="/admin-dashboard" className="grs-brand">
            <div className="grs-brand-icon admin-icon-accent">
              <ShieldAlert size={22} />
            </div>
            {!isCollapsed && (
              <div className="grs-brand-text">
                <h2>GRS Admin</h2>
                <span>Executive Console</span>
              </div>
            )}
          </NavLink>

          <button
            className="grs-collapse-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            className="grs-mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Mobile Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Profile Card */}
        <div className="grs-user-card admin-profile-box">
          <div className="grs-avatar-wrapper">
            <div className="grs-avatar admin-avatar">A</div>
            <span className="online-indicator" title="Admin Active"></span>
          </div>

          {!isCollapsed && (
            <div className="grs-user-details">
              <h4>Administrator</h4>
              <p>admin@grs.edu</p>
              <span className="admin-badge">Super Admin</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="grs-nav">
          {!isCollapsed && (
            <div className="grs-nav-section-title">MANAGEMENT</div>
          )}

          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Dashboard"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <LayoutDashboard size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Dashboard</span>}
            {!isCollapsed && location.pathname === "/admin-dashboard" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/admin-complaints"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Complaints"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <ClipboardList size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Complaints</span>}
            {!isCollapsed && complaints.length > 0 && (
              <span className="nav-count-badge">{complaints.length}</span>
            )}
            {!isCollapsed && location.pathname === "/admin-complaints" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/admin-students"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Students"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <Users size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Students</span>}
            {!isCollapsed && students.length > 0 && (
              <span className="nav-count-badge secondary">{students.length}</span>
            )}
            {!isCollapsed && location.pathname === "/admin-students" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          {!isCollapsed && (
            <div className="grs-nav-section-title">SYSTEM CONFIG</div>
          )}

          <NavLink
            to="/admin-complaint-types"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Complaint Types"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <Tag size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Complaint Types</span>}
            {!isCollapsed && location.pathname === "/admin-complaint-types" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/admin-colleges"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Colleges"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <Building2 size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Colleges</span>}
            {!isCollapsed && location.pathname === "/admin-colleges" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/admin-sessions"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Sessions"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <Calendar size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Sessions</span>}
            {!isCollapsed && location.pathname === "/admin-sessions" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="grs-sidebar-footer">
          <button
            className="grs-logout-btn"
            onClick={logout}
            data-tooltip="Logout"
            aria-label="Logout"
          >
            <div className="nav-icon-box">
              <LogOut size={19} />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="grs-main-wrapper">
        {/* Admin Topbar */}
        <header className="grs-topbar">
          <div className="topbar-left">
            <button
              className="grs-menu-toggle"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>

            <div className="topbar-heading">
              <h1>{getPageTitle()}</h1>
              <div className="topbar-date">
                <Calendar size={14} />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {/* Notification Bell */}
            <div
              className="topbar-action-icon"
              title={`${pendingCount} pending reviews`}
              onClick={() => navigate("/admin-complaints")}
            >
              <Bell size={20} />
              {pendingCount > 0 && <span className="notification-dot"></span>}
            </div>

            {/* Admin Chip */}
            <div className="topbar-user-chip">
              <div className="chip-avatar admin-chip-avatar">A</div>
              <div className="chip-info">
                <span className="chip-name">Administrator</span>
                <span className="chip-role">Online</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              className="topbar-logout-btn"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="grs-content">
          <Outlet
            context={{
              complaints,
              students,
              loading,
              refreshData: fetchDashboardData,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
