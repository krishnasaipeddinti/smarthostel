import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { getNoticesApi } from "../../services/hostelApi";

const StudentNoticesPage = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await getNoticesApi();
        setNotices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Notices fetch failed:", error);
      }
    };

    loadNotices();
  }, []);

  return (
    <PageShell
      title="Notices"
      subtitle="View all hostel notices added by admin or warden."
    >
      <div className="space-y-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">{notice.title}</h3>
                <span className="badge">{notice.priority}</span>
                <span className="badge">{notice.createdBy}</span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {notice.description}
              </p>

              <div className="mt-4">
                <span className="badge">{notice.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No notices available.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default StudentNoticesPage;