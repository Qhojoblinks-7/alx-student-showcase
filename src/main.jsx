// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Import the AppWrapper component
import './index.css'; // Your global CSS file (e.g., for Tailwind base styles)
import { applyChartTheme } from './lib/chart-utils';
import { Provider } from 'react-redux';
import {store} from './store/index'


applyChartTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppWrapper /> {/* Render the AppWrapper component */}
    </Provider>
  </React.StrictMode>,
);
