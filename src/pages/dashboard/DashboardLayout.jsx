import { useState, useRef, useCallback, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Send, CreditCard, User, Bell, Sun, Moon, Shield, Menu, X, MessageCircle } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import NotificationToast from "@/components/notifications/NotificationToast";
import WhatsNew from "@/components/WhatsNew";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning";
import BiometricNudge from "@/components/BiometricNudge";

// Per-tab scroll position registry — persists across tab switches
const scrollRegistry = {};

const NAV = [
  { label: "Dashboard",        icon: LayoutDashboard, path: "/dashboard" },
  { label: "Insights & Wealth",icon: TrendingUp,      path: "/dashboard/insights" },
  { label: "Pay",              icon: Send,            path: "/dashboard/pay" },
  { label: "Cards",            icon: CreditCard,      path: "/dashboard/cards" },
  { label: "Profile",          icon: User,            path: "/dashboard/profile" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("kf_dark_mode") !== "false"; } catch { return true; }
  });
  const [taglish, setTaglish] = useState(() => {
    try { return localStorage.getItem("kf_taglish") === "true"; } catch { return false; }
  });
  const [bahay, setBahay] = useState(() => {
    try { return localStorage.getItem("kf_bahay") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { notifications, toast, unreadCount, dismiss, markAllRead, clearAll, dismissToast } = useNotifications();
  const { showWarning, secondsLeft, extendSession, doLogout } = useSessionTimeout();

  // Persist preferences
  useEffect(() => { try { localStorage.setItem("kf_dark_mode", darkMode); } catch {} }, [darkMode]);
  useEffect(() => { try { localStorage.setItem("kf_taglish", taglish); } catch {} }, [taglish]);
  useEffect(() => { try { localStorage.setItem("kf_bahay", bahay); } catch {} }, [bahay]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Save current tab scroll before navigating away
  const navigateTab = useCallback((path) => {
    scrollRegistry[location.pathname] = mainRef.current?.scrollTop ?? 0;
    setMobileOpen(false);
    navigate(path);
  }, [location.pathname, navigate]);

  const bgMain = darkMode ? "bg-[#0a0f1a]" : "bg-[#f5efe6]";
  const bgSidebar = darkMode ? "bg-[#0d1526]" : "bg-[#1a2a4a]";
  const bgContent = darkMode ? "bg-[#111827]" : "bg-white";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";
  const textMuted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const activeClass = darkMode ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary";
  const inactiveClass = darkMode ? "text-white/60 hover:text-white hover:bg-white/5" : "text-white/70 hover:text-white hover:bg-white/10";

  return (
    <div className={`min-h-screen flex ${bgMain}`}>
      {/* Sidebar */}
      <aside className={`${bgSidebar} w-56 flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
        {/* Logo */}
        <div className="p-5 pb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden"><img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" /></div>
            <div><div className="font-extrabold text-white text-base leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Kinnect<span className="text-primary">Fi</span></div><div className="text-white/30 text-[8px] uppercase tracking-widest">Cross-Border Neobank</div></div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ label, icon: NavIcon, path }) => {
            const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? activeClass : inactiveClass}`}>
                <NavIcon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom toggles */}
        <div className="p-4 space-y-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Taglish Mode</span>
            <button onClick={() => setTaglish(!taglish)} className={`w-10 h-5 rounded-full transition-all ${taglish ? "bg-primary" : "bg-white/20"} relative`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${taglish ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"><span className="text-[10px]">🏠</span><span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Bahay Mode</span></div>
            <button onClick={() => setBahay(!bahay)} className={`w-10 h-5 rounded-full transition-all ${bahay ? "bg-primary" : "bg-white/20"} relative`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${bahay ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-white/30 text-[9px] uppercase tracking-widest">Bank-Grade Trust</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 sm:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 sm:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className={`${bgContent} border-b ${darkMode ? "border-white/5" : "border-black/5"} px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20`}>
          <button className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-lg ${darkMode ? "text-white/70 hover:bg-white/10" : "text-[#1a2a4a]/70 hover:bg-black/10"} transition-colors`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Logo shown in mobile header */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden"><img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" /></div>
            <span className={`font-extrabold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Kinnect<span className="text-primary">Fi</span></span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Support shortcut */}
            <Link to="/dashboard/support"
              className={`hidden sm:flex w-9 h-9 items-center justify-center rounded-lg transition-colors ${darkMode ? "text-white/40 hover:text-white hover:bg-white/8" : "text-[#1a2a4a]/40 hover:bg-black/8"}`}>
              <MessageCircle className="w-4 h-4" />
            </Link>
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
                className="relative w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity">
                <Bell className={`w-4 h-4 ${textMuted}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-secondary text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotificationPanel
                    notifications={notifications}
                    onDismiss={dismiss}
                    onMarkAllRead={markAllRead}
                    onClearAll={clearAll}
                    onClose={() => setNotifOpen(false)}
                    darkMode={darkMode}
                  />
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 flex items-center justify-center rounded-lg ${darkMode ? "bg-white/10 text-white" : "bg-black/10 text-[#1a2a4a]"}`}>
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <div className={`hidden sm:flex items-center gap-1.5 text-xs ${textMuted}`}>
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Secured</span>
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          onScroll={() => { scrollRegistry[location.pathname] = mainRef.current?.scrollTop ?? 0; }}
          className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-8 ${darkMode ? "text-white" : "text-[#1a2a4a]"} overflow-y-auto`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (mainRef.current) {
                  mainRef.current.scrollTop = scrollRegistry[location.pathname] ?? 0;
                }
              }}
            >
              <Outlet context={{ darkMode, taglish, bahay }} />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav onNavigate={navigateTab} />

        {/* What's New changelog */}
        <WhatsNew darkMode={darkMode} />

        {/* Biometric nudge — shown once post-login */}
        <BiometricNudge darkMode={darkMode} />

        {/* Session timeout warning */}
        <AnimatePresence>
          {showWarning && (
            <SessionTimeoutWarning
              secondsLeft={secondsLeft}
              onExtend={extendSession}
              onLogout={doLogout}
              darkMode={darkMode}
            />
          )}
        </AnimatePresence>

        {/* Global push toast banner */}
        <AnimatePresence>
          {toast && (
            <NotificationToast toast={toast} onDismiss={dismissToast} darkMode={darkMode} />
          )}
        </AnimatePresence>

        <footer className={`hidden sm:flex px-6 py-3 text-center text-[10px] ${textMuted} border-t ${darkMode ? "border-white/5" : "border-black/5"} justify-between`}>
          <div className="flex gap-4"><span>🔒 Bank-grade Security</span><span>✓ Regulated & Insured</span></div>
          <span>© 2026 KinnectFi. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}