import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";

export function AppShell() {
  return (
    <div className="relative min-h-screen xl:grid xl:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <div className="relative min-w-0 px-3 py-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-80 rounded-full bg-accent/15 blur-[120px] sm:inset-x-8" />
        <Topbar />
        <main className="relative z-10 grid min-w-0 gap-4 sm:gap-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
