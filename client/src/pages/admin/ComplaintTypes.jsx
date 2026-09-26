import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ComplaintTypes = () => {
  const [complaintTypes, setComplaintTypes] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editId, setEditId] = useState(null);

  const fetchComplaintTypes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/complaint-type"
      );

      setComplaintTypes(res.data.data || []);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComplaintTypes();
  }, []);

  const addOrUpdateComplaintType = async () => {
    if (!name || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/complaint-type/${editId}`,
          {
            name,
            description,
          }
        );

        alert(res.data.msg);

        setEditId(null);

      } else {
        const res = await axios.post(
          "http://localhost:5000/api/complaint-type",
          {
            name,
            description,
          }
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
  };

  const deleteComplaintType = async (id) => {
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

        <div className="admin-list-header">

          <div>
            <h2>Complaint Types</h2>

            <p>
              Add and manage complaint categories.
            </p>
          </div>

          <Link to="/admin-dashboard">
            <button>
              Back to Dashboard
            </button>
          </Link>

        </div>

        <div className="type-form-box">

          <h3>
            {editId
              ? "Update Complaint Type"
              : "Add Complaint Type"}
          </h3>

          <div className="type-form">

            <input
              type="text"
              placeholder="Complaint Type Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <button
              onClick={addOrUpdateComplaintType}
            >
              {editId
                ? "Update Type"
                : "Add Type"}
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
                <th>Complaint Type</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {complaintTypes.length > 0 ? (
                complaintTypes.map(
                  (type, index) => (
                    <tr key={type._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {type.name}
                      </td>

                      <td>
                        {type.description}
                      </td>

                      <td>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            editComplaintType(type)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteComplaintType(
                              type._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="4">
                    No complaint types found
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