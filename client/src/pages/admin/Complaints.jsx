import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/complaint"
      );

      setComplaints(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/complaint/status/${id}`,
        {
          status: status,
        }
      );

      alert(res.data.msg);

      fetchComplaints();
    } catch (error) {
      console.log(error);
      alert("Status update failed");
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
    <div className="admin-list-page">
      <div className="admin-list-container">

        <div className="admin-list-header">
          <div>
            <h2>All Complaints</h2>
            <p>
              View and manage all student grievances.
            </p>
          </div>

          <Link to="/admin-dashboard">
            <button>Back to Dashboard</button>
          </Link>
        </div>

        <div className="admin-table-box">
          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Complaint</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>

            <tbody>

              {complaints.length > 0 ? (
                complaints.map((item, index) => (
                  <tr key={item._id}>

                    <td>{index + 1}</td>

                    <td>
                      {item.studentId
                        ? item.studentId.name
                        : "N/A"}
                    </td>

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

                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(
                            item._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="notProcessed">
                          Not Processed
                        </option>

                        <option value="pending">
                          Pending
                        </option>

                        <option value="closed">
                          Closed
                        </option>
                      </select>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No complaints found
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

export default Complaints;