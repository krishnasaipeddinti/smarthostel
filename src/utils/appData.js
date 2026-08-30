import { KEYS, getStorageData, setStorageData } from "./storage";

/* ---------------------- Price Utils ---------------------- */

const ROOM_PRICE_MAP = {
  "AC-1": 8000,
  "AC-2": 7800,
  "AC-3": 7000,
  "AC-4": 6500,
  "Non AC-1": 7000,
  "Non AC-2": 6200,
  "Non AC-3": 5600,
  "Non AC-4": 5000,
};

export const getRoomPrice = (roomType, sharing) => {
  return ROOM_PRICE_MAP[`${roomType}-${sharing}`] || 5500;
};

/* ---------------------- Notification Utils ---------------------- */

const emitNotificationsUpdate = () => {
  window.dispatchEvent(new Event("smartnest-notifications-updated"));
};

const addNotification = ({ recipientRole, title, message }) => {
  const notifications = getStorageData(KEYS.NOTIFICATIONS, []);

  const newNotification = {
    id: `NT${Date.now()}${Math.floor(Math.random() * 1000)}`,
    recipientRole,
    title,
    message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const updated = [newNotification, ...notifications];
  setStorageData(KEYS.NOTIFICATIONS, updated);
  emitNotificationsUpdate();
  return updated;
};

const getStudentRoomFee = (studentId) => {
  const users = getStorageData(KEYS.USERS, []);
  const rooms = getStorageData(KEYS.ROOMS, []);

  const student = users.find((user) => user.id === studentId);
  if (!student?.room || student.room === "Not Allotted") return 0;

  const room = rooms.find((item) => item.roomNo === student.room);
  if (!room) return 0;

  return (
    Number(room.monthlyFee) ||
    getRoomPrice(room.roomType, Number(room.sharing))
  );
};

/* ---------------------- Notices ---------------------- */

export const addNotice = (payload) => {
  const notices = getStorageData(KEYS.NOTICES, []);

  const newNotice = {
    id: `N${Date.now()}`,
    ...payload,
  };

  const updated = [newNotice, ...notices];
  setStorageData(KEYS.NOTICES, updated);

  addNotification({
    recipientRole: "student",
    title: "New Notice Added",
    message: `${payload.createdBy} added a new notice: ${payload.title}`,
  });

  return updated;
};

export const updateNotice = (id, payload) => {
  const notices = getStorageData(KEYS.NOTICES, []);

  const updated = notices.map((item) =>
    item.id === id ? { ...item, ...payload } : item
  );

  setStorageData(KEYS.NOTICES, updated);
  return updated;
};

/* ---------------------- Complaints ---------------------- */

export const addComplaint = (payload) => {
  const complaints = getStorageData(KEYS.COMPLAINTS, []);

  const newComplaint = {
    id: `C${Date.now()}`,
    status: "Pending",
    ...payload,
  };

  const updated = [newComplaint, ...complaints];
  setStorageData(KEYS.COMPLAINTS, updated);

  addNotification({
    recipientRole: "warden",
    title: "New Complaint",
    message: `${payload.studentName} submitted a complaint: ${payload.title}`,
  });

  return updated;
};

export const updateComplaintStatus = (id, status) => {
  const complaints = getStorageData(KEYS.COMPLAINTS, []);

  const updated = complaints.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  setStorageData(KEYS.COMPLAINTS, updated);
  return updated;
};

/* ---------------------- Leaves ---------------------- */

export const addLeaveRequest = (payload) => {
  const leaves = getStorageData(KEYS.LEAVES, []);

  const newLeave = {
    id: `L${Date.now()}`,
    status: "Pending",
    ...payload,
  };

  const updated = [newLeave, ...leaves];
  setStorageData(KEYS.LEAVES, updated);

  addNotification({
    recipientRole: "warden",
    title: "New Leave Request",
    message: `${payload.studentName} submitted a leave request.`,
  });

  return updated;
};

export const updateLeaveStatus = (id, status) => {
  const leaves = getStorageData(KEYS.LEAVES, []);

  const updated = leaves.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  setStorageData(KEYS.LEAVES, updated);
  return updated;
};

/* ---------------------- Fees ---------------------- */

export const updateFeeStatus = (id, status) => {
  const fees = getStorageData(KEYS.FEES, []);

  const updated = fees.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  setStorageData(KEYS.FEES, updated);
  return updated;
};

export const processStudentFeePayment = ({
  feeId,
  paidAmount,
  paymentMethod,
  paymentDetails,
}) => {
  const fees = getStorageData(KEYS.FEES, []);
  let feeOwnerName = "";

  const updated = fees.map((item) => {
    if (item.id !== feeId) return item;

    feeOwnerName = item.studentName;

    const derivedTotal =
      Number(item.amount) || getStudentRoomFee(item.studentId) || 0;

    const currentPaid = Number(item.paidAmount || 0);
    const payment = Number(paidAmount || 0);
    const nextPaid = Math.min(currentPaid + payment, derivedTotal);
    const remaining = Math.max(0, derivedTotal - nextPaid);

    return {
      ...item,
      amount: derivedTotal,
      paidAmount: nextPaid,
      status: remaining <= 0 ? "Paid" : nextPaid > 0 ? "Partial" : "Pending",
      paymentHistory: [
        {
          id: `PAY${Date.now()}`,
          amount: payment,
          method: paymentMethod,
          details: paymentDetails,
          date: new Date().toISOString(),
        },
        ...(item.paymentHistory || []),
      ],
    };
  });

  setStorageData(KEYS.FEES, updated);

  addNotification({
    recipientRole: "warden",
    title: "Fee Payment Update",
    message: `${feeOwnerName} made a fee payment using ${paymentMethod}.`,
  });

  return updated;
};

/* ---------------------- Rooms ---------------------- */

export const addRoom = (payload) => {
  const rooms = getStorageData(KEYS.ROOMS, []);

  const sharing = Number(payload.sharing);
  const roomType = payload.roomType;
  const monthlyFee = getRoomPrice(roomType, sharing);

  const newRoom = {
    id: `R${Date.now()}`,
    roomSeries: payload.roomSeries,
    roomNo: payload.roomNo,
    block: payload.roomSeries,
    floor: Number(payload.floor || 1),
    sharing,
    roomType,
    capacity: sharing,
    occupied: 0,
    monthlyFee,
  };

  const updated = [newRoom, ...rooms];
  setStorageData(KEYS.ROOMS, updated);
  return updated;
};

export const updateRoom = (id, payload) => {
  const rooms = getStorageData(KEYS.ROOMS, []);

  const updated = rooms.map((room) => {
    if (room.id !== id) return room;

    const nextSharing = Number(payload.sharing ?? room.sharing);
    const nextRoomType = payload.roomType ?? room.roomType;

    return {
      ...room,
      ...payload,
      sharing: nextSharing,
      capacity: nextSharing,
      monthlyFee: getRoomPrice(nextRoomType, nextSharing),
    };
  });

  setStorageData(KEYS.ROOMS, updated);
  return updated;
};

export const assignRoomToStudent = (studentId, roomId) => {
  const users = getStorageData(KEYS.USERS, []);
  const rooms = getStorageData(KEYS.ROOMS, []);
  const fees = getStorageData(KEYS.FEES, []);
  const currentUser = getStorageData(KEYS.CURRENT_USER, null);

  const student = users.find((user) => user.id === studentId);
  const targetRoom = rooms.find((room) => room.id === roomId);

  if (!student || !targetRoom) {
    throw new Error("Student or room not found.");
  }

  const safeRoomFee =
    Number(targetRoom.monthlyFee) ||
    getRoomPrice(targetRoom.roomType, Number(targetRoom.sharing));

  const currentRoomNo = student.room;
  const previousRoom = rooms.find((room) => room.roomNo === currentRoomNo);

  if (previousRoom && previousRoom.id === targetRoom.id) {
    throw new Error("Student is already allotted to this room.");
  }

  if (Number(targetRoom.occupied) >= Number(targetRoom.capacity)) {
    throw new Error("Selected room is already full.");
  }

  const updatedRooms = rooms.map((room) => {
    if (previousRoom && room.id === previousRoom.id) {
      return {
        ...room,
        occupied: Math.max(0, Number(room.occupied || 0) - 1),
      };
    }

    if (room.id === targetRoom.id) {
      return {
        ...room,
        occupied: Number(room.occupied || 0) + 1,
        monthlyFee:
          Number(room.monthlyFee) ||
          getRoomPrice(room.roomType, Number(room.sharing)),
      };
    }

    return room;
  });

  const updatedUsers = users.map((user) =>
    user.id === studentId
      ? {
          ...user,
          room: targetRoom.roomNo,
          hostelBlock: targetRoom.block,
        }
      : user
  );

  const existingFee = fees.find((fee) => fee.studentId === studentId);

  let updatedFees;
  if (existingFee) {
    const paidAmount = Number(existingFee.paidAmount || 0);

    updatedFees = fees.map((fee) => {
      if (fee.studentId !== studentId) return fee;

      return {
        ...fee,
        studentName: student.name,
        amount: safeRoomFee,
        paidAmount,
        status:
          paidAmount >= safeRoomFee
            ? "Paid"
            : paidAmount > 0
            ? "Partial"
            : "Pending",
      };
    });
  } else {
    updatedFees = [
      {
        id: `F${Date.now()}`,
        studentId,
        studentName: student.name,
        amount: safeRoomFee,
        paidAmount: 0,
        dueDate: "2026-04-10",
        status: "Pending",
        paymentHistory: [],
      },
      ...fees,
    ];
  }

  setStorageData(KEYS.ROOMS, updatedRooms);
  setStorageData(KEYS.USERS, updatedUsers);
  setStorageData(KEYS.FEES, updatedFees);

  if (currentUser && currentUser.id === studentId) {
    const latestStudent = updatedUsers.find((user) => user.id === studentId);
    setStorageData(KEYS.CURRENT_USER, latestStudent);
  }

  return {
    users: updatedUsers,
    rooms: updatedRooms,
    fees: updatedFees,
    student: updatedUsers.find((user) => user.id === studentId),
  };
};

/* ---------------------- Students ---------------------- */

export const updateStudentProfile = (studentId, payload) => {
  const users = getStorageData(KEYS.USERS, []);

  const updatedUsers = users.map((user) =>
    user.id === studentId ? { ...user, ...payload } : user
  );

  setStorageData(KEYS.USERS, updatedUsers);

  const currentUser = getStorageData(KEYS.CURRENT_USER, null);
  if (currentUser && currentUser.id === studentId) {
    setStorageData(KEYS.CURRENT_USER, { ...currentUser, ...payload });
  }

  return updatedUsers.find((user) => user.id === studentId) || null;
};

export const updateStudentByAdminOrWarden = (studentId, payload) => {
  return updateStudentProfile(studentId, payload);
};

/* ---------------------- Food Menu ---------------------- */

export const updateFoodMenuItem = (id, payload) => {
  const menu = getStorageData(KEYS.FOOD_MENU, []);

  const updated = menu.map((item) =>
    item.id === id ? { ...item, ...payload } : item
  );

  setStorageData(KEYS.FOOD_MENU, updated);
  return updated;
};

/* ---------------------- Maintenance ---------------------- */

export const updateMaintenanceStatus = (id, status) => {
  const items = getStorageData(KEYS.MAINTENANCE, []);

  const updated = items.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  setStorageData(KEYS.MAINTENANCE, updated);
  return updated;
};