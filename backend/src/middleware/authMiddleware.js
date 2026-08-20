const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      db.get(
        `SELECT id, studentId, name, email, phone, course, year, parentContact, room, hostelBlock, role
         FROM users
         WHERE id = ?`,
        [decoded.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ message: "Database error" });
          }

          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }

          req.user = user;
          next();
        }
      );
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };