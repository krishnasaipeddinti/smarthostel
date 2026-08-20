import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BrandLogo from "../../components/common/BrandLogo";
import { useAuth } from "../../context/AuthContext";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    course: "",
    year: "",
    parentContact: "",
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
      await signup(form);
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-3xl rounded-3xl p-6 shadow-2xl md:p-8"
      >
        <div className="mb-6 flex justify-center">
          <BrandLogo size={50} />
        </div>

        <h2 className="text-3xl font-bold text-white">Student Signup</h2>
        <p className="mt-2 text-sm text-slate-400">
          Signup ayyaka direct student dashboard ki redirect avtharu.
        </p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mt-6 grid gap-4 md:grid-cols-2"
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
            autoComplete="new-password"
            className="hidden"
            tabIndex={-1}
          />

          <input
            className="input"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <input
            className="input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <input
            className="input"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <input
            className="input"
            name="course"
            placeholder="Course"
            value={form.course}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <input
            className="input"
            name="year"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <input
            className="input md:col-span-2"
            name="parentContact"
            placeholder="Parent contact"
            value={form.parentContact}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          {error ? (
            <div className="md:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-primary md:col-span-2"
            disabled={submitting}
          >
            {submitting ? "Creating Account..." : "Create Student Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;