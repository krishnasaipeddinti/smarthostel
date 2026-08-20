const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const query = (sql, params = []) => pool.query(sql, params);

const getOne = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

// ─── Seed ─────────────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  // Check if data already seeded
  const existingAdmin = await getOne(
    `SELECT * FROM users WHERE email = $1`,
    ["admin@smartnest.com"]
  );

  if (existingAdmin) {
    console.log("Supabase seed already exists ✅");
    return;
  }

  console.log("Seeding Supabase database...");

  const adminPassword   = await bcrypt.hash("Admin@123", 10);
  const wardenPassword  = await bcrypt.hash("Warden@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // ── Users ──────────────────────────────────────────────────
  await query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)`,
    ["System Admin", "admin@smartnest.com", adminPassword, "9999999991", "admin"]
  );

  await query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)`,
    ["Main Warden", "warden@smartnest.com", wardenPassword, "9999999992", "warden"]
  );

  await query(
    `INSERT INTO users ("studentId", name, email, password, phone, course, year, "parentContact", room, "hostelBlock", role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      "STD1001",
      "Demo Student",
      "student@smartnest.com",
      studentPassword,
      "9999999993",
      "B.Tech CSE",
      "3rd Year",
      "9999999994",
      "A-101",
      "A",
      "student",
    ]
  );

  // ── Rooms ──────────────────────────────────────────────────
  await query(
    `INSERT INTO rooms ("roomSeries", "roomNo", block, floor, sharing, "roomType", capacity, occupied, "monthlyFee")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    ["A", "A-101", "A", 1, 2, "AC", 2, 1, 7800]
  );

  await query(
    `INSERT INTO rooms ("roomSeries", "roomNo", block, floor, sharing, "roomType", capacity, occupied, "monthlyFee")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    ["A", "A-102", "A", 1, 3, "Non AC", 3, 0, 5600]
  );

  await query(
    `INSERT INTO rooms ("roomSeries", "roomNo", block, floor, sharing, "roomType", capacity, occupied, "monthlyFee")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    ["B", "B-201", "B", 2, 1, "AC", 1, 0, 8000]
  );

  // ── Fees ───────────────────────────────────────────────────
  await query(
    `INSERT INTO fees ("studentId", "studentName", amount, "paidAmount", "dueDate", status, "paymentHistory")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    ["STD1001", "Demo Student", 7800, 0, "2026-04-10", "Pending", "[]"]
  );

  // ── Notices ────────────────────────────────────────────────
  await query(
    `INSERT INTO notices (title, description, priority, date, "createdBy")
     VALUES ($1, $2, $3, $4, $5)`,
    ["Hostel Gate Closing Time", "All students must return before 9:30 PM.", "Important", "2026-03-15", "Admin"]
  );

  await query(
    `INSERT INTO notices (title, description, priority, date, "createdBy")
     VALUES ($1, $2, $3, $4, $5)`,
    ["Water Maintenance", "Water supply will be interrupted from 10 AM to 12 PM on Sunday.", "Medium", "2026-03-16", "Warden"]
  );

  // ── Food Menu ──────────────────────────────────────────────
  const foodRows = [
    ["Monday",    "Idli, Sambar & Peanut Chutney",       "Rice, Dal Fry, Veg Curry & Curd",         "Samosa & Tea",       "Chapati, Paneer Butter Masala & Jeera Rice"],
    ["Tuesday",   "Masala Dosa & Coconut Chutney",       "Veg Biryani, Raita & Boiled Egg",          "Veg Puff & Tea",     "Rice, Sambar, Aloo Fry & Salad"],
    ["Wednesday", "Upma, Banana & Chutney",              "Rice, Rasam, Beans Curry & Papad",         "Bonda & Tea",        "Chicken Curry, Rice & Onion Salad"],
    ["Thursday",  "Poori & Potato Masala",               "Lemon Rice, Dal Tadka & Veg Fry",          "Biscuits & Tea",     "Chapati, Mixed Veg Curry & Curd Rice"],
    ["Friday",    "Pongal & Coconut Chutney",            "Rice, Sambar, Cabbage Fry & Curd",         "Mirchi Bajji & Tea", "Egg Curry, Rice & Tomato Dal"],
    ["Saturday",  "Uttapam & Peanut Chutney",            "Tomato Rice, Raita & Veg Kurma",           "Cutlet & Tea",       "Chapati, Dal Tadka & Veg Pulao"],
    ["Sunday",    "Masala Dosa, Vada & Chutney",         "Special Veg Meals with Sweet",             "Noodles & Tea",      "Chicken Biryani & Raita"],
  ];

  for (const item of foodRows) {
    await query(
      `INSERT INTO food_menu (day, breakfast, lunch, snacks, dinner)
       VALUES ($1, $2, $3, $4, $5)`,
      item
    );
  }

  console.log("Supabase seed completed successfully 🎉");
};

module.exports = seedDatabase;