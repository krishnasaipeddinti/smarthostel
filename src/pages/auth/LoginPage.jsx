import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Bell, ShieldCheck, Users } from "lucide-react";
import BrandLogo from "../../components/common/BrandLogo";
import { useAuth } from "../../context/AuthContext";

const hostelHighlights = [
  {
    icon: BedDouble,
    title: "Smart Room Allocation",
    description:
      "Monitor available rooms, occupied beds, and hostel accommodation data efficiently.",
    iconColor: "text-blue-300",
    bgColor: "bg-blue-500/15",
  },
  {
    icon: Users,
    title: "Student Record Management",
    description:
      "Access student information, profiles, and hostel records with a structured workflow.",
    iconColor: "text-emerald-300",
    bgColor: "bg-emerald-500/15",
  },
  {
    icon: Bell,
    title: "Notices & Updates",
    description:
      "Keep students and staff informed with timely announcements and hostel communications.",
    iconColor: "text-amber-300",
    bgColor: "bg-amber-500/15",
  },
  {
    icon: ShieldCheck,
    title: "Secure Role-Based Dashboards",
    description:
      "Provide focused access for Admin, Warden, and Student through dedicated dashboard experiences.",
    iconColor: "text-violet-300",
    bgColor: "bg-violet-500/15",
  },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const user = await login(form);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "warden") {
        navigate("/warden");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden rounded-3xl border border-white/10 bg-linear-to-br from-blue-700/25 via-slate-900 to-emerald-500/10 p-8 shadow-2xl lg:block"
        >
          <BrandLogo />

          <div className="mt-6">
            <h2 className="text-4xl font-black leading-tight text-white">
              Welcome to the future of
              <span className="block text-blue-400">hostel administration</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              SmartNest helps manage hostel operations through a polished,
              efficient, and role-driven digital workflow built for modern
              institutions.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {hostelHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="glass rounded-3xl p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl p-3 ${item.bgColor} ${item.iconColor}`}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl p-6 shadow-2xl md:p-8"
        >
          <div className="mb-6 flex justify-center">
            <BrandLogo size={50} />
          </div>

          <h2 className="text-3xl font-bold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue into SmartNest.
          </p>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="mt-8 space-y-4"
          >
            <input
              type="text"
              name="fakeUsername"
              autoComplete="username"
              className="hidden"
              tabIndex={-1}
            />
            <input
              type="password"
              name="fakePassword"
              autoComplete="current-password"
              className="hidden"
              tabIndex={-1}
            />

            <input
              className="input"
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />

            <input
              className="input"
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New student?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;