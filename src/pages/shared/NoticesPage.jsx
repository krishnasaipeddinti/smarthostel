import PageShell from "../../components/common/PageShell";
import { getNotices } from "../../utils/auth";

const NoticesPage = () => {
  const notices = getNotices();

  return (
    <PageShell
      title="Notice Board"
      subtitle="Important hostel announcements and communication."
    >
      <div className="grid gap-4">
        {notices.map((notice) => (
          <div key={notice.id} className="glass rounded-3xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{notice.title}</h3>
              <div className="flex gap-2">
                <span className="badge">{notice.priority}</span>
                <span className="badge">{notice.date}</span>
              </div>
            </div>
            <p className="mt-3 text-slate-400">{notice.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default NoticesPage;