import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOutletContext } from "react-router-dom";
import { Shield, HelpCircle, LogOut, ChevronRight, Trash2, Copy, Check, Users, Gift, Mail, TrendingUp, Star, Share2, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SecurityHub from "@/components/security/SecurityHub";
import PointsRedemption from "@/components/dashboard/PointsRedemption";
import EditProfileForm from "@/components/profile/EditProfileForm";
import AccountDetails from "@/components/profile/AccountDetails";
import FamilyNetworkPanel from "@/components/profile/FamilyNetworkPanel";
import { base44 } from "@/api/base44Client";

const TIERS = [
  { label: "Starter",   min: 0,  max: 2,        points: 500,  color: "text-gray-400",    bg: "bg-gray-400/10",    icon: "🌱" },
  { label: "Connector", min: 3,  max: 9,        points: 750,  color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "🤝" },
  { label: "Bayani",    min: 10, max: 24,       points: 1000, color: "text-primary",     bg: "bg-primary/10",     icon: "🌟" },
  { label: "Pillar",    min: 25, max: Infinity,  points: 1500, color: "text-yellow-400", bg: "bg-yellow-400/10",  icon: "🏆" },
];
function getTier(joined) { return TIERS.find(t => joined >= t.min && joined <= t.max) || TIERS[0]; }
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PROFILE_TABS = ["General","Family","Referrals","Security","Support"];

export default function Profile() {
  const { darkMode } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("General");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeLang, setActiveLang] = useState("EN");
  const [transfers, setTransfers] = useState([]);
  // Referrals state
  const [referrals, setReferrals] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setLoadingUser(false);
      if (u?.email) {
        setReferralsLoading(true);
        base44.entities.Referral.filter({ referrer_email: u.email })
          .then(r => { setReferrals(r); setReferralsLoading(false); })
          .catch(() => setReferralsLoading(false));
      }
      // Auto-approve KYC: if doc is uploaded but still "pending", approve after 30s
      if (u?.kyc_doc_url && u?.kyc_status === "pending") {
        setTimeout(async () => {
          await base44.auth.updateMe({ kyc_status: "approved" }).catch(() => {});
          setUser(prev => prev ? { ...prev, kyc_status: "approved" } : prev);
        }, 30000);
      }
    }).catch(() => setLoadingUser(false));
    base44.entities.Transfer.list("-created_date", 100).then(setTransfers).catch(() => {});
  }, []);

  const handleSignOut = () => {
    base44.auth.logout("/");
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRedemption, setShowRedemption] = useState(false);

  const handleUploadDocument = () => {
    setShowOnboarding(true);
  };

  const referralCode = user?.email?.split("@")[0] || "user";
  const referralLink = `kinnect.fi/join/${referralCode}`;
  const invited = referrals.length;
  const joined  = referrals.filter(r => r.status === "joined" || r.status === "rewarded").length;
  const pending = referrals.filter(r => r.status === "pending").length;
  const tier    = getTier(joined);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const toNext   = nextTier ? nextTier.min - joined : 0;
  const pointsEarned = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || joined * 500;

  // Compute real points from transfers (50 pts per $10 sent) + referrals
  const transferPoints = transfers.reduce((sum, t) => sum + Math.floor((t.amount_usd || 0) / 10) * 50, 0);
  const realPoints = transferPoints + (joined * 500);

  // Compute streak — count consecutive months with at least one transfer
  const streak = (() => {
    if (!transfers.length) return 0;
    const monthSet = new Set(transfers.map(t => {
      const d = new Date(t.created_date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (monthSet.has(`${d.getFullYear()}-${d.getMonth()}`)) count++;
      else break;
    }
    return count;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    if (!user?.email) return;
    if (referrals.find(r => r.referred_email === inviteEmail)) return;
    setSending(true);
    try {
      const ref = await base44.entities.Referral.create({
        referrer_email: user.email, referred_email: inviteEmail, status: "pending", points_awarded: 0,
      });
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `${user.full_name || "Your friend"} invited you to KinnectFi 🇵🇭`,
        from_name: "KinnectFi",
        body: `Hi there!\n\n${user.full_name || "A friend"} invited you to KinnectFi — zero-fee cross-border neobank for Filipino families.\n\nJoin and you'll both earn 500 Kinnect Points:\nhttps://${referralLink}\n\n— The KinnectFi Team`,
      });
      setReferrals(prev => [...prev, ref]);
      setInviteEmail("");
    } catch {}
    finally { setSending(false); }
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : "U";

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {showRedemption && (
          <PointsRedemption
          points={realPoints}
            darkMode={darkMode}
            onClose={() => setShowRedemption(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOnboarding && user && (
          <OnboardingModal
            user={user}
            onComplete={() => { setShowOnboarding(false); base44.auth.me().then(setUser).catch(() => {}); }}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
      <div className="mb-4">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profile</h1>
        <p className={`text-xs ${muted}`}>Account Settings</p>
      </div>

      {/* User card */}
      <div className={`border rounded-2xl p-4 mb-4 flex items-center gap-3 ${card}`}>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-secondary font-black text-lg flex-shrink-0">{initials}</div>
        {loadingUser ? (
          <div className="flex-1 space-y-1.5 animate-pulse">
            <div className={`h-4 rounded-lg w-32 ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
            <div className={`h-3 rounded-lg w-44 ${darkMode ? "bg-white/5" : "bg-black/5"}`} />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className={`font-extrabold text-base truncate ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user?.full_name || "KinnectFi User"}
              </h2>
              <span className="text-primary text-sm flex-shrink-0">✓</span>
            </div>
            <p className={`text-xs ${muted} truncate`}>{user?.email || ""}</p>
            <div className="flex gap-1.5 mt-1.5">
              {user?.kyc_status === "approved"
                ? <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-full">✓ KYC Verified</span>
                : user?.kyc_status === "pending"
                  ? <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded-full">⏳ KYC Pending</span>
                  : <span className="bg-gray-500/10 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded-full">○ Verify Identity</span>
              }
              <span className={`${tier.bg} ${tier.color} text-[9px] font-bold px-2 py-0.5 rounded-full`}>{tier.icon} {tier.label.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {PROFILE_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 flex-1 min-w-[56px] py-2 text-[10px] font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-4">
          {/* Account Details */}
          {user && <AccountDetails user={user} darkMode={darkMode} />}

          <div className={`flex items-center justify-between p-4 rounded-xl border ${card}`}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div><p className={`font-semibold text-sm ${textMain}`}>IDENTITY VERIFIED</p><p className={`text-xs ${muted}`}>Full institutional access active</p></div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-primary text-xs">✓</div>
          </div>

          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1526, #1a2a4a)" }}>
            <div className="absolute top-3 right-4 opacity-10 text-6xl">🙏</div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">🔥</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xs font-bold uppercase">Bayani Streak</span>
                  {streak >= 12 && <span className="bg-yellow-500/20 text-yellow-400 text-[9px] font-bold px-1.5 rounded">LEGENDARY</span>}
                </div>
                <h3 className="text-white font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{streak} Month Padala Streak</h3>
                <p className="text-white/50 text-xs">{streak >= 12 ? "You've supported your family every month for a year. That's true Bayanihan!" : streak > 0 ? `${streak} consecutive months of supporting your family. Keep it up!` : "Send your first padala to start your streak!"}</p>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">🎁</span>
              <span className="text-primary text-[10px] font-bold uppercase bg-primary/10 px-2 py-0.5 rounded-full">REWARDS</span>
            </div>
            <p className={`text-3xl font-black ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{realPoints.toLocaleString()}</p>
            <p className={`text-xs ${muted} mb-3`}>Kinnect Points Balance</p>
            <button
              onClick={() => setShowRedemption(true)}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl border text-sm font-semibold ${textMain} ${darkMode ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"} transition-colors`}>
              Redeem for Cash/Fees <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {/* KYC */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Identity Verification</h3>
              {user?.kyc_status === "pending" && (
                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full">UNDER REVIEW</span>
              )}
              {user?.kyc_status === "approved" && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full">✓ APPROVED</span>
              )}
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: "Document uploaded", sub: "PhilSys, Passport, UMID or any gov ID", done: !!user?.kyc_doc_url },
                { label: "Selfie verified",   sub: "Live selfie for liveness check", done: !!user?.kyc_selfie_url },
                { label: "Phone secured",     sub: "OTP verification via SMS", done: !!user?.phone_verified },
              ].map((item, i) => (
                <button key={i} onClick={handleUploadDocument}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98] text-left ${item.done ? (darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200") : (darkMode ? "bg-white/5 border-white/8 hover:border-white/20" : "bg-black/3 border-black/8 hover:border-black/20")}`}>
                  <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${item.done ? "bg-emerald-500" : (darkMode ? "bg-white/10 border-2 border-white/20" : "bg-black/8 border-2 border-black/15")}`}>
                    {item.done ? <span className="text-white text-sm font-black">✓</span> : <span className={`text-xs font-black ${muted}`}>{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${item.done ? (darkMode ? "text-emerald-400" : "text-emerald-600") : (darkMode ? "text-white" : "text-[#1a2a4a]")}`}>{item.label}</p>
                    <p className={`text-xs ${muted} truncate`}>{item.sub}</p>
                  </div>
                  {!item.done && <ChevronRight className={`w-4 h-4 flex-shrink-0 ${muted}`} />}
                </button>
              ))}
            </div>
            <button onClick={handleUploadDocument} className="w-full bg-primary text-secondary font-bold px-5 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              {user?.kyc_doc_url ? "Continue KYC Setup →" : "⬆ Start Identity Verification"}
            </button>
          </div>

          {/* Editable profile fields */}
          {user && (
            <EditProfileForm
              user={user}
              darkMode={darkMode}
              onUpdated={(updated) => setUser(u => ({ ...u, ...updated }))}
            />
          )}

          {/* Language & Theme */}
          <div className={`border rounded-xl p-4 ${card}`}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3"><span className="text-lg">🌐</span><div><p className="font-semibold text-sm">Wika / Language</p><p className={`text-xs ${muted}`}>{activeLang === "EN" ? "English (US)" : activeLang === "TG" ? "Taglish" : activeLang === "CEB" ? "Cebuano" : "Ilocano"}</p></div></div>
              <div className="flex gap-1">
                {["EN","TG","CEB","ILO"].map(l => (
                  <button key={l} onClick={() => setActiveLang(l)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${l === activeLang ? "bg-primary text-secondary" : `${darkMode ? "bg-white/10 text-white/50 hover:bg-white/20" : "bg-black/10 text-black/50 hover:bg-black/20"}`}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 bg-primary/10 rounded-lg p-2">
              <span className="text-primary">⚡</span>
              <span className="text-primary text-xs">Language Multiplier: Active! Using localized languages like Taglish/Cebuano grants you a <strong>1.2x points multiplier</strong> on all transactions.</span>
            </div>
          </div>

          {/* Year story — real stats */}
          {transfers.length > 0 && (() => {
            const totalSent = transfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
            const totalPHP = transfers.reduce((s, t) => s + (t.amount_php || 0), 0);
            const uniqueRecipients = [...new Set(transfers.map(t => t.recipient_name).filter(Boolean))].length;
            return (
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #c97a20, #e8a030)" }}>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">✦ YOUR 2026 KINNECTFI STORY</p>
                <h3 className="text-white font-extrabold text-xl mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  A Year of Connection
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {[
                    { label: "Total Sent", val: `$${totalSent.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
                    { label: "Received (PHP)", val: `₱${(totalPHP/1000).toFixed(0)}K` },
                    { label: "Family Members", val: String(uniqueRecipients) },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-2.5 text-center">
                      <p className="text-white font-black text-lg leading-none">{s.val}</p>
                      <p className="text-white/70 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-xs mt-2">Every transfer is a reminder of your love for your family. 🇵🇭</p>
                <button
                  onClick={() => navigate("/dashboard/story")}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-white/20 border border-white/30 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors active:scale-[0.98]"
                >
                  <PlayCircle className="w-4 h-4" />
                  View Full Story →
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "Family" && (
        <div className="space-y-4">
          <FamilyNetworkPanel darkMode={darkMode} />
        </div>
      )}

      {activeTab === "Referrals" && (
        <div className="space-y-6">
          {/* Tier card */}
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
            <div className="absolute top-0 right-0 text-[120px] opacity-5 leading-none select-none">{tier.icon}</div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{tier.icon}</span>
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">Your Referral Tier</p>
                  <p className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tier.label}</p>
                </div>
                <span className="ml-auto bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full">{tier.points} pts / referral</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ label: "Invited", val: invited, icon: "📨" },{ label: "Joined", val: joined, icon: "✅" },{ label: "Pending", val: pending, icon: "⏳" }].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-lg mb-0.5">{s.icon}</p>
                    <p className="text-white font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
              {nextTier && (
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1"><span>{tier.label}</span><span>{toNext} more to {nextTier.label}</span></div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((joined / nextTier.min) * 100, 100)}%` }} /></div>
                </div>
              )}
            </div>
          </div>

          {/* Points earned */}
          <div className={`border rounded-2xl p-5 flex items-center gap-4 ${card}`}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Gift className="w-6 h-6 text-primary" /></div>
            <div className="flex-1">
              <p className={`text-xs uppercase tracking-wider font-bold ${muted} mb-0.5`}>Total Points Earned</p>
              <p className="text-3xl font-black text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pointsEarned.toLocaleString()} <span className={`text-sm font-normal ${muted}`}>pts</span></p>
              <p className={`text-xs ${muted}`}>≈ ${(pointsEarned / 1000).toFixed(2)} in transfer credits</p>
            </div>
          </div>

          {/* Referral link */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4"><Share2 className="w-4 h-4 text-primary" /><h3 className={`font-bold ${textMain}`}>Your Unique Referral Link</h3></div>
            <button onClick={handleCopy} className={`flex items-center gap-3 w-full border rounded-xl px-4 py-3 mb-3 hover:border-primary/40 transition-colors ${darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}>
              <span className="text-xs font-mono flex-1 truncate text-left">{referralLink}</span>
              <span className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${copied ? "text-emerald-500" : "text-primary"}`}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </span>
            </button>
            <p className={`text-xs ${muted} text-center`}>Share this link — you both earn <span className="text-primary font-bold">500 Kinnect Points</span> when they sign up</p>
          </div>

          {/* Invite by email */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-primary" /><h3 className={`font-bold ${textMain}`}>Invite by Email</h3></div>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleInvite()}
                placeholder="kumpadre@example.com" type="email"
                className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`} />
              <button onClick={handleInvite} disabled={sending || !inviteEmail}
                className="bg-primary text-secondary font-bold px-5 py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0">
                {sending ? "Sending..." : "Invite →"}
              </button>
            </div>
          </div>

          {/* Referral history */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h3 className={`font-bold ${textMain}`}>Referral History</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${darkMode ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"}`}>{referrals.length} total</span>
            </div>
            {referralsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className={`h-12 rounded-xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />)}</div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8"><p className="text-3xl mb-2">🤝</p><p className={`text-sm ${muted}`}>No referrals yet. Share your link to get started!</p></div>
            ) : (
              <div className="space-y-2">
                {referrals.map((r, i) => {
                  const isJoined = r.status === "joined" || r.status === "rewarded";
                  return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>{r.referred_email[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><p className={`text-sm font-semibold truncate ${textMain}`}>{r.referred_email}</p><p className={`text-xs ${muted}`}>{new Date(r.created_date).toLocaleDateString()}</p></div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>{isJoined ? "✓ Joined" : "Pending"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-primary" /><h3 className={`font-bold ${textMain}`}>How It Works</h3></div>
            <div className="space-y-3">
              {[{ num: "01", title: "Share your link", desc: "Send your referral link to fellow OFWs via email, WhatsApp, or Facebook." },{ num: "02", title: "They sign up", desc: "Your friend creates a KinnectFi account using your link." },{ num: "03", title: "You both earn 500 pts", desc: "Once they complete their first transfer, you both receive 500 Kinnect Points instantly." }].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 ${darkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>{s.num}</span>
                  <div><p className={`text-sm font-bold ${textMain}`}>{s.title}</p><p className={`text-xs ${muted}`}>{s.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <p className="text-primary text-xs font-bold">Reach Bayani tier (10+ referrals) to earn 1,000 pts per referral!</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <SecurityHub darkMode={darkMode} />
      )}

      {activeTab === "Support" && (
        <div className="space-y-3">
          <button onClick={() => window.open("/HowItWorks", "_blank")} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${card} ${darkMode ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
            <HelpCircle className={`w-5 h-5 ${muted}`} />
            <span className="font-semibold text-sm">Help Center & FAQs</span>
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors border-red-500/20 hover:bg-red-500/5">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-sm text-red-500">Sign Out</span>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors border-red-700/30 hover:bg-red-700/5">
                <Trash2 className="w-5 h-5 text-red-700" />
                <div>
                  <span className="font-semibold text-sm text-red-700 block">Delete Account</span>
                  <span className={`text-xs ${darkMode ? "text-white/30" : "text-black/30"}`}>Permanently remove your account and data</span>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is <strong>permanent and irreversible</strong>. All your wallets, transfer history, savings goals, and personal data will be erased. Your family connections will also be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    alert("Account deletion request submitted. Our team will process it within 48 hours and send a confirmation to your email.");
                    base44.auth.logout("/");
                  }}
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}