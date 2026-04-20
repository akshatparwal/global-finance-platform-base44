import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerBg = "bg-background/95 backdrop-blur-md border-b border-border shadow-sm";
  const textColor = "text-foreground";
  const mutedColor = "text-muted-foreground";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden bg-primary/10 transition-transform group-hover:scale-105">
            <img
              src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg"
              alt="KinnectFi"
              className="w-full h-full object-cover scale-150"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-extrabold text-lg ${textColor} tracking-tight`} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Kinnect<span className="text-primary">Fi</span>
            </span>
            <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase ${mutedColor}`}>
              Cross-Border Neobank
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          <Link
            to="/HowItWorks"
            className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${location.pathname === '/HowItWorks' ? 'text-primary' : textColor}`}
          >
            How It Works
          </Link>
          <a href="#features" onClick={e => { e.preventDefault(); document.querySelector('.py-32.bg-secondary')?.scrollIntoView({behavior:'smooth'}); }} className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${textColor}`}>Features</a>
          <a href="#rates" onClick={e => { e.preventDefault(); document.querySelector('.py-24.bg-primary')?.scrollIntoView({behavior:'smooth'}); }} className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${textColor}`}>Rates</a>
          <a href="#about" onClick={e => { e.preventDefault(); document.querySelector('.py-32.bg-muted')?.scrollIntoView({behavior:'smooth'}); }} className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${textColor}`}>About</a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/auth" className={`text-sm font-semibold transition-colors hover:text-primary ${textColor}`}>Sign In</Link>
          <Link to="/auth"
            className="relative overflow-hidden bg-primary text-primary-foreground font-bold rounded-full py-2.5 px-6 text-sm flex items-center gap-2 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 active:scale-95"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon" className={`${textColor} hover:bg-muted`}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-l border-border w-80 p-0">
            <div className="flex flex-col h-full p-6">
              {/* Logo in sheet */}
              <Link to="/" className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" alt="KinnectFi" className="w-full h-full scale-150 object-cover" onError={(e) => { e.target.style.display='none'; }} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-foreground text-xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    Kinnect<span className="text-primary">Fi</span>
                  </span>
                </div>
              </Link>

              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors">Home</Link>
                <Link to="/HowItWorks" className="text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors">How It Works</Link>
                <a href="/#features" onClick={() => { document.querySelector('.py-32.bg-secondary')?.scrollIntoView({behavior:'smooth'}); }} className="text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors">Features</a>
                <a href="/#rates" className="text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors">Rates</a>
                <a href="/#about" className="text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-muted transition-colors">About</a>
              </nav>

              <div className="mt-auto space-y-4 pt-8">
                <Link to="/auth" className="flex items-center justify-center w-full border-2 border-border text-foreground font-bold py-3.5 rounded-full hover:bg-muted transition-colors">Sign In</Link>
                <Link to="/auth"
                  className="relative overflow-hidden w-full bg-primary text-primary-foreground font-bold rounded-full py-3.5 flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}