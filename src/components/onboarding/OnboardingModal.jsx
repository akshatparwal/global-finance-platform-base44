import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Upload, Camera, Phone, User, CreditCard, ArrowRight, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STEPS = [
  { id: "welcome",    title: "Welcome to KinnectFi", icon: "🇵🇭" },
  { id: "identity",   title: "Verify Your Identity",  icon: "🪪" },
  { id: "selfie",     title: "Quick Selfie Check",    icon: "🤳" },
  { id: "phone",      title: "Add Phone Number",      icon: "📱" },
  { id: "recipient",  title: "Add First Recipient",   icon: "❤️" },
  { id: "fund",       title: "Ready to Send!",        icon: "🚀" },
];

const DOC_TYPES = [
  { value: "passport",        label: "Passport",         flag: "📗" },
  { value: "philsys",         label: "PhilSys ID",       flag: "🇵🇭" },
  { value: "umid",            label: "UMID",             flag: "🆔" },
  { value: "drivers_license", label: "Driver's License", flag: "🚗" },
  { value: "national_id",     label: "National ID",      flag: "🏛️" },
];

const PH_BANKS = ["GCash", "Maya", "BDO", "BPI", "Metrobank", "UnionBank", "Security Bank", "Landbank", "PNB"];

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "UAE", "Saudi Arabia", "Singapore", "Hong Kong", "Japan", "South Korea", "Germany", "Italy"];

