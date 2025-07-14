import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { initializeSupabase } from './service/auth-service'
// Get the root DOM element where the React application will be mounted.
const rootElement = document.getElementById('root');

// Create a React root for concurrent mode.
const root = createRoot(rootElement);

// Initialize Supabase client before rendering the app.
// This ensures that the Supabase client is available when components
// that depend on it (like useAuth) are mounted.
initializeSupabase()
  .then(() => {
    console.log("Supabase client initialized successfully.");
    // Render the main application component tree after Supabase is initialized.
    // StrictMode helps in highlighting potential problems in an application.
    // Provider makes the Redux store available to any nested components that need to access the Redux store.
    // ErrorBoundary catches JavaScript errors anywhere in their child component tree,
    // logs those errors, and displays a fallback UI instead of the component tree that crashed.
    root.render(
      <StrictMode>
        <Provider store={store}>
          {/* Wrap the entire App component with ErrorBoundary to catch any rendering errors */}
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Provider>
      </StrictMode>
    );
  })
  .catch(error => {
    // Handle initialization errors, e.g., show a message to the user
    console.error("Failed to initialize Supabase:", error.message ? String(error.message) : String(error));
    root.render(
      <StrictMode>
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          Error: Failed to load application. Please check your Supabase configuration and network connection.
          <br />
          Details: {error.message ? String(error.message) : String(error)}
        </div>
      </StrictMode>
    );
  });
