const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const Admin = require("./model/Admin");
const College = require("./model/College");
const Session = require("./model/Session");
const ComplaintType = require("./model/ComplaintType");
const Student = require("./model/Student");
const Complaint = require("./model/Complaint");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grs";
    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    // 1. Seed Admin
    const adminEmail = "admin@grs.com";
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      admin = await Admin.create({
        email: adminEmail,
        password: hashedAdminPassword,
      });
      console.log("Admin created: admin@grs.com / admin123");
    } else {
      console.log("Admin already exists: admin@grs.com");
    }

    // 2. Seed Sessions
    const sessionData = [
      { name: "2022 - 2026", description: "B.Tech Batch 2022 to 2026" },
      { name: "2023 - 2027", description: "B.Tech Batch 2023 to 2027" },
      { name: "2024 - 2028", description: "B.Tech Batch 2024 to 2028" },
    ];
    for (const item of sessionData) {
      const exists = await Session.findOne({ name: item.name });
      if (!exists) {
        await Session.create(item);
      }
    }
    console.log("Sessions seeded.");
    const sessions = await Session.find();

    // 3. Seed Colleges
    const collegeData = [
      {
        name: "Institute of Engineering & Technology",
        description: "Department of Engineering & Technical Studies",
      },
      {
        name: "Department of Computer Science & IT",
        description: "School of Computing and Information Technology",
      },
      {
        name: "School of Management & Business Studies",
        description: "Faculty of Commerce and Management",
      },
    ];
    for (const item of collegeData) {
      const exists = await College.findOne({ name: item.name });
      if (!exists) {
        await College.create(item);
      }
    }
    console.log("Colleges seeded.");
    const colleges = await College.find();

    // 4. Seed Complaint Types
    const typeData = [
      {
        name: "Hostel & Mess",
        description: "Issues related to hostel rooms, cleanliness, mess food quality",
      },
      {
        name: "Wi-Fi & Network",
        description: "Campus internet connectivity, router or computer lab network issues",
      },
      {
        name: "Classroom & Infrastructure",
        description: "Projectors, air conditioning, benches, drinking water facilities",
      },
      {
        name: "Library & Learning Resources",
        description: "Book availability, library timings, digital catalog access",
      },
      {
        name: "Academic & Examination",
        description: "Syllabus coverage, timetable conflicts, exam schedule queries",
      },
    ];
    for (const item of typeData) {
      const exists = await ComplaintType.findOne({ name: item.name });
      if (!exists) {
        await ComplaintType.create(item);
      }
    }
    console.log("Complaint Types seeded.");
    const complaintTypes = await ComplaintType.find();

    // 5. Seed Students
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const student1Email = "rahul@gmail.com";
    let student1 = await Student.findOne({ email: student1Email });
    if (!student1) {
      student1 = await Student.create({
        name: "Rahul Sharma",
        fatherName: "Sanjay Sharma",
        email: student1Email,
        gender: "Male",
        password: studentPasswordHash,
        address: "Room 204, Boys Hostel B, Campus Area",
        mobile: "9876543210",
        dob: "2004-05-14",
        sessionId: sessions[1]?._id,
        city: "Delhi",
        pincode: "110001",
        course: "B.Tech Computer Science",
        collegeId: colleges[1]?._id,
      });
      console.log("Sample Student 1 created: rahul@gmail.com / student123");
    }

    const student2Email = "priya@gmail.com";
    let student2 = await Student.findOne({ email: student2Email });
    if (!student2) {
      student2 = await Student.create({
        name: "Priya Patel",
        fatherName: "Ramesh Patel",
        email: student2Email,
        gender: "Female",
        password: studentPasswordHash,
        address: "Flat 12, Girls Hostel A, University Campus",
        mobile: "9812345678",
        dob: "2004-11-20",
        sessionId: sessions[1]?._id,
        city: "Jaipur",
        pincode: "302001",
        course: "B.Tech Information Technology",
        collegeId: colleges[0]?._id,
      });
      console.log("Sample Student 2 created: priya@gmail.com / student123");
    }

    // 6. Seed Sample Complaints for Student 1
    if (student1) {
      const complaintsCount = await Complaint.countDocuments({ studentId: student1._id });
      if (complaintsCount === 0) {
        await Complaint.create([
          {
            studentId: student1._id,
            complaintType: complaintTypes[1]?._id, // Wi-Fi
            complaint: "Wi-Fi speed in Computer Lab 3 is extremely slow during project hours.",
            status: "notProcessed",
          },
          {
            studentId: student1._id,
            complaintType: complaintTypes[0]?._id, // Hostel
            complaint: "Water cooler on 2nd floor of Boys Hostel is not working for 2 days.",
            status: "pending",
          },
          {
            studentId: student1._id,
            complaintType: complaintTypes[3]?._id, // Library
            complaint: "Need latest edition of Operating System concepts textbook in reading section.",
            status: "closed",
          },
        ]);
        console.log("Sample complaints created for Rahul Sharma.");
      }
    }

    console.log("\n==========================================");
    console.log("DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
    console.log("Admin Credentials  : admin@grs.com / admin123");
    console.log("Student Credentials: rahul@gmail.com / student123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
