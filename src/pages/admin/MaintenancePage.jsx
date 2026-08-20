import { useState } from "react";
import PageShell from "../../components/common/PageShell";
import { getMaintenance } from "../../utils/auth";
import { updateMaintenanceStatus } from "../../utils/appData";

const MaintenancePage = () => {
  const [items, setItems] = useState(getMaintenance());

  const handleStatusChange = (id, status) => {
    const updated = updateMaintenanceStatus(id, status);
    setItems(updated);
  };

  return (
    <PageShell
      title="Maintenance Management"
      subtitle="Track and manage hostel maintenance issues."
    >
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {item.area}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    Issue: {item.issue}
                  </p>

                  <p className="text-slate-400">
                    Assigned To: {item.assignedTo}
                  </p>

                  <div className="mt-3">
                    <span className="badge">{item.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      handleStatusChange(item.id, "Pending")
                    }
                  >
                    Pending
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() =>
                      handleStatusChange(item.id, "In Progress")
                    }
                  >
                    In Progress
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() =>
                      handleStatusChange(item.id, "Completed")
                    }
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            No maintenance records found.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default MaintenancePage;