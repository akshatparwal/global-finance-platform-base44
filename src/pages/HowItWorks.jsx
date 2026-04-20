import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Send, Wallet, Users, Globe, Shield, Zap, Clock, TrendingUp, Check, ChevronDown } from "lucide-react";

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
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`}>
      {children}
    </div>
  );
};

const faqs = [
  { q: "How long does a transfer take?", a: "Most transfers arrive in under 5 minutes. Bank-to-bank transfers can take up to 2 hours, while GCash and e-wallet deliveries are instant." },
  { q: "Is KinnectFi regulated and safe?", a: "Yes. KinnectFi uses 256-bit bank-grade encryption and is registered with financial authorities. Your money and data are fully protected." },
  { q: "What currencies can I send from?", a: "You can send from USD, AED, SGD, GBP, EUR, and more. We support OFWs in over 20 countries." },
  { q: "Are there really zero fees?", a: "Yes, $0 padala fee today for your first transfers! We earn from a small, transparent exchange rate margin — no hidden charges ever." },
  { q: "How do my family receive the money?", a: "Recipients can receive to BDO, BPI, Metrobank, UnionBank, GCash, Maya, and most Philippine banks and e-wallets." },
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    { num: "01", title: "Create your free account", desc: "Sign up with your email and verify your identity in just minutes. No paperwork, no branch visits — all digital, all easy.", icon: <Users className="w-7 h-7" />, color: "bg-primary" },
    { num: "02", title: "Add funds instantly", desc: "Link your debit card, bank account, or international e-wallet. Funds show in your KinnectFi wallet immediately.", icon: <Wallet className="w-7 h-7" />, color: "bg-accent" },
    { num: "03", title: "Enter recipient details", desc: "Add your family member's Philippine bank account or e-wallet. Save them for future padala — no need to re-enter each time.", icon: <Send className="w-7 h-7" />, color: "bg-primary" },
    { num: "04", title: "Send & track live", desc: "Confirm your transfer and watch it move in real-time. You and your family both receive instant SMS and app notifications.", icon: <Globe className="w-7 h-7" />, color: "bg-accent" },
  ];

  const channels = [
    { name: "BDO Unibank", type: "Bank" }, { name: "BPI", type: "Bank" }, { name: "Metrobank", type: "Bank" },
    { name: "UnionBank", type: "Bank" }, { name: "GCash", type: "E-Wallet" }, { name: "Maya", type: "E-Wallet" },
    { name: "Land Bank", type: "Bank" }, { name: "PNB", type: "Bank" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] bg-secondary flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <Badge className="bg-secondary-foreground/10 text-secondary-foreground border-secondary-foreground/20 mb-4">Simple Process</Badge>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-secondary-foreground mb-6 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              How{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
                KinnectFi
              </span>{" "}
              works
            </h1>
            <p className="text-secondary-foreground/70 text-xl max-w-2xl leading-relaxed">
              Sending money home should feel as easy and warm as a phone call. Here's exactly how it works — from your wallet to your family's hands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")' }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedElement>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                4 steps to connect your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">puso</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">From sign-up to padala in under 10 minutes your first time. Repeat transfers take seconds.</p>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <AnimatedElement key={i} delay={i * 100}>
                <div className="p-px rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-accent/20 h-full">
                  <Card className="rounded-2xl border-0 h-full bg-card hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.2)] transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-primary-foreground flex-shrink-0 shadow-lg`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-5xl font-black text-primary/15 leading-none mb-1" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{step.num}</div>
                          <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Channels */}
      <section className="py-20 bg-muted relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedElement>
            <div className="text-center mb-12">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Delivery Options</Badge>
              <h2 className="text-4xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                Your family can receive via
              </h2>
              <p className="text-muted-foreground text-lg">All major Philippine banks and e-wallets supported.</p>
            </div>
          </AnimatedElement>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {channels.map((ch, i) => (
              <AnimatedElement key={i} delay={i * 60}>
                <div className="bg-card border border-border rounded-xl px-4 py-5 text-center hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <div className="text-foreground font-bold text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{ch.name}</div>
                  <Badge className="text-xs bg-primary/8 text-primary border-primary/15">{ch.type}</Badge>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits row */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Under 5 minutes to most e-wallets and major banks in the Philippines." },
              { icon: <Shield className="w-6 h-6" />, title: "Fully Secure", desc: "256-bit encryption and fraud monitoring protect every single transfer." },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Best Rates", desc: "We publish our rates live so you always know exactly what your family receives." },
            ].map((b, i) => (
              <AnimatedElement key={i} delay={i * 80}>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">{b.icon}</div>
                  <div>
                    <h3 className="font-bold text-secondary-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{b.title}</h3>
                    <p className="text-secondary-foreground/60 text-sm">{b.desc}</p>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedElement>
            <div className="text-center mb-14">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">FAQ</Badge>
              <h2 className="text-4xl font-extrabold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                Questions? We have answers.
              </h2>
            </div>
          </AnimatedElement>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedElement key={i} delay={i * 60}>
                <div className="p-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/10">
                  <div className="rounded-2xl bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/40 transition-colors duration-200"
                    >
                      <span className="font-semibold text-foreground pr-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-400 ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")' }} />
        <AnimatedElement>
          <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-extrabold text-primary-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Ready to send your first padala?
            </h2>
            <p className="text-primary-foreground/80 mb-8">Sign up free and send your first transfer with zero fees. It takes less than 10 minutes.</p>
            <Link to="/auth"
              className="relative overflow-hidden bg-primary-foreground text-primary font-bold rounded-xl py-4 px-10 text-base flex items-center gap-2 mx-auto hover:scale-[1.03] hover:shadow-xl transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
              Start Sending Now <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center gap-4 mt-6">
              {["Free to join", "No monthly fees", "Cancel anytime"].map((t, i) => (
                <div key={i} className="flex items-center gap-1 text-primary-foreground/60 text-xs">
                  <Check className="w-3 h-3 text-accent" />{t}
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>
      </section>
    </div>
  );
}