import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ComplaintForm = () => {
  const navigate = useNavigate();

  const [complaintTypes, setComplaintTypes] = useState([]);

  const [formData, setFormData] = useState({
    complaintType: "",
    complaint: "",
  });

  useEffect(() => {
    fetchComplaintTypes();
  }, []);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!formData.complaintType || !formData.complaint) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/complaint",
        {
          complaintType: formData.complaintType,
          complaint: formData.complaint,
          studentId: studentId,
        }
      );

      alert(res.data.msg);

      if (res.data.msg === "Complaint Added Successfully") {
        setFormData({
          complaintType: "",
          complaint: "",
        });

        navigate("/my-complaints");
      }
    } catch (error) {
      console.log(error);

      alert("Complaint not submitted");
    }
  };

  return (
    <div className="complaint-page">

      <div className="complaint-box">

        <h2>Submit Complaint</h2>

        <p>
          Raise your grievance to the administration.
        </p>

        <form onSubmit={handleSubmit}>

          <select
            name="complaintType"
            value={formData.complaintType}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Complaint Type
            </option>

            {complaintTypes.map((type) => (
              <option
                key={type._id}
                value={type._id}
              >
                {type.name}
              </option>
            ))}

          </select>

          <textarea
            name="complaint"
            rows="7"
            placeholder="Describe your complaint"
            value={formData.complaint}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">
            Submit Complaint
          </button>

        </form>

        <div style={{ marginTop: "20px" }}>
          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </div>

      </div>

    </div>
  );
};

export default ComplaintForm;