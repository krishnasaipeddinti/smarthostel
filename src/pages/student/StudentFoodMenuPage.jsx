import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { getFoodMenuApi } from "../../services/hostelApi";

const StudentFoodMenuPage = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getFoodMenuApi();
        setMenu(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Food menu fetch failed:", error);
      }
    };

    loadMenu();
  }, []);

  return (
    <PageShell
      title="Food Menu"
      subtitle="Weekly hostel meal plan."
    >
      <div className="space-y-4">
        {menu.length > 0 ? (
          menu.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
              <h3 className="text-xl font-bold text-white">{item.day}</h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Breakfast:</span> {item.breakfast}</p>
                <p><span className="font-semibold text-white">Lunch:</span> {item.lunch}</p>
                <p><span className="font-semibold text-white">Snacks:</span> {item.snacks}</p>
                <p><span className="font-semibold text-white">Dinner:</span> {item.dinner}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-center text-slate-400 shadow-2xl">
            Food menu not available.
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default StudentFoodMenuPage;