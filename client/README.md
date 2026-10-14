# Grievance Redressal System (GRS)

A full-stack **Grievance Redressal System** built using the **MERN Stack**, designed to provide students with a simple and transparent platform to submit, track, and manage grievances digitally.

## 🚀 Features

### 👨‍🎓 Student

* Student registration and login
* Secure authentication
* Submit grievances with relevant details
* Select grievance category
* Track grievance status
* View previously submitted grievances
* Manage profile

### 👨‍💼 Admin

* Secure admin login
* Admin dashboard
* View and manage student grievances
* Update grievance status
* View student information
* Manage complaints efficiently

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication & Security

* JWT Authentication
* bcrypt Password Hashing

## 📁 Project Structure

```text
MERN-GRS/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/shatrughan9328/MERN-GRS.git
```

```bash
cd MERN-GRS
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add your environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

## 🔄 Application Flow

```text
Student
   ↓
Register / Login
   ↓
Student Dashboard
   ↓
Submit Grievance
   ↓
Admin Reviews Grievance
   ↓
Status Updated
   ↓
Student Tracks Status
```

## 🔐 Security

The system uses:

* **JWT** for authentication and authorization
* **bcrypt** for securely hashing passwords
* Environment variables for sensitive configuration
* Protected routes for authorized users

## 🎯 Objective

The main objective of this project is to digitize the grievance-handling process and provide a structured platform where students can submit complaints and track their resolution status, while administrators can efficiently manage and respond to grievances.

## 🌟 Key Highlights

* Full-stack MERN application
* Student and Admin modules
* Secure authentication
* Real-time grievance status management
* Responsive user interface
* RESTful backend architecture
* MongoDB-based data management

## 👨‍💻 Author

**Shatrughan Singh**

B.Tech CSE Student
Rajkiya Engineering College, Basti

---

⭐ If you find this project useful, consider giving it a star!
