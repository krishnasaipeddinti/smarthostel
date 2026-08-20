import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BedDouble,
  Wallet,
  FileWarning,
  ClipboardCheck,
  Bell,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";
import PageShell from "../../components/common/PageShell";
import StatCard from "../../components/common/StatCard";
import {
  getStudentsApi,
  getRoomsApi,
  getAllComplaintsApi,
  getAllLeavesApi,
  getNoticesApi,
  getFoodMenuApi,
} from "../../services/hostelApi";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalNotices: 0,
    menuDays: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        studentsData,
        roomsData,
        complaintsData,
        leavesData,
        noticesData,
        foodMenuData,
      ] = await Promise.all([
        getStudentsApi(),
        getRoomsApi(),
        getAllComplaintsApi(),
        getAllLeavesApi(),
        getNoticesApi(),
        getFoodMenuApi(),
      ]);

      const students = Array.isArray(studentsData) ? studentsData : [];
      const rooms = Array.isArray(roomsData) ? roomsData : [];
      const complaints = Array.isArray(complaintsData) ? complaintsData : [];
      const leaves = Array.isArray(leavesData) ? leavesData : [];
      const notices = Array.isArray(noticesData) ? noticesData : [];
      const foodMenu = Array.isArray(foodMenuData) ? foodMenuData : [];

      const occupiedRooms = rooms.filter(
        (room) => Number(room.occupied || 0) > 0
      ).length;

      const availableRooms = rooms.filter(
        (room) => Number(room.occupied || 0) < Number(room.capacity || 0)
      ).length;

      const occupiedBeds = rooms.reduce(
        (sum, room) => sum + Number(room.occupied || 0),
        0
      );

      const totalBeds = rooms.reduce(
        (sum, room) => sum + Number(room.capacity || 0),
        0
      );

      const pendingComplaints = complaints.filter(
        (item) => item.status === "Pending" || item.status === "In Progress"
      ).length;

      const resolvedComplaints = complaints.filter(
        (item) => item.status === "Resolved"
      ).length;

      const pendingLeaves = leaves.filter(
        (item) => item.status === "Pending"
      ).length;

      const approvedLeaves = leaves.filter(
        (item) => item.status === "Approved"
      ).length;

      setStats({
        totalStudents: students.length,
        totalRooms: rooms.length,
        occupiedRooms,
        availableRooms,
        occupiedBeds,
        totalBeds,
        pendingComplaints,
        resolvedComplaints,
        pendingLeaves,
        approvedLeaves,
        totalNotices: notices.length,
        menuDays: foodMenu.length,
      });
    } catch (error) {
      console.error("Admin dashboard sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const clickableCardClass =
    "cursor-pointer rounded-[28px] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl";

  return (
    <PageShell
      title="Admin Dashboard"
      subtitle="Monitor hostel operations with live synced data."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={clickableCardClass} onClick={() => navigate("/admin/students")}>
          <StatCard
            icon={Users}
            label="Total Students"
            value={loading ? "..." : stats.totalStudents}
            hint="Registered hostel students"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/rooms")}>
          <StatCard
            icon={BedDouble}
            label="Total Rooms"
            value={loading ? "..." : stats.totalRooms}
            hint="Rooms available in hostel"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/rooms")}>
          <StatCard
            icon={CheckCircle2}
            label="Occupied Rooms"
            value={loading ? "..." : stats.occupiedRooms}
            hint={`Available rooms: ${stats.availableRooms}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/fees")}>
          <StatCard
            icon={Wallet}
            label="Bed Occupancy"
            value={loading ? "..." : `${stats.occupiedBeds}/${stats.totalBeds}`}
            hint="Occupied beds / total beds"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/complaints")}>
          <StatCard
            icon={FileWarning}
            label="Pending Complaints"
            value={loading ? "..." : stats.pendingComplaints}
            hint={`Resolved: ${stats.resolvedComplaints}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/leaves")}>
          <StatCard
            icon={ClipboardCheck}
            label="Pending Leaves"
            value={loading ? "..." : stats.pendingLeaves}
            hint={`Approved: ${stats.approvedLeaves}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/notices")}>
          <StatCard
            icon={Bell}
            label="Total Notices"
            value={loading ? "..." : stats.totalNotices}
            hint="Announcements added"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/admin/food-menu")}>
          <StatCard
            icon={UtensilsCrossed}
            label="Food Menu Days"
            value={loading ? "..." : stats.menuDays}
            hint="Weekly menu entries"
          />
        </div>
      </div>

      <div className="glass mt-6 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Live Overview</h3>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadDashboardData}
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Students</p>
            <p className="mt-2">Current registered students: {stats.totalStudents}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Rooms</p>
            <p className="mt-2">
              {stats.occupiedRooms} occupied / {stats.totalRooms} total rooms
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Service Requests</p>
            <p className="mt-2">
              {stats.pendingComplaints} active complaints and {stats.pendingLeaves} pending leave requests
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Communication</p>
            <p className="mt-2">
              {stats.totalNotices} notices and {stats.menuDays} food menu records synced
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default AdminDashboard;