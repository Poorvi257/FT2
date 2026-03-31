import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budget", label: "Budget" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" }
];

export function Sidebar() {
  return (
    <aside className="relative border-b border-white/[0.06] bg-white/[0.04] px-3 py-3 backdrop-blur-xl xs:px-4 xs:py-4 xl:min-h-screen xl:border-b-0 xl:border-r xl:px-6 xl:py-8">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="mb-3 xl:mb-8">
        <span className="brand-kicker">FT2</span>
        <h1 className="mt-3 bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-lg font-semibold tracking-tight text-transparent xs:text-xl xl:mt-4 xl:text-2xl">
          Finance Tracker
        </h1>
        <p className="mt-2 hidden text-sm leading-6 text-fg-muted xl:block xl:mt-3">
          Reports, budgets, and transaction history in one ambient workspace.
        </p>
      </div>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:grid xl:overflow-visible xl:px-0 xl:pb-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => [
              "shrink-0 whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] xs:px-4 xs:py-2.5 xl:px-4 xl:py-3",
              isActive
                ? "border-accent/40 bg-accent/15 text-fg shadow-accent"
                : "border-white/[0.06] bg-white/[0.02] text-fg-muted hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-fg hover:shadow-panel"
            ].join(" ")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
