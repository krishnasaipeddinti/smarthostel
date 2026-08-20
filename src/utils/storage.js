const KEYS = {
  USERS: "smartnest_users",
  CURRENT_USER: "smartnest_current_user",
  ROOMS: "smartnest_rooms",
  NOTICES: "smartnest_notices",
  FEES: "smartnest_fees",
  COMPLAINTS: "smartnest_complaints",
  LEAVES: "smartnest_leaves",
  FOOD_MENU: "smartnest_food_menu",
  MAINTENANCE: "smartnest_maintenance",
  NOTIFICATIONS: "smartnest_notifications",
};

export const getStorageData = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const setStorageData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorageData = (key) => {
  localStorage.removeItem(key);
};

export { KEYS };