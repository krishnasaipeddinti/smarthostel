import { useEffect, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { getFoodMenuApi, updateFoodMenuApi } from "../../services/hostelApi";

const FoodMenuManagementPage = () => {
  const [menu, setMenu] = useState([]);

  const loadMenu = async () => {
    try {
      const data = await getFoodMenuApi();
      setMenu(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Food menu fetch failed:", error);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleChange = (id, field, value) => {
    setMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (item) => {
    try {
      const updated = await updateFoodMenuApi(item.id, {
        breakfast: item.breakfast,
        lunch: item.lunch,
        snacks: item.snacks,
        dinner: item.dinner,
      });

      setMenu((prev) =>
        prev.map((row) => (row.id === item.id ? updated : row))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Food menu update failed");
    }
  };

  return (
    <PageShell
      title="Food Menu Management"
      subtitle="Edit weekly food menu."
    >
      <div className="space-y-4">
        {menu.map((item) => (
          <div key={item.id} className="glass rounded-3xl p-5 shadow-2xl">
            <h3 className="text-xl font-bold text-white">{item.day}</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="input"
                value={item.breakfast}
                onChange={(e) => handleChange(item.id, "breakfast", e.target.value)}
                placeholder="Breakfast"
              />
              <input
                className="input"
                value={item.lunch}
                onChange={(e) => handleChange(item.id, "lunch", e.target.value)}
                placeholder="Lunch"
              />
              <input
                className="input"
                value={item.snacks}
                onChange={(e) => handleChange(item.id, "snacks", e.target.value)}
                placeholder="Snacks"
              />
              <input
                className="input"
                value={item.dinner}
                onChange={(e) => handleChange(item.id, "dinner", e.target.value)}
                placeholder="Dinner"
              />
            </div>

            <button className="btn-primary mt-4" onClick={() => handleSave(item)}>
              Save Menu
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default FoodMenuManagementPage;