import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { addComplaintApi, getMyComplaintsApi } from "../../services/hostelApi";

const StudentComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "Plumber",
    title: "",
    description: "",
  });

  const loadData = async () => {
    try {
      const data = await getMyComplaintsApi();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Complaint fetch failed:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const created = await addComplaintApi({
        category: form.category,
        title: form.title,
        description: form.description,
      });

      setComplaints((prev) => [created, ...prev]);

      setForm({
        category: "Plumber",
        title: "",
        description: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Complaint submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="My Complaints"
      subtitle="Raise and track your complaints."
    >
      <form
        onSubmit={handleSubmit}
        className="glass mb-6 rounded-3xl p-5 shadow-2xl space-y-4"
      >
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="Plumber">Plumber</option>
          <option value="Electrician">Electrician</option>
          <option value="Maintenance">Maintenance</option>
          <option value="WiFi">WiFi</option>
        </select>

        <input
          className="input"
          placeholder="Complaint title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="input min-h-30"
          placeholder="Complaint description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Add Complaint"}
        </button>
      </form>

      <div className="space-y-4">
        {complaints.length > 0 ? (
          complaints.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <span className="badge">{item.status}</span>
              </div>

              <p className="mt-2 text-slate-400">{item.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge">{item.category}</span>
                <span className="badge">{item.createdAtLabel}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No complaints found.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default StudentComplaintsPage;