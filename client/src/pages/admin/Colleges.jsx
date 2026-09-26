import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchColleges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/college");
      setColleges(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const addOrUpdateCollege = async () => {
    if (!name || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/college/${editId}`,
          {
            name,
            description,
          }
        );

        alert(res.data.msg);
        setEditId(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/college",
          {
            name,
            description,
          }
        );

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
  };

  const deleteCollege = async (id) => {
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

        <div className="admin-list-header">
          <div>
            <h2>College Management</h2>
            <p>Add and manage colleges available in the system.</p>
          </div>

          <Link to="/admin-dashboard">
            <button>Back to Dashboard</button>
          </Link>
        </div>

        <div className="type-form-box">
          <h3>
            {editId ? "Update College" : "Add College"}
          </h3>

          <div className="type-form">

            <input
              type="text"
              placeholder="College Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="College Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button onClick={addOrUpdateCollege}>
              {editId ? "Update College" : "Add College"}
            </button>

          </div>

          {editId && (
            <div style={{ marginTop: "15px" }}>
              <button onClick={cancelEdit}>
                Cancel Edit
              </button>
            </div>
          )}

        </div>

        <div className="admin-table-box">

          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>College Name</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {colleges.length > 0 ? (
                colleges.map((college, index) => (
                  <tr key={college._id}>

                    <td>{index + 1}</td>

                    <td>{college.name}</td>

                    <td>{college.description}</td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          editCollege(college)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteCollege(college._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    No colleges found
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