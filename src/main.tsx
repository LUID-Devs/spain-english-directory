import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
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

// Check if we have prerendered content (SSR/SSG)
const hasPrerenderedContent = rootElement.innerHTML.trim().length > 0;

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

if (hasPrerenderedContent) {
  // Hydrate the prerendered content to preserve SEO and reduce flicker
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  // Standard client-side rendering for non-prerendered pages
  ReactDOM.createRoot(rootElement).render(app);
}
