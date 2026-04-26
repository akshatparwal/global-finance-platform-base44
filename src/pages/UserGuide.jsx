import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    emoji: "🚀",
    title: "Getting Started — Sign Up",
    color: "#C97B22",
    steps: [
      {
        step: "1",
        title: "Create Your Account",
        body: `Go to the KinnectFi home page and click "Get Started →". You'll be taken to the sign-up screen.\n\nEnter your email address and create a secure password. You'll receive a verification email — click the link inside to confirm your address.`,
      },
      {
        step: "2",
        title: "Complete Identity Verification (KYC)",
        body: `After logging in, a setup wizard will guide you through identity verification (required by law for financial services):\n\n• Upload a government-issued ID (passport, driver's license, or national ID)\n• Take a selfie for liveness verification\n• Enter your phone number and verify it with an SMS code\n\nThis usually takes less than 3 minutes. Once approved, your account is fully active.`,
      },
      {
        step: "3",
        title: "Fund Your Wallet",
        body: `Before sending money, you need to add USD funds to your wallet. In the Dashboard, tap "Add Funds".\n\nYou can deposit via:\n• ACH Bank Transfer (1–2 business days, free)\n• Wire Transfer (same day, bank fees may apply)\n• Instant Debit Card (instant, small fee)\n\nFunds appear in your USD wallet balance immediately upon processing.`,
      },
    ],
  },
  {
    emoji: "🏠",
    title: "Dashboard — Your Home Base",
    color: "#3B82F6",
    steps: [
      {
        step: "1",
        title: "Net Worth Card",
        body: `At the top of the Dashboard you'll see your Total Net Worth — this combines your USD and PHP wallet balances converted at the live exchange rate.\n\nTap the card to go directly to the Send Money screen. You can toggle "Bahay Mode" in the sidebar to flip the primary display to Philippine Pesos (₱) instead of USD.`,
      },
      {
        step: "2",
        title: "Wallets",
        body: `Below the net worth card you'll see your USD 🇺🇸 and PHP 🇵🇭 wallets. Each wallet shows:\n\n• Current balance\n• Yield percentage (interest earned on idle funds)\n• Tap any wallet to go to the Send page\n\nTap "Add Funds" to deposit more money into your USD wallet.`,
      },
      {
        step: "3",
        title: "Quick Send",
        body: `The Quick Send row shows your saved recipients for one-tap transfers. Tap any avatar to jump straight to the Pay screen pre-filled with that recipient.\n\nTap "+ New Send" to add a new recipient and start a fresh transfer.`,
      },
      {
        step: "4",
        title: "Activity Feed",
        body: `Your 5 most recent transfers are shown here with recipient name, date, amount sent, and PHP received. Tap any transaction to see full details, download a receipt, or repeat the transfer.\n\nTap "VIEW ALL" to see your complete transaction history.`,
      },
      {
        step: "5",
        title: "Pull to Refresh",
        body: `On mobile, pull down from the top of the Dashboard to refresh your balance, exchange rate, and recent activity in real time.`,
      },
    ],
  },
  {
    emoji: "💸",
    title: "Sending Money (Pay)",
    color: "#10B981",
    steps: [
      {
        step: "1",
        title: "Select a Recipient",
        body: `Tap "Pay" in the bottom navigation bar. You'll see your saved recipients listed. Tap an avatar to select who you're sending to.\n\nIf you're sending to someone new, tap "+ Add" to go to the Recipients page and save their details first.`,
      },
      {
        step: "2",
        title: "Enter the Amount",
        body: `Use the on-screen numpad to enter the USD amount you want to send. The PHP amount your recipient will receive updates in real time using the live exchange rate.\n\nQuick tip: You'll see the "Best Time to Send" banner that shows whether now is an optimal rate moment.`,
      },
      {
        step: "3",
        title: "Add an Optional Note",
        body: `Type a memo in the "Note" field — e.g. "for groceries" or "school fees". This note appears on the receipt and helps your family understand what the money is for.`,
      },
      {
        step: "4",
        title: "Review & Confirm",
        body: `Tap "REVIEW & SEND →". A security gate will appear — authenticate with Face ID, Touch ID, or your 4-digit PIN.\n\nA confirmation screen shows the full breakdown:\n• Amount sent in USD\n• Amount received in PHP\n• Exchange rate used\n• Transfer fee: $0.00\n• Estimated arrival time\n\nTap "Confirm & Send" to complete the transfer.`,
      },
      {
        step: "5",
        title: "Track Your Transfer",
        body: `After sending, a celebratory animation confirms success. You and your recipient will both receive email notifications.\n\nIn Transfer History, tap any transfer to open the Transfer Tracker — a live step-by-step progress view showing: Initiated → Processing → Sent → Delivered.`,
      },
    ],
  },
  {
    emoji: "🔔",
    title: "Rate Alerts",
    color: "#8B5CF6",
    steps: [
      {
        step: "1",
        title: "What Are Rate Alerts?",
        body: `Rate Alerts notify you by email and in-app the moment the USD/PHP exchange rate hits your target. This lets you send money at the best possible moment — maximizing what your family receives.`,
      },
      {
        step: "2",
        title: "Setting an Alert",
        body: `In Pay → "Rate Alerts" tab, tap "+ New Alert".\n\n• Choose direction: Above ▲ (rate goes up) or Below ▼ (rate drops)\n• Enter your target rate (e.g. ₱57.00)\n• Or tap a preset like "₱57.00 ▲"\n• Tap "Set Alert →"\n\nYour alert is now live and watching the market 24/7.`,
      },
      {
        step: "3",
        title: "When an Alert Triggers",
        body: `When the live rate hits your target:\n• An in-app toast notification appears at the top of the screen\n• An email is sent to your registered address\n• The alert moves to the "Triggered" section\n\nHead to Pay and send your transfer immediately to lock in the rate.`,
      },
    ],
  },
  {
    emoji: "👥",
    title: "Managing Recipients",
    color: "#F59E0B",
    steps: [
      {
        step: "1",
        title: "Adding a Recipient",
        body: `Go to the Recipients page (accessible from the sidebar or Pay page). Tap "+ Add Recipient".\n\nFill in:\n• Nickname (e.g. "Nanay", "Kuya Ben")\n• Full legal name\n• Bank name (GCash, Maya, BDO, BPI, etc.)\n• Account number\n• Relationship\n• Phone number (optional)\n\nSave — they'll now appear in Quick Send and the Pay screen.`,
      },
      {
        step: "2",
        title: "Editing or Removing",
        body: `On the Recipients page, tap any recipient card to view their details and transfer history. You can update their bank account details or remove them if no longer needed.`,
      },
    ],
  },
  {
    emoji: "📊",
    title: "Insights & Wealth",
    color: "#EC4899",
    steps: [
      {
        step: "1",
        title: "Spending Overview",
        body: `The Insights page shows your total spending trends over 30, 60, or 90 days with an interactive chart. See how much you've sent per month and track your transfer frequency.`,
      },
      {
        step: "2",
        title: "Savings Goals",
        body: `Create savings goals for big milestones — a house in the Philippines, college tuition, emergency fund, or a family vacation.\n\nFor each goal set:\n• Target amount\n• Current saved amount\n• Auto-save rules (e.g. save $20/month automatically)\n• Round-up savings (round up each transfer and save the difference)\n\nTrack progress with a visual progress bar.`,
      },
      {
        step: "3",
        title: "AI Financial Insights",
        body: `Kaya AI — KinnectFi's built-in financial assistant — analyzes your transfer patterns and gives personalized tips:\n\n• "You send ₱12,000 every month — you could save $18/yr by timing transfers to peak rate days"\n• Suggested savings allocations based on your income\n• Holiday reminders for upcoming Philippine events`,
      },
    ],
  },
  {
    emoji: "💳",
    title: "Virtual & Physical Cards",
    color: "#06B6D4",
    steps: [
      {
        step: "1",
        title: "Your Virtual Card",
        body: `The Cards page shows your KinnectFi virtual Visa/Mastercard. Use it for online purchases anywhere in the world — spending directly from your USD wallet at zero FX markup.`,
      },
      {
        step: "2",
        title: "Card Controls",
        body: `From the Cards page you can:\n• Freeze / unfreeze your card instantly\n• Set a spending limit\n• Enable/disable contactless payments\n• View your card number, expiry, and CVV securely`,
      },
      {
        step: "3",
        title: "Request a Physical Card",
        body: `Want a physical card mailed to you? Tap "Request Physical Card" and enter your mailing address. Cards are shipped within 5–7 business days. Track shipment status directly in the app.`,
      },
      {
        step: "4",
        title: "Loyalty Tiers",
        body: `Earn Kinnect Points on every transfer. Reach higher tiers for exclusive perks:\n\n• 🥉 Bayani — entry level\n• 🥈 Datu — reduced fees, priority support\n• 🥇 Lakan — airport lounge access, dedicated agent, best rates\n\nYour current tier and progress are shown on the Cards page.`,
      },
    ],
  },
  {
    emoji: "⚙️",
    title: "Profile & Settings",
    color: "#64748B",
    steps: [
      {
        step: "1",
        title: "Editing Your Profile",
        body: `In Profile, tap "Edit Profile" to update your display name, phone number, and profile photo. Your email address is linked to your account and cannot be changed.`,
      },
      {
        step: "2",
        title: "Security Settings",
        body: `Set up or change your:\n• 4-digit PIN (used to authorize transfers)\n• Biometric login (Face ID / Touch ID)\n• Two-Factor Authentication (2FA)\n\nAlways keep these up to date for maximum account security.`,
      },
      {
        step: "3",
        title: "Referrals",
        body: `Share your unique referral link from the Profile page. When a friend signs up and completes their first transfer, you both earn 500 Kinnect Points — redeemable for cash back or fee credits.`,
      },
      {
        step: "4",
        title: "Dark Mode & Language",
        body: `Toggle Dark/Light mode using the moon/sun button in the top-right header.\n\nToggle "Taglish" mode in the sidebar to switch the interface to a mix of English and Filipino.\n\nToggle "Bahay Mode" to display balances primarily in Philippine Pesos — designed for family members in the Philippines viewing the shared account.`,
      },
    ],
  },
  {
    emoji: "🆘",
    title: "Support",
    color: "#EF4444",
    steps: [
      {
        step: "1",
        title: "In-App Chat",
        body: `Tap the chat bubble icon in the top navigation bar or go to the Support page. Type your question and Kaya AI will answer instantly.\n\nCommon topics: transfer status, KYC issues, wallet funding, card activation.`,
      },
      {
        step: "2",
        title: "Human Support",
        body: `For complex issues, tap "Talk to a Human" in the Support page. You can reach a live agent via:\n• WhatsApp\n• Email\n\nResponse time: within 24 hours (Bayani tier), within 4 hours (Datu/Lakan tier).`,
      },
      {
        step: "3",
        title: "Transaction Disputes",
        body: `If a transfer didn't arrive or was sent to the wrong account, open the transaction in your history and tap "Dispute This Transaction". Fill in the details and our team will investigate within 3–5 business days.`,
      },
    ],
  },
];

