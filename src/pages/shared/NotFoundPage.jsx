import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-8 text-center shadow-2xl">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-3 text-slate-400">Page not found.</p>
        <Link to="/" className="btn-primary mt-6">
          Back to App
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;