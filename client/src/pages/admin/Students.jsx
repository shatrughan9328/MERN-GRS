import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  Trash2,
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/student");
      setStudents(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student account?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/student/${id}`
      );
      alert(res.data.msg);
      fetchStudents();
    } catch (error) {
      console.log(error);
      alert("Student not deleted");
    }
  };

  return (
    <div className="admin-list-page">
      <div className="admin-list-container">
        {/* Page Header */}
        <div className="admin-list-header">
          <div className="header-titles">
            <div className="header-icon-wrap">
              <Users size={24} />
            </div>
            <div>
              <h2>Registered Students Directory</h2>
              <p>Audit and manage enrolled student accounts across all colleges.</p>
            </div>
          </div>

          <Link to="/admin-dashboard" className="back-btn-link">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Table Box */}
        <div className="admin-table-box">
          <div className="table-header-title">
            <GraduationCap size={18} />
            <h3>Active Enrolled Students ({students.length})</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "20%" }}>Student Details</th>
                <th style={{ width: "16%" }}>Contact</th>
                <th style={{ width: "17%" }}>Course</th>
                <th style={{ width: "20%" }}>Institution</th>
                <th style={{ width: "12%" }}>Batch</th>
                <th style={{ width: "10%" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: "36px" }}>
                    Loading students...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student._id} className="table-row-hover">
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <div className="student-meta-cell">
                        <div className="student-mini-avatar">
                          {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div className="student-meta-info">
                          <span className="student-meta-name">{student.name}</span>
                          <span className="student-meta-sub">
                            <Mail size={11} style={{ display: "inline", marginRight: "3px" }} />
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="contact-meta-cell">
                        <span>
                          <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                          {student.mobile || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="course-pill">
                        <BookOpen size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {student.course}
                      </span>
                    </td>

                    <td>
                      <span className="college-cell-text">
                        {student.collegeId ? student.collegeId.name : "Not Assigned"}
                      </span>
                    </td>

                    <td>
                      <span className="session-badge">
                        {student.sessionId ? student.sessionId.name : "Not Assigned"}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="action-btn-delete"
                        onClick={() => deleteStudent(student._id)}
                        title="Delete Student Account"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: "36px" }}>
                    No students found in directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;