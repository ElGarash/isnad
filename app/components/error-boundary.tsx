'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <h2>Error loading hadith data</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
