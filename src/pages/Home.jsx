import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, TrendingUp, Clock, Users, Wallet, Star, Check, Send, Globe, Lock, Moon, HelpCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: '0px 0px 200px 0px' });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className || ''}`}>
      {children}
    </div>
  );
};

const iconMap = { Zap, TrendingUp, Clock, Shield, Users, Wallet, Globe, Lock, Send };

function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] mt-16 flex flex-col sm:flex-row bg-background">
      {/* --- LEFT PANEL (Image & Overlay) --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full sm:w-1/2 min-h-[60vh] sm:min-h-full flex flex-col justify-end p-8 sm:p-16 lg:p-24"
      >
        <img
          src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/052538e80_akshatparwal37--kinnectfi-frontend-fastapi-app_modal_run_filipino_family_remittance_2641e1b7.png"
          alt="Filipino family celebrating birthday on video call"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Deep gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative z-10 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-[5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6" 
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            Ang pera mo ,<br />
            <span className="text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">konektado</span> sa puso<br />
            mo.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/90 text-lg sm:text-xl font-medium mb-10 max-w-md leading-relaxed drop-shadow-md"
          >
            Your money, connected to your heart.<br />
            Bridging the distance with trust and community.
          </motion.p>

          {/* Social Proof Pill */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full py-2.5 px-3 pr-8 border border-white/10 shadow-2xl"
          >
            <div className="flex -space-x-3">
              {[
                "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png",
                "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png",
                "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png",
              ].map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-[3px] border-[#1a1a1a] overflow-hidden">
                  <img src={src} alt={`User ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
              </div>
              <span className="text-white text-[10px] font-bold tracking-widest uppercase opacity-90">Trusted by 10,000+ Filipinos Worldwide</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* --- RIGHT PANEL (Action Area) --- */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="relative w-full sm:w-1/2 bg-background flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 min-h-[60vh] sm:min-h-full overflow-hidden"
      >
        {/* Ambient floating elements */}
        <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none style-floatA" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none style-floatB" />

        <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
          
          {/* Main Illustration Card */}
          <div className="w-full max-w-[280px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] mb-10 bg-white group hover:scale-[1.02] transition-transform duration-500">
            <img
              src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/cb814d220_akshatparwal37--kinnectfi-frontend-fastapi-app_modal_run_ofw_connection_c788f168.png"
              alt="OFW Connection"
              className="w-full h-auto object-cover"
            />
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground text-center mb-4 leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Connected, No<br />Matter the Distance.
          </h2>
          
          <p className="text-muted-foreground text-center mb-10 text-sm lg:text-base leading-relaxed max-w-sm">
            The OFW Connection — mano po across oceans — the sacrifice and love of working abroad.
          </p>

          {/* Primary Action Button */}
          <button
            className="relative w-full overflow-hidden bg-primary text-primary-foreground font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          
          <a href="#" className="mt-5 text-[13px] font-medium text-muted-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:text-primary transition-colors">
            Already have an account? Maligayang pagbabalik!
          </a>

          {/* Controls Row (Dots & Theme) */}
          <div className="flex items-center justify-between w-full mt-10 mb-12">
            <div className="flex items-center gap-1.5 ml-auto mr-auto pl-12">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 transition-all"></div>
              <div className="w-6 h-1.5 rounded-full bg-primary transition-all shadow-[0_0_10px_rgba(201,160,80,0.5)]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 transition-all"></div>
            </div>
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-[11px] font-bold text-foreground hover:bg-muted transition-colors">
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="bg-muted/40 border border-border/60 rounded-full py-2.5 px-6 flex items-center justify-center gap-2.5 backdrop-blur-sm w-fit shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-extrabold tracking-[0.15em] text-muted-foreground uppercase">Secured by 256-bit encryption</span>
            </div>
            
            <div className="flex gap-3 w-full justify-center">
              <div className="flex-1 bg-muted/40 border border-border/60 rounded-full py-2.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors cursor-default">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-muted-foreground">PHP/USD</span>
                <span className="text-xs font-black text-foreground ml-1">₱56.24</span>
              </div>
              <div className="flex-1 bg-muted/40 border border-border/60 rounded-full py-2.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors cursor-default">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Padala Fee</span>
                <span className="text-xs font-black text-primary ml-1 drop-shadow-sm">$0 Today</span>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Action Button */}
        <button className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-primary/40 transition-all duration-300 z-20">
          <HelpCircle className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const [features, setFeatures] = useState([]);
  useEffect(() => {
    base44.entities.Feature.list().then(setFeatures).catch(() => {});
  }, []);

  const staticFallback = [
    { title: "Zero Transfer Fees", description: "Send money home with $0 fees today. Keep every peso for your family, not for banks.", icon: "Zap", badge: "Free Today" },
    { title: "Best Exchange Rates", description: "Live PHP/USD rates updated in real-time. ₱56.24 per dollar — always competitive.", icon: "TrendingUp", badge: "Live Rates" },
    { title: "Instant Delivery", description: "Money arrives in minutes, not days. Your family in the Philippines gets it fast.", icon: "Clock", badge: "Under 5 mins" },
    { title: "256-bit Security", description: "Bank-grade encryption protects every transaction. Your money and data are always safe.", icon: "Shield", badge: "Bank-Grade" },
    { title: "OFW Community", description: "Built by Filipinos for Filipinos. Join 10,000+ OFWs who trust KinnectFi worldwide.", icon: "Users", badge: "10K+ Members" },
    { title: "Multi-Currency Wallet", description: "Hold USD, PHP, AED and more in one account. Switch currencies instantly.", icon: "Wallet", badge: "5 Currencies" },
  ];
  const items = features.length > 0 ? features : staticFallback;

  return (
    <section className="py-32 bg-secondary relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none style-floatA" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-background/10 rounded-full blur-[100px] pointer-events-none style-floatB" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedElement>
          <div className="text-center mb-20">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 py-1.5 px-4 text-xs font-bold tracking-widest uppercase">Why KinnectFi</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-secondary-foreground mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Banking built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
                OFW hearts
              </span>
            </h2>
            <p className="text-secondary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Every feature designed with the Filipino worker in mind — fast, affordable, and deeply human.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, index) => {
            const IconComp = iconMap[item.icon] || Zap;
            return (
              <AnimatedElement key={item.id || index} delay={index * 100}>
                <div className="group h-full p-px rounded-[2rem] bg-gradient-to-b from-secondary-foreground/10 to-transparent hover:from-primary/50 transition-colors duration-500">
                  <Card className="rounded-[2rem] h-full bg-background/95 backdrop-blur-md border-0 shadow-xl group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-150" />
                    <CardContent className="p-8 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                        <IconComp className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{item.title}</h3>
                        {item.badge && (
                          <Badge className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20 ml-auto whitespace-nowrap">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-[15px]">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Create your account", desc: "Sign up in minutes. We verify your identity securely — no paperwork needed.", icon: <Users className="w-6 h-6" /> },
    { num: "02", title: "Add funds", desc: "Connect your bank, debit card, or e-wallet. Add USD, AED, SGD, and more.", icon: <Wallet className="w-6 h-6" /> },
    { num: "03", title: "Send to family", desc: "Enter your recipient's details and send. They receive PHP directly to their bank or GCash.", icon: <Send className="w-6 h-6" /> },
    { num: "04", title: "Track every peso", desc: "Real-time notifications for you and your loved ones. See exactly when money arrives.", icon: <Globe className="w-6 h-6" /> },
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedElement>
          <div className="text-center mb-24">
            <Badge className="bg-muted text-muted-foreground border-border mb-6 py-1.5 px-4 text-xs font-bold tracking-widest uppercase">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Send money home in{" "}
              <span className="text-primary relative inline-block">
                4 simple steps
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
              </span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Padala made simple — no hidden fees, no confusing forms, just heart-to-heart transfers.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent z-0" />
          
          {steps.map((step, index) => (
            <AnimatedElement key={index} delay={index * 150} className="relative z-10">
              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-8 relative group-hover:border-primary transition-colors duration-500 shadow-xl shadow-muted/50">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">{step.num}</span>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors duration-500">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm max-w-[250px]">{step.desc}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => {
    base44.entities.Testimonial.list().then(setTestimonials).catch(() => {});
  }, []);

  const staticFallback = [
    { name: "Maria Santos", location: "Dubai, UAE", message: "KinnectFi changed everything for me. I send money home to Cebu in minutes, and my family gets it instantly. Walang hassle!", rating: 5, image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png", amount_sent: "$1,200/mo" },
    { name: "Jose Reyes", location: "Riyadh, Saudi Arabia", message: "Zero fees today is amazing. I used to pay $15 every time I sent money home. Now I keep that money for my family.", rating: 5, image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png", amount_sent: "$800/mo" },
    { name: "Ana Dela Cruz", location: "London, UK", message: "The exchange rate is always competitive and I trust KinnectFi with my hard-earned money. Napakaganda ng app!", rating: 5, image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png", amount_sent: "$950/mo" },
    { name: "Roberto Mendoza", location: "Singapore", message: "My nanay in Davao calls me every time the money arrives. The speed and reliability of KinnectFi is unmatched.", rating: 5, image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png", amount_sent: "$1,500/mo" },
  ];
  const items = testimonials.length > 0 ? testimonials : staticFallback;

  return (
    <section className="py-32 bg-muted relative overflow-hidden">
      <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedElement>
          <div className="text-center mb-20 flex flex-col items-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 py-1.5 px-4 text-xs font-bold tracking-widest uppercase">Real Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Voices of 10,000+{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                OFW families
              </span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl text-center leading-relaxed">
              Every peso sent is a story of love. Here are a few of those stories from our community.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <AnimatedElement key={item.id || index} delay={index * 150}>
              <Card className="rounded-[2rem] h-full bg-background border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group">
                <CardContent className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                    </div>
                    <Lock className="w-8 h-8 text-muted/30 group-hover:text-primary/10 transition-colors" />
                  </div>
                  <p className="text-foreground text-lg leading-relaxed mb-8 italic font-medium">"{item.message}"</p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="relative">
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-md relative z-10" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary/30 scale-110 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-foreground text-base" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{item.name}</p>
                      <p className="text-muted-foreground text-sm font-medium">{item.location}</p>
                    </div>
                    <div className="bg-muted px-4 py-2 rounded-xl border border-border">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Sends</p>
                      <p className="text-sm font-black text-primary">{item.amount_sent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Filipinos Worldwide", value: "10,000+", icon: <Users className="w-6 h-6" /> },
    { label: "Average Exchange Rate", value: "₱56.24", icon: <TrendingUp className="w-6 h-6" /> },
    { label: "Transfer Fees Today", value: "$0", icon: <Zap className="w-6 h-6" /> },
    { label: "Avg. Delivery Time", value: "<5 mins", icon: <Clock className="w-6 h-6" /> },
  ];
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Dynamic background texture */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <AnimatedElement key={i} delay={i * 100}>
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6 text-primary-foreground transform group-hover:-translate-y-2 group-hover:bg-primary-foreground/20 transition-all duration-300 backdrop-blur-sm border border-primary-foreground/10">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black text-primary-foreground mb-2 tracking-tight drop-shadow-sm" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-primary-foreground/80 text-sm md:text-base font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <AnimatedElement>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-8 py-2 px-6 text-sm font-bold tracking-widest uppercase">Start Today</Badge>
          <h2 className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 leading-[1.1] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Ready to kinnect with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative inline-block">
              your puso?
              <svg className="absolute w-full h-4 -bottom-2 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of OFW families sending love home every day. Start with zero fees — forever free for your first transfer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              className="relative w-full sm:w-auto overflow-hidden bg-primary text-primary-foreground font-bold rounded-full py-5 px-10 text-lg flex items-center justify-center gap-3 hover:scale-[1.03] shadow-[0_20px_40px_-15px_rgba(201,160,80,0.5)] transition-all duration-300 active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/HowItWorks"
              className="w-full sm:w-auto bg-transparent border-2 border-muted text-foreground font-bold rounded-full py-5 px-10 text-lg flex items-center justify-center gap-2 hover:bg-muted hover:border-border transition-all duration-300 active:scale-95"
            >
              Learn More
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12">
            {["No hidden setup fees", "Instant account activation", "256-bit bank security"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-foreground font-medium text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </AnimatedElement>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { background-position: 200% center; }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(5deg) scale(1.05); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(30px) rotate(-5deg) scale(1.02); }
        }
        .style-floatA { animation: floatA 8s ease-in-out infinite; }
        .style-floatB { animation: floatB 12s ease-in-out infinite; }
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        .animate-gradient-x { animation: gradient-x 4s ease infinite; }
      `}} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <StatsSection />
      <CtaSection />
    </div>
  );
}