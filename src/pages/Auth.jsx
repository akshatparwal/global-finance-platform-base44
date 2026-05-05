import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";

const LANGUAGES = [
  { code: "en", label: "English", sub: "English", flag: "🇺🇸" },
  { code: "tg", label: "Taglish", sub: "Filipino", flag: "🇵🇭" },
];

const STEPS = { LANGUAGE: "language", SIGNIN: "signin", SIGNUP_NAME: "signup_name", SIGNUP_EMAIL: "signup_email", SIGNUP_PASSWORD: "signup_password", VERIFY_EMAIL: "verify_email" };

export default function Auth() {
  const navigate = useNavigate();
  const { rates } = useLiveRates();
  const liveRate = rates?.USDPHP ? rates.USDPHP.toFixed(2) : "56.24";
  const [tab, setTab] = useState("signup");
  const [step, setStep] = useState(STEPS.LANGUAGE);
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailValid, setEmailValid] = useState(null); // null | true | false
  const [emailTouched, setEmailTouched] = useState(false);

  // Password strength: 0-5
  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  useEffect(() => {
    if (emailTouched && email) setEmailValid(validateEmail(email));
    else if (emailTouched && !email) setEmailValid(false);
  }, [email, emailTouched]);

  const progress = {
    [STEPS.LANGUAGE]: 1, [STEPS.SIGNIN]: 2,
    [STEPS.SIGNUP_NAME]: 2, [STEPS.SIGNUP_EMAIL]: 3, [STEPS.SIGNUP_PASSWORD]: 4, [STEPS.VERIFY_EMAIL]: 5,
  };
  const totalSteps = tab === "signin" ? 2 : 5;

  const handleTabSwitch = (t) => {
    setTab(t);
    setStep(t === "signin" ? STEPS.SIGNIN : STEPS.LANGUAGE);
    setError("");
  };

  const handleBack = () => {
    if (step === STEPS.SIGNIN || step === STEPS.LANGUAGE) navigate("/");
    else if (step === STEPS.SIGNUP_NAME) setStep(STEPS.LANGUAGE);
    else if (step === STEPS.SIGNUP_EMAIL) setStep(STEPS.SIGNUP_NAME);
    else if (step === STEPS.SIGNUP_PASSWORD) setStep(STEPS.SIGNUP_EMAIL);
    else if (step === STEPS.VERIFY_EMAIL) setStep(STEPS.SIGNUP_PASSWORD);
  };

  const handleForgotPassword = () => {
    alert("Please contact support or use the password reset option on the login page.");
  };

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    if (!hasUpper && !hasNumber && !hasSymbol) { setError("Password is too simple. Please add uppercase letters, numbers, or symbols."); return; }
    setLoading(true); setError("");
    try {
      await base44.auth.register({ email, password });
      setStep(STEPS.VERIFY_EMAIL);
    } catch (e) {
      setError(e?.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) { setError("Please enter the verification code."); return; }
    setLoading(true); setError("");
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      await base44.auth.loginViaEmailPassword(email, password);
      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await base44.auth.resendOtp(email);
      setResendCooldown(60);
      const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    } catch (e) {
      setError(e?.message || "Could not resend code.");
    }
  };

  const handleGoogleAuth = () => {
    base44.auth.redirectToLogin("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.LANGUAGE:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create your account</h1>
            <p className="text-white/50 text-sm mb-6">Choose your preferred language to get started.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 ${lang === l.code ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                  <span className="text-xl mb-1">{l.flag}</span>
                  <span className="font-bold text-white text-sm">{l.label}</span>
                  <span className="text-white/40 text-xs">{l.sub}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(STEPS.SIGNUP_NAME)}
              className="w-full bg-primary text-secondary font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors">
              Continue
            </button>
          </>
        );

      case STEPS.SIGNUP_NAME:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nice to meet you!</h1>
            <p className="text-white/50 text-sm mb-6">Join the KinnectFi family.</p>
            <label className="text-white/70 text-sm mb-2 block">What should we call you?</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Maria Santos"
              onKeyDown={e => e.key === "Enter" && name.trim() && setStep(STEPS.SIGNUP_EMAIL)}
              className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary" />
            <button onClick={() => name.trim() && setStep(STEPS.SIGNUP_EMAIL)} disabled={!name.trim()}
              className="w-full bg-primary text-secondary font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40">
              Continue
            </button>
          </>
        );

      case STEPS.SIGNUP_EMAIL:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your email</h1>
            <p className="text-white/50 text-sm mb-6">Join the KinnectFi family.</p>
            <label className="text-white/70 text-sm mb-2 block">Your primary email</label>
            <div className="relative mb-2">
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailTouched(true); }}
                onBlur={() => setEmailTouched(true)}
                placeholder="maria@email.com"
                type="email"
                onKeyDown={e => e.key === "Enter" && emailValid && setStep(STEPS.SIGNUP_PASSWORD)}
                className={`w-full bg-white/10 border text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 focus:outline-none transition-colors ${emailTouched && emailValid === false ? "border-red-400" : emailTouched && emailValid === true ? "border-emerald-400" : "border-white/10 focus:border-primary"}`}
              />
              {emailTouched && emailValid !== null && (
                <span className="absolute right-3 top-3.5">
                  {emailValid
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </span>
              )}
            </div>
            {emailTouched && emailValid === false && (
              <p className="text-red-400 text-xs mb-3">Please enter a valid email address.</p>
            )}
            {emailTouched && emailValid === true && (
              <p className="text-emerald-400 text-xs mb-3">Looks good! ✓</p>
            )}
            {!(emailTouched && emailValid !== null) && <div className="mb-4" />}
            <button onClick={() => emailValid && setStep(STEPS.SIGNUP_PASSWORD)} disabled={!emailValid}
              className="w-full bg-primary text-secondary font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40">
              Continue
            </button>
          </>
        );

      case STEPS.SIGNUP_PASSWORD:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Secure it</h1>
            <p className="text-white/50 text-sm mb-6">Join the KinnectFi family.</p>
            <label className="text-white/70 text-sm mb-2 block">Create a secure password</label>
            <div className="relative mb-3">
              <input value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters" type={showPassword ? "text" : "password"}
                onKeyDown={e => e.key === "Enter" && password.length >= 8 && handleSignUp()}
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-white/40 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-white/10"}`} />
                  ))}
                </div>
                <p className={`text-xs font-semibold ${passwordStrength >= 4 ? "text-emerald-400" : passwordStrength >= 3 ? "text-yellow-400" : "text-orange-400"}`}>
                  {strengthLabels[passwordStrength]}
                  {passwordStrength < 3 && " — try adding numbers, symbols, or uppercase"}
                </p>
              </div>
            )}
            {!password.length && <div className="mb-4" />}
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button onClick={handleSignUp} disabled={password.length < 8 || loading}
              className="w-full bg-primary text-secondary font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </>
        );

      case STEPS.VERIFY_EMAIL:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Check your email</h1>
            <p className="text-white/50 text-sm mb-2">We sent a verification code to</p>
            <p className="text-primary font-bold text-sm mb-6">{email}</p>
            <label className="text-white/70 text-sm mb-2 block">Verification Code</label>
            <input
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              maxLength={6}
              onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 mb-4 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-primary"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button onClick={handleVerifyOtp} disabled={otpCode.length < 4 || loading}
              className="w-full bg-primary text-secondary font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 mb-3 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify & Continue →"}
            </button>
            <button onClick={handleResendOtp} disabled={resendCooldown > 0}
              className="w-full text-white/40 text-sm hover:text-white/70 transition-colors disabled:opacity-40">
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive it? Resend code"}
            </button>
          </>
        );

      case STEPS.SIGNIN:
        return (
          <>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back!</h1>
            <p className="text-white/50 text-sm mb-6">Sign in to your KinnectFi account.</p>
            <button onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl mb-4 hover:bg-white/15 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-white/10"/><span className="text-white/30 text-xs">or</span><div className="flex-1 h-px bg-white/10"/></div>
            <label className="text-white/70 text-sm mb-2 block">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="maria@email.com" type="email"
              className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-primary" />
            <div className="flex justify-between items-center mb-2">
              <label className="text-white/70 text-sm">Password</label>
              <button className="text-primary text-xs hover:underline" onClick={handleForgotPassword}>Forgot password?</button>
            </div>
            <div className="relative mb-4">
              <input value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" type={showPassword ? "text" : "password"}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-white/40 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button onClick={handleSignIn} disabled={loading}
              className="w-full bg-white text-secondary font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="h-screen flex bg-secondary overflow-hidden">
      {/* Left panel */}
      <div className="hidden sm:flex relative flex-1 flex-col justify-end p-12 overflow-hidden">
        <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/052538e80_akshatparwal37--kinnectfi-frontend-fastapi-app_modal_run_filipino_family_remittance_2641e1b7.png"
          alt="Filipino family" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/20"><img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" /></div>
            <div><div className="font-extrabold text-white text-lg leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Kinnect<span className="text-primary">Fi</span></div><div className="text-white/40 text-[9px] tracking-widest uppercase">Cross-Border Neobank</div></div>
          </Link>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your money,<br /><span className="text-primary">connected</span> to your<br />heart.
          </h1>
          <p className="text-white/70 text-lg mb-8">Bridging the distance with trust and community.<br />Send money home instantly, with zero fees.</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png","https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png","https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png"].map((s,i) => (
                <img key={i} src={s} className="w-8 h-8 rounded-full border-2 border-black object-cover" />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className="text-primary text-xs">★</span>)}</div>
              <span className="text-white/50 text-[10px] uppercase tracking-widest">Trusted by 10,000+ Filipinos Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full sm:w-[400px] xl:w-[440px] flex-shrink-0 bg-[#0f1a2e] flex flex-col justify-center px-8 sm:px-16 py-10 relative overflow-y-auto">
        <button onClick={handleBack} className="absolute top-6 right-8 flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-white/5 rounded-xl p-1 mb-8 w-fit">
          {["signin","signup"].map(t => (
            <button key={t} onClick={() => handleTabSwitch(t)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? "bg-primary text-secondary" : "text-white/50 hover:text-white"}`}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="max-w-sm w-full">


          {tab === "signup" && step !== STEPS.LANGUAGE && (
            <>
              <button onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl mb-4 hover:bg-white/15 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <p className="text-white/40 text-xs text-center mb-4">or sign up with email</p>
            </>
          )}

          {renderStep()}

          {/* Already have an account - sign up only */}
          {tab === "signup" && (
            <p className="text-white/50 text-sm text-center mt-4">
              Already have an account?{" "}
              <button onClick={() => handleTabSwitch("signin")} className="text-primary font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mt-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i < progress[step] ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/20"}`} />
            ))}
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="mt-8 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 bg-white/5 rounded-full py-2 px-4 w-fit mx-auto">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/50 text-[10px] uppercase tracking-widest">Secured by 256-bit Encryption</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-white/40 text-xs">🇵🇭 PHP/USD <span className="text-primary font-bold">₱{liveRate}</span></span>
            <span className="text-white/40 text-xs">Padala Fee <span className="text-primary font-bold">$0 Today</span></span>
          </div>
        </div>

        <button className="absolute bottom-6 right-6 w-10 h-10 bg-primary text-secondary rounded-full flex items-center justify-center shadow-lg">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}