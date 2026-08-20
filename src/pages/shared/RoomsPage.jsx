import PageShell from "../../components/common/PageShell";
import { getRooms } from "../../utils/auth";

const RoomsPage = () => {
  const rooms = getRooms();

  return (
    <PageShell
      title="Room Management"
      subtitle="Room availability and occupancy overview."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const available = room.capacity - room.occupied;
          const percent = (room.occupied / room.capacity) * 100;

          return (
            <div key={room.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Room Number</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{room.roomNo}</h3>
                </div>
                <span className="badge">Block {room.block}</span>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-300">
                <p>Floor: {room.floor}</p>
                <p>Capacity: {room.capacity}</p>
                <p>Occupied: {room.occupied}</p>
                <p>Available: {available}</p>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Occupancy</span>
                  <span>{Math.round(percent)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default RoomsPage;