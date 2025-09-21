'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    retry: () => void;
    reset: () => void;
  }>;
}

class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In a real app, you would send this to an error reporting service
    // like Sentry, LogRocket, or similar
    if (typeof window !== 'undefined') {
      // Log to analytics/error reporting
      console.error('Error details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // In a real app, you might want to navigate to a safe route
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
            reset={this.handleReset}
          />
        );
      }

      return <DefaultErrorFallback
        error={this.state.error}
        retry={this.handleRetry}
        reset={this.handleReset}
      />;
    }

    return this.props.children;
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error?: Error;
  retry: () => void;
  reset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  retry,
  reset,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error while loading this page.
          This has been automatically reported to our team.
        </p>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Error Details (Development Only):
            </h3>
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 cursor-pointer">
                  Stack Trace
                </summary>
                <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔄 Try Again
          </button>

          <button
            onClick={reset}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            🏠 Go to Dashboard
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support at{' '}
            <a
              href="mailto:support@bluezone.community"
              className="text-blue-600 hover:text-blue-700"
            >
              support@bluezone.community
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{
    error?: Error;
    retry: () => void;
    reset: () => void;
  }>
) {
  const WrappedComponent = (props: P) => {
    return (
      <GlobalErrorBoundary fallback={fallback}>
        <Component {...props} />
      </GlobalErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Hook for triggering error boundary (useful for async errors)
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const triggerError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return triggerError;
}

export default GlobalErrorBoundary;