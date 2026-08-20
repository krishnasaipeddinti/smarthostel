const bcrypt = require("bcryptjs");
const db = require("../config/db");

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const seedDatabase = async () => {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      course TEXT DEFAULT '',
      year TEXT DEFAULT '',
      parentContact TEXT DEFAULT '',
      room TEXT DEFAULT 'Not Allotted',
      hostelBlock TEXT DEFAULT '-',
      role TEXT NOT NULL
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomSeries TEXT NOT NULL,
      roomNo TEXT NOT NULL UNIQUE,
      block TEXT NOT NULL,
      floor INTEGER NOT NULL,
      sharing INTEGER NOT NULL,
      roomType TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      occupied INTEGER DEFAULT 0,
      monthlyFee INTEGER NOT NULL
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      amount INTEGER DEFAULT 0,
      paidAmount INTEGER DEFAULT 0,
      dueDate TEXT DEFAULT '2026-04-10',
      status TEXT DEFAULT 'Pending',
      paymentHistory TEXT DEFAULT '[]'
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAtLabel TEXT DEFAULT ''
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS leaves_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      fromDate TEXT NOT NULL,
      toDate TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Pending'
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'General',
      date TEXT DEFAULT '',
      createdBy TEXT DEFAULT ''
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS food_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL UNIQUE,
      breakfast TEXT DEFAULT '',
      lunch TEXT DEFAULT '',
      snacks TEXT DEFAULT '',
      dinner TEXT DEFAULT ''
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipientRole TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const notificationColumns = await allAsync(`PRAGMA table_info(notifications)`);
  const hasIsReadColumn = notificationColumns.some(
    (column) => column.name === "isRead"
  );

  if (!hasIsReadColumn) {
    await runAsync(
      `ALTER TABLE notifications ADD COLUMN isRead INTEGER DEFAULT 0`
    );
  }

  const existingAdmin = await getAsync(`SELECT * FROM users WHERE email = ?`, [
    "admin@smartnest.com",
  ]);

  if (existingAdmin) {
    console.log("SQLite seed already exists");
    return;
  }

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const wardenPassword = await bcrypt.hash("Warden@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  await runAsync(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES (?, ?, ?, ?, ?)`,
    ["System Admin", "admin@smartnest.com", adminPassword, "9999999991", "admin"]
  );

  await runAsync(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES (?, ?, ?, ?, ?)`,
    ["Main Warden", "warden@smartnest.com", wardenPassword, "9999999992", "warden"]
  );

  await runAsync(
    `INSERT INTO users (studentId, name, email, password, phone, course, year, parentContact, room, hostelBlock, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  await runAsync(
    `INSERT INTO rooms (roomSeries, roomNo, block, floor, sharing, roomType, capacity, occupied, monthlyFee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["A", "A-101", "A", 1, 2, "AC", 2, 1, 7800]
  );

  await runAsync(
    `INSERT INTO rooms (roomSeries, roomNo, block, floor, sharing, roomType, capacity, occupied, monthlyFee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["A", "A-102", "A", 1, 3, "Non AC", 3, 0, 5600]
  );

  await runAsync(
    `INSERT INTO rooms (roomSeries, roomNo, block, floor, sharing, roomType, capacity, occupied, monthlyFee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["B", "B-201", "B", 2, 1, "AC", 1, 0, 8000]
  );

  await runAsync(
    `INSERT INTO fees (studentId, studentName, amount, paidAmount, dueDate, status, paymentHistory)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["STD1001", "Demo Student", 7800, 0, "2026-04-10", "Pending", "[]"]
  );

  await runAsync(
    `INSERT INTO notices (title, description, priority, date, createdBy)
     VALUES (?, ?, ?, ?, ?)`,
    [
      "Hostel Gate Closing Time",
      "All students must return before 9:30 PM.",
      "Important",
      "2026-03-15",
      "Admin",
    ]
  );

  await runAsync(
    `INSERT INTO notices (title, description, priority, date, createdBy)
     VALUES (?, ?, ?, ?, ?)`,
    [
      "Water Maintenance",
      "Water supply will be interrupted from 10 AM to 12 PM on Sunday.",
      "Medium",
      "2026-03-16",
      "Warden",
    ]
  );

  const foodRows = [
    ["Monday", "Idli, Sambar & Peanut Chutney", "Rice, Dal Fry, Veg Curry & Curd", "Samosa & Tea", "Chapati, Paneer Butter Masala & Jeera Rice"],
    ["Tuesday", "Masala Dosa & Coconut Chutney", "Veg Biryani, Raita & Boiled Egg", "Veg Puff & Tea", "Rice, Sambar, Aloo Fry & Salad"],
    ["Wednesday", "Upma, Banana & Chutney", "Rice, Rasam, Beans Curry & Papad", "Bonda & Tea", "Chicken Curry, Rice & Onion Salad"],
    ["Thursday", "Poori & Potato Masala", "Lemon Rice, Dal Tadka & Veg Fry", "Biscuits & Tea", "Chapati, Mixed Veg Curry & Curd Rice"],
    ["Friday", "Pongal & Coconut Chutney", "Rice, Sambar, Cabbage Fry & Curd", "Mirchi Bajji & Tea", "Egg Curry, Rice & Tomato Dal"],
    ["Saturday", "Uttapam & Peanut Chutney", "Tomato Rice, Raita & Veg Kurma", "Cutlet & Tea", "Chapati, Dal Tadka & Veg Pulao"],
    ["Sunday", "Masala Dosa, Vada & Chutney", "Special Veg Meals with Sweet", "Noodles & Tea", "Chicken Biryani & Raita"],
  ];

  for (const item of foodRows) {
    await runAsync(
      `INSERT INTO food_menu (day, breakfast, lunch, snacks, dinner)
       VALUES (?, ?, ?, ?, ?)`,
      item
    );
  }

  console.log("SQLite seed completed successfully");
};

module.exports = seedDatabase;