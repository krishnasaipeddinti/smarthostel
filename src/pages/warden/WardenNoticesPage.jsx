import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { addNoticeApi, getNoticesApi, updateNoticeApi } from "../../services/hostelApi";

const WardenNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "General",
  });
  const [editingId, setEditingId] = useState(null);

  const loadNotices = async () => {
    try {
      const data = await getNoticesApi();
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notice fetch failed:", error);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateNoticeApi(editingId, form);
      } else {
        await addNoticeApi(form);
      }

      setForm({
        title: "",
        description: "",
        priority: "General",
      });
      setEditingId(null);
      await loadNotices();
    } catch (error) {
      alert(error.response?.data?.message || "Notice action failed");
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
    });
  };

  return (
    <PageShell
      title="Notices"
      subtitle="Add and manage student notices."
    >
      <form
        onSubmit={handleSubmit}
        className="glass mb-6 rounded-3xl p-5 shadow-2xl space-y-4"
      >
        <input
          className="input"
          placeholder="Notice title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="input min-h-30"
          placeholder="Notice description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <select
          className="input"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="General">General</option>
          <option value="Medium">Medium</option>
          <option value="Important">Important</option>
        </select>

        <div className="flex gap-3">
          <button className="btn-primary" type="submit">
            {editingId ? "Update Notice" : "Add Notice"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  description: "",
                  priority: "General",
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="glass rounded-3xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">{notice.title}</h3>
                <span className="badge">{notice.priority}</span>
                <span className="badge">{notice.createdBy}</span>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleEdit(notice)}
              >
                Edit
              </button>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              {notice.description}
            </p>

            <div className="mt-4">
              <span className="badge">{notice.date}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default WardenNoticesPage;