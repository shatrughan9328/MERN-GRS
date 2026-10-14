import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from "lucide-react";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/session");
      setSessions(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const addOrUpdateSession = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/session/${editId}`,
          { name, description }
        );
        alert(res.data.msg);
        setEditId(null);
      } else {
        const res = await axios.post("http://localhost:5000/api/session", {
          name,
          description,
        });
        alert(res.data.msg);
      }

      setName("");
      setDescription("");
      fetchSessions();
    } catch (error) {
      console.log(error);
      alert("Operation failed");
    }
  };

  const editSession = (session) => {
    setName(session.name);
    setDescription(session.description);
    setEditId(session._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this academic session?")) {
      return;
    }

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/session/${id}`
      );
      alert(res.data.msg);
      fetchSessions();

      if (editId === id) {
        setEditId(null);
        setName("");
        setDescription("");
      }
    } catch (error) {
      console.log(error);
      alert("Session not deleted");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="admin-list-page">
      <div className="admin-list-container">
        {/* Page Header */}
        <div className="admin-list-header">
          <div className="header-titles">
            <div className="header-icon-wrap">
              <Calendar size={24} />
            </div>
            <div>
              <h2>Academic Sessions</h2>
              <p>Configure student cohort durations and academic batches.</p>
            </div>
          </div>

          <Link to="/admin-dashboard" className="back-btn-link">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="type-form-box">
          <div className="type-form-header">
            <div className="form-title-wrap">
              {editId ? <Pencil size={18} className="form-icon-edit" /> : <Plus size={18} className="form-icon-add" />}
              <h3>{editId ? "Update Academic Session" : "Create New Academic Session"}</h3>
            </div>
            <span className="form-tagline">
              {editId ? "Modifying session timeframe" : "Define year batch duration for enrollments"}
            </span>
          </div>

          <form onSubmit={addOrUpdateSession} className="type-form">
            <div className="form-fields-grid">
              <div className="form-input-group">
                <label>Session Batch Name</label>
                <input
                  type="text"
                  placeholder="e.g. 2024 - 2028 or 2023 - 2027"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Batch Description</label>
                <input
                  type="text"
                  placeholder="e.g. Undergraduate Engineering 4-Year Batch"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-btn-row">
              <button type="submit" className="primary-form-btn">
                {editId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                <span>{editId ? "Save Changes" : "Add Session"}</span>
              </button>

              {editId && (
                <button type="button" className="cancel-form-btn" onClick={cancelEdit}>
                  <X size={15} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sessions Table */}
        <div className="admin-table-box">
          <div className="table-header-title">
            <Clock size={18} />
            <h3>Academic Batches ({sessions.length})</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "6%" }}>#</th>
                <th style={{ width: "35%" }}>Session Duration</th>
                <th style={{ width: "41%" }}>Description</th>
                <th style={{ width: "18%" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: "36px" }}>
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <tr key={session._id} className="table-row-hover">
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <div className="entity-name-cell">
                        <span className="session-badge">{session.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="entity-desc-text">{session.description}</span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="action-btn-edit"
                          onClick={() => editSession(session)}
                          title="Edit Session"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-btn-delete"
                          onClick={() => deleteSession(session._id)}
                          title="Delete Session"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: "36px" }}>
                    No sessions found. Use the form above to add one.
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

export default Sessions;