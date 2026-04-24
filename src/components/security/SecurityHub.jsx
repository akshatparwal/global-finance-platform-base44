/**
 * SecurityHub — Revolut-style Security tab content.
 * Features: Biometric login toggle, Transaction PIN, 2FA, active sessions, security score.
 */
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield, ShieldCheck, Fingerprint, Smartphone, Key,
  Eye, EyeOff, Lock, Unlock, ChevronRight, AlertTriangle,
  Monitor, Globe, Check, X
} from "lucide-react";
import PinSetupModal from "./PinSetupModal";
import TwoFASetupModal from "./TwoFASetupModal";

const SESSIONS = [
  { device: "iPhone 15 Pro", location: "Dubai, UAE", time: "Now · Active", current: true },
  { device: "MacBook Pro", location: "Dubai, UAE", time: "2 hours ago", current: false },
  { device: "Chrome · Windows", location: "Manila, PH", time: "3 days ago", current: false },
];

export default function SecurityHub({ darkMode }) {
  const [biometric, setBiometric] = useState(() => localStorage.getItem("kfi_biometric") === "true");
  const [pinSet, setPinSet] = useState(() => !!localStorage.getItem("kfi_pin"));
  const [twoFAEnabled, setTwoFAEnabled] = useState(() => localStorage.getItem("kfi_2fa") === "enabled");
  const [loginNotifs, setLoginNotifs] = useState(true);
  const [transactionNotifs, setTransactionNotifs] = useState(true);

  const [showPinModal, setShowPinModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [revokedSessions, setRevokedSessions] = useState([]);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const divider = darkMode ? "border-white/5" : "border-black/5";

  // Security score calculation
  const checks = [biometric, pinSet, twoFAEnabled, loginNotifs, transactionNotifs];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const scoreColor = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-yellow-500" : "text-red-400";
  const scoreBarColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-red-400";
  const scoreLabel = score >= 80 ? "Strong" : score >= 50 ? "Fair" : "Weak";

  const handleBiometricToggle = () => {
    const next = !biometric;
    setBiometric(next);
    localStorage.setItem("kfi_biometric", String(next));
  };

  const handlePinSaved = (pin) => {
    setPinSet(true);
  };

  const handle2FAEnabled = () => {
    setTwoFAEnabled(true);
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("kfi_2fa");
    setTwoFAEnabled(false);
  };

  const handleRevokeSession = (i) => {
    setRevokedSessions(prev => [...prev, i]);
  };

  // Toggle helper
  const Toggle = ({ value, onChange, color = "bg-primary" }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${value ? color : darkMode ? "bg-white/20" : "bg-black/20"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  // Row helper
  const Row = ({ icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", label, sub, right, borderTop = true }) => (
    <div className={`flex items-center gap-3 py-4 ${borderTop ? `border-t ${divider}` : ""}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${text}`}>{label}</p>
        {sub && <p className={`text-xs ${muted}`}>{sub}</p>}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Security Score */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1526 0%, #1a2a4a 100%)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Security Score</p>
            <p className={`font-black text-4xl ${scoreColor}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {score}<span className="text-xl">/100</span>
            </p>
            <p className={`text-xs font-bold mt-0.5 ${scoreColor}`}>{scoreLabel} Protection</p>
          </div>
          <div className={`w-16 h-16 rounded-2xl ${score >= 80 ? "bg-emerald-500/20" : score >= 50 ? "bg-yellow-500/20" : "bg-red-400/20"} flex items-center justify-center`}>
            {score >= 80
              ? <ShieldCheck className={`w-8 h-8 ${scoreColor}`} />
              : <Shield className={`w-8 h-8 ${scoreColor}`} />
            }
          </div>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${scoreBarColor} rounded-full`}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {checks.map((c, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center ${c ? "bg-emerald-500/20" : "bg-white/10"}`}>
              {c ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-white/30" />}
            </div>
          ))}
          <p className="text-white/30 text-xs self-center ml-1">
            {checks.filter(Boolean).length}/{checks.length} checks passed
          </p>
        </div>
      </div>

      {/* Biometric & PIN */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <p className={`text-[10px] font-black uppercase tracking-wider ${muted} mb-1`}>Login & Access</p>

        <Row
          borderTop={false}
          icon={Fingerprint}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
          label="Face ID / Touch ID"
          sub={biometric ? "Biometric login is active" : "Use biometrics to sign in instantly"}
          right={<Toggle value={biometric} onChange={handleBiometricToggle} color="bg-blue-500" />}
        />

        <AnimatePresence>
          {biometric && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2`}>
                <Fingerprint className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-blue-400 text-xs font-semibold">
                  Biometric login is enabled. Your device's Face ID / Touch ID is used to verify your identity on every login.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Row
          icon={Key}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          label="Transaction PIN"
          sub={pinSet ? "6-digit PIN is set · Required for all transfers" : "Set a PIN to authorise transfers"}
          right={
            <button
              onClick={() => setShowPinModal(true)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                pinSet
                  ? darkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-black/10 text-black/60 hover:bg-black/5"
                  : "border-primary text-primary hover:bg-primary/10"
              }`}
            >
              {pinSet ? "Change" : "Set PIN"}
            </button>
          }
        />
      </div>

      {/* 2FA */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <p className={`text-[10px] font-black uppercase tracking-wider ${muted} mb-1`}>Two-Factor Authentication</p>

        <Row
          borderTop={false}
          icon={Smartphone}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          label="Authenticator App"
          sub={twoFAEnabled ? "TOTP 2FA is active — Google Auth / Authy" : "Protect logins with an authenticator app"}
          right={
            twoFAEnabled ? (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full">ACTIVE</span>
                <button onClick={handleDisable2FA} className="text-red-400 text-xs font-bold hover:underline">Disable</button>
              </div>
            ) : (
              <button
                onClick={() => setShow2FAModal(true)}
                className="border border-emerald-500/40 text-emerald-500 text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                Enable
              </button>
            )
          }
        />

        <Row
          icon={Globe}
          iconColor={muted.includes("white") ? "text-white/50" : "text-[#1a2a4a]/50"}
          iconBg={darkMode ? "bg-white/5" : "bg-black/5"}
          label="Login notifications"
          sub="Email alert on every new sign-in"
          right={<Toggle value={loginNotifs} onChange={() => setLoginNotifs(!loginNotifs)} />}
        />

        <Row
          icon={Lock}
          iconColor={muted.includes("white") ? "text-white/50" : "text-[#1a2a4a]/50"}
          iconBg={darkMode ? "bg-white/5" : "bg-black/5"}
          label="Transfer alerts"
          sub="Notify me on every outgoing transfer"
          right={<Toggle value={transactionNotifs} onChange={() => setTransactionNotifs(!transactionNotifs)} />}
        />
      </div>

      {/* Active Sessions */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>Active Sessions</p>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{SESSIONS.length - revokedSessions.length} active</span>
        </div>
        <div className="space-y-1">
          {SESSIONS.map((s, i) => (
            !revokedSessions.includes(i) && (
              <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? `border-t ${divider}` : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.current ? "bg-emerald-500/10" : darkMode ? "bg-white/5" : "bg-black/5"}`}>
                  <Monitor className={`w-4 h-4 ${s.current ? "text-emerald-500" : muted}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold truncate ${text}`}>{s.device}</p>
                    {s.current && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">THIS DEVICE</span>}
                  </div>
                  <p className={`text-xs ${muted}`}>{s.location} · {s.time}</p>
                </div>
                {!s.current && (
                  <button
                    onClick={() => handleRevokeSession(i)}
                    className="text-red-400 text-xs font-bold hover:underline flex-shrink-0"
                  >
                    Revoke
                  </button>
                )}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className={`border border-red-500/20 rounded-2xl p-5 ${darkMode ? "bg-red-500/5" : "bg-red-50"}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Security Actions</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("This will sign you out from all other devices. Continue?")) {
              setRevokedSessions([1, 2]);
            }
          }}
          className="w-full text-left flex items-center justify-between py-3"
        >
          <div>
            <p className="text-red-400 font-semibold text-sm">Sign out all other devices</p>
            <p className={`text-xs ${muted}`}>Revoke access from all sessions except this one</p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPinModal && (
          <PinSetupModal
            darkMode={darkMode}
            mode="set"
            onClose={() => setShowPinModal(false)}
            onSaved={handlePinSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {show2FAModal && (
          <TwoFASetupModal
            darkMode={darkMode}
            onClose={() => setShow2FAModal(false)}
            onEnabled={handle2FAEnabled}
          />
        )}
      </AnimatePresence>
    </div>
  );
}