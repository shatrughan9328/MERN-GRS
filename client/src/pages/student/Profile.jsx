import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    if (studentId) {
      fetchStudent(studentId);
    }
  }, []);

  const fetchStudent = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/student/${id}`
      );

      setStudent(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!student) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h2>No Student Data Found</h2>
          <p>Please login first.</p>

          <Link to="/login">
            <button>Student Login</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <div>
            <h2>Student Profile</h2>
            <p>View your personal information.</p>
          </div>

          <Link to="/dashboard">
            <button>Back to Dashboard</button>
          </Link>
        </div>

        <div className="student-profile-card">

          <div className="student-avatar">
            {student.name
              ? student.name.charAt(0).toUpperCase()
              : "S"}
          </div>

          <div className="student-profile-info">
            <h2>{student.name}</h2>
            <p>{student.email}</p>
            <span>{student.course}</span>
          </div>

        </div>

        <div className="profile-details">

          <div className="profile-item">
            <label>Name</label>
            <p>{student.name}</p>
          </div>

          <div className="profile-item">
            <label>Father Name</label>
            <p>{student.fatherName}</p>
          </div>

          <div className="profile-item">
            <label>Email</label>
            <p>{student.email}</p>
          </div>

          <div className="profile-item">
            <label>Mobile</label>
            <p>{student.mobile}</p>
          </div>

          <div className="profile-item">
            <label>Gender</label>
            <p>{student.gender}</p>
          </div>

          <div className="profile-item">
            <label>Date of Birth</label>
            <p>{student.dob}</p>
          </div>

          <div className="profile-item">
            <label>Course</label>
            <p>{student.course}</p>
          </div>

          <div className="profile-item">
            <label>Session</label>
            <p>
              {student.sessionId
                ? student.sessionId.name
                : "Not Assigned"}
            </p>
          </div>

          <div className="profile-item">
            <label>College</label>
            <p>
              {student.collegeId
                ? student.collegeId.name
                : "Not Assigned"}
            </p>
          </div>

          <div className="profile-item">
            <label>City</label>
            <p>{student.city}</p>
          </div>

          <div className="profile-item">
            <label>Pincode</label>
            <p>{student.pincode}</p>
          </div>

          <div className="profile-item profile-address">
            <label>Address</label>
            <p>{student.address}</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;