import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Layers,
  CheckCircle2,
} from "lucide-react";

const ComplaintTypes = () => {
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComplaintTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/complaint-type");
      setComplaintTypes(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintTypes();
  }, []);

  const addOrUpdateComplaintType = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/complaint-type/${editId}`,
          { name, description }
        );
        alert(res.data.msg);
        setEditId(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/complaint-type",
          { name, description }
        );
        alert(res.data.msg);
      }

      setName("");
      setDescription("");
      fetchComplaintTypes();
    } catch (error) {
      console.log(error);
      alert("Operation failed");
    }
  };

  const editComplaintType = (type) => {
    setName(type.name);
    setDescription(type.description);
    setEditId(type._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteComplaintType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint category?")) {
      return;
    }

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/complaint-type/${id}`
      );
      alert(res.data.msg);
      fetchComplaintTypes();

      if (editId === id) {
        setEditId(null);
        setName("");
        setDescription("");
      }
    } catch (error) {
      console.log(error);
      alert("Complaint type not deleted");
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
              <Tag size={24} />
            </div>
            <div>
              <h2>Complaint Categories</h2>
              <p>Define categories and issue classifications for student grievances.</p>
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
              <h3>{editId ? "Update Category Details" : "Create New Grievance Category"}</h3>
            </div>
            <span className="form-tagline">
              {editId ? "Updating existing category definitions" : "New category option for student portal"}
            </span>
          </div>

          <form onSubmit={addOrUpdateComplaintType} className="type-form">
            <div className="form-fields-grid">
              <div className="form-input-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel & Mess or Wi-Fi & Network"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Description & Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Room cleanliness, meal quality, water supply"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-btn-row">
              <button type="submit" className="primary-form-btn">
                {editId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                <span>{editId ? "Save Changes" : "Add Category"}</span>
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

        {/* Table Box */}
        <div className="admin-table-box">
          <div className="table-header-title">
            <Layers size={18} />
            <h3>Configured Categories ({complaintTypes.length})</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "6%" }}>#</th>
                <th style={{ width: "35%" }}>Category Name</th>
                <th style={{ width: "41%" }}>Description</th>
                <th style={{ width: "18%" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: "36px" }}>
                    Loading categories...
                  </td>
                </tr>
              ) : complaintTypes.length > 0 ? (
                complaintTypes.map((type, index) => (
                  <tr key={type._id} className="table-row-hover">
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <div className="entity-name-cell">
                        <span className="category-pill">{type.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="entity-desc-text">{type.description}</span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="action-btn-edit"
                          onClick={() => editComplaintType(type)}
                          title="Edit Category"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-btn-delete"
                          onClick={() => deleteComplaintType(type._id)}
                          title="Delete Category"
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
                    No categories found. Use the form above to add one.
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

export default ComplaintTypes;