import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";

// Layouts with Persistent Sidebar and Outlet
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

// Student Pages
import Login from "./pages/student/Login";
import Register from "./pages/student/Register";
import Dashboard from "./pages/student/Dashboard";
import ComplaintForm from "./pages/student/ComplaintForm";
import MyComplaints from "./pages/student/MyComplaints";
import Profile from "./pages/student/Profile";

// Admin Pages
import Adlogin from "./pages/admin/Adlogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Complaints from "./pages/admin/Complaints";
import Students from "./pages/admin/Students";
import ComplaintTypes from "./pages/admin/ComplaintTypes";
import Colleges from "./pages/admin/Colleges";
import Sessions from "./pages/admin/Sessions";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Home & Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<Adlogin />} />

        {/* Student Modules inside Persistent Sidebar Outlet */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-complaint" element={<ComplaintForm />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Modules inside Persistent Sidebar Outlet */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-complaints" element={<Complaints />} />
          <Route path="/admin-students" element={<Students />} />
          <Route path="/admin-complaint-types" element={<ComplaintTypes />} />
          <Route path="/admin-colleges" element={<Colleges />} />
          <Route path="/admin-sessions" element={<Sessions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;