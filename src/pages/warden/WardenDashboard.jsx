import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BedDouble,
  FileWarning,
  ClipboardCheck,
  Bell,
  UtensilsCrossed,
  CheckCircle2,
  Wallet,
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

function WardenDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    activeComplaints: 0,
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

      const activeComplaints = complaints.filter(
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
        occupiedRooms,
        availableRooms,
        occupiedBeds,
        totalBeds,
        activeComplaints,
        resolvedComplaints,
        pendingLeaves,
        approvedLeaves,
        totalNotices: notices.length,
        menuDays: foodMenu.length,
      });
    } catch (error) {
      console.error("Warden dashboard sync failed:", error);
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
      title="Warden Dashboard"
      subtitle="Track hostel activity with synced live records."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={clickableCardClass} onClick={() => navigate("/warden/students")}>
          <StatCard
            icon={Users}
            label="Students"
            value={loading ? "..." : stats.totalStudents}
            hint="Students under hostel records"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/rooms")}>
          <StatCard
            icon={BedDouble}
            label="Occupied Rooms"
            value={loading ? "..." : stats.occupiedRooms}
            hint={`Available rooms: ${stats.availableRooms}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/fees")}>
          <StatCard
            icon={Wallet}
            label="Bed Occupancy"
            value={loading ? "..." : `${stats.occupiedBeds}/${stats.totalBeds}`}
            hint="Occupied beds / total capacity"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/complaints")}>
          <StatCard
            icon={FileWarning}
            label="Active Complaints"
            value={loading ? "..." : stats.activeComplaints}
            hint={`Resolved: ${stats.resolvedComplaints}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/leaves")}>
          <StatCard
            icon={ClipboardCheck}
            label="Pending Leaves"
            value={loading ? "..." : stats.pendingLeaves}
            hint={`Approved: ${stats.approvedLeaves}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/notices")}>
          <StatCard
            icon={Bell}
            label="Notices"
            value={loading ? "..." : stats.totalNotices}
            hint="Hostel notices available"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/food-menu")}>
          <StatCard
            icon={UtensilsCrossed}
            label="Food Menu Days"
            value={loading ? "..." : stats.menuDays}
            hint="Weekly menu synced"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/warden/rooms")}>
          <StatCard
            icon={CheckCircle2}
            label="Available Rooms"
            value={loading ? "..." : stats.availableRooms}
            hint="Rooms with remaining capacity"
          />
        </div>
      </div>

      <div className="glass mt-6 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Warden Overview</h3>
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
            <p className="mt-2">{stats.totalStudents} students currently tracked</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Rooms</p>
            <p className="mt-2">
              {stats.occupiedRooms} occupied and {stats.availableRooms} available
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Approvals</p>
            <p className="mt-2">
              {stats.pendingLeaves} leave requests waiting for action
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Issue Tracking</p>
            <p className="mt-2">
              {stats.activeComplaints} active complaints currently open
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default WardenDashboard;