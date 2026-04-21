import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Copy, Check, Users, Gift, Mail, TrendingUp, Star, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIERS = [
  { label: "Starter", min: 0,  max: 2,  points: 500,  color: "text-gray-400",    bg: "bg-gray-400/10",    icon: "🌱" },
  { label: "Connector", min: 3,  max: 9,  points: 750,  color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "🤝" },
  { label: "Bayani",   min: 10, max: 24, points: 1000, color: "text-primary",     bg: "bg-primary/10",     icon: "🌟" },
  { label: "Pillar",   min: 25, max: Infinity, points: 1500, color: "text-yellow-400", bg: "bg-yellow-400/10", icon: "🏆" },
];

function getTier(joined) {
  return TIERS.find(t => joined >= t.min && joined <= t.max) || TIERS[0];
}

export default function Referrals() {
  const { darkMode } = useOutletContext() || {};
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const card  = darkMode ? "bg-[#1a2332] border-white/5"  : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50"                 : "text-[#1a2a4a]/50";
  const text  = darkMode ? "text-white"                    : "text-[#1a2a4a]";
  const inputBg = darkMode
    ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30"
    : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.email) {
        base44.entities.Referral.filter({ referrer_email: u.email })
          .then(r => { setReferrals(r); setLoading(false); })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const referralCode = user?.email?.split("@")[0] || "user";
  const referralLink = `kinnect.fi/join/${referralCode}`;

  const invited = referrals.length;
  const joined  = referrals.filter(r => r.status === "joined" || r.status === "rewarded").length;
  const pending = referrals.filter(r => r.status === "pending").length;
  const tier    = getTier(joined);
  const pointsEarned = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || joined * 500;
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const toNext   = nextTier ? nextTier.min - joined : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    if (!user?.email) return;
    if (referrals.find(r => r.referred_email === inviteEmail)) {
      alert("This email has already been invited!"); return;
    }
    setSending(true);
    try {
      const ref = await base44.entities.Referral.create({
        referrer_email: user.email,
        referred_email: inviteEmail,
        status: "pending",
        points_awarded: 0,
      });
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `${user.full_name || "Your friend"} invited you to KinnectFi 🇵🇭`,
        from_name: "KinnectFi",
        body: `Hi there!\n\n${user.full_name || "A friend"} has invited you to join KinnectFi — the zero-fee cross-border neobank built for Filipino families.\n\n✓ Send money to the Philippines instantly\n✓ Zero transfer fees\n✓ 5.10% APY on your USD balance\n\nJoin using this link and you'll both earn 500 Kinnect Points:\n\nhttps://${referralLink}\n\n— The KinnectFi Team`,
      });
      setReferrals(prev => [...prev, ref]);
      setInviteEmail("");
      alert(`✅ Invite sent to ${inviteEmail}! You'll earn 500 Kinnect Points when they join.`);
    } catch {
      alert("Could not send invite. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Referral Dashboard
        </h1>
        <p className={`text-sm ${muted}`}>Invite fellow OFWs and earn Kinnect Points together</p>
      </div>

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
            <span className="ml-auto bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {tier.points} pts / referral
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Invited", val: invited, icon: "📨" },
              { label: "Joined",  val: joined,  icon: "✅" },
              { label: "Pending", val: pending, icon: "⏳" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-lg mb-0.5">{s.icon}</p>
                <p className="text-white font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>{tier.label}</span>
                <span>{toNext} more to {nextTier.label}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((joined / nextTier.min) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Points earned */}
      <div className={`border rounded-2xl p-5 flex items-center gap-4 ${card}`}>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className={`text-xs uppercase tracking-wider font-bold ${muted} mb-0.5`}>Total Points Earned</p>
          <p className="text-3xl font-black text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {pointsEarned.toLocaleString()} <span className={`text-sm font-normal ${muted}`}>pts</span>
          </p>
          <p className={`text-xs ${muted}`}>≈ ${(pointsEarned / 1000).toFixed(2)} in transfer credits</p>
        </div>
        <div className="text-right">
          <p className={`text-xs ${muted} mb-1`}>Cash Value</p>
          <p className="font-black text-lg text-primary">${(pointsEarned / 1000).toFixed(2)}</p>
        </div>
      </div>

      {/* Referral link */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-primary" />
          <h3 className={`font-bold ${text}`}>Your Unique Referral Link</h3>
        </div>
        <button onClick={handleCopy}
          className={`flex items-center gap-3 w-full border rounded-xl px-4 py-3 mb-3 hover:border-primary/40 transition-colors ${inputBg}`}>
          <span className="text-xs font-mono flex-1 truncate text-left">{referralLink}</span>
          <span className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${copied ? "text-emerald-500" : "text-primary"}`}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </span>
        </button>
        <p className={`text-xs ${muted} text-center`}>
          Share this link — you both earn <span className="text-primary font-bold">500 Kinnect Points</span> when they sign up
        </p>
      </div>

      {/* Invite by email */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className={`font-bold ${text}`}>Invite by Email</h3>
        </div>
        <div className="flex gap-2">
          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            placeholder="kumpadre@example.com"
            type="email"
            className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${inputBg}`}
          />
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
          <h3 className={`font-bold ${text}`}>Referral History</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${darkMode ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"}`}>
            {referrals.length} total
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className={`h-12 rounded-xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🤝</p>
            <p className={`text-sm ${muted}`}>No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r, i) => {
              const isJoined = r.status === "joined" || r.status === "rewarded";
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>
                    {r.referred_email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${text}`}>{r.referred_email}</p>
                    <p className={`text-xs ${muted}`}>{new Date(r.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isJoined ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>
                      {isJoined ? "✓ Joined" : "Pending"}
                    </span>
                    {isJoined && (
                      <p className="text-primary text-xs font-bold mt-0.5">+500 pts</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className={`font-bold ${text}`}>How It Works</h3>
        </div>
        <div className="space-y-3">
          {[
            { num: "01", title: "Share your link", desc: "Send your unique referral link to fellow OFWs via email, WhatsApp, or Facebook." },
            { num: "02", title: "They sign up", desc: "Your friend creates a KinnectFi account using your referral link." },
            { num: "03", title: "You both earn 500 pts", desc: "Once they complete their first transfer, you both receive 500 Kinnect Points instantly." },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`text-xs font-black px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 ${darkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>{s.num}</span>
              <div>
                <p className={`text-sm font-bold ${text}`}>{s.title}</p>
                <p className={`text-xs ${muted}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <p className="text-primary text-xs font-bold">Reach Bayani tier (10+ referrals) to earn 1,000 pts per referral!</p>
          </div>
        </div>
      </div>
    </div>
  );
}