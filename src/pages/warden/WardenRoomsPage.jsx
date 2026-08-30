import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import {
  addRoomApi,
  deleteRoomApi,
  getRoomsApi,
  updateRoomApi,
} from "../../services/hostelApi";

const DEFAULT_ROOM_PRICES = {
  "AC-1": 8000,
  "AC-2": 7800,
  "AC-3": 7000,
  "AC-4": 6500,
  "Non AC-1": 7000,
  "Non AC-2": 6200,
  "Non AC-3": 5600,
  "Non AC-4": 5000,
};

const getDefaultPrice = (type, share) =>
  DEFAULT_ROOM_PRICES[`${type}-${share}`] || 5500;

const WardenRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    roomSeries: "A",
    roomNo: "",
    floor: "",
    sharing: "1",
    roomType: "AC",
    monthlyFee: "8000",
  });

  const loadRooms = async () => {
    try {
      const data = await getRoomsApi();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Rooms fetch failed:", error);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      roomSeries: "A",
      roomNo: "",
      floor: "",
      sharing: "1",
      roomType: "AC",
      monthlyFee: "8000",
    });
  };

  const handleSharingChange = (val) => {
    setForm((prev) => ({
      ...prev,
      sharing: val,
      monthlyFee: String(getDefaultPrice(prev.roomType, val)),
    }));
  };

  const handleRoomTypeChange = (val) => {
    setForm((prev) => ({
      ...prev,
      roomType: val,
      monthlyFee: String(getDefaultPrice(val, prev.sharing)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateRoomApi(editingId, form);
      } else {
        await addRoomApi(form);
      }

      resetForm();
      loadRooms();
    } catch (error) {
      alert(error.response?.data?.message || "Room action failed");
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      roomSeries: room.roomSeries,
      roomNo: room.roomNo,
      floor: String(room.floor),
      sharing: String(room.sharing),
      roomType: room.roomType,
      monthlyFee: String(
        room.monthlyFee ?? getDefaultPrice(room.roomType, room.sharing)
      ),
    });
  };

  const handleDelete = async (id, roomNo) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNo}?`)) {
      return;
    }

    try {
      await deleteRoomApi(id);
      loadRooms();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <PageShell
      title="Rooms"
      subtitle="Add, edit and monitor room availability."
    >
      <form
        onSubmit={handleSubmit}
        className="glass mb-6 rounded-3xl p-5 shadow-2xl"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Block / Series
            </label>
            <select
              className="input"
              value={form.roomSeries}
              onChange={(e) =>
                setForm({ ...form, roomSeries: e.target.value })
              }
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Room Number
            </label>
            <input
              className="input"
              placeholder="e.g. 101"
              value={form.roomNo}
              onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Floor
            </label>
            <input
              className="input"
              placeholder="e.g. 1"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Sharing
            </label>
            <select
              className="input"
              value={form.sharing}
              onChange={(e) => handleSharingChange(e.target.value)}
            >
              <option value="1">1 Share</option>
              <option value="2">2 Share</option>
              <option value="3">3 Share</option>
              <option value="4">4 Share</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Room Type
            </label>
            <select
              className="input"
              value={form.roomType}
              onChange={(e) => handleRoomTypeChange(e.target.value)}
            >
              <option value="AC">AC</option>
              <option value="Non AC">Non AC</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Price / Monthly Fee (₹)
            </label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 8000"
              value={form.monthlyFee}
              onChange={(e) =>
                setForm({ ...form, monthlyFee: e.target.value })
              }
              required
              min="0"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn-primary" type="submit">
            {editingId ? "Update Room" : "Add Room"}
          </button>
          {editingId && (
            <button
              className="btn-secondary"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="glass rounded-3xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">{room.roomNo}</h3>
                <span className="badge">{room.roomType}</span>
                <span className="badge">{room.sharing} Share</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => handleEdit(room)}
                >
                  Edit
                </button>
                <button
                  className="btn-secondary text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300"
                  type="button"
                  onClick={() => handleDelete(room.id, room.roomNo)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
              <p>
                <span className="font-semibold text-white">Block:</span>{" "}
                {room.block}
              </p>
              <p>
                <span className="font-semibold text-white">Floor:</span>{" "}
                {room.floor}
              </p>
              <p>
                <span className="font-semibold text-white">Occupied:</span>{" "}
                {room.occupied}/{room.capacity}
              </p>
              <p>
                <span className="font-semibold text-white">Monthly Fee:</span> ₹
                {room.monthlyFee}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default WardenRoomsPage;