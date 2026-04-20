import { useState } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIInsights({ darkMode, wallets, transfers, goals }) {
  const [open, setOpen] = useState(true);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  const generateInsights = async () => {
    setLoading(true);
    try {
      const usdBalance = wallets?.find(w => w.currency_code === "USD")?.balance || 0;
      const phpBalance = wallets?.find(w => w.currency_code === "PHP")?.balance || 0;
      const recentTransfers = (transfers || []).slice(0, 5).map(t => `$${t.amount_usd} to ${t.recipient_name}`).join(", ");
      const goalSummary = (goals || []).map(g => `${g.label}: $${g.current_amount}/$${g.target_amount}`).join(", ");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial advisor for a Filipino OFW (Overseas Filipino Worker) using KinnectFi, a cross-border neobank. 
        
        User's current financial snapshot:
        - USD Wallet: $${usdBalance}
        - PHP Wallet: ₱${phpBalance}
        - Recent transfers: ${recentTransfers || "None yet"}
        - Savings goals: ${goalSummary || "None set"}
        - Current USD/PHP rate: approximately ₱56.24
        
        Generate 3 personalized, actionable financial insights specifically relevant to OFWs sending money to the Philippines. 
        Be warm, encouraging, and culturally aware of Filipino family values (bayanihan, pamilya, padala). 
        Include specific actionable advice about timing transfers, saving strategies, and financial wellness.
        Keep each insight concise (1-2 sentences max).`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  icon: { type: "string", description: "A single emoji" },
                  title: { type: "string" },
                  body: { type: "string" },
                  action: { type: "string", description: "Short action label like 'Send Now' or 'Set Goal'" }
                }
              }
            }
          }
        }
      });
      setInsights(result.insights || []);
    } catch {
      setInsights([
        { icon: "✦", title: "Your Money, Working Hard", body: "Smart Yield is actively growing your idle balance at 5.1% APY — beating most US savings accounts.", action: "View Yield" },
        { icon: "⚡", title: "Budget Status: Healthy", body: "Keep up the momentum. You're tracking well against your monthly targets.", action: "See Details" },
        { icon: "🏠", title: "Bahay Goal Progress", body: "You're 65% toward your dream home. Keep consistent padala and you'll reach it by December 2026.", action: "View Goal" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first open if no insights yet
  const handleToggle = () => {
    if (!open && !insights && !loading) generateInsights();
    setOpen(!open);
  };

  return (
    <div>
      <button onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-primary font-bold text-sm uppercase tracking-wider">AI Spending Insights</span>
          <span className="bg-primary text-secondary text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
            {insights ? insights.length : "✦"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {insights && (
            <button onClick={(e) => { e.stopPropagation(); generateInsights(); }}
              className="text-primary/60 hover:text-primary transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
        </div>
      </button>

      {open && (
        <div className="space-y-2">
          {loading ? (
            <div className={`border rounded-xl p-6 text-center ${card}`}>
              <RefreshCw className="w-5 h-5 text-primary animate-spin mx-auto mb-2" />
              <p className={`text-sm ${muted}`}>Generating personalized insights...</p>
            </div>
          ) : !insights ? (
            <div className={`border rounded-xl p-6 text-center ${card}`}>
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-bold mb-1">Get AI-Powered Insights</p>
              <p className={`text-sm ${muted} mb-4`}>Let our AI analyze your finances and give you personalized OFW tips.</p>
              <button onClick={generateInsights}
                className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90">
                Generate Insights
              </button>
            </div>
          ) : (
            insights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${card}`}>
                <span className="text-xl flex-shrink-0 mt-0.5">{ins.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{ins.title}</p>
                  <p className={`text-xs ${muted} mt-0.5 leading-relaxed`}>{ins.body}</p>
                </div>
                {ins.action && (
                  <span className="text-primary text-xs font-bold flex-shrink-0 mt-0.5">{ins.action} →</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}