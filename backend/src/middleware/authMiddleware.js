const jwt  = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token   = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT id, "studentId", name, email, phone, course, year, "parentContact", room, "hostelBlock", role
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };