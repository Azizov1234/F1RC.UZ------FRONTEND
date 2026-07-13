import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ui/ErrorState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden text-center">
            {/* Inner glass decoration */}
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" aria-hidden="true" />
            
            <ErrorState
              type="server"
              title="Kutilmagan xatolik yuz berdi"
              description={this.state.error?.message || "Ilova ishida kutilmagan texnik muammo yuz berdi. Sahifani yangilab ko'ring."}
              onRetry={this.handleReset}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
