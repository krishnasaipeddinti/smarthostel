import { useEffect, useMemo, useState } from "react";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Bell,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Wallet,
  FileWarning,
  ClipboardCheck,
  UtensilsCrossed,
} from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import { useAuth } from "../context/AuthContext";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
} from "../services/hostelApi";

const menuByRole = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Students", path: "/admin/students", icon: Users },
    { label: "Rooms", path: "/admin/rooms", icon: BedDouble },
    { label: "Fees", path: "/admin/fees", icon: Wallet },
    { label: "Complaints", path: "/admin/complaints", icon: FileWarning },
    { label: "Notices", path: "/admin/notices", icon: Bell },
    { label: "Leaves", path: "/admin/leaves", icon: ClipboardCheck },
    { label: "Food Menu", path: "/admin/food-menu", icon: UtensilsCrossed },
  ],
  warden: [
    { label: "Dashboard", path: "/warden", icon: LayoutDashboard },
    { label: "Students", path: "/warden/students", icon: Users },
    { label: "Rooms", path: "/warden/rooms", icon: BedDouble },
    { label: "Fees", path: "/warden/fees", icon: Wallet },
    { label: "Complaints", path: "/warden/complaints", icon: FileWarning },
    { label: "Leaves", path: "/warden/leaves", icon: ClipboardCheck },
    { label: "Notices", path: "/warden/notices", icon: Bell },
    { label: "Food Menu", path: "/warden/food-menu", icon: UtensilsCrossed },
  ],
  student: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Fees", path: "/student/fees", icon: Wallet },
    { label: "Complaints", path: "/student/complaints", icon: FileWarning },
    { label: "Leave Request", path: "/student/leaves", icon: ClipboardCheck },
    { label: "Food Menu", path: "/student/food-menu", icon: UtensilsCrossed },
    { label: "Notices", path: "/student/notices", icon: Bell },
  ],
};

const dashboardRootPaths = ["/admin", "/warden", "/student"];

const isMenuItemActive = (pathname, itemPath) => {
  if (dashboardRootPaths.includes(itemPath)) {
    return pathname === itemPath;
  }

  if (pathname === itemPath) return true;

  return Boolean(
    matchPath(
      {
        path: `${itemPath}/*`,
        end: false,
      },
      pathname
    )
  );
};

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = useMemo(() => menuByRole[user?.role] || [], [user?.role]);

  const loadNotifications = async () => {
    try {
      if (!user?.role) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await getNotificationsApi();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setNotifications(sorted);
      setUnreadCount(sorted.filter((item) => !item.isRead).length);
    } catch (error) {
      console.error("Notifications fetch failed:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.role, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNavigate = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    setMobileOpen(false);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const updated = await markAllNotificationsReadApi();
      const sorted = Array.isArray(updated)
        ? [...updated].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setNotifications(sorted);
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all read failed:", error);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-full">
        <aside
          className={`fixed inset-y-0 left-0 z-40 h-screen w-72 shrink-0 transform border-r border-white/10 bg-slate-950/90 p-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="mb-8 flex items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="glass mb-6 rounded-3xl p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                  <UserCircle2 size={28} />
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isMenuItemActive(location.pathname, item.path);

                return (
                  <button
                    key={`${user?.role}-${item.path}`}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ease-out ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200 ${
                        active ? "bg-white opacity-100" : "bg-transparent opacity-0"
                      }`}
                    />

                    <div className="relative z-10 flex items-center gap-3 transition-all duration-200">
                      <Icon
                        size={18}
                        className={`transition-all duration-200 ${
                          active ? "opacity-100" : "opacity-90"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary mt-6 w-full shrink-0"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 shrink-0 border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={18} />
              </button>

              <div className="hidden items-center gap-3 lg:flex">
                <BrandLogo size={32} />
              </div>

              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-full border border-white/10 bg-white/5 p-3 text-slate-200"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <span className="badge">{user?.email}</span>

                {showNotifications && (
                  <div className="absolute right-0 top-14 z-50 w-90 rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-white">
                        Notifications
                      </h3>

                      <div className="flex items-center gap-2">
                        <span className="badge">{unreadCount} unread</span>
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-95 space-y-3 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border p-3 ${
                              item.isRead
                                ? "border-white/10 bg-white/5"
                                : "border-blue-500/20 bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-semibold text-white">
                                {item.title}
                              </p>
                              {!item.isRead && (
                                <span className="rounded-full bg-blue-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                  New
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-300">
                              {item.message}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                          No notifications available.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;