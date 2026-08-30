const pool = require("../config/db");

const ROOM_PRICE_MAP = {
  "AC-1":     8000,
  "AC-2":     7800,
  "AC-3":     7000,
  "AC-4":     6500,
  "Non AC-1": 7000,
  "Non AC-2": 6200,
  "Non AC-3": 5600,
  "Non AC-4": 5000,
};

const getRoomPrice = (roomType, sharing) =>
  ROOM_PRICE_MAP[`${roomType}-${sharing}`] || 5500;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const allRows = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

const getOne = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

const run = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

const normalizeFee = (fee) => {
  if (!fee) return null;
  return {
    ...fee,
    paymentHistory: fee.paymentHistory
      ? JSON.parse(fee.paymentHistory)
      : [],
  };
};

/* ─────────────────────────── Rooms ─────────────────────────────────────── */

const getRooms = async (req, res) => {
  try {
    const rooms = await allRows(`SELECT * FROM rooms ORDER BY "roomNo" ASC`);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addRoom = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { roomSeries, roomNo, floor, sharing, roomType, monthlyFee: customFee } = req.body;

    if (!roomSeries || !roomNo || !floor || !sharing || !roomType) {
      return res.status(400).json({ message: "All room fields are required" });
    }

    const existing = await getOne(`SELECT * FROM rooms WHERE "roomNo" = $1`, [roomNo]);
    if (existing) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const numericSharing = Number(sharing);
    const monthlyFee =
      customFee !== undefined && customFee !== null && customFee !== ""
        ? Number(customFee)
        : getRoomPrice(roomType, numericSharing);

    const room = await run(
      `INSERT INTO rooms ("roomSeries", "roomNo", block, floor, sharing, "roomType", capacity, occupied, "monthlyFee")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        roomSeries,
        roomNo,
        roomSeries,
        Number(floor),
        numericSharing,
        roomType,
        numericSharing,
        0,
        monthlyFee,
      ]
    );

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const existing = await getOne(`SELECT * FROM rooms WHERE id = $1`, [id]);

    if (!existing) {
      return res.status(404).json({ message: "Room not found" });
    }

    const nextRoomSeries = req.body.roomSeries ?? existing.roomSeries;
    const nextRoomNo     = req.body.roomNo     ?? existing.roomNo;
    const nextFloor      = Number(req.body.floor    ?? existing.floor);
    const nextSharing    = Number(req.body.sharing  ?? existing.sharing);
    const nextRoomType   = req.body.roomType   ?? existing.roomType;
    const nextMonthlyFee =
      req.body.monthlyFee !== undefined && req.body.monthlyFee !== null && req.body.monthlyFee !== ""
        ? Number(req.body.monthlyFee)
        : getRoomPrice(nextRoomType, nextSharing);

    const duplicate = await getOne(
      `SELECT * FROM rooms WHERE "roomNo" = $1 AND id != $2`,
      [nextRoomNo, id]
    );

    if (duplicate) {
      return res.status(400).json({ message: "Another room already uses this room number" });
    }

    if (nextRoomNo !== existing.roomNo) {
      await run(`UPDATE users SET room = $1 WHERE room = $2`, [nextRoomNo, existing.roomNo]);
    }

    const updated = await run(
      `UPDATE rooms
       SET "roomSeries" = $1, "roomNo" = $2, block = $3, floor = $4, sharing = $5,
           "roomType" = $6, capacity = $7, "monthlyFee" = $8
       WHERE id = $9
       RETURNING *`,
      [
        nextRoomSeries,
        nextRoomNo,
        nextRoomSeries,
        nextFloor,
        nextSharing,
        nextRoomType,
        nextSharing,
        nextMonthlyFee,
        id,
      ]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const existing = await getOne(`SELECT * FROM rooms WHERE id = $1`, [id]);

    if (!existing) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (Number(existing.occupied) > 0) {
      return res.status(400).json({
        message: `Cannot delete room ${existing.roomNo} because it currently has ${existing.occupied} student(s) allotted. Please reassign students first.`,
      });
    }

    const assignedStudents = await allRows(
      `SELECT id, name FROM users WHERE room = $1`,
      [existing.roomNo]
    );

    if (assignedStudents && assignedStudents.length > 0) {
      return res.status(400).json({
        message: `Cannot delete room ${existing.roomNo} because student(s) (${assignedStudents.map((s) => s.name).join(", ")}) are assigned to it. Please reassign them first.`,
      });
    }

    await run(`DELETE FROM rooms WHERE id = $1`, [id]);

    res.json({ message: "Room deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignRoomToStudent = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { studentId, roomId } = req.body;

    const student    = await getOne(`SELECT * FROM users WHERE id = $1`, [studentId]);
    const targetRoom = await getOne(`SELECT * FROM rooms WHERE id = $1`, [roomId]);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!targetRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (Number(targetRoom.occupied) >= Number(targetRoom.capacity)) {
      return res.status(400).json({ message: "Selected room is already full" });
    }

    const previousRoom =
      student.room && student.room !== "Not Allotted"
        ? await getOne(`SELECT * FROM rooms WHERE "roomNo" = $1`, [student.room])
        : null;

    if (previousRoom && Number(previousRoom.id) === Number(targetRoom.id)) {
      return res.status(400).json({ message: "Student is already allotted to this room" });
    }

    if (previousRoom) {
      await run(
        `UPDATE rooms SET occupied = $1 WHERE id = $2`,
        [Math.max(0, Number(previousRoom.occupied || 0) - 1), previousRoom.id]
      );
    }

    await run(
      `UPDATE rooms SET occupied = $1 WHERE id = $2`,
      [Number(targetRoom.occupied || 0) + 1, targetRoom.id]
    );

    await run(
      `UPDATE users SET room = $1, "hostelBlock" = $2 WHERE id = $3`,
      [targetRoom.roomNo, targetRoom.block, student.id]
    );

    const fee = await getOne(
      `SELECT * FROM fees WHERE "studentId" = $1 ORDER BY id DESC LIMIT 1`,
      [student.studentId]
    );

    if (fee) {
      const paidAmount = Number(fee.paidAmount || 0);
      const nextStatus =
        paidAmount >= Number(targetRoom.monthlyFee)
          ? "Paid"
          : paidAmount > 0
          ? "Partial"
          : "Pending";

      await run(
        `UPDATE fees SET amount = $1, status = $2 WHERE id = $3`,
        [Number(targetRoom.monthlyFee), nextStatus, fee.id]
      );
    } else {
      await run(
        `INSERT INTO fees ("studentId", "studentName", amount, "paidAmount", "dueDate", status, "paymentHistory")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          student.studentId,
          student.name,
          Number(targetRoom.monthlyFee),
          0,
          "2026-04-10",
          "Pending",
          "[]",
        ]
      );
    }

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      ["student", "Room Allotted", `You have been allotted room ${targetRoom.roomNo}.`, false]
    );

    const updatedStudent = await getOne(`SELECT * FROM users WHERE id = $1`, [student.id]);
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Fees ──────────────────────────────────────── */

