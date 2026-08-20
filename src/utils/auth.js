import {
  staticUsers,
  roomData,
  noticeData,
  feeData,
  complaintData,
  leaveData,
  foodMenuData,
  maintenanceData,
} from "../data/mockData";
import {
  getStorageData,
  setStorageData,
  removeStorageData,
  KEYS,
} from "./storage";

const shouldRefreshFoodMenu = (menu) => {
  if (!Array.isArray(menu)) return true;
  if (menu.length !== 7) return true;

  const requiredDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const menuDays = menu.map((item) => item.day);
  const hasAllDays = requiredDays.every((day) => menuDays.includes(day));
  if (!hasAllDays) return true;

  const hasSnacksField = menu.every((item) =>
    Object.prototype.hasOwnProperty.call(item, "snacks")
  );

  return !hasSnacksField;
};

export const seedInitialData = () => {
  if (!getStorageData(KEYS.USERS, null)) {
    setStorageData(KEYS.USERS, staticUsers);
  }

  if (!getStorageData(KEYS.ROOMS, null)) {
    setStorageData(KEYS.ROOMS, roomData);
  }

  if (!getStorageData(KEYS.NOTICES, null)) {
    setStorageData(KEYS.NOTICES, noticeData);
  }

  if (!getStorageData(KEYS.FEES, null)) {
    setStorageData(KEYS.FEES, feeData);
  }

  if (!getStorageData(KEYS.COMPLAINTS, null)) {
    setStorageData(KEYS.COMPLAINTS, complaintData);
  }

  if (!getStorageData(KEYS.LEAVES, null)) {
    setStorageData(KEYS.LEAVES, leaveData);
  }

  const existingFoodMenu = getStorageData(KEYS.FOOD_MENU, null);
  if (!existingFoodMenu || shouldRefreshFoodMenu(existingFoodMenu)) {
    setStorageData(KEYS.FOOD_MENU, foodMenuData);
  }

  if (!getStorageData(KEYS.MAINTENANCE, null)) {
    setStorageData(KEYS.MAINTENANCE, maintenanceData);
  }

  if (!getStorageData(KEYS.NOTIFICATIONS, null)) {
    setStorageData(KEYS.NOTIFICATIONS, []);
  }
};

export const getAllUsers = () => getStorageData(KEYS.USERS, []);
export const getStudents = () =>
  getAllUsers().filter((user) => user.role === "student");

export const getRooms = () => getStorageData(KEYS.ROOMS, []);
export const getNotices = () => getStorageData(KEYS.NOTICES, []);
export const getFees = () => getStorageData(KEYS.FEES, []);
export const getComplaints = () => getStorageData(KEYS.COMPLAINTS, []);
export const getLeaves = () => getStorageData(KEYS.LEAVES, []);
export const getFoodMenu = () => getStorageData(KEYS.FOOD_MENU, []);
export const getMaintenance = () => getStorageData(KEYS.MAINTENANCE, []);
export const getNotifications = () => getStorageData(KEYS.NOTIFICATIONS, []);

export const getUnreadNotificationsByRole = (role) => {
  const all = getNotifications();
  return all.filter((item) => item.recipientRole === role && !item.isRead);
};

export const markAllNotificationsAsRead = (role) => {
  const notifications = getNotifications();

  const updated = notifications.map((item) =>
    item.recipientRole === role ? { ...item, isRead: true } : item
  );

  setStorageData(KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new Event("smartnest-notifications-updated"));
  return updated;
};

export const getCurrentUser = () => getStorageData(KEYS.CURRENT_USER, null);

export const loginUser = ({ email, password }) => {
  const users = getAllUsers();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  setStorageData(KEYS.CURRENT_USER, user);
  return user;
};

export const logoutUser = () => {
  removeStorageData(KEYS.CURRENT_USER);
};

export const signupStudent = (payload) => {
  const users = getAllUsers();

  const exists = users.some(
    (item) => item.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (exists) {
    throw new Error("Email already exists. Please login.");
  }

  const nextId = `STD${1000 + getStudents().length + 1}`;

  const newStudent = {
    id: nextId,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "student",
    phone: payload.phone,
    course: payload.course,
    year: payload.year,
    parentContact: payload.parentContact,
    room: "Not Allotted",
    hostelBlock: "-",
  };

  const updatedUsers = [...users, newStudent];
  setStorageData(KEYS.USERS, updatedUsers);
  setStorageData(KEYS.CURRENT_USER, newStudent);

  return newStudent;
};