import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("KinnectFi crash:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { darkMode } = this.props;
    const bg = darkMode ? "bg-[#0a0f1a] text-white" : "bg-[#f5efe6] text-[#1a2a4a]";

    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${bg}`}>
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Something went wrong
          </h1>
          <p className="text-sm opacity-50 mb-6">
            KinnectFi hit an unexpected error. Your funds and data are safe.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Reload App
          </button>
          {this.state.error && (
            <p className="text-[10px] opacity-30 mt-4 font-mono break-all">
              {this.state.error.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}