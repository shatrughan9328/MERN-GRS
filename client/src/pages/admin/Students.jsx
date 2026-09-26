import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Students = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/student"
      );

      setStudents(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

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

        <div className="admin-list-header">
          <div>
            <h2>Registered Students</h2>
            <p>
              View all students registered in the system.
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
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Course</th>
                <th>College</th>
                <th>Session</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student._id}>

                    <td>{index + 1}</td>

                    <td>{student.name}</td>

                    <td>{student.email}</td>

                    <td>{student.mobile}</td>

                    <td>{student.course}</td>

                    <td>
                      {student.collegeId
                        ? student.collegeId.name
                        : "Not Assigned"}
                    </td>

                    <td>
                      {student.sessionId
                        ? student.sessionId.name
                        : "Not Assigned"}
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteStudent(student._id)
                        }
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    No students found
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