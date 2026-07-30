import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  error: Error | null;
  retryKey: number;
}

export class AppShellErrorBoundary extends Component<Props, State> {
  state: State = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Deliberately local-only: route failures may contain user data and are not
    // sent to remote telemetry.
  }

  private retry = () => {
    this.props.onRetry?.();
    this.setState((state) => ({ error: null, retryKey: state.retryKey + 1 }));
  };

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return <div key={this.state.retryKey}>{this.props.children}</div>;
    }

    return (
      <main className="mx-auto flex min-h-[50vh] max-w-xl items-center px-6 py-12">
        <section role="alert" aria-labelledby="app-shell-error-title" className="w-full rounded-lg border bg-background p-6 shadow-sm">
          <AlertTriangle aria-hidden="true" className="mb-4 h-8 w-8 text-destructive" />
          <h1 id="app-shell-error-title" className="text-xl font-semibold">This page could not be opened</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You can try the page again without reloading. If that does not work, reload when you are ready.
            Offline progress already saved on this device is kept for the next sync.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={this.retry}>
              <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={this.reload}>Reload app</Button>
          </div>
        </section>
      </main>
    );
  }
}
