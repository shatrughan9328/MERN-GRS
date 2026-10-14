import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Building,
  CheckCircle2,
} from "lucide-react";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/college");
      setColleges(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const addOrUpdateCollege = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/college/${editId}`,
          { name, description }
        );
        alert(res.data.msg);
        setEditId(null);
      } else {
        const res = await axios.post("http://localhost:5000/api/college", {
          name,
          description,
        });
        alert(res.data.msg);
      }

      setName("");
      setDescription("");
      fetchColleges();
    } catch (error) {
      console.log(error);
      alert("Operation failed");
    }
  };

  const editCollege = (college) => {
    setName(college.name);
    setDescription(college.description);
    setEditId(college._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCollege = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) {
      return;
    }

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/college/${id}`
      );
      alert(res.data.msg);
      fetchColleges();

      if (editId === id) {
        setEditId(null);
        setName("");
        setDescription("");
      }
    } catch (error) {
      console.log(error);
      alert("College not deleted");
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
              <Building2 size={24} />
            </div>
            <div>
              <h2>College & Campus Directory</h2>
              <p>Manage institutions and academic units participating in GRS.</p>
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
              <h3>{editId ? "Update College Details" : "Add New College / Campus"}</h3>
            </div>
            <span className="form-tagline">
              {editId ? "Modifying existing institution entry" : "Configure new affiliated entity"}
            </span>
          </div>

          <form onSubmit={addOrUpdateCollege} className="type-form">
            <div className="form-fields-grid">
              <div className="form-input-group">
                <label>College Name</label>
                <input
                  type="text"
                  placeholder="e.g. Institute of Engineering & Technology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>College Description</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Engineering & Technical Studies"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-btn-row">
              <button type="submit" className="primary-form-btn">
                {editId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                <span>{editId ? "Save Changes" : "Add College"}</span>
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

        {/* Colleges Table */}
        <div className="admin-table-box">
          <div className="table-header-title">
            <Building size={18} />
            <h3>Affiliated Institutions ({colleges.length})</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "6%" }}>#</th>
                <th style={{ width: "35%" }}>College / Campus</th>
                <th style={{ width: "41%" }}>Description</th>
                <th style={{ width: "18%" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: "36px" }}>
                    Loading colleges...
                  </td>
                </tr>
              ) : colleges.length > 0 ? (
                colleges.map((college, index) => (
                  <tr key={college._id} className="table-row-hover">
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <div className="entity-name-cell">
                        <span className="entity-main-name">{college.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="entity-desc-text">{college.description}</span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="action-btn-edit"
                          onClick={() => editCollege(college)}
                          title="Edit College"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-btn-delete"
                          onClick={() => deleteCollege(college._id)}
                          title="Delete College"
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
                    No colleges found in directory. Use the form above to add one.
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

export default Colleges;