import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import {
  addRoomApi,
  getRoomsApi,
  updateRoomApi,
} from "../../services/hostelApi";

function RoomsManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    roomSeries: "A",
    roomNo: "",
    floor: "",
    sharing: "1",
    roomType: "AC",
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
    });
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
    });
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

          <input
            className="input"
            placeholder="Room Number"
            value={form.roomNo}
            onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
            required
          />

          <input
            className="input"
            placeholder="Floor"
            value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
            required
          />

          <select
            className="input"
            value={form.sharing}
            onChange={(e) => setForm({ ...form, sharing: e.target.value })}
          >
            <option value="1">1 Share</option>
            <option value="2">2 Share</option>
            <option value="3">3 Share</option>
            <option value="4">4 Share</option>
          </select>

          <select
            className="input"
            value={form.roomType}
            onChange={(e) => setForm({ ...form, roomType: e.target.value })}
          >
            <option value="AC">AC</option>
            <option value="Non AC">Non AC</option>
          </select>
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

              <button
                className="btn-secondary"
                type="button"
                onClick={() => handleEdit(room)}
              >
                Edit
              </button>
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
}

export default RoomsManagementPage;