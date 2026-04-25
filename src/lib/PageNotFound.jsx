import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, Send } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d1526 0%, #1a2a4a 50%, #2a1a00 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl overflow-hidden">
          <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
        </div>
        <div>
          <div className="font-extrabold text-white text-base leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Kinnect<span className="text-[#C97B22]">Fi</span>
          </div>
          <div className="text-white/30 text-[8px] uppercase tracking-widest">Cross-Border Neobank</div>
        </div>
      </div>

      {/* 404 card */}
      <div className="text-center max-w-sm w-full">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl"
          style={{ background: "rgba(201,123,34,0.15)", border: "1px solid rgba(201,123,34,0.3)" }}
        >
          🗺️
        </div>

        <p className="text-[#C97B22] text-xs font-black uppercase tracking-widest mb-2">Error 404</p>
        <h1 className="text-white font-black text-3xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Page Not Found
        </h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Looks like this page got lost somewhere between here and the Philippines. Let's get you back on track.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-[#C97B22] text-white font-bold py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Link>
          {isFetched && authData?.isAuthenticated && (
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/15 text-white font-bold py-4 rounded-xl hover:bg-white/15 active:scale-95 transition-all text-sm"
            >
              <Send className="w-4 h-4 text-[#C97B22]" /> Go to Dashboard
            </Link>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          {["🔒 Secured", "✓ Regulated", "💸 Zero Fees"].map((t, i) => (
            <span key={i} className="text-white/25 text-[10px] font-bold uppercase tracking-wider">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}