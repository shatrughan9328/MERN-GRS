import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/session");
      setSessions(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const addOrUpdateSession = async () => {
    if (!name || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        const res = await axios.patch(
          `http://localhost:5000/api/session/${editId}`,
          {
            name,
            description,
          }
        );

        alert(res.data.msg);
        setEditId(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/session",
          {
            name,
            description,
          }
        );

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
  };

  const deleteSession = async (id) => {
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

        <div className="admin-list-header">
          <div>
            <h2>Session Management</h2>
            <p>Add and manage academic sessions.</p>
          </div>

          <Link to="/admin-dashboard">
            <button>Back to Dashboard</button>
          </Link>
        </div>

        <div className="type-form-box">

          <h3>
            {editId ? "Update Session" : "Add Session"}
          </h3>

          <div className="type-form">

            <input
              type="text"
              placeholder="Session Name (Example: 2023 - 2027)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button onClick={addOrUpdateSession}>
              {editId ? "Update Session" : "Add Session"}
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
                <th>Session</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <tr key={session._id}>

                    <td>{index + 1}</td>

                    <td>{session.name}</td>

                    <td>{session.description}</td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          editSession(session)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteSession(session._id)
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
                    No sessions found
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