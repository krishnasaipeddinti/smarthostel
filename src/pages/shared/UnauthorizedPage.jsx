import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-bold text-white">Unauthorized Access</h1>
        <p className="mt-3 text-slate-400">
          You do not have permission to access this page.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;