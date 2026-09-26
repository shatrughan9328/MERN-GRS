import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    fetchComplaints(studentId);
  }, [navigate]);

  const fetchComplaints = async (studentId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/complaint/student/${studentId}`
      );

      setComplaints(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusText = (status) => {
    if (status === "notProcessed") {
      return "Not Processed";
    }

    if (status === "pending") {
      return "Pending";
    }

    if (status === "closed") {
      return "Closed";
    }

    return status;
  };

  const getStatusClass = (status) => {
    if (status === "notProcessed") {
      return "not-processed";
    }

    if (status === "pending") {
      return "pending";
    }

    if (status === "closed") {
      return "resolved";
    }

    return "";
  };

  return (
    <div className="my-complaints-page">
      <div className="complaints-container">

        <div className="complaints-header">
          <div>
            <h2>My Complaints</h2>
            <p>Track and view all your submitted complaints.</p>
          </div>

          <Link to="/submit-complaint">
            <button>+ New Complaint</button>
          </Link>
        </div>

        <div className="complaints-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Complaint</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length > 0 ? (
                complaints.map((item, index) => (
                  <tr key={item._id}>

                    <td>{index + 1}</td>

                    <td>{item.complaint}</td>

                    <td>
                      {item.complaintType
                        ? item.complaintType.name
                        : "N/A"}
                    </td>

                    <td>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <span
                        className={`status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    No complaints found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link
          to="/dashboard"
          className="back-dashboard"
        >
          ← Back to Dashboard
        </Link>

      </div>
    </div>
  );
};

export default MyComplaints;