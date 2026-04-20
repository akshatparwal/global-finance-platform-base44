import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Send, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
                <img
                  src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg"
                  alt="KinnectFi"
                  className="w-6 h-6"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="font-extrabold text-lg text-secondary-foreground leading-none" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  Kinnect<span style={{ color: 'hsl(var(--accent))' }}>Fi</span>
                </div>
                <div className="text-[10px] text-secondary-foreground/50 tracking-widest uppercase">Cross-Border Neobank</div>
              </div>
            </Link>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6">
              Built by Filipinos, for Filipinos. Connecting OFW families worldwide with fast, safe, and affordable money transfers.
            </p>
            <div className="flex items-center gap-2 text-secondary-foreground/60 text-xs">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Secured by 256-bit Encryption</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-bold text-secondary-foreground mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Product</h4>
            <ul className="space-y-3">
              <li><Link to="/HowItWorks" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">How It Works</Link></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Features</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Exchange Rates</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Security</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-bold text-secondary-foreground mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">OFW Community</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Support + newsletter */}
          <div>
            <h4 className="font-bold text-secondary-foreground mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Support</h4>
            <ul className="space-y-3 mb-7">
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">Compliance</a></li>
            </ul>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary-foreground/60 text-xs uppercase tracking-wider">Live Rate:</span>
              <span className="font-bold text-accent text-sm">₱56.24 / USD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
              <span className="text-secondary-foreground/60 text-xs">$0 Padala Fee Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/40 text-xs text-center sm:text-left">
            © 2024 KinnectFi. All rights reserved. Made with{" "}
            <Heart className="w-3 h-3 inline text-primary fill-primary" />{" "}
            for OFW families worldwide.
          </p>
          <div className="flex items-center gap-5">
            <Globe className="w-4 h-4 text-secondary-foreground/40" />
            <span className="text-secondary-foreground/40 text-xs">🇵🇭 Philippines</span>
            <span className="text-secondary-foreground/40 text-xs">🇺🇸 United States</span>
            <span className="text-secondary-foreground/40 text-xs">🇦🇪 UAE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}