function AccordionSection({ section, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border overflow-hidden mb-3" style={{ borderColor: "rgba(13,31,60,0.1)", background: "#FFFFFF" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.emoji}</span>
          <span className="font-extrabold text-base text-[#0D1F3C]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {section.title}
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-[#0D1F3C]/40 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-[#0D1F3C]/40 flex-shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "rgba(13,31,60,0.07)" }}>
              {section.steps.map((s, i) => (
                <div key={i} className="flex gap-4 pt-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5"
                    style={{ background: `${section.color}18`, color: section.color }}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#0D1F3C] mb-1.5">{s.title}</h4>
                    <p className="text-sm text-[#0D1F3C]/60 leading-relaxed whitespace-pre-line">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UserGuide() {
  const [openSection, setOpenSection] = useState(0);

  return (
    <div style={{ backgroundColor: "#F5EFE3", minHeight: "100svh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #3d2e00 60%, #8a6a00 100%)" }} className="px-5 pt-12 pb-10 sm:px-10 sm:pt-16 sm:pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 text-sm mb-6 hover:text-white/80 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
          </div>
          <span className="font-extrabold text-white text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Kinnect<span className="text-[#C97B22]">Fi</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Platform User Guide
        </h1>
        <p className="text-white/60 text-sm sm:text-base max-w-xl leading-relaxed">
          Everything you need to know — from signing up to sending your first padala and beyond. Tap any section to expand it.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { label: "Sections", value: SECTIONS.length },
            { label: "Minutes to read", value: "~10" },
            { label: "Transfer fee", value: "$0" },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-[#C97B22] font-black text-lg leading-none">{s.value}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">

        {/* Table of contents */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: "#FFFFFF", borderColor: "rgba(13,31,60,0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C97B22] mb-3">Table of Contents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SECTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setOpenSection(i)}
                className="flex items-center gap-2 text-left text-sm text-[#0D1F3C]/70 hover:text-[#C97B22] transition-colors py-1"
              >
                <span>{s.emoji}</span>
                <span className="font-medium">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accordion sections */}
        {SECTIONS.map((section, i) => (
          <AccordionSection
            key={i}
            section={section}
            isOpen={openSection === i}
            onToggle={() => setOpenSection(openSection === i ? null : i)}
          />
        ))}

        {/* Footer CTA */}
        <div
          className="rounded-2xl p-6 mt-6 text-center"
          style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #3d2e00 60%, #8a6a00 100%)" }}
        >
          <p className="text-white font-extrabold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to get started?</p>
          <p className="text-white/50 text-sm mb-4">Create your free account in under 2 minutes.</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 font-bold rounded-xl py-3 px-7 text-sm hover:opacity-90 transition-opacity"
            style={{ background: "#C97B22", color: "#fff" }}
          >
            Create Free Account →
          </Link>
        </div>

        <p className="text-center text-[11px] text-[#0D1F3C]/30 mt-6 pb-8">
          Need more help? Visit <Link to="/dashboard/support" className="underline">Support</Link> or email us at support@kinnect.fi
        </p>
      </div>
    </div>
  );
}