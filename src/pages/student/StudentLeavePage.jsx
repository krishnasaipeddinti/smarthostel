import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { addLeaveApi, getMyLeavesApi } from "../../services/hostelApi";

const StudentLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const loadData = async () => {
    try {
      const data = await getMyLeavesApi();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Leave fetch failed:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const created = await addLeaveApi({
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      });

      setLeaves((prev) => [created, ...prev]);

      setForm({
        fromDate: "",
        toDate: "",
        reason: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Leave request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Leave Request"
      subtitle="Submit and track your hostel leave requests."
    >
      <form
        onSubmit={handleSubmit}
        className="glass mb-6 rounded-3xl p-5 shadow-2xl"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            type="date"
            name="fromDate"
            value={form.fromDate}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="date"
            name="toDate"
            value={form.toDate}
            onChange={handleChange}
            required
          />

          <textarea
            className="input min-h-32.5 md:col-span-2"
            name="reason"
            placeholder="Enter leave reason"
            value={form.reason}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="btn-primary md:col-span-2"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {leaves.length > 0 ? (
          leaves.map((leave) => (
            <div key={leave.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">
                  {leave.fromDate} to {leave.toDate}
                </h3>
                <span className="badge">{leave.status}</span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {leave.reason}
              </p>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No leave requests found.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default StudentLeavePage;