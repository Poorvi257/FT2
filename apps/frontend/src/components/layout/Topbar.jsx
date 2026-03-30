import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";

export function Topbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const userLabel = user?.webLoginEmail || user?.appUserId || "User";

  async function handleLogout() {
    await authApi.logout();
    setUser(null);
    navigate("/login");
  }

  return (
    <header className="mb-5 flex flex-col gap-4 rounded-[28px] border border-white/[0.06] bg-white/[0.04] px-5 py-4 shadow-panel backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="eyebrow">Personal finance and budget control</span>
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          Track spending, shape budgets, and review month-by-month performance.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm font-medium text-fg shadow-soft">
          {userLabel}
        </span>
        <button
          className="border border-white/[0.08] bg-white/[0.05] text-fg shadow-panel hover:bg-white/[0.08]"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
