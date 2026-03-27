import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-900 h-full overflow-auto text-xs">
          <h1 className="text-lg font-bold mb-2">Something went wrong.</h1>
          <pre className="whitespace-pre-wrap break-words">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap break-words mt-4">{this.state.errorInfo?.componentStack}</pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
