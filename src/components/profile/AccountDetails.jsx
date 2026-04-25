/**
 * AccountDetails — shows user's KinnectFi account number + routing info.
 * Deterministically generated from user ID so it's stable per user.
 */
import { useState } from "react";
import { Copy, Check, Eye, EyeOff, Shield } from "lucide-react";

function deriveAccountNumber(userId) {
  // Simple deterministic number from userId chars
  if (!userId) return "KF-000-000-0000";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  const n = hash.toString().padStart(10, "0").slice(0, 10);
  return `${n.slice(0,3)}-${n.slice(3,6)}-${n.slice(6)}`;
}

function deriveRoutingNumber(userId) {
  if (!userId) return "021000089";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 17 + userId.charCodeAt(i)) >>> 0;
  return (100000000 + (hash % 899999999)).toString();
}

export default function AccountDetails({ user, darkMode }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(null);

  const accountNumber = deriveAccountNumber(user?.id);
  const routingNumber = deriveRoutingNumber(user?.id);
  const iban = `US${routingNumber.slice(0,2)} KNNF ${accountNumber.replace(/-/g, " ")}`;

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const rowBg = darkMode ? "bg-white/5" : "bg-black/4";

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const rows = [
    { label: "Account Number", value: accountNumber, key: "acct" },
    { label: "Routing Number (ABA)", value: routingNumber, key: "routing" },
    { label: "SWIFT / BIC", value: "KNNFUS33", key: "swift" },
    { label: "Bank Name", value: "KinnectFi Bank N.A.", key: "bank" },
    { label: "Account Type", value: "Checking", key: "type" },
  ];

  return (
    <div className={`border rounded-2xl p-5 ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold ${text}`}>Account Details</h3>
          <p className={`text-xs ${muted}`}>Use these to receive wire transfers or direct deposits</p>
        </div>
        <button
          onClick={() => setShow(!show)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
            darkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-black/10 text-black/60 hover:bg-black/5"
          }`}
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {show ? "Hide" : "Reveal"}
        </button>
      </div>

      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.key} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${rowBg}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-0.5`}>{row.label}</p>
              <p className={`font-mono text-sm font-bold ${text}`}>
                {show || row.key === "bank" || row.key === "type"
                  ? row.value
                  : "•".repeat(row.value.length)}
              </p>
            </div>
            {(show || row.key === "bank" || row.key === "type") && (
              <button onClick={() => handleCopy(row.value, row.key)}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/10"}`}>
                {copied === row.key
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className={`w-3.5 h-3.5 ${muted}`} />}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3">
        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-primary text-xs">These details are unique to your KinnectFi account. Only share with trusted parties for receiving funds.</p>
      </div>
    </div>
  );
}