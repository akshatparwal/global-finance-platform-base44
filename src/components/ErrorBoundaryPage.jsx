/**
 * ErrorBoundaryPage — per-route error recovery UI.
 * Wrap individual dashboard pages for graceful degradation.
 */
import { Component } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default class ErrorBoundaryPage extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[PageError]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const darkMode = this.props.darkMode;
    const bg = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/8";
    const text = darkMode ? "text-white" : "text-[#1a2a4a]";
    const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";

    return (
      <div className={`rounded-2xl border p-8 flex flex-col items-center text-center max-w-sm mx-auto mt-8 ${bg}`}>
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className={`font-extrabold text-lg mb-2 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Something went wrong
        </h3>
        <p className={`text-sm ${muted} mb-5 leading-relaxed`}>
          This section couldn't load. Your data is safe — try refreshing.
        </p>
        <button
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          className="flex items-center gap-2 bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </button>
        {this.state.error && (
          <p className={`text-[10px] ${muted} mt-4 font-mono`}>{this.state.error.message}</p>
        )}
      </div>
    );
  }
}