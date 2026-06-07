import React from 'react';

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-card border border-rose-200 bg-white p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600">ClinCommand OS startup error</p>
          <h1 className="mt-2 font-display text-2xl font-bold">The application could not finish loading.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Clear the saved session for this browser tab, then reload and sign in again.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded bg-slate-950 p-3 text-xs text-rose-100">
            {this.state.error.message}
          </pre>
          <button
            className="mt-5 rounded-button bg-brand-teal px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Reset Session
          </button>
        </div>
      </div>
    );
  }
}
