export const staticUsers = [
  {
    id: "ADM001",
    name: "System Admin",
    email: "admin@smartnest.com",
    password: "Admin@123",
    role: "admin",
    phone: "9999999991",
  },
  {
    id: "WRD001",
    name: "Main Warden",
    email: "warden@smartnest.com",
    password: "Warden@123",
    role: "warden",
    phone: "9999999992",
  },
  {
    id: "STD1001",
    name: "Demo Student",
    email: "student@smartnest.com",
    password: "Student@123",
    role: "student",
    phone: "9999999993",
    course: "B.Tech CSE",
    year: "3rd Year",
    parentContact: "9999999994",
    room: "A-101",
    hostelBlock: "A",
  },
];

export const roomData = [
  {
    id: "R001",
    roomSeries: "A",
    roomNo: "A-101",
    block: "A",
    floor: 1,
    sharing: 2,
    roomType: "AC",
    capacity: 2,
    occupied: 1,
    monthlyFee: 7800,
  },
  {
    id: "R002",
    roomSeries: "A",
    roomNo: "A-102",
    block: "A",
    floor: 1,
    sharing: 3,
    roomType: "Non AC",
    capacity: 3,
    occupied: 0,
    monthlyFee: 5600,
  },
  {
    id: "R003",
    roomSeries: "B",
    roomNo: "B-201",
    block: "B",
    floor: 2,
    sharing: 1,
    roomType: "AC",
    capacity: 1,
    occupied: 0,
    monthlyFee: 8000,
  },
  {
    id: "R004",
    roomSeries: "C",
    roomNo: "C-301",
    block: "C",
    floor: 3,
    sharing: 4,
    roomType: "Non AC",
    capacity: 4,
    occupied: 0,
    monthlyFee: 5000,
  },
];

export const noticeData = [
  {
    id: "N001",
    title: "Hostel Gate Closing Time",
    description: "All students must return before 9:30 PM.",
    priority: "Important",
    date: "2026-03-15",
    createdBy: "Admin",
  },
  {
    id: "N002",
    title: "Water Maintenance",
    description: "Water supply will be interrupted from 10 AM to 12 PM on Sunday.",
    priority: "Medium",
    date: "2026-03-16",
    createdBy: "Warden",
  },
];

export const feeData = [
  {
    id: "F001",
    studentId: "STD1001",
    studentName: "Demo Student",
    amount: 7800,
    paidAmount: 0,
    dueDate: "2026-04-10",
    status: "Pending",
    paymentHistory: [],
  },
];

export const complaintData = [
  {
    id: "C001",
    studentId: "STD1001",
    studentName: "Demo Student",
    category: "WiFi",
    title: "WiFi issue in room",
    description: "Internet speed is very slow in the evening.",
    status: "Pending",
    createdAt: "2026-03-15",
  },
];

export const leaveData = [
  {
    id: "L001",
    studentId: "STD1001",
    studentName: "Demo Student",
    fromDate: "2026-03-20",
    toDate: "2026-03-22",
    reason: "Family function",
    status: "Pending",
  },
];

export const foodMenuData = [
  {
    id: "M001",
    day: "Monday",
    breakfast: "Idli, Sambar & Peanut Chutney",
    lunch: "Rice, Dal Fry, Veg Curry & Curd",
    snacks: "Samosa & Tea",
    dinner: "Chapati, Paneer Butter Masala & Jeera Rice",
  },
  {
    id: "M002",
    day: "Tuesday",
    breakfast: "Masala Dosa & Coconut Chutney",
    lunch: "Veg Biryani, Raita & Boiled Egg",
    snacks: "Veg Puff & Tea",
    dinner: "Rice, Sambar, Aloo Fry & Salad",
  },
  {
    id: "M003",
    day: "Wednesday",
    breakfast: "Upma, Banana & Chutney",
    lunch: "Rice, Rasam, Beans Curry & Papad",
    snacks: "Bonda & Tea",
    dinner: "Chicken Curry, Rice & Onion Salad",
  },
  {
    id: "M004",
    day: "Thursday",
    breakfast: "Poori & Potato Masala",
    lunch: "Lemon Rice, Dal Tadka & Veg Fry",
    snacks: "Biscuits & Tea",
    dinner: "Chapati, Mixed Veg Curry & Curd Rice",
  },
  {
    id: "M005",
    day: "Friday",
    breakfast: "Pongal & Coconut Chutney",
    lunch: "Rice, Sambar, Cabbage Fry & Curd",
    snacks: "Mirchi Bajji & Tea",
    dinner: "Egg Curry, Rice & Tomato Dal",
  },
  {
    id: "M006",
    day: "Saturday",
    breakfast: "Uttapam & Peanut Chutney",
    lunch: "Tomato Rice, Raita & Veg Kurma",
    snacks: "Cutlet & Tea",
    dinner: "Chapati, Dal Tadka & Veg Pulao",
  },
  {
    id: "M007",
    day: "Sunday",
    breakfast: "Masala Dosa, Vada & Chutney",
    lunch: "Special Veg Meals with Sweet",
    snacks: "Noodles & Tea",
    dinner: "Chicken Biryani & Raita",
  },
];

export const maintenanceData = [
  {
    id: "MT001",
    area: "Block A Water Tank",
    issue: "Cleaning required",
    assignedTo: "Maintenance Team",
    status: "In Progress",
  },
];