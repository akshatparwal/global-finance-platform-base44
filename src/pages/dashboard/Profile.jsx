import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Shield, Bell, Settings, HelpCircle, LogOut, ChevronRight, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const PROFILE_TABS = ["General","Family","Security","Support"];

export default function Profile() {
  const { darkMode } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("General");
  const navigate = useNavigate();
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  const handleSignOut = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profile</h1>
        <p className={`text-sm ${muted}`}>Account Settings</p>
      </div>

      {/* User card */}
      <div className={`border rounded-2xl p-5 mb-6 flex items-center gap-4 ${card}`}>
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-secondary font-black text-xl">TU</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Test User</h2>
            <span className="text-primary">✓</span>
          </div>
          <p className={`text-sm ${muted}`}>test-verify@kinnectfi.com</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ KYC Verified</span>
            <span className={`${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"} text-[10px] font-bold px-2 py-0.5 rounded-full`}>Premium</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6`}>
        {PROFILE_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-4">
          {/* Identity verified */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${card}`}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div><p className="font-semibold text-sm">IDENTITY VERIFIED</p><p className={`text-xs ${muted}`}>Full institutional access active</p></div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-primary text-xs">✓</div>
          </div>

          {/* Streak */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1526, #1a2a4a)" }}>
            <div className="absolute top-3 right-4 opacity-10 text-6xl">🙏</div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">🔥</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xs font-bold uppercase">Bayani Streak</span>
                  <span className="bg-yellow-500/20 text-yellow-400 text-[9px] font-bold px-1.5 rounded">LEGENDARY</span>
                </div>
                <h3 className="text-white font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>12 Month Padala Streak</h3>
                <p className="text-white/50 text-xs">You've supported your family every month for a year. That's true Bayanihan!</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-2xl p-5 ${card}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">🎁</span>
                <span className="text-primary text-[10px] font-bold uppercase bg-primary/10 px-2 py-0.5 rounded-full">REWARDS</span>
              </div>
              <p className="text-3xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>2,450</p>
              <p className={`text-xs ${muted} mb-3`}>Kinnect Points Balance</p>
              <button className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl border text-sm font-semibold ${darkMode ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"} transition-colors`}>
                Redeem for Cash/Fees <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className={`border rounded-2xl p-5 ${card}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👨‍👩‍👧</span>
                <span className="text-primary text-[10px] font-bold uppercase">INVITE FAMILY & FRIENDS</span>
              </div>
              <p className={`text-xs ${muted} mb-3`}>Invite your family and friends to KinnectFi. You both earn <span className="text-primary font-bold">500 Kinnect Points</span> — that's a free padala fee!</p>
              <div className="flex items-center gap-2 bg-black/10 rounded-lg px-3 py-2">
                <span className="text-xs font-mono flex-1 truncate">kinnect.fi/join/testuser</span>
                <Copy className="w-3 h-3 text-primary cursor-pointer" />
              </div>
              <p className={`text-xs ${muted} mt-2`}>You've invited 3 family members. <span className="text-primary">2 have joined!</span></p>
            </div>
          </div>

          {/* KYC */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <h3 className="font-bold mb-3">Identity Verification</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {["PhilSys","UMID","Passport","Driver's License","Voter's ID","SSS ID"].map(id => (
                <span key={id} className={`text-[10px] font-bold px-2 py-1 rounded ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>{id}</span>
              ))}
            </div>
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current opacity-30 flex items-center justify-center mx-auto mb-2">⏱</div>
              <p className={`text-sm ${muted} mb-3`}>No document uploaded<br /><span className="text-xs">Upload your ID to complete verification</span></p>
              <button className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90">⬆ Upload Document</button>
            </div>
          </div>

          {/* Language & Theme */}
          <div className={`border rounded-xl p-4 ${card}`}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3"><span className="text-lg">🌐</span><div><p className="font-semibold text-sm">Wika / Language</p><p className={`text-xs ${muted}`}>English (US)</p></div></div>
              <div className="flex gap-1">
                {["EN","TG","CEB","ILO"].map(l => <button key={l} className={`text-[10px] font-bold px-2 py-1 rounded ${l==="EN" ? "bg-primary text-secondary" : `${darkMode ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"}`}`}>{l}</button>)}
              </div>
            </div>
            <div className={`flex items-center justify-between py-2 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <div className="flex items-center gap-3"><span className="text-lg">☀️</span><div><p className="font-semibold text-sm">Display Mode</p><p className={`text-xs ${muted}`}>Bahay (Light Mode)</p></div></div>
              <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${darkMode ? "border-white/20 hover:bg-white/5" : "border-black/20"} transition-colors`}>SWITCH</button>
            </div>
            <div className="mt-2 flex items-center gap-2 bg-primary/10 rounded-lg p-2">
              <span className="text-primary">⚡</span>
              <span className="text-primary text-xs">Language Multiplier: Active! Using localized languages like Taglish/Cebuano grants you a <strong>1.2x points multiplier</strong> on all transactions.</span>
            </div>
          </div>

          {/* Year story */}
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #c97a20, #e8a030)" }}>
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">✦</p>
            <h3 className="text-white font-extrabold text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your 2026 KinnectFi Story</h3>
            <p className="text-white/70 text-sm mb-4">Watch your year of connection, sacrifice, and love.</p>
            <button className="w-full bg-white text-[#c97a20] font-bold py-3 rounded-xl hover:bg-white/90 transition-colors">Watch Now</button>
          </div>
        </div>
      )}

      {activeTab === "Family" && (
        <div className="space-y-4">
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-1"><span className="text-red-400">❤️</span><h3 className="font-extrabold">Katuwang Shared Wallet</h3></div>
            <p className="text-primary text-xs font-bold uppercase mb-3">FOR COUPLES & FAMILY PARTNERS</p>
            <p className={`text-sm ${muted} mb-4`}>Build your future together. Katuwang wallets require dual-signature approval for major transfers, ensuring your shared goals stay on track.</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👩</span><span className="text-2xl">👴</span>
            </div>
            <div className="flex justify-between items-center">
              <button className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90">Connect your Partner →</button>
              <div className="text-right">
                <p className={`text-xs ${muted} mb-0.5`}>Shared Balance</p>
                <p className="font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$4,250.00</p>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: "75%" }} /></div>
                <p className={`text-[10px] ${muted} mt-0.5`}>75% of goal</p>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex justify-between items-center mb-1">
              <div><h3 className="font-bold">Family Network</h3><p className="text-primary text-xs font-bold uppercase">BAYANIHAN MAP</p></div>
              <span className="text-red-400 text-lg cursor-pointer">🤍</span>
            </div>
            <div className="h-48 rounded-xl mt-3 flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e8e0d0, #f5efe6)" }}>
              {[{label:"Quezon City",top:"10%",left:"65%"},{label:"Davao City",top:"45%",left:"25%"},{label:"Cebu City",top:"45%",left:"75%"},{label:"Manila",top:"75%",left:"50%"}].map((c,i) => (
                <div key={i} className="absolute text-center" style={{ top: c.top, left: c.left, transform: "translate(-50%,-50%)" }}>
                  <p className="text-[10px] text-[#1a2a4a]/60 font-semibold">{c.label}</p>
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-[#1a2a4a] flex items-center justify-center text-white text-lg">👤</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[{icon:"📍",label:"Reach",val:"4 Family Members"},{icon:"📈",label:"Total Sent",val:"₱2.3M"},{icon:"❤️",label:"Loyalty",val:"12 month streak"}].map((s,i) => (
                <div key={i} className="text-center">
                  <p className={`text-xs ${muted} mb-1`}><span className="text-primary">{s.icon}</span> {s.label}</p>
                  <p className="font-bold text-sm">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="space-y-3">
          {[{ icon: Shield, label: "Security Hub", sub: "Sessions, 2FA, biometrics" },{ icon: Bell, label: "Notifications", sub: "Push, email, SMS alerts" }].map((s,i) => (
            <button key={i} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${card} ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
              <s.icon className={`w-5 h-5 ${muted}`} />
              <div className="flex-1"><p className="font-semibold text-sm">{s.label}</p><p className={`text-xs ${muted}`}>{s.sub}</p></div>
              <ChevronRight className={`w-4 h-4 ${muted}`} />
            </button>
          ))}
        </div>
      )}

      {activeTab === "Support" && (
        <div className="space-y-3">
          {[{ icon: Settings, label: "App Settings" },{ icon: HelpCircle, label: "Help Center & FAQs" }].map((s,i) => (
            <button key={i} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${card} ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
              <s.icon className={`w-5 h-5 ${muted}`} />
              <span className="font-semibold text-sm">{s.label}</span>
            </button>
          ))}
          <button onClick={handleSignOut} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors border-red-500/20 hover:bg-red-500/5`}>
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-sm text-red-500">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}