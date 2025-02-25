"use client";

import { Component, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <h2>Error loading hadith data</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
