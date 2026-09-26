import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    email: "",
    gender: "",
    password: "",
    address: "",
    mobile: "",
    dob: "",
    sessionId: "",
    city: "",
    pincode: "",
    course: "",
    collegeId: "",
    picture: "",
  });

  useEffect(() => {
    fetchSessions();
    fetchColleges();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/session");
      setSessions(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/college");
      setColleges(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/register",
        formData
      );

      alert(res.data.msg);

      if (res.data.msg === "Student Registered Successfully") {
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      alert("Registration Failed");
    }
  };

  return (
    <div className="form-page">
      <div className="form-box">
        <h2>Student Registration</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="fatherName"
            placeholder="Father Name"
            value={formData.fatherName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="course"
            placeholder="Course"
            value={formData.course}
            onChange={handleChange}
            required
          />

          <select
            name="sessionId"
            value={formData.sessionId}
            onChange={handleChange}
          >
            <option value="">Select Session</option>

            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            name="collegeId"
            value={formData.collegeId}
            onChange={handleChange}
          >
            <option value="">Select College</option>

            {colleges.map((college) => (
              <option key={college._id} value={college._id}>
                {college.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>

          <input
            type="text"
            name="picture"
            placeholder="Picture URL (optional)"
            value={formData.picture}
            onChange={handleChange}
          />

          <button type="submit">Register</button>
        </form>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;