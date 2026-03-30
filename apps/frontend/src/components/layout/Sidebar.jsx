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
    <aside className="relative border-b border-white/[0.06] bg-white/[0.04] px-4 py-5 backdrop-blur-xl lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="mb-8">
        <span className="brand-kicker">FT2</span>
        <h1 className="mt-4 bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Finance Tracker
        </h1>
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          Reports, budgets, and transaction history in one ambient workspace.
        </p>
      </div>
      <nav className="grid gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => [
              "rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
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