const getStudentFee = async (req, res) => {
  try {
    const fee = await getOne(
      `SELECT * FROM fees WHERE "studentId" = $1 ORDER BY id DESC LIMIT 1`,
      [req.user.studentId]
    );
    res.json(normalizeFee(fee));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payStudentFee = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;

    const fee = await getOne(
      `SELECT * FROM fees WHERE "studentId" = $1 ORDER BY id DESC LIMIT 1`,
      [req.user.studentId]
    );

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const paymentAmount = Number(amount || 0);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    const totalFee    = Number(fee.amount || 0);
    const currentPaid = Number(fee.paidAmount || 0);
    const nextPaid    = Math.min(currentPaid + paymentAmount, totalFee);
    const remaining   = Math.max(0, totalFee - nextPaid);

    const nextStatus =
      remaining <= 0 ? "Paid" : nextPaid > 0 ? "Partial" : "Pending";

    const currentHistory = fee.paymentHistory
      ? JSON.parse(fee.paymentHistory)
      : [];

    const updatedHistory = [
      {
        id:      `PAY${Date.now()}`,
        amount:  paymentAmount,
        method:  paymentMethod || "UPI",
        details: paymentDetails || {},
        date:    new Date().toISOString(),
      },
      ...currentHistory,
    ];

    const updatedFee = await run(
      `UPDATE fees
       SET "paidAmount" = $1, status = $2, "paymentHistory" = $3
       WHERE id = $4
       RETURNING *`,
      [nextPaid, nextStatus, JSON.stringify(updatedHistory), fee.id]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "warden",
        "Fee Payment Update",
        `${req.user.name} made a fee payment using ${paymentMethod || "UPI"}.`,
        false,
      ]
    );

    res.json(normalizeFee(updatedFee));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllFees = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const fees = await allRows(`SELECT * FROM fees ORDER BY id DESC`);
    res.json(fees.map(normalizeFee));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeeStatus = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id }     = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const fee = await getOne(`SELECT * FROM fees WHERE id = $1`, [id]);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const updatedFee = await run(
      `UPDATE fees SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "warden",
        "Fee Status Updated",
        `Fee status for ${fee.studentName} has been updated to ${status}.`,
        false,
      ]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "student",
        "Fee Status Updated",
        `Your fee status has been updated to ${status}.`,
        false,
      ]
    );

    res.json(normalizeFee(updatedFee));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Notices ───────────────────────────────────── */

const getStudentNotices = async (req, res) => {
  try {
    const notices = await allRows(`SELECT * FROM notices ORDER BY id DESC`);
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNotice = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const createdBy = req.user.role === "admin" ? "Admin" : "Warden";
    const date      = new Date().toISOString().split("T")[0];

    const notice = await run(
      `INSERT INTO notices (title, description, priority, date, "createdBy")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, priority || "General", date, createdBy]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "student",
        "New Notice Added",
        `${createdBy} added a new notice: ${title}`,
        false,
      ]
    );

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id }                       = req.params;
    const { title, description, priority } = req.body;

    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const existing = await getOne(`SELECT * FROM notices WHERE id = $1`, [id]);
    if (!existing) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const updated = await run(
      `UPDATE notices
       SET title = $1, description = $2, priority = $3
       WHERE id = $4
       RETURNING *`,
      [
        title       ?? existing.title,
        description ?? existing.description,
        priority    ?? existing.priority,
        id,
      ]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Complaints ────────────────────────────────── */

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await allRows(
      `SELECT * FROM complaints WHERE "studentId" = $1 ORDER BY id DESC`,
      [req.user.studentId]
    );
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const complaints = await allRows(`SELECT * FROM complaints ORDER BY id DESC`);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComplaint = async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({
        message: "Category, title and description are required",
      });
    }

    const createdAtLabel = new Date().toISOString().split("T")[0];

    const complaint = await run(
      `INSERT INTO complaints ("studentId", "studentName", category, title, description, status, "createdAtLabel")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.studentId,
        req.user.name,
        category,
        title,
        description,
        "Pending",
        createdAtLabel,
      ]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "warden",
        "New Complaint",
        `${req.user.name} submitted a complaint: ${title}`,
        false,
      ]
    );

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedStatuses = ["Pending", "In Progress", "Resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status" });
    }

    const existing = await getOne(`SELECT * FROM complaints WHERE id = $1`, [id]);
    if (!existing) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const updated = await run(
      `UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "student",
        "Complaint Status Updated",
        `Your complaint "${updated.title}" is now marked as ${status}.`,
        false,
      ]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Leaves ────────────────────────────────────── */

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await allRows(
      `SELECT * FROM leaves_table WHERE "studentId" = $1 ORDER BY id DESC`,
      [req.user.studentId]
    );
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const leaves = await allRows(`SELECT * FROM leaves_table ORDER BY id DESC`);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addLeaveRequest = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "From date, to date and reason are required",
      });
    }

    const leave = await run(
      `INSERT INTO leaves_table ("studentId", "studentName", "fromDate", "toDate", reason, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.studentId, req.user.name, fromDate, toDate, reason, "Pending"]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "warden",
        "New Leave Request",
        `${req.user.name} submitted a leave request.`,
        false,
      ]
    );

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid leave status" });
    }

    const existing = await getOne(`SELECT * FROM leaves_table WHERE id = $1`, [id]);
    if (!existing) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const updated = await run(
      `UPDATE leaves_table SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await run(
      `INSERT INTO notifications ("recipientRole", title, message, "isRead")
       VALUES ($1, $2, $3, $4)`,
      [
        "student",
        "Leave Status Updated",
        `Your leave request from ${updated.fromDate} to ${updated.toDate} is ${status}.`,
        false,
      ]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Food Menu ─────────────────────────────────── */

const getFoodMenu = async (req, res) => {
  try {
    const menu = await allRows(`SELECT * FROM food_menu ORDER BY id ASC`);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFoodMenuItem = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const existing = await getOne(`SELECT * FROM food_menu WHERE id = $1`, [id]);

    if (!existing) {
      return res.status(404).json({ message: "Food menu item not found" });
    }

    const { breakfast, lunch, snacks, dinner } = req.body;

    const updated = await run(
      `UPDATE food_menu
       SET breakfast = $1, lunch = $2, snacks = $3, dinner = $4
       WHERE id = $5
       RETURNING *`,
      [
        breakfast ?? existing.breakfast,
        lunch     ?? existing.lunch,
        snacks    ?? existing.snacks,
        dinner    ?? existing.dinner,
        id,
      ]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Students ──────────────────────────────────── */

const getStudents = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await allRows(
      `SELECT id, "studentId", name, email, phone, course, year, "parentContact", room, "hostelBlock", role
       FROM users
       WHERE role = 'student'
       ORDER BY id DESC`
    );

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentByAdminOrWarden = async (req, res) => {
  try {
    if (!["admin", "warden"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const existing = await getOne(`SELECT * FROM users WHERE id = $1`, [id]);

    if (!existing || existing.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const nextName          = req.body.name          ?? existing.name;
    const nextPhone         = req.body.phone         ?? existing.phone;
    const nextCourse        = req.body.course        ?? existing.course;
    const nextYear          = req.body.year          ?? existing.year;
    const nextParentContact = req.body.parentContact ?? existing.parentContact;

    await run(
      `UPDATE users
       SET name = $1, phone = $2, course = $3, year = $4, "parentContact" = $5
       WHERE id = $6`,
      [nextName, nextPhone, nextCourse, nextYear, nextParentContact, id]
    );

    await run(
      `UPDATE fees SET "studentName" = $1 WHERE "studentId" = $2`,
      [nextName, existing.studentId]
    );

    const updated = await getOne(
      `SELECT id, "studentId", name, email, phone, course, year, "parentContact", room, "hostelBlock", role
       FROM users WHERE id = $1`,
      [id]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ─────────────────────────── Notifications ─────────────────────────────── */

const getNotificationsByRole = async (req, res) => {
  try {
    const notifications = await allRows(
      `SELECT * FROM notifications
       WHERE "recipientRole" = $1
       ORDER BY id DESC`,
      [req.user.role]
    );

    const mapped = notifications.map((item) => ({
      ...item,
      isRead:    Boolean(item.isRead),
      createdAt: item.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await run(
      `UPDATE notifications SET "isRead" = true WHERE "recipientRole" = $1`,
      [req.user.role]
    );

    const notifications = await allRows(
      `SELECT * FROM notifications
       WHERE "recipientRole" = $1
       ORDER BY id DESC`,
      [req.user.role]
    );

    const mapped = notifications.map((item) => ({
      ...item,
      isRead:    Boolean(item.isRead),
      createdAt: item.createdAt,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  assignRoomToStudent,
  getStudentFee,
  payStudentFee,
  getAllFees,
  updateFeeStatus,
  getStudentNotices,
  addNotice,
  updateNotice,
  getMyComplaints,
  getAllComplaints,
  addComplaint,
  updateComplaintStatus,
  getMyLeaves,
  getAllLeaves,
  addLeaveRequest,
  updateLeaveStatus,
  getFoodMenu,
  updateFoodMenuItem,
  getStudents,
  updateStudentByAdminOrWarden,
  getNotificationsByRole,
  markAllNotificationsRead,
};