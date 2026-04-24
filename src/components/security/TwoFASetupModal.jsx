/**
 * TwoFASetupModal — Revolut-style in-app 2FA setup.
 * Shows a simulated TOTP QR code setup with manual entry key,
 * then asks user to verify with a 6-digit code.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ShieldCheck, Smartphone } from "lucide-react";

// Simulated secret key
const SECRET = "KFIB44XXYYZZ1234";
const BACKUP_CODES = ["KFI-8472", "KFI-2931", "KFI-5510", "KFI-7734", "KFI-9012", "KFI-3388"];

export default function TwoFASetupModal({ onClose, onEnabled, darkMode }) {
  const [step, setStep] = useState("intro"); // intro | qr | verify | backup | done
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const card = darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const inputCls = `w-full border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest outline-none focus:border-primary transition-colors ${
    darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/20" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"
  }`;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(SECRET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    // Accept any 6-digit code in demo mode
    if (code.replace(/\s/g, "").length === 6) {
      setStep("backup");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleCopyBackups = () => {
    navigator.clipboard.writeText(BACKUP_CODES.join("\n"));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
  };

  const handleFinish = () => {
    localStorage.setItem("kfi_2fa", "enabled");
    setStep("done");
    setTimeout(() => { onEnabled(); onClose(); }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-sm ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className={`font-extrabold text-base ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Authenticator App 2FA
              </h3>
              <p className={`text-[10px] ${muted}`}>Step {["intro","qr","verify","backup","done"].indexOf(step) + 1} of 4</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className={`mx-6 h-1 rounded-full mb-5 ${darkMode ? "bg-white/10" : "bg-black/10"}`}>
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(["intro","qr","verify","backup","done"].indexOf(step) + 1) / 4 * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="px-6 pb-8 overflow-y-auto max-h-[75vh]">
          <AnimatePresence mode="wait">

            {step === "intro" && (
              <motion.div key="intro" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl mb-4">🔐</div>
                  <h4 className={`font-extrabold text-xl mb-2 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Two-Factor Authentication
                  </h4>
                  <p className={`text-sm ${muted} max-w-xs`}>
                    Add an extra layer of protection. Every login and sensitive action requires a rotating 6-digit code from your authenticator app.
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { icon: "📱", title: "Install an authenticator app", desc: "Google Authenticator, Authy, or any TOTP app" },
                    { icon: "🔑", title: "Scan the QR code or enter key", desc: "Links KinnectFi to your authenticator" },
                    { icon: "✅", title: "Verify with a 6-digit code", desc: "Confirm the setup is working correctly" },
                  ].map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${card}`}>
                      <span className="text-xl flex-shrink-0">{s.icon}</span>
                      <div><p className={`text-sm font-semibold ${text}`}>{s.title}</p><p className={`text-xs ${muted}`}>{s.desc}</p></div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep("qr")} className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 transition-opacity">
                  Get Started →
                </button>
              </motion.div>
            )}

            {step === "qr" && (
              <motion.div key="qr" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                <h4 className={`font-extrabold text-base mb-1 ${text}`}>Scan with your app</h4>
                <p className={`text-xs ${muted} mb-5`}>Open your authenticator app and scan this QR code, or enter the key manually.</p>

                {/* Simulated QR code */}
                <div className={`flex items-center justify-center mb-5`}>
                  <div className="w-44 h-44 rounded-2xl bg-white p-3 shadow-lg">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Simulated QR pattern */}
                      <rect width="100" height="100" fill="white"/>
                      {/* Finder patterns */}
                      <rect x="5" y="5" width="25" height="25" rx="2" fill="black"/>
                      <rect x="8" y="8" width="19" height="19" rx="1" fill="white"/>
                      <rect x="11" y="11" width="13" height="13" rx="1" fill="black"/>
                      <rect x="70" y="5" width="25" height="25" rx="2" fill="black"/>
                      <rect x="73" y="8" width="19" height="19" rx="1" fill="white"/>
                      <rect x="76" y="11" width="13" height="13" rx="1" fill="black"/>
                      <rect x="5" y="70" width="25" height="25" rx="2" fill="black"/>
                      <rect x="8" y="73" width="19" height="19" rx="1" fill="white"/>
                      <rect x="11" y="76" width="13" height="13" rx="1" fill="black"/>
                      {/* Data modules (random looking pattern) */}
                      {[38,42,46,50,54,58,62,38,46,54,62].map((x,i) => (
                        <rect key={`a${i}`} x={x} y="5" width="4" height="4" fill="black"/>
                      ))}
                      {[38,42,50,58,62,38,42,50,54,62].map((y,i) => (
                        <rect key={`b${i}`} x="5" y={y} width="4" height="4" fill="black"/>
                      ))}
                      {[5,9,13,17,21,25,29,33,37,41,45,49,53,57,61,65,69,73,77,81,85,89].map((x,i) => (
                        <rect key={`c${i}`} x={x} y="38" width="4" height="4" fill={i%3===0?"black":"white"}/>
                      ))}
                      {[42,50,54,62,70,78,82,90].map((x,i) => (
                        <rect key={`d${i}`} x={x} y="42" width="4" height="4" fill="black"/>
                      ))}
                      {[38,46,50,58,66,74,82,90].map((x,i) => (
                        <rect key={`e${i}`} x={x} y="46" width="4" height="4" fill="black"/>
                      ))}
                      {[42,54,62,70,78,86,90].map((x,i) => (
                        <rect key={`f${i}`} x={x} y="50" width="4" height="4" fill="black"/>
                      ))}
                      {[38,46,54,62,66,74,82,90].map((x,i) => (
                        <rect key={`g${i}`} x={x} y="54" width="4" height="4" fill="black"/>
                      ))}
                      {[42,50,58,66,70,78,86].map((x,i) => (
                        <rect key={`h${i}`} x={x} y="58" width="4" height="4" fill="black"/>
                      ))}
                      {[38,46,54,58,62,70,82,90].map((x,i) => (
                        <rect key={`j${i}`} x={x} y="62" width="4" height="4" fill="black"/>
                      ))}
                      {[42,50,66,74,78,86].map((x,i) => (
                        <rect key={`k${i}`} x={x} y="66" width="4" height="4" fill="black"/>
                      ))}
                      {[38,54,62,70,78,82,90].map((x,i) => (
                        <rect key={`l${i}`} x={x} y="70" width="4" height="4" fill="black"/>
                      ))}
                      {[42,46,50,58,66,74,86,90].map((x,i) => (
                        <rect key={`m${i}`} x={x} y="74" width="4" height="4" fill="black"/>
                      ))}
                      {[38,54,62,70,78,82].map((x,i) => (
                        <rect key={`n${i}`} x={x} y="78" width="4" height="4" fill="black"/>
                      ))}
                      {[42,50,58,66,70,74,86].map((x,i) => (
                        <rect key={`o${i}`} x={x} y="82" width="4" height="4" fill="black"/>
                      ))}
                      {[38,46,54,62,74,82,90].map((x,i) => (
                        <rect key={`p${i}`} x={x} y="86" width="4" height="4" fill="black"/>
                      ))}
                      {[42,50,58,66,70,78,86,90].map((x,i) => (
                        <rect key={`q${i}`} x={x} y="90" width="4" height="4" fill="black"/>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Manual entry key */}
                <div className={`border rounded-xl p-3 mb-5 ${card}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Manual Entry Key</p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 font-mono text-sm font-bold tracking-widest ${text}`}>{SECRET}</code>
                    <button onClick={handleCopySecret} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${copied ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : darkMode ? "border-white/20 text-white/60 hover:bg-white/10" : "border-black/20 text-black/60 hover:bg-black/5"}`}>
                      {copied ? <><Check className="w-3 h-3 inline mr-1" />Copied!</> : <><Copy className="w-3 h-3 inline mr-1" />Copy</>}
                    </button>
                  </div>
                </div>

                <button onClick={() => setStep("verify")} className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 transition-opacity">
                  I've scanned it →
                </button>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div key="verify" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                <h4 className={`font-extrabold text-base mb-1 ${text}`}>Verify setup</h4>
                <p className={`text-xs ${muted} mb-5`}>Enter the 6-digit code from your authenticator app to confirm it's working.</p>
                <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    className={inputCls}
                    autoFocus
                  />
                </motion.div>
                <p className={`text-xs ${muted} text-center mt-3 mb-6`}>In demo mode, enter any 6-digit code</p>
                <button
                  onClick={handleVerify}
                  disabled={code.length < 6}
                  className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  Verify →
                </button>
              </motion.div>
            )}

            {step === "backup" && (
              <motion.div key="backup" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
                <h4 className={`font-extrabold text-base mb-1 ${text}`}>Save backup codes</h4>
                <p className={`text-xs ${muted} mb-4`}>If you lose access to your authenticator, these codes let you sign in. Each code can only be used once.</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {BACKUP_CODES.map((c, i) => (
                    <div key={i} className={`border rounded-xl px-3 py-2.5 text-center font-mono text-sm font-bold ${text} ${card}`}>{c}</div>
                  ))}
                </div>
                <button onClick={handleCopyBackups} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm mb-4 transition-colors ${codesCopied ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : darkMode ? "border-white/20 text-white/60 hover:bg-white/5" : "border-black/20 text-black/60 hover:bg-black/5"}`}>
                  {codesCopied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy all codes</>}
                </button>
                <button onClick={handleFinish} className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 transition-opacity">
                  I've saved them — Enable 2FA →
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <p className={`font-extrabold text-xl mb-1 ${text}`}>2FA Enabled!</p>
                <p className={`text-sm ${muted}`}>Your account is now protected with two-factor authentication.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}