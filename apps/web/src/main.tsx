import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global Fetch Interceptor to rewrite local API calls on production deployments
const originalFetch = window.fetch;
const getApiBase = () => {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalHost
    ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    : window.location.origin;
};

const rewriteApiUrl = (url: string) => {
  const apiBase = getApiBase();
  return url
    .replace(/^https?:\/\/localhost:(5000|8000)(?=\/api)/, apiBase)
    .replace(/^https?:\/\/127\.0\.0\.1:(5000|8000)(?=\/api)/, apiBase);
};

window.fetch = function (input, init) {
  if (typeof input === 'string') {
    return originalFetch(rewriteApiUrl(input), init);
  }

  if (input instanceof Request) {
    const rewrittenUrl = rewriteApiUrl(input.url);
    if (rewrittenUrl !== input.url) {
      return originalFetch(new Request(rewrittenUrl, input), init);
    }
  }

  if (input instanceof URL) {
    return originalFetch(rewriteApiUrl(input.toString()), init);
  }

  return originalFetch(input as RequestInfo | URL, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
