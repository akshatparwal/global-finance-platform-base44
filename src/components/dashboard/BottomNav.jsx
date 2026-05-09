import { useLocation } from "react-router-dom";
import { Home, Send, CreditCard, PiggyBank, MoreHorizontal } from "lucide-react";
import { haptic } from "@/utils/haptic";

const NAV = [
  { label: "Home",  icon: Home,           path: "/dashboard" },
  { label: "Send",  icon: Send,           path: "/dashboard/pay" },
  { label: "Card",  icon: CreditCard,     path: "/dashboard/cards" },
  { label: "Save",  icon: PiggyBank,      path: "/dashboard/insights" },
  { label: "More",  icon: MoreHorizontal, path: "/dashboard/profile" },
];

export default function BottomNav({ onNavigate }) {
  const location = useLocation();

  const go = (path) => {
    haptic.light();
    if (onNavigate) onNavigate(path);
  };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#0D1F3C]/8"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-[60px]">
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => go(path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                active ? "text-primary" : "text-[#0D1F3C]/35"
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.6} />
              <span className={`text-[10px] leading-none ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}