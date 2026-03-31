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
    <header className="mb-4 flex flex-col gap-3 rounded-[22px] border border-white/[0.06] bg-white/[0.04] px-4 py-4 shadow-panel backdrop-blur-xl sm:mb-5 sm:gap-4 sm:rounded-[28px] sm:px-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <span className="eyebrow">Personal finance and budget control</span>
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          Track spending, shape budgets, and review month-by-month performance.
        </p>
      </div>
      <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center md:justify-end">
        <span className="inline-flex max-w-full items-center break-all rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm font-medium text-fg shadow-soft md:max-w-[18rem]">
          {userLabel}
        </span>
        <button
          className="w-full border border-white/[0.08] bg-white/[0.05] text-fg shadow-panel hover:bg-white/[0.08] xs:w-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
