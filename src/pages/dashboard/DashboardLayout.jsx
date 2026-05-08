import { useState, useRef, useCallback, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, TrendingUp, Send, CreditCard, User, Bell, Sun, Moon, Shield, Menu, X, MessageCircle, Globe, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import NotificationToast from "@/components/notifications/NotificationToast";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning";
import { useTabStack } from "@/hooks/useTabStack";
import PWAInstallNudge from "@/components/PWAInstallNudge";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";

const NAV = [
  { label: "Dashboard",        icon: LayoutDashboard, path: "/dashboard",          color: "text-blue-400",    bg: "bg-blue-500/15" },
  { label: "Insights",         icon: TrendingUp,      path: "/dashboard/insights", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { label: "Pay",              icon: Send,            path: "/dashboard/pay",      color: "text-primary",     bg: "bg-primary/15" },
  { label: "Cards",            icon: CreditCard,      path: "/dashboard/cards",    color: "text-purple-400",  bg: "bg-purple-500/15" },
  { label: "Profile",          icon: User,            path: "/dashboard/profile",  color: "text-orange-400",  bg: "bg-orange-500/15" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      setIsAuthed(authed);
      setAuthChecked(true);
      if (!authed) base44.auth.redirectToLogin(window.location.href);
    });
  }, []);

  const { activeTab, currentPath, stackDepth, isRoot, switchTab, resetTab, push, pop, loadScroll, saveScroll } = useTabStack();
  
  // Read from localStorage synchronously in the initializer to prevent flash-of-light-mode
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("kf_dark_mode");
      // Default to dark if no preference stored
      return stored === null ? true : stored !== "false";
    } catch { return true; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { notifications, toast, unreadCount, dismiss, markAllRead, clearAll, dismissToast } = useNotifications();
  const { showWarning, secondsLeft, extendSession, doLogout } = useSessionTimeout();

  // Sync React Router location with tab stack
  useEffect(() => {
    const tab = ["/dashboard", "/dashboard/insights", "/dashboard/pay", "/dashboard/cards", "/dashboard/profile"].find(
      t => location.pathname === t || location.pathname.startsWith(t + "/")
    ) || "/dashboard";
    push(location.pathname);
    switchTab(tab);
  }, [location.pathname, push, switchTab]);

  // Persist preferences
  useEffect(() => { try { localStorage.setItem("kf_dark_mode", darkMode); } catch {} }, [darkMode]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Handle tab navigation with re-tap-to-reset
  const handleTabClick = useCallback((tabPath) => {
    if (activeTab === tabPath) {
      // Re-tap same tab = reset to root
      resetTab(tabPath);
      navigate(tabPath);
    } else {
      // Switch to different tab
      switchTab(tabPath);
      navigate(tabPath);
    }
    setMobileOpen(false);
  }, [activeTab, resetTab, switchTab, navigate]);

  // Tab order for swipe navigation
  const TAB_ORDER = ["/dashboard", "/dashboard/insights", "/dashboard/pay", "/dashboard/cards", "/dashboard/profile"];

  const swipeHandlers = useSwipeTabs({
    onSwipeLeft: () => {
      const idx = TAB_ORDER.indexOf(activeTab);
      if (idx < TAB_ORDER.length - 1) handleTabClick(TAB_ORDER[idx + 1]);
    },
    onSwipeRight: () => {
      const idx = TAB_ORDER.indexOf(activeTab);
      if (idx > 0) handleTabClick(TAB_ORDER[idx - 1]);
    },
  });

  const bgMain = darkMode ? "kf-cosmic-bg" : "bg-[#f8f5f0]";
  const bgSidebar = "bg-[#0B0E1A]";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";
  const textMuted = darkMode ? "text-white/40" : "text-[#1a2a4a]/50";
  const activeClass = "bg-white/8 text-white";
  const inactiveClass = "text-white/40 hover:text-white hover:bg-white/5";

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1a]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthed) return null;

  return (
    <div className={`min-h-screen flex ${bgMain}`}>
      {/* Sidebar */}
      <aside className={`${bgSidebar} w-56 flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
        {/* Logo */}
         <div className="p-4 pb-5 border-b border-white/8">
           <Link to="/" className="inline-block">
             <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/02c4d00b2_Screenshot2026-05-08at53712PM.png" className="h-10 object-contain" />
           </Link>
         </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ label, icon: NavIcon, path, color, bg }) => {
            const active = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
            return (
              <button key={path} onClick={() => handleTabClick(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? "bg-white/10 text-white" : "text-white/55 hover:text-white hover:bg-white/5"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${active ? `${bg} ${color}` : "bg-white/5 text-white/40"}`}>
                  <NavIcon className="w-3.5 h-3.5" />
                </div>
                <span className={active ? "text-white" : ""}>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-1.5 px-1">
            <Shield className="w-3 h-3 text-emerald-400/70" />
            <span className="text-white/25 text-[9px] uppercase tracking-widest">Bank-Grade Secure</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 sm:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 sm:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className={`${darkMode ? "bg-[#0B0E1A]" : "bg-white"} border-b ${darkMode ? "border-white/5" : "border-black/10"} px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20`}>
          {/* Mobile: Back button if not root, menu button if root */}
          {!isRoot ? (
            <button className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-lg ${darkMode ? "text-white/70 hover:bg-white/10" : "text-[#1a2a4a]/70 hover:bg-black/10"} transition-colors`} onClick={() => { pop(); navigate(activeTab); }} title="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-lg ${darkMode ? "text-white/70 hover:bg-white/10" : "text-[#1a2a4a]/70 hover:bg-black/10"} transition-colors`} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          {/* Logo shown in mobile header */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0"><img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full object-contain p-0.5" /></div>
            <span className={`font-extrabold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ka<span className="text-primary">yah</span></span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Support shortcut */}
            <Link to="/dashboard/support"
              className={`hidden sm:flex w-11 h-11 items-center justify-center rounded-lg transition-colors ${darkMode ? "text-white/40 hover:text-white hover:bg-white/8" : "text-[#1a2a4a]/40 hover:bg-black/8"}`}>
              <MessageCircle className="w-5 h-5" />
            </Link>
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
                className="relative w-11 h-11 flex items-center justify-center hover:opacity-70 transition-opacity">
                <Bell className={`w-5 h-5 ${textMuted}`} />
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
            <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-11 flex items-center justify-center rounded-lg ${darkMode ? "bg-white/10 text-white" : "bg-black/10 text-[#1a2a4a]"}`}>
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className={`hidden sm:flex items-center gap-1.5 text-xs ${textMuted}`}>
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Secured</span>
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          onScroll={() => { saveScroll(mainRef.current?.scrollTop ?? 0); }}
          onTouchStart={swipeHandlers.onTouchStart}
          onTouchEnd={swipeHandlers.onTouchEnd}
          className={`flex-1 p-4 sm:p-6 pb-28 sm:pb-8 overflow-y-auto ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPath}
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              onAnimationComplete={() => {
                if (mainRef.current) {
                  mainRef.current.scrollTop = loadScroll();
                }
              }}
            >
              <Outlet context={{ darkMode: darkMode === true }} />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav onNavigate={handleTabClick} />

        {/* PWA install nudge */}
        <PWAInstallNudge darkMode={darkMode} />

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

        <footer className={`hidden sm:flex px-6 py-3 text-center text-[10px] ${darkMode ? "text-white/40" : "text-[#1a2a4a]/50"} border-t ${darkMode ? "border-white/5" : "border-black/10"} justify-between ${darkMode ? "bg-[#0B0E1A]" : "bg-white"}`}>
          <div className="flex gap-4"><span>🔒 Bank-grade Security</span><span>✓ Regulated & Insured</span></div>
          <span>© 2026 KinnectFi. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}