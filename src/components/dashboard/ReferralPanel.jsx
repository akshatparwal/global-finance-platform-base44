import { useState, useEffect } from "react";
import { Copy, Check, Users, Gift } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReferralPanel({ darkMode }) {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.email) {
        base44.entities.Referral.filter({ referrer_email: u.email }).then(setReferrals).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const referralCode = user?.email?.split("@")[0] || "user";
  const referralLink = `kinnect.fi/join/${referralCode}`;
  const joined = referrals.filter(r => r.status === "joined" || r.status === "rewarded").length;
  const pointsEarned = joined * 500;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return;
    if (!user?.email) return;
    setSending(true);
    try {
      // Check if already invited
      const existing = referrals.find(r => r.referred_email === inviteEmail);
      if (existing) { alert("This email has already been invited!"); setSending(false); return; }

      // Save referral record
      const ref = await base44.entities.Referral.create({
        referrer_email: user.email,
        referred_email: inviteEmail,
        status: "pending",
        points_awarded: 0,
      });

      // Send invite email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `${user.full_name || "Your friend"} invited you to KinnectFi 🇵🇭`,
        from_name: "KinnectFi",
        body: `Hi there!\n\n${user.full_name || "A friend"} has invited you to join KinnectFi — the zero-fee cross-border neobank built for Filipino families.\n\n✓ Send money to the Philippines instantly\n✓ Zero transfer fees\n✓ 5.10% APY on your USD balance\n\nJoin using this link and you'll both earn 500 Kinnect Points (worth a free padala fee!):\n\nhttps://${referralLink}\n\n— The KinnectFi Team\n\nBuilt for OFW families, by Filipinos.`
      });

      setReferrals(prev => [...prev, ref]);
      setInviteEmail("");
      alert(`✅ Invite sent to ${inviteEmail}! You'll earn 500 Kinnect Points when they join.`);
    } catch { alert("Could not send invite. Please try again."); }
    finally { setSending(false); }
  };

  return (
    <div className={`border rounded-2xl p-5 ${card}`}>
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-bold">Invite Family & Friends</h3>
      </div>
      <p className={`text-xs ${muted} mb-4`}>
        You both earn <span className="text-primary font-bold">500 Kinnect Points</span> when they join — that's a free padala!
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: "📨", label: "Invited", val: referrals.length },
          { icon: "✅", label: "Joined", val: joined },
          { icon: "🎁", label: "Points Earned", val: pointsEarned.toLocaleString() },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 text-center ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="font-black text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
            <p className={`text-[10px] ${muted} uppercase tracking-wider`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="mb-4">
        <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2`}>Your referral link</p>
        <button onClick={handleCopy} className={`flex items-center gap-2 w-full border rounded-xl px-4 py-2.5 text-left hover:border-primary/40 transition-colors ${inputBg}`}>
          <span className="text-xs font-mono flex-1 truncate">{referralLink}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
        </button>
      </div>

      {/* Invite by email */}
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2`}>Or invite by email</p>
        <div className="flex gap-2">
          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="family@example.com"
            type="email"
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors ${inputBg}`}
          />
          <button onClick={handleInvite} disabled={sending || !inviteEmail}
            className="bg-primary text-secondary font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 flex-shrink-0 transition-opacity">
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Recent invites</p>
          {referrals.slice(0, 3).map((r, i) => (
            <div key={i} className={`flex items-center justify-between py-2 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <p className="text-xs font-semibold truncate flex-1">{r.referred_email}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                r.status === "joined" || r.status === "rewarded" ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"
              }`}>
                {r.status === "joined" || r.status === "rewarded" ? "✓ Joined" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}