/**
 * MobileSelect — on mobile renders options as a vaul Drawer bottom sheet.
 * On desktop, renders a standard <select> styled to match the app.
 *
 * Props mirror a basic <select>:
 *   value, onChange, options: [{ value, label }], placeholder, className
 */
import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Check } from "lucide-react";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMobile(mq.matches);
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export default function MobileSelect({ value, onChange, options = [], placeholder = "Select…", className = "" }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);
  const label = selected?.label ?? placeholder;

  if (!isMobile) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`border border-input rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring ${className}`}
      >
        {!selected && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          className={`border border-input rounded-lg px-3 py-2 bg-background text-foreground text-sm text-left flex items-center justify-between gap-2 focus:outline-none ${className}`}
        >
          <span className={selected ? "text-foreground" : "text-muted-foreground"}>{label}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground flex-shrink-0">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl outline-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted" />
          </div>
          <div className="px-4 pt-2 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mb-4">{placeholder}</p>
            <div className="space-y-1">
              {options.map(o => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                    o.value === value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {o.label}
                  {o.value === value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}