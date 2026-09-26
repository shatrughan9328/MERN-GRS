import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  PlusCircle,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Calendar,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapsible sidebar state (persisted)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("grs_sidebar_collapsed") === "true";
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      navigate("/login");
      return;
    }
    fetchData(studentId);
  }, [navigate]);

  const fetchData = async (studentId) => {
    try {
      setLoading(true);
      const [complaintRes, studentRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/complaint/student/${studentId}`),
        axios.get(`http://localhost:5000/api/student/${studentId}`),
      ]);

      setComplaints(complaintRes.data.data || []);
      setStudent(studentRes.data.data || null);
    } catch (error) {
      console.error("Error fetching student layout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("grs_sidebar_collapsed", String(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const studentInitial = student?.name
    ? student.name.charAt(0).toUpperCase()
    : "S";

  const notProcessedCount = complaints.filter(
    (c) => c.status === "notProcessed"
  ).length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("submit-complaint")) return "Lodge Grievance";
    if (path.includes("my-complaints")) return "My Grievances";
    if (path.includes("profile")) return "Student Profile";
    return "Student Dashboard";
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

      {/* ===================== PERSISTENT SIDEBAR ===================== */}
      <aside
        className={`grs-sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="grs-sidebar-header">
          <NavLink to="/dashboard" className="grs-brand">
            <div className="grs-brand-icon">
              <ShieldCheck size={22} />
            </div>
            {!isCollapsed && (
              <div className="grs-brand-text">
                <h2>GRS</h2>
                <span>Student Portal</span>
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
            aria-label="Close Mobile Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="grs-user-card">
          <div className="grs-avatar-wrapper">
            <div className="grs-avatar">{studentInitial}</div>
            <span className="online-indicator" title="Online"></span>
          </div>

          {!isCollapsed && (
            <div className="grs-user-details">
              <h4 title={student?.name || "Student"}>
                {student?.name || "Student"}
              </h4>
              <p title={student?.email || "student@email.com"}>
                {student?.email || "student@email.com"}
              </p>
              <span className="student-badge">Student Account</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="grs-nav">
          {!isCollapsed && <div className="grs-nav-section-title">MAIN MENU</div>}

          <NavLink
            to="/dashboard"
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
            {!isCollapsed && location.pathname === "/dashboard" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/submit-complaint"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Submit Complaint"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <PlusCircle size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Submit Complaint</span>}
            {!isCollapsed && location.pathname === "/submit-complaint" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/my-complaints"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="My Complaints"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <ClipboardList size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">My Complaints</span>}
            {!isCollapsed && complaints.length > 0 && (
              <span className="nav-count-badge">{complaints.length}</span>
            )}
            {!isCollapsed && location.pathname === "/my-complaints" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `grs-nav-link ${isActive ? "active" : ""}`
            }
            data-tooltip="Profile"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="nav-icon-box">
              <User size={20} />
            </div>
            {!isCollapsed && <span className="nav-label">Profile</span>}
            {!isCollapsed && location.pathname === "/profile" && (
              <span className="nav-active-pip"></span>
            )}
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="grs-sidebar-footer">
          {!isCollapsed && (
            <div className="grs-support-card">
              <div className="support-header">
                <HelpCircle size={16} />
                <span>Need Assistance?</span>
              </div>
              <p>Contact the redressal cell for urgent issues.</p>
            </div>
          )}

          <button
            className="grs-logout-btn"
            onClick={logout}
            data-tooltip="Logout"
            aria-label="Logout"
          >
            <div className="nav-icon-box">
              <LogOut size={19} />
            </div>
            {!isCollapsed && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="grs-main-wrapper">
        {/* Top Navbar */}
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
              title={`${notProcessedCount} unread notices`}
              onClick={() => navigate("/my-complaints")}
            >
              <Bell size={20} />
              {notProcessedCount > 0 && <span className="notification-dot"></span>}
            </div>

            {/* User Chip */}
            <div
              className="topbar-user-chip"
              onClick={() => navigate("/profile")}
              title="View Profile"
            >
              <div className="chip-avatar">{studentInitial}</div>
              <div className="chip-info">
                <span className="chip-name">{student?.name || "Student"}</span>
                <span className="chip-role">Active</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              className="topbar-logout-btn"
              onClick={logout}
              title="Logout"
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
              student,
              complaints,
              loading,
              refreshData: () => {
                const sId = localStorage.getItem("studentId");
                if (sId) fetchData(sId);
              },
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
