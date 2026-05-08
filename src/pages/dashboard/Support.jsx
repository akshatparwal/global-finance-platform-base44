import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Send, RefreshCw, BookOpen, Phone, ChevronRight, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import ChatMessage from "@/components/support/ChatMessage";
import SuggestedPrompts from "@/components/support/SuggestedPrompts";
import { useLiveRates } from "@/hooks/useLiveRates";

const buildSystemPrompt = (liveRate) => `You are Kaya, Kayah's friendly and knowledgeable AI support assistant. Kayah is a cross-border neobank built for Filipino OFWs (Overseas Filipino Workers) to send money home instantly with zero fees.

Key facts you know:
- Current USD/PHP rate is ${liveRate ? `₱${liveRate.toFixed(2)} (live, just fetched)` : "approximately ₱56.24 (live rate, varies)"}
- Transfers to GCash, Maya, BDO, BPI, Metrobank, UnionBank, PNB, RCBC, Landbank are supported
- Transfers arrive in 30 seconds to 2 minutes for GCash/Maya, 1-2 hours for bank transfers
- Kayah charges ZERO transfer fees
- KYC requires: PhilSys, UMID, Passport, Driver's License, Voter's ID, or SSS ID + selfie + phone verification
- Kayah cards (virtual + physical) are available to verified users
- Savings goals, rate alerts, and referral rewards (500 pts per referral) are available
- Bayani tier requires 10+ referrals; users earn Kinnect Points redeemable for transfer credits
- The app supports English and Taglish

Be concise, warm, and helpful. Use Filipino cultural references when appropriate. If you don't know something specific, say so honestly and suggest contacting live support. Keep responses under 150 words unless the user asks for detail. Use emojis sparingly but naturally.`;

const SYSTEM_PROMPT = buildSystemPrompt(null); // fallback, overridden at send time

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Kumusta! 👋 I'm Kaya, your Kayah assistant.\n\nI can help you with transfers, rates, KYC, cards, and more. What can I help you with today?",
  timestamp: Date.now(),
};

const LS_CHAT_KEY = "kf_support_chat";

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_CHAT_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
  } catch { return [WELCOME_MESSAGE]; }
}

function saveHistory(msgs) {
  try { localStorage.setItem(LS_CHAT_KEY, JSON.stringify(msgs.slice(-40))); } catch {}
}