export default function OnboardingModal({ user, onComplete, darkMode }) {
  const savedStep = Math.min(user?.onboarding_step || 0, STEPS.length - 1);
  const [currentStep, setCurrentStep] = useState(savedStep);
  const [saving, setSaving] = useState(false);

  // Step data
  const [country, setCountry] = useState(user?.address_country || "");
  const [docType, setDocType] = useState(user?.kyc_doc_type || "");
  const [docUploading, setDocUploading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(!!user?.kyc_doc_url);
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(!!user?.kyc_selfie_url);
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(user?.phone_verified || false);
  const [recipientName, setRecipientName] = useState(user?.first_recipient_name || "");
  const [recipientBank, setRecipientBank] = useState(user?.first_recipient_bank || "");

  const docInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const progress = Math.round(((currentStep) / (STEPS.length - 1)) * 100);
  const step = STEPS[currentStep];

  const saveProgress = async (data) => {
    await base44.auth.updateMe({ onboarding_step: currentStep, ...data }).catch(() => {});
  };

  const goNext = async (data = {}) => {
    setSaving(true);
    await saveProgress(data);
    setSaving(false);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ kyc_doc_url: file_url, kyc_doc_type: docType, kyc_status: "pending" });
      setDocUploaded(true);
    } finally {
      setDocUploading(false);
    }
  };

  const handleSelfieUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ kyc_selfie_url: file_url });
      setSelfieUploaded(true);
    } finally {
      setSelfieUploading(false);
    }
  };

  const handleSendOtp = () => {
    // Simulated OTP — in production this would call a real SMS API
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    // Accept "1234" as demo code, or any 4+ digit code
    if (otp.length >= 4) {
      setOtpVerified(true);
      await base44.auth.updateMe({ phone_number: phone, phone_verified: true });
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      onboarding_completed: true,
      onboarding_step: STEPS.length - 1,
      first_recipient_name: recipientName,
      first_recipient_bank: recipientBank,
    }).catch(() => {});
    setSaving(false);
    onComplete();
  };

  const bg = "bg-[#0d1526]";
  const inputCls = "w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors";

  const renderStep = () => {
    switch (step.id) {

      case "welcome":
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl mx-auto mb-5">🇵🇭</div>
            <h2 className="text-white font-extrabold text-2xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mabuhay, {user?.full_name?.split(" ")[0] || "OFW"}!
            </h2>
            <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
              Let's set up your account in under 2 minutes. You'll be sending padala home before you know it. 💸
            </p>
            <div className="space-y-2 mb-8 text-left">
              {[
                { icon: "🪪", label: "Verify your identity (KYC)" },
                { icon: "🤳", label: "Quick selfie check" },
                { icon: "📱", label: "Secure your account with phone" },
                { icon: "❤️", label: "Add your first recipient" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                  <span>{item.icon}</span>
                  <span className="text-white/70 text-sm">{item.label}</span>
                  <CheckCircle className="w-4 h-4 text-white/20 ml-auto" />
                </div>
              ))}
            </div>
            <button onClick={() => goNext({ address_country: country })}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-white/30 text-xs mt-3">Takes ~2 minutes · 256-bit encrypted</p>
          </div>
        );

      case "identity":
        return (
          <div>
            <h2 className="text-white font-extrabold text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verify Your Identity</h2>
            <p className="text-white/40 text-sm mb-5">Required for cross-border transfers. Your data is encrypted and never shared.</p>

            {/* Country of residence */}
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Country of Residence</label>
            <select value={country} onChange={e => setCountry(e.target.value)}
              className={`${inputCls} mb-4 bg-[#1a2332]`}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Document type */}
            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Document Type</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {DOC_TYPES.map(d => (
                <button key={d.value} onClick={() => setDocType(d.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${docType === d.value ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                  <span className="text-xl">{d.flag}</span>
                  {d.label}
                </button>
              ))}
            </div>

            {/* Upload area */}
            <input ref={docInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocUpload} />
            <button onClick={() => docType && docInputRef.current?.click()}
              disabled={!docType || docUploading}
              className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-all mb-5 ${docUploaded ? "border-emerald-500 bg-emerald-500/10" : "border-white/20 hover:border-primary/50 hover:bg-primary/5"} ${!docType ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
              {docUploaded ? (
                <>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span className="text-emerald-500 font-bold text-sm">Document Uploaded ✓</span>
                  <span className="text-white/40 text-xs">Tap to replace</span>
                </>
              ) : docUploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-primary text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/30" />
                  <span className="text-white/60 font-semibold text-sm">{docType ? "Upload Document" : "Select a document type first"}</span>
                  <span className="text-white/30 text-xs">JPG, PNG or PDF · Max 10MB</span>
                </>
              )}
            </button>

            <button onClick={() => goNext({ kyc_doc_type: docType, address_country: country })}
              disabled={!docUploaded || !country || !docType || saving}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? "Saving..." : "Continue →"}
            </button>
          </div>
        );

      case "selfie":
        return (
          <div>
            <h2 className="text-white font-extrabold text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Selfie Check</h2>
            <p className="text-white/40 text-sm mb-5">This confirms you're the real person behind the document. Liveness detection powered by AI.</p>

            <div className="bg-white/5 rounded-2xl p-4 mb-5">
              {["Look directly at the camera", "Make sure your face is well-lit", "Remove glasses or hats if possible"].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-white/50 text-sm py-1.5">
                  <span className="text-primary font-black text-xs">{i + 1}</span> {tip}
                </div>
              ))}
            </div>

            <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieUpload} />

            <button onClick={() => selfieInputRef.current?.click()}
              disabled={selfieUploading}
              className={`w-full border-2 border-dashed rounded-2xl py-12 flex flex-col items-center gap-3 transition-all mb-5 cursor-pointer ${selfieUploaded ? "border-emerald-500 bg-emerald-500/10" : "border-white/20 hover:border-primary/50 hover:bg-primary/5"}`}>
              {selfieUploaded ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <span className="text-emerald-500 font-bold">Selfie Captured ✓</span>
                  <span className="text-white/40 text-xs">Tap to retake</span>
                </>
              ) : selfieUploading ? (
                <>
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-primary text-sm">Processing...</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white/40" />
                  </div>
                  <span className="text-white/60 font-semibold">Take Selfie</span>
                  <span className="text-white/30 text-xs">Or upload from gallery</span>
                </>
              )}
            </button>

            <button onClick={() => goNext()} disabled={!selfieUploaded || saving}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity mb-3">
              {saving ? "Saving..." : "Continue →"}
            </button>
            <button onClick={() => goNext()} className="w-full text-white/30 text-sm hover:text-white/50 py-2 transition-colors">
              Skip for now
            </button>
          </div>
        );

      case "phone":
        return (
          <div>
            <h2 className="text-white font-extrabold text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Secure Your Account</h2>
            <p className="text-white/40 text-sm mb-5">Your phone number is used for 2FA and instant transfer alerts.</p>

            {!otpVerified ? (
              <>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Phone Number</label>
                <div className="flex gap-2 mb-4">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-3 flex items-center text-white/50 text-sm flex-shrink-0">+1</div>
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="(555) 000-0000" inputMode="tel"
                    className={inputCls} />
                </div>

                {!otpSent ? (
                  <button onClick={handleSendOtp} disabled={phone.length < 10}
                    className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity mb-4">
                    Send Verification Code
                  </button>
                ) : (
                  <>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                      <span className="text-primary text-lg">📱</span>
                      <span className="text-primary text-sm">Code sent! Enter <strong>1234</strong> to verify (demo).</span>
                    </div>
                    <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Verification Code</label>
                    <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="1234" inputMode="numeric" maxLength={6}
                      className={`${inputCls} text-center text-2xl font-black tracking-widest mb-4`} />
                    <button onClick={handleVerifyOtp} disabled={otp.length < 4}
                      className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity">
                      Verify Code
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-emerald-500 font-bold text-lg mb-1">Phone Verified!</p>
                <p className="text-white/40 text-sm mb-6">{phone}</p>
                <button onClick={() => goNext({ phone_number: phone, phone_verified: true })} disabled={saving}
                  className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40">
                  {saving ? "Saving..." : "Continue →"}
                </button>
              </div>
            )}

            <button onClick={() => goNext()} className="w-full text-white/30 text-sm hover:text-white/50 py-3 mt-2 transition-colors">
              Skip for now
            </button>
          </div>
        );

      case "recipient":
        return (
          <div>
            <h2 className="text-white font-extrabold text-xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add Your First Recipient</h2>
            <p className="text-white/40 text-sm mb-5">Who will you be sending padala to? You can add more later.</p>

            <div className="flex gap-3 mb-5">
              {["👩", "👴", "👩‍🦱", "👦", "👧", "💛"].map((e, i) => (
                <button key={i} onClick={() => setRecipientName(prev => e + " " + prev.replace(/^[^\s]+\s?/, ""))}
                  className="w-10 h-10 text-xl rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 flex items-center justify-center">
                  {e}
                </button>
              ))}
            </div>

            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Recipient's Full Name</label>
            <input value={recipientName} onChange={e => setRecipientName(e.target.value)}
              placeholder="e.g. Maria Santos" className={`${inputCls} mb-4`} />

            <label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Send to (Bank / eWallet)</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {PH_BANKS.map(b => (
                <button key={b} onClick={() => setRecipientBank(b)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${recipientBank === b ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                  {b}
                </button>
              ))}
            </div>

            <button onClick={() => goNext({ first_recipient_name: recipientName, first_recipient_bank: recipientBank })}
              disabled={!recipientName || !recipientBank || saving}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity mb-3">
              {saving ? "Saving..." : "Add Recipient →"}
            </button>
            <button onClick={() => goNext()} className="w-full text-white/30 text-sm hover:text-white/50 py-2 transition-colors">
              Skip for now
            </button>
          </div>
        );

      case "fund":
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl mx-auto mb-5 animate-bounce">🚀</div>
            <h2 className="text-white font-extrabold text-2xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              You're all set!
            </h2>
            <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
              Your account is ready. Start sending padala home to your family instantly at the best rates.
            </p>

            <div className="space-y-2 mb-6 text-left">
              {[
                { label: "Identity uploaded", done: !!user?.kyc_doc_url || docUploaded },
                { label: "Selfie verified",    done: !!user?.kyc_selfie_url || selfieUploaded },
                { label: "Phone secured",      done: otpVerified || !!user?.phone_verified },
                { label: "Recipient added",    done: !!recipientName || !!user?.first_recipient_name },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${item.done ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/5"}`}>
                  {item.done
                    ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
                  }
                  <span className={`text-sm ${item.done ? "text-white" : "text-white/40"}`}>{item.label}</span>
                  {item.done && <span className="text-emerald-500 text-xs ml-auto font-bold">✓ DONE</span>}
                </div>
              ))}
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-primary text-xs text-left">KYC under review — typically approved within minutes. You can still explore the app while we verify.</p>
            </div>

            <button onClick={handleFinish} disabled={saving}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl text-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Setting up..." : "Go to Dashboard 🎉"}
            </button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-lg bg-[#0d1526] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-primary text-xs font-black flex-shrink-0">{progress}%</span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1 justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={s.id}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= currentStep ? "bg-primary" : "bg-white/10"}`} />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">
                Step {currentStep + 1} of {STEPS.length}
              </p>
              <p className="text-white font-bold text-sm">{step.title}</p>
            </div>
            {currentStep === 0 && (
              <button onClick={onComplete} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}