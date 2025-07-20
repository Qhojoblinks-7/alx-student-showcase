import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react'; // Import an icon for visual feedback

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree, logs those errors,
 * and displays a fallback UI instead of the crashed component tree.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // Concatenate all error details into a single string before passing to console.error
    const fullErrorMessage = `🛠️ ErrorBoundary caught an error: ${String(error)}\nComponent Stack:\n${String(errorInfo.componentStack)}`;
    console.error(fullErrorMessage); // Pass a single, guaranteed string argument

    // Set state to display error details in the fallback UI
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-4 rounded-lg shadow-md">
          <AlertTriangle className="h-16 w-16 mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-lg text-center mb-4">
            We're sorry for the inconvenience. Please try again later.
          </p>
          {/* Display error details in development mode for debugging */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md max-w-lg overflow-auto text-sm">
              <summary className="font-semibold cursor-pointer">Error Details</summary>
              <pre className="whitespace-pre-wrap break-all">
                {/* Ensure error and errorInfo are stringified before rendering */}
                {this.state.error && `Error: ${String(this.state.error)}\n\n`}
                {this.state.errorInfo && `Component Stack:\n${String(this.state.errorInfo.componentStack)}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
ErrorBoundary.defaultProps = {
  children: null, // Default to null if no children are provided
};