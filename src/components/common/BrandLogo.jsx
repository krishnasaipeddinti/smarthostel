const BrandLogo = ({ size = 40, showText = true }) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/smartnest-logo.svg"
        alt="SmartNest Logo"
        style={{ width: size, height: size }}
        className="rounded-xl shadow-lg"
      />

      {showText && (
        <div className="leading-tight">
          <h1 className="text-lg font-bold text-white">
            Smart<span className="text-blue-400">Nest</span>
          </h1>
          <p className="text-xs text-slate-400">Smart Hostel Management</p>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;