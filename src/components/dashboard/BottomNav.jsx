import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Send, CreditCard, User } from "lucide-react";

const NAV = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Insights", icon: TrendingUp, path: "/dashboard/insights" },
  { label: "Pay", icon: Send, path: "/dashboard/pay" },
  { label: "Cards", icon: CreditCard, path: "/dashboard/cards" },
  { label: "Profile", icon: User, path: "/dashboard/profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1526] border-t border-white/10 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
              active ? "text-primary" : "text-white/40"
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}