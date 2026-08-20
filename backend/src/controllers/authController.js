const bcrypt = require("bcryptjs");
const db = require("../config/db");
const generateToken = require("../utils/generateToken");

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await getAsync(`SELECT * FROM users WHERE email = ?`, [
      String(email).trim().toLowerCase(),
    ]);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      course: user.course,
      year: user.year,
      parentContact: user.parentContact,
      room: user.room,
      hostelBlock: user.hostelBlock,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone, course, year, parentContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await getAsync(`SELECT * FROM users WHERE email = ?`, [
      String(email).trim().toLowerCase(),
    ]);

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const countRow = await getAsync(
      `SELECT COUNT(*) as total FROM users WHERE role = 'student'`
    );

    const studentId = `STD${1000 + Number(countRow?.total || 0) + 1}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await runAsync(
      `INSERT INTO users (studentId, name, email, password, phone, course, year, parentContact, room, hostelBlock, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        name.trim(),
        String(email).trim().toLowerCase(),
        hashedPassword,
        phone || "",
        course || "",
        year || "",
        parentContact || "",
        "Not Allotted",
        "-",
        "student",
      ]
    );

    const user = await getAsync(`SELECT * FROM users WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      course: user.course,
      year: user.year,
      parentContact: user.parentContact,
      room: user.room,
      hostelBlock: user.hostelBlock,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to get user profile" });
  }
};

module.exports = {
  loginUser,
  registerStudent,
  getMe,
};