import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import {
  getStudentsApi,
  updateStudentApi,
  getRoomsApi,
  assignRoomApi,
} from "../../services/hostelApi";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    course: "",
    year: "",
    parentContact: "",
  });
  const [assignMap, setAssignMap] = useState({});

  const loadData = async () => {
    try {
      const [studentsData, roomsData] = await Promise.all([
        getStudentsApi(),
        getRoomsApi(),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error("Students sync failed:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditForm({
      name: student.name || "",
      phone: student.phone || "",
      course: student.course || "",
      year: student.year || "",
      parentContact: student.parentContact || "",
    });
  };

  const handleSave = async () => {
    try {
      const updated = await updateStudentApi(editingId, editForm);

      setStudents((prev) =>
        prev.map((item) => (item.id === editingId ? updated : item))
      );
      setEditingId(null);
    } catch (error) {
      alert(error.response?.data?.message || "Student update failed");
    }
  };

  const handleAssignRoom = async (studentId) => {
    try {
      const selectedRoomId = assignMap[studentId];

      if (!selectedRoomId) {
        alert("Please select a room first");
        return;
      }

      const updatedStudent = await assignRoomApi({
        studentId,
        roomId: selectedRoomId,
      });

      setStudents((prev) =>
        prev.map((item) =>
          item.id === studentId ? { ...item, ...updatedStudent } : item
        )
      );

      const freshRooms = await getRoomsApi();
      setRooms(Array.isArray(freshRooms) ? freshRooms : []);
    } catch (error) {
      alert(error.response?.data?.message || "Room allotment failed");
    }
  };

  return (
    <PageShell
      title="Students"
      subtitle="Edit student details and allot rooms."
    >
      <div className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="glass rounded-3xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">{student.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {student.studentId} • {student.email}
                </p>
              </div>

              <button
                className="btn-secondary"
                type="button"
                onClick={() => handleEdit(student)}
              >
                Edit
              </button>
            </div>

            {editingId === student.id ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  className="input"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Name"
                />
                <input
                  className="input"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="Phone"
                />
                <input
                  className="input"
                  value={editForm.course}
                  onChange={(e) =>
                    setEditForm({ ...editForm, course: e.target.value })
                  }
                  placeholder="Course"
                />
                <input
                  className="input"
                  value={editForm.year}
                  onChange={(e) =>
                    setEditForm({ ...editForm, year: e.target.value })
                  }
                  placeholder="Year"
                />
                <input
                  className="input md:col-span-2"
                  value={editForm.parentContact}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      parentContact: e.target.value,
                    })
                  }
                  placeholder="Parent Contact"
                />

                <div className="md:col-span-2 flex gap-3">
                  <button className="btn-primary" type="button" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <p>
                  <span className="font-semibold text-white">Phone:</span>{" "}
                  {student.phone || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Course:</span>{" "}
                  {student.course || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Year:</span>{" "}
                  {student.year || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Parent Contact:
                  </span>{" "}
                  {student.parentContact || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Room:</span>{" "}
                  {student.room || "Not Allotted"}
                </p>
                <p>
                  <span className="font-semibold text-white">Hostel Block:</span>{" "}
                  {student.hostelBlock || "-"}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
              <select
                className="input md:max-w-xs"
                value={assignMap[student.id] || ""}
                onChange={(e) =>
                  setAssignMap((prev) => ({
                    ...prev,
                    [student.id]: e.target.value,
                  }))
                }
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNo} • {room.roomType} • {room.sharing} Share •{" "}
                    {room.occupied}/{room.capacity}
                  </option>
                ))}
              </select>

              <button
                className="btn-primary"
                type="button"
                onClick={() => handleAssignRoom(student.id)}
              >
                Assign Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default StudentsPage;