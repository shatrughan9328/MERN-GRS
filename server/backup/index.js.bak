const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoDB = require("./config/db");
mongoDB();

// Routes
const adminRoute = require("./routes/adminRoute");
const collegeRoute = require("./routes/collegeRoute");
const complaintRoute = require("./routes/complaintRoute");
const complaintTypeRoute = require("./routes/complaintTypeRoute");
const sessionRoute = require("./routes/sessionRoute");
const studentRoute = require("./routes/studentRoute");

// Route Mounting
app.use("/api/admin", adminRoute);
app.use("/api/college", collegeRoute);
app.use("/api/complaint", complaintRoute);
app.use("/api/complaint-type", complaintTypeRoute);
app.use("/api/session", sessionRoute);
app.use("/api/student", studentRoute);

// Test Route
app.get("/", (req, res) => {
  res.send("GRS Backend is running");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
