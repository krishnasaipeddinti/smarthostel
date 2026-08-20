import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import {
  getAllComplaintsApi,
  updateComplaintStatusApi,
} from "../../services/hostelApi";

function WardenComplaintsPage() {
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = async () => {
    try {
      const data = await getAllComplaintsApi();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Complaints fetch failed:", error);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateComplaintStatusApi(id, { status });

      setComplaints((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Complaint status update failed");
    }
  };

  return (
    <PageShell
      title="Complaints Management"
      subtitle="Review and update student complaints."
    >
      <div className="space-y-4">
        {complaints.length > 0 ? (
          complaints.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <span className="badge">{item.status}</span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {item.studentName} • {item.category}
                  </p>
                </div>

                <select
                  className="input max-w-45"
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(item.id, e.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {item.description}
              </p>

              <div className="mt-4">
                <span className="badge">{item.createdAtLabel}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No complaints available.
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default WardenComplaintsPage;