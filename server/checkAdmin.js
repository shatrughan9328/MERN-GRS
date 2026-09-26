const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const Admin = require("./model/Admin");

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database Connected");

    const admin = await Admin.findOne();

    if (!admin) {
      console.log("No Admin Found");
      process.exit();
    }

    console.log("Admin Email:", admin.email);

    // Reset admin password
    const newPassword = "admin123";

    admin.password = await bcrypt.hash(newPassword, 10);

    await admin.save();

    console.log("Password Reset Successfully");
    console.log("New Password: admin123");

    process.exit();
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

checkAdmin();
