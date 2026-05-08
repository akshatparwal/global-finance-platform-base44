import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Shield, HelpCircle, LogOut, ChevronRight, Trash2, Copy, Check, Users, Mail, Share2, PlayCircle } from "lucide-react";
import SecurityHub from "@/components/security/SecurityHub";
import EditProfileForm from "@/components/profile/EditProfileForm";
import AccountDetails from "@/components/profile/AccountDetails";
import { base44 } from "@/api/base44Client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PROFILE_TABS = ["General", "Security", "Support"];

export default function Profile() {
  const { darkMode } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("General");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    }).catch(() => setLoadingUser(false));
    base44.entities.Transfer.list("-created_date", 100).then(setTransfers).catch(() => {});
  }, []);

  const handleSignOut = () => base44.auth.logout("/");

  const referralCode = user?.email?.split("@")[0] || "user";
  const referralLink = `kinnect.fi/join/${referralCode}`;
  const joined  = referrals.filter(r => r.status === "joined" || r.status === "rewarded").length;
  const pending = referrals.filter(r => r.status === "pending").length;
  const cashEarned = joined * 50;

  // Streak — consecutive months with at least one transfer
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
        body: `Hi there!\n\n${user.full_name || "A friend"} invited you to KinnectFi — zero-fee cross-border neobank for Filipino families.\n\nJoin and you'll both earn $50 cash:\nhttps://${referralLink}\n\n— The KinnectFi Team`,
      });
      setReferrals(prev => [...prev, ref]);
      setInviteEmail("");
    } catch {}
    finally { setSending(false); }
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-2xl mx-auto">
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
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {PROFILE_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-4">
          {/* Account Details */}
          {user && <AccountDetails user={user} darkMode={darkMode} />}

          {user?.kyc_status === "approved" && (
            <div className={`flex items-center justify-between p-4 rounded-xl border ${card}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div><p className={`font-semibold text-sm ${textMain}`}>IDENTITY VERIFIED</p><p className={`text-xs ${muted}`}>Full institutional access active</p></div>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-primary text-xs">✓</div>
            </div>
          )}

          {/* Streak */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1526, #1a2a4a)" }}>
            <div className="absolute top-3 right-4 opacity-10 text-6xl">🙏</div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">🔥</div>
              <div>
                <span className="text-primary text-xs font-bold uppercase">Bayani Streak</span>
                <h3 className="text-white font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{streak} Month Padala Streak</h3>
                <p className="text-white/50 text-xs">{streak >= 12 ? "You've supported your family every month for a year!" : streak > 0 ? `${streak} consecutive months of supporting your family.` : "Send your first padala to start your streak!"}</p>
              </div>
            </div>
          </div>

          {/* Referrals — concise inline section */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <h3 className={`font-bold ${textMain}`}>Refer & Earn</h3>
              </div>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">$50 per referral</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ label: "Invited", val: referrals.length, icon: "📨" }, { label: "Joined", val: joined, icon: "✅" }, { label: "Earned", val: `$${cashEarned}`, icon: "💵" }].map((s, i) => (
                <div key={i} className={`rounded-xl p-3 text-center ${darkMode ? "bg-white/5" : "bg-black/4"}`}>
                  <p className="text-base mb-0.5">{s.icon}</p>
                  <p className={`font-black text-lg ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
                  <p className={`text-[10px] uppercase tracking-wider ${muted}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <button onClick={handleCopy} className={`flex items-center gap-3 w-full border rounded-xl px-4 py-3 mb-3 hover:border-primary/40 transition-colors ${darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}>
              <span className="text-xs font-mono flex-1 truncate text-left">{referralLink}</span>
              <span className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${copied ? "text-emerald-500" : "text-primary"}`}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </span>
            </button>

            {/* Invite by email */}
            <div className="flex gap-2 mb-3">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleInvite()}
                placeholder="friend@example.com" type="email"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`} />
              <button onClick={handleInvite} disabled={sending || !inviteEmail}
                className="bg-primary text-secondary font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0">
                {sending ? "..." : "Invite →"}
              </button>
            </div>

            <p className={`text-xs ${muted} text-center`}>You both earn <span className="text-primary font-bold">$50 cash</span> when they complete their first transfer</p>

            {/* Referral history */}
            {referrals.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${darkMode ? "border-white/5" : "border-black/5"} space-y-2`}>
                {referralsLoading ? (
                  <div className="space-y-2">{[1,2].map(i => <div key={i} className={`h-10 rounded-xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />)}</div>
                ) : referrals.map((r, i) => {
                  const isJoined = r.status === "joined" || r.status === "rewarded";
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>{r.referred_email[0].toUpperCase()}</div>
                      <p className={`text-sm flex-1 truncate ${textMain}`}>{r.referred_email}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>{isJoined ? "✓ +$50" : "Pending"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KYC */}
          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Identity Verification</h3>
              {user?.kyc_status === "pending" && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full">UNDER REVIEW</span>}
              {user?.kyc_status === "approved" && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full">✓ APPROVED</span>}
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: "Document uploaded", sub: "PhilSys, Passport, UMID or any gov ID", done: !!user?.kyc_doc_url },
                { label: "Selfie verified",   sub: "Live selfie for liveness check",        done: !!user?.kyc_selfie_url },
                { label: "Phone secured",     sub: "OTP verification via SMS",              done: !!user?.phone_verified },
              ].map((item, i) => (
                <button key={i} onClick={() => setShowOnboarding(true)}
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
            {user?.kyc_status !== "approved" && (
              <button onClick={() => setShowOnboarding(true)} className="w-full bg-primary text-secondary font-bold px-5 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                {user?.kyc_doc_url ? "Continue KYC Setup →" : "⬆ Start Identity Verification"}
              </button>
            )}
          </div>

          {/* Editable profile fields */}
          {user && (
            <EditProfileForm
              user={user}
              darkMode={darkMode}
              onUpdated={(updated) => setUser(u => ({ ...u, ...updated }))}
            />
          )}

          {/* Year story */}
          {transfers.length > 0 && (() => {
            const OUTBOUND = ["remittance", "bills", "subscriptions", "savings", "other"];
            const sentTransfers = transfers.filter(t => OUTBOUND.includes(t.category));
            const totalSent = sentTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
            const totalPHP = sentTransfers.reduce((s, t) => s + (t.amount_php || 0), 0);
            const uniqueRecipients = [...new Set(sentTransfers.map(t => t.recipient_name).filter(Boolean))].length;
            return (
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #c97a20, #e8a030)" }}>
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">✦ YOUR 2026 KINNECTFI STORY</p>
                <h3 className="text-white font-extrabold text-xl mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A Year of Connection</h3>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {[
                    { label: "Total Sent", val: `$${totalSent.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
                    { label: "Received (PHP)", val: `₱${(totalPHP / 1000).toFixed(0)}K` },
                    { label: "Family Members", val: String(uniqueRecipients) },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 rounded-xl p-2.5 text-center">
                      <p className="text-white font-black text-lg leading-none">{s.val}</p>
                      <p className="text-white/70 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-xs mt-2">Every transfer is a reminder of your love for your family. 🇵🇭</p>
                <button onClick={() => navigate("/dashboard/story")}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-white/20 border border-white/30 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors active:scale-[0.98]">
                  <PlayCircle className="w-4 h-4" />
                  View Full Story →
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "Security" && <SecurityHub darkMode={darkMode} />}

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
                  This action is <strong>permanent and irreversible</strong>. All your wallets, transfer history, savings goals, and personal data will be erased.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    await base44.entities.Transfer.create({
                      amount_usd: 0, recipient_name: "ACCOUNT_DELETION_REQUEST", category: "other", status: "pending",
                      note: `Deletion requested by ${user?.email || "unknown"} at ${new Date().toISOString()}`,
                      reference_id: `DEL-${Date.now().toString(36).toUpperCase()}`,
                    }).catch(() => {});
                    if (user?.email) {
                      await base44.integrations.Core.SendEmail({
                        to: user.email, subject: "KinnectFi: Account Deletion Request Received",
                        body: `Hi ${user.full_name || "there"},\n\nWe received your account deletion request. Our team will process it within 48 hours.\n\n— The KinnectFi Team`,
                      }).catch(() => {});
                    }
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