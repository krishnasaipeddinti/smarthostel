import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const featureCards = [
  {
    title: "Smart Room Allocation",
    description:
      "Manage room availability, hostel blocks, occupancy, and allotments with a smooth workflow.",
  },
  {
    title: "Fee & Payment Tracking",
    description:
      "Track hostel fees, due amounts, payment history, and room-based fee calculation in one place.",
  },
  {
    title: "Complaints, Leaves & Notices",
    description:
      "Handle student complaints, leave approvals, and important hostel announcements efficiently.",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[42px_42px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
            Smart Hostel Ecosystem
          </div>

          <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
            Smart<span className="text-blue-400">Nest</span>
          </h1>

          <h2 className="mt-4 max-w-3xl text-2xl font-extrabold uppercase tracking-[0.26em] text-white md:text-4xl">
            Smart Hostel Management Platform
          </h2>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            Transform hostel administration with a premium digital platform built
            for student records, room allocation, fee tracking, notices, leave
            requests, complaints, and smooth role-based access.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
            >
              Get Started
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
              Admin • Warden • Student role-based access
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="mt-14 grid gap-5 lg:grid-cols-3"
        >
          {featureCards.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;