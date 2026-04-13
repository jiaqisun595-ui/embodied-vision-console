import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-base font-mono text-accent/70">
          <div className="text-center">
            <div className="text-lg tracking-widest">系统异常，正在恢复…</div>
            {this.state.error?.message && (
              <div className="mt-2 text-xs text-accent/40">{this.state.error.message}</div>
            )}
            <button
              className="mt-4 rounded border border-accent/30 px-4 py-1 text-sm text-accent/50 hover:bg-accent/10"
              onClick={() => this.setState({ hasError: false, error: null })}
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
