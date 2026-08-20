import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, hint }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-5 shadow-2xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;