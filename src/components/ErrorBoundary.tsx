import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0A0E1A] font-mono text-[#00E5FF]/70">
          <div className="text-center">
            <div className="text-lg tracking-widest">系统异常，正在恢复…</div>
            <button
              className="mt-4 rounded border border-[#00E5FF]/30 px-4 py-1 text-sm text-[#00E5FF]/50 hover:bg-[#00E5FF]/10"
              onClick={() => this.setState({ hasError: false })}
            >
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
