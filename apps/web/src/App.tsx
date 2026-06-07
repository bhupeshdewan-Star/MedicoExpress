import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import HelpDrawer from './components/layout/HelpDrawer';
import CopilotDrawer from './components/layout/CopilotDrawer';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sops from './pages/Sops';
import Skills from './pages/Skills';
import Workspace from './pages/Workspace';
import KnowledgeCenter from './pages/Knowledge';
import LiteratureSearch from './pages/LiteratureSearch';
import ComplianceCenter from './pages/Compliance';
import UsersPage from './pages/Users';
import AuditTrail from './pages/AuditTrail';
import SettingsPage from './pages/Settings';
import LearningAcademy from './pages/LearningAcademy';
import Permissions from './pages/Permissions';
import AuditExports from './pages/AuditExports';
import AIGovernance from './pages/AIGovernance';
import ValidationCenter from './pages/ValidationCenter';
import TenantManagement from './pages/TenantManagement';
import CustomerSuccess from './pages/CustomerSuccess';
import SecurityCenter from './pages/SecurityCenter';
import StudiesCenter from './pages/StudiesCenter';
import SiteManagement from './pages/SiteManagement';
import SubjectCenter from './pages/SubjectCenter';
import MonitoringCenter from './pages/MonitoringCenter';
import ETMFCenter from './pages/eTMFCenter';
import RBMCenter from './pages/RBMCenter';
import ClinicalAnalytics from './pages/ClinicalAnalytics';
import RTSMCenter from './pages/RTSMCenter';
import EDCCenter from './pages/EDCCenter';
import SystemHealth from './pages/SystemHealth';
import AuditDashboard from './pages/AuditDashboard';
import ProductionReadinessDashboard from './pages/ProductionReadinessDashboard';
import PilotReadinessDashboard from './pages/PilotReadinessDashboard';
import LiveOperationsDashboard from './pages/LiveOperationsDashboard';
import OperationsCopilot from './pages/OperationsCopilot';
import GlobalCommandConsole from './pages/GlobalCommandConsole';
import RegulatoryCommandCenter from './pages/RegulatoryCommandCenter';
import About from './pages/About';
import UserManual from './pages/UserManual';
import DeploymentReadinessCenter from './pages/DeploymentReadinessCenter';
import DemoGuide from './components/layout/DemoGuide';
import ErrorBoundary from './components/ErrorBoundary';

// Route guard checking for authorized JWT sessions
function ProtectedRoute({ children }) {
  const { token } = useAuth() as any;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Global UI Shell wrapper
function AppShell() {
  const { token } = useAuth() as any;
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // If visiting login, don't wrap in shell panels
  if (location.pathname === '/login' || !token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleHelp={() => setHelpOpen(!helpOpen)}
          onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          <div className="flex-1 pb-6">
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute><Workspace domain="marketing" /></ProtectedRoute>} />
              <Route path="/clinical" element={<ProtectedRoute><Workspace domain="clinical" /></ProtectedRoute>} />
              <Route path="/regulatory" element={<ProtectedRoute><Workspace domain="regulatory" /></ProtectedRoute>} />
              <Route path="/sops" element={<ProtectedRoute><Sops /></ProtectedRoute>} />
              <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
              <Route path="/knowledge" element={<ProtectedRoute><KnowledgeCenter /></ProtectedRoute>} />
              <Route path="/literature-search" element={<ProtectedRoute><LiteratureSearch /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><ComplianceCenter /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
              <Route path="/learning-academy" element={<ProtectedRoute><LearningAcademy /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
              <Route path="/audit-exports" element={<ProtectedRoute><AuditExports /></ProtectedRoute>} />
              <Route path="/ai-governance" element={<ProtectedRoute><AIGovernance /></ProtectedRoute>} />
              <Route path="/validation-center" element={<ProtectedRoute><ValidationCenter /></ProtectedRoute>} />
              <Route path="/tenant-management" element={<ProtectedRoute><TenantManagement /></ProtectedRoute>} />
              <Route path="/customer-success" element={<ProtectedRoute><CustomerSuccess /></ProtectedRoute>} />
              <Route path="/security-center" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
              <Route path="/clinical-studies" element={<ProtectedRoute><StudiesCenter /></ProtectedRoute>} />
              <Route path="/clinical-sites" element={<ProtectedRoute><SiteManagement /></ProtectedRoute>} />
              <Route path="/clinical-subjects" element={<ProtectedRoute><SubjectCenter /></ProtectedRoute>} />
              <Route path="/clinical-monitoring" element={<ProtectedRoute><MonitoringCenter /></ProtectedRoute>} />
              <Route path="/clinical-etmf" element={<ProtectedRoute><ETMFCenter /></ProtectedRoute>} />
              <Route path="/clinical-rbm" element={<ProtectedRoute><RBMCenter /></ProtectedRoute>} />
              <Route path="/clinical-analytics" element={<ProtectedRoute><ClinicalAnalytics /></ProtectedRoute>} />
              <Route path="/clinical-rtsm" element={<ProtectedRoute><RTSMCenter /></ProtectedRoute>} />
              <Route path="/clinical-edc" element={<ProtectedRoute><EDCCenter /></ProtectedRoute>} />
              <Route path="/admin/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
              <Route path="/admin/audit-dashboard" element={<ProtectedRoute><AuditDashboard /></ProtectedRoute>} />
              <Route path="/admin/production-readiness" element={<ProtectedRoute><ProductionReadinessDashboard /></ProtectedRoute>} />
              <Route path="/admin/pilot-readiness" element={<ProtectedRoute><PilotReadinessDashboard /></ProtectedRoute>} />
              <Route path="/admin/live-operations" element={<ProtectedRoute><LiveOperationsDashboard /></ProtectedRoute>} />
              <Route path="/admin/copilot" element={<ProtectedRoute><OperationsCopilot /></ProtectedRoute>} />
              <Route path="/admin/global-console" element={<ProtectedRoute><GlobalCommandConsole /></ProtectedRoute>} />
              <Route path="/admin/regulatory-command" element={<ProtectedRoute><RegulatoryCommandCenter /></ProtectedRoute>} />
              <Route path="/admin/deployment-readiness" element={<ProtectedRoute><DeploymentReadinessCenter /></ProtectedRoute>} />
              <Route path="/admin/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/admin/user-manual" element={<ProtectedRoute><UserManual /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold tracking-wider text-slate-400/80 bg-white/40 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
            © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved
          </footer>
        </main>
      </div>

      {/* Slide-out Panels */}
      <HelpDrawer isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
      <DemoGuide />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
