const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const Student = require("../model/Student");

/**
 * Verify JWT token from Authorization header or cookies
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-access-token"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Access denied. Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key"
    );

    // If role was not explicitly stored in JWT, resolve from DB for backward compatibility
    let userRole = decoded.role;
    if (!userRole) {
      const isAdmin = await Admin.findById(decoded.id).select("_id");
      if (isAdmin) {
        userRole = "Admin";
      } else {
        const isStudent = await Student.findById(decoded.id).select("_id");
        if (isStudent) {
          userRole = "Student";
        }
      }
    }

    req.user = {
      id: decoded.id,
      role: userRole,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token.",
      error: error.message,
    });
  }
};

/**
 * Optional Auth: Attaches user info if valid token exists, otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-access-token"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      token = authHeader;
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key"
      );
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};

/**
 * Enforce Admin Role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      msg: "Access forbidden. Administrator privileges required.",
    });
  }
  next();
};

/**
 * Enforce Student Role
 */
const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      msg: "Access forbidden. Student authorization required.",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireAdmin,
  requireStudent,
};
