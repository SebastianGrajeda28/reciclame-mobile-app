import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './lib/design-system.css';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (response.status === 401) {
    const currentPath = window.location.pathname;
    const isOnPublicPage = [
      "/login", "/register", "/forgot-password",
      "/reset-password", "/logout", "/auth/callback", "/terms", "/",
    ].includes(currentPath);

    if (!isOnPublicPage) {
      if (typeof window.__forceSessionExpired === "function") {
        window.__forceSessionExpired();
      } else {
        window.location.href = "/login";
      }
    }
  }

  return response;
};

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