export default function Support() {
  const { darkMode, taglish } = useOutletContext() || {};
  const navigate = useNavigate();
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [user, setUser] = useState(null);
  const [flagging, setFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { rates } = useLiveRates();
  const liveRate = rates?.USDPHP;

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/8";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputBg = darkMode
    ? "bg-[#1a2332] border-white/10 text-white placeholder-white/30"
    : "bg-white border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildHistory = (msgs) =>
    msgs
      .filter(m => m.role !== "assistant" || m !== WELCOME_MESSAGE)
      .map(m => `${m.role === "user" ? "User" : "Kaya"}: ${m.content}`)
      .join("\n");

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    setShowPrompts(false);

    const userMsg = { role: "user", content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = buildHistory(messages);
      const contextPrompt = user
        ? `The user's name is ${user.full_name || "there"}.${user.onboarding_completed ? " They are fully verified." : " They have not completed KYC yet."}\n\n`
        : "";

      const systemPrompt = buildSystemPrompt(liveRate);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\n${contextPrompt}Conversation so far:\n${history}\n\nUser: ${userText}\n\nKaya:`,
        model: "gemini_3_flash",
      });

      const assistantMsg = {
        role: "assistant",
        content: typeof response === "string" ? response : response?.text || "Sorry, I couldn't process that. Please try again.",
        timestamp: Date.now(),
        id: Date.now().toString(),
        feedback: null,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Support chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again, or reach out to our support team via WhatsApp or email above.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Persist messages on every change
  useEffect(() => { saveHistory(messages); }, [messages]);

  const handleFeedback = async (msgId, rating, msgContent) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: rating } : m));
    if (rating === "down") {
      await base44.integrations.Core.SendEmail({
        to: "support@kinnectfi.com",
        from_name: "Kayah Kaya Feedback",
        subject: `👎 Unhelpful Kaya Response — ${user?.email || "unknown user"}`,
        body: `A user rated a Kaya response as unhelpful.\n\nUser: ${user?.full_name || "Unknown"} (${user?.email || "no email"})\nTime: ${new Date().toISOString()}\n\nKaya's response:\n"${msgContent}"\n\nFull conversation:\n${messages.map(m => `${m.role === "user" ? "User" : "Kaya"}: ${m.content}`).join("\n\n")}`,
      }).catch(() => {});
    }
  };

  const handleReset = () => {
    const fresh = [WELCOME_MESSAGE];
    setMessages(fresh);
    saveHistory(fresh);
    setShowPrompts(true);
    setInput("");
    setFlagged(false);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Suporta" : "Support"}
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className={`text-xs ${muted}`}>Kaya AI · Online now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${darkMode ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}
            title="New conversation"
          >
            <RefreshCw className={`w-4 h-4 ${muted}`} />
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
        <a
          href="mailto:support@kinnectfi.com?subject=Help%20Center%20FAQ&body=Hi%2C%20I%20have%20a%20question%20about%20Kayah."
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${card} hover:border-primary/30`}
        >
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className={`text-xs font-bold ${text}`}>Help Center</p>
            <p className={`text-[10px] ${muted} truncate`}>Guides & FAQs</p>
          </div>
          <ChevronRight className={`w-3 h-3 ${muted} flex-shrink-0 ml-auto`} />
        </a>
        <div className={`flex flex-col rounded-xl border overflow-hidden ${card}`}>
          <a
            href="https://wa.me/14155238886?text=Hi%2C%20I%20need%20help%20with%20my%20Kayah%20account"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 border-b text-left transition-colors hover:border-primary/30 ${darkMode ? "border-white/5" : "border-black/5"}`}
          >
            <span className="text-base flex-shrink-0">💬</span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${text}`}>WhatsApp Support</p>
              <p className={`text-[10px] ${muted} truncate`}>Human agent · Replies in mins</p>
            </div>
            <ChevronRight className={`w-3 h-3 ${muted} flex-shrink-0 ml-auto`} />
          </a>
          <a
            href={`mailto:support@kinnectfi.com?subject=Support%20Request&body=Hi%2C%20I%20need%20help%20with%20my%20Kayah%20account.%20My%20email%3A%20${encodeURIComponent(user?.email || "")}`}
            className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:opacity-80"
          >
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className={`text-xs font-bold ${text}`}>Email Support</p>
              <p className={`text-[10px] ${muted} truncate`}>support@kinnectfi.com</p>
            </div>
            <ChevronRight className={`w-3 h-3 ${muted} flex-shrink-0 ml-auto`} />
          </a>
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 overflow-y-auto rounded-2xl border p-4 space-y-4 mb-3 ${card}`}
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              darkMode={darkMode}
              onFeedback={msg.role === "assistant" && msg.id ? (rating) => handleFeedback(msg.id, rating, msg.content) : null}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm">🤖</span>
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-bl-sm border ${darkMode ? "bg-[#1a2332] border-white/8" : "bg-white border-black/8 shadow-sm"}`}>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Escalate / Flag issue */}
      {messages.length > 2 && !loading && (
        <div className="flex-shrink-0 flex justify-center mb-2">
          {flagged ? (
            <span className={`text-xs font-semibold px-4 py-2 rounded-full ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-600"}`}>
              ✓ Issue flagged — our team will follow up via email
            </span>
          ) : (
            <button
              disabled={flagging}
              onClick={async () => {
                setFlagging(true);
                const transcript = messages.map(m => `${m.role === "user" ? "User" : "Kaya"}: ${m.content}`).join("\n\n");
                await base44.integrations.Core.SendEmail({
                  to: "support@kinnectfi.com",
                  from_name: "Kayah Kaya Escalation",
                  subject: `🚩 Unresolved Support Issue — ${user?.email || "unknown user"}`,
                  body: `A user flagged an unresolved issue in the Kaya chat.\n\nUser: ${user?.full_name || "Unknown"} (${user?.email || "no email"})\nTime: ${new Date().toISOString()}\n\n--- Transcript ---\n\n${transcript}`,
                }).catch(() => {});
                setFlagged(true);
                setFlagging(false);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${darkMode ? "border-white/10 text-white/40 hover:border-red-400/40 hover:text-red-400" : "border-black/10 text-[#1a2a4a]/40 hover:border-red-400/40 hover:text-red-500"} disabled:opacity-40`}
            >
              <Flag className="w-3 h-3" />
              {flagging ? "Flagging..." : "Kaya couldn't help — escalate to team"}
            </button>
          )}
        </div>
      )}

      {/* Suggested prompts */}
      {showPrompts && !loading && (
        <div className="flex-shrink-0 mb-3">
          <SuggestedPrompts onSelect={sendMessage} darkMode={darkMode} />
        </div>
      )}

      {/* Input — sticky above keyboard on mobile */}
      <div className={`flex gap-2 items-end flex-shrink-0 border rounded-2xl px-3 py-2 ${inputBg}`}
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={taglish ? "Magtanong kay Kaya..." : "Ask Kaya anything..."}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm resize-none py-1 max-h-24"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-primary text-secondary rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 disabled:opacity-30 transition-opacity active:scale-95 mb-0.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}