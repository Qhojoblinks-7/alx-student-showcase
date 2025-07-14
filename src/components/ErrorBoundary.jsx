// src/components/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-4">We're sorry for the inconvenience. Please try again later.</p>
          {/* Optional: show error details in development mode */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="whitespace-pre-wrap text-left text-sm mt-4 p-2 bg-red-50 rounded">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
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

export default ErrorBoundary;