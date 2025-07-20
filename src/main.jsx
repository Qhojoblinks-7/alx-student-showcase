import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import './index.css';
import store from './store/store.js'; // Ensure this path is correct
import { initializeAuth } from './components/auth/auth-service.js'; // Import initializeAuth
import { ErrorBoundary } from './components/ErrorBoundary.jsx'; // Import ErrorBoundary

// --- Global Console Error Override ---
// This robustly stringifies all arguments passed to console.error
// to prevent "Cannot convert object to primitive value" errors
// that can occur in React's development environment's console overrides.
const originalConsoleError = console.error;
console.error = (...args) => {
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg); // Fallback if stringify fails
      }
    }
    return String(arg); // Ensure all arguments are strings
  });
  originalConsoleError.apply(console, formattedArgs);
};
// --- End Global Console Error Override ---


// Initialize authentication service once at the application start
async function initializeApp() {
  try {
    await initializeAuth();
    console.log("Authentication service initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize authentication service:", String(error));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        {/* Wrap the entire App with ErrorBoundary */}
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Provider>
    </React.StrictMode>,
  );
}

initializeApp();
