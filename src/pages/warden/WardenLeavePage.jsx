import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { getAllLeavesApi, updateLeaveStatusApi } from "../../services/hostelApi";

const WardenLeavePage = () => {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = async () => {
    try {
      const data = await getAllLeavesApi();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Leave fetch failed:", error);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateLeaveStatusApi(id, { status });

      setLeaves((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Leave status update failed");
    }
  };

  return (
    <PageShell
      title="Leave Approval"
      subtitle="Review and update student leave requests."
    >
      <div className="space-y-4">
        {leaves.length > 0 ? (
          leaves.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {item.studentName}
                    </h3>
                    <span className="badge">{item.status}</span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {item.fromDate} to {item.toDate}
                  </p>
                </div>

                <select
                  className="input max-w-45"
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {item.reason}
              </p>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No leave requests available.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default WardenLeavePage;