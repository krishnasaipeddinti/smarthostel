import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  UserCircle2,
  Wallet,
  ClipboardCheck,
  Bell,
  FileWarning,
} from "lucide-react";
import PageShell from "../../components/common/PageShell";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  getRoomsApi,
  getMyFeeApi,
  getMyComplaintsApi,
  getMyLeavesApi,
  getNoticesApi,
} from "../../services/hostelApi";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [localUser, setLocalUser] = useState(user || null);
  const [rooms, setRooms] = useState([]);
  const [currentFee, setCurrentFee] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    course: "",
    year: "",
    parentContact: "",
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const latestUser = await refreshUser();
      const safeUser = latestUser || user || null;
      setLocalUser(safeUser);

      const [roomsData, feeData, complaintsData, leavesData, noticesData] =
        await Promise.all([
          getRoomsApi(),
          getMyFeeApi(),
          getMyComplaintsApi(),
          getMyLeavesApi(),
          getNoticesApi(),
        ]);

      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setCurrentFee(feeData || null);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
    } catch (error) {
      console.error("Student dashboard sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    setForm({
      name: localUser?.name || "",
      phone: localUser?.phone || "",
      course: localUser?.course || "",
      year: localUser?.year || "",
      parentContact: localUser?.parentContact || "",
    });
  }, [localUser]);

  const allottedRoom = useMemo(() => {
    return rooms.find((room) => room.roomNo === localUser?.room) || null;
  }, [rooms, localUser?.room]);

  const totalFee = useMemo(() => {
    return Number(currentFee?.amount) || Number(allottedRoom?.monthlyFee) || 0;
  }, [currentFee?.amount, allottedRoom?.monthlyFee]);

  const paidAmount = Number(currentFee?.paidAmount || 0);
  const remainingFee = Math.max(0, totalFee - paidAmount);

  const activeComplaints = complaints.filter(
    (item) => item.status === "Pending" || item.status === "In Progress"
  ).length;

  const pendingLeaves = leaves.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedLeaves = leaves.filter(
    (item) => item.status === "Approved"
  ).length;

  const feeStatusDisplay =
    remainingFee === 0 && totalFee > 0
      ? "Paid"
      : currentFee?.status || (totalFee > 0 ? "Pending" : "Not Assigned");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalUser((prev) =>
      prev
        ? {
            ...prev,
            name: form.name,
            phone: form.phone,
            course: form.course,
            year: form.year,
            parentContact: form.parentContact,
          }
        : prev
    );

    setIsEditing(false);
  };

  const clickableCardClass =
    "cursor-pointer rounded-[28px] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl";

  return (
    <PageShell
      title="Student Dashboard"
      subtitle="Your allotted room, fee summary, requests, and live hostel updates."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={clickableCardClass} onClick={() => navigate("/student")}>
          <StatCard
            icon={UserCircle2}
            label="Student"
            value={loading ? "..." : localUser?.name || "-"}
            hint="Logged in student"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student")}>
          <StatCard
            icon={BedDouble}
            label="Room"
            value={loading ? "..." : localUser?.room || "Not Allotted"}
            hint={
              allottedRoom
                ? `${allottedRoom.roomType} • ${allottedRoom.sharing} Share`
                : "Allocated room number"
            }
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student/fees")}>
          <StatCard
            icon={Wallet}
            label="Total Fee"
            value={loading ? "..." : totalFee ? `₹${totalFee}` : "Not Assigned"}
            hint="Based on allotted room"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student/fees")}>
          <StatCard
            icon={ClipboardCheck}
            label="Remaining Fee"
            value={
              loading ? "..." : remainingFee === 0 && totalFee > 0 ? "No Due" : `₹${remainingFee}`
            }
            hint={remainingFee === 0 ? "No pending hostel fee" : "Pending hostel fee"}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student/complaints")}>
          <StatCard
            icon={FileWarning}
            label="Active Complaints"
            value={loading ? "..." : activeComplaints}
            hint={`Total complaints: ${complaints.length}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student/leaves")}>
          <StatCard
            icon={ClipboardCheck}
            label="Leave Requests"
            value={loading ? "..." : pendingLeaves}
            hint={`Approved leaves: ${approvedLeaves}`}
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student/notices")}>
          <StatCard
            icon={Bell}
            label="Notices"
            value={loading ? "..." : notices.length}
            hint="Latest hostel announcements"
          />
        </div>

        <div className={clickableCardClass} onClick={() => navigate("/student")}>
          <StatCard
            icon={BedDouble}
            label="Hostel Block"
            value={loading ? "..." : localUser?.hostelBlock || "-"}
            hint="Current block assignment"
          />
        </div>
      </div>

      <div className="glass mt-6 rounded-3xl p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">My Details</h3>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel" : "Edit Details"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              className="input"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Course"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
            <input
              className="input md:col-span-2"
              placeholder="Parent Contact"
              value={form.parentContact}
              onChange={(e) =>
                setForm({ ...form, parentContact: e.target.value })
              }
              required
            />

            <button className="btn-primary md:col-span-2" type="submit">
              Save Details
            </button>
          </form>
        ) : (
          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Name:</span>{" "}
              {localUser?.name || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Email:</span>{" "}
              {localUser?.email || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Phone:</span>{" "}
              {localUser?.phone || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Course:</span>{" "}
              {localUser?.course || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Year:</span>{" "}
              {localUser?.year || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Parent Contact:</span>{" "}
              {localUser?.parentContact || "-"}
            </p>
            <p>
              <span className="font-semibold text-white">Room Number:</span>{" "}
              {localUser?.room || "Not Allotted"}
            </p>
            <p>
              <span className="font-semibold text-white">Hostel Block:</span>{" "}
              {localUser?.hostelBlock || "-"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-3xl p-5 shadow-2xl">
          <h3 className="text-lg font-semibold text-white">Fee Summary</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <p>
              <span className="font-semibold text-white">Total Fee:</span>{" "}
              {totalFee ? `₹${totalFee}` : "Not Assigned"}
            </p>
            <p>
              <span className="font-semibold text-white">Paid Amount:</span> ₹
              {paidAmount}
            </p>
            <p>
              <span className="font-semibold text-white">Remaining:</span>{" "}
              {remainingFee === 0 && totalFee > 0 ? "No Due" : `₹${remainingFee}`}
            </p>
            <p>
              <span className="font-semibold text-white">Status:</span>{" "}
              {feeStatusDisplay}
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-5 shadow-2xl">
          <h3 className="text-lg font-semibold text-white">Quick Overview</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <p>
              You currently have <span className="font-semibold text-white">{activeComplaints}</span> active complaints.
            </p>
            <p>
              You currently have <span className="font-semibold text-white">{pendingLeaves}</span> pending leave requests.
            </p>
            <p>
              Hostel has shared <span className="font-semibold text-white">{notices.length}</span> notices for students.
            </p>
            <p>
              Assigned room type:{" "}
              <span className="font-semibold text-white">
                {allottedRoom ? `${allottedRoom.roomType} • ${allottedRoom.sharing} Share` : "Not Allotted"}
              </span>
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={loadDashboardData}
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default StudentDashboard;