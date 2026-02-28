import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './app/globals.css'
import './styles/keyboard-navigation.css'
import { configureAmplify } from './config/amplify'
import ErrorBoundary from '@/components/ErrorBoundary'

// Configure AWS Amplify before rendering the app
configureAmplify();
const queryClient = new QueryClient();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const appTree = (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

// StrictMode double-invokes effects in development and can trigger duplicate API bursts.
// Keep strict checks in production builds while avoiding noisy duplicate requests in local dev.
const app = import.meta.env.DEV ? appTree : <React.StrictMode>{appTree}</React.StrictMode>;

// Hydrate the server-rendered markup to preserve content and enable interactivity.
// This prevents the flash of empty content that occurs with createRoot.
ReactDOM.hydrateRoot(rootElement, app);
