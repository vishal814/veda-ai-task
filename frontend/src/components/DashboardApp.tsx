'use client';

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import AssignmentForm from './AssignmentForm';
import QuestionPaperView from './QuestionPaperView';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChevronRight, ArrowLeft, Bell, Menu } from 'lucide-react';

export default function DashboardApp() {
  // Initialize the real-time WebSocket connection
  useWebSocket();

  const currentView = useAssignmentStore((state) => state.currentView);
  const setCurrentView = useAssignmentStore((state) => state.setCurrentView);
  const selectedAssignment = useAssignmentStore((state) => state.selectedAssignment);
  const fetchAssignments = useAssignmentStore((state) => state.fetchAssignments);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Fetch list of assignments from DB when mounted
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleBackClick = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content frame */}
      <main className="main-content">
        {/* Navigation Breadcrumbs and User Profile details */}
        <header className="main-header">
          <div className="breadcrumb">
            {/* Hamburger menu button for mobile */}
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} title="Open menu">
              <Menu size={18} />
            </button>

            {currentView !== 'dashboard' && (
              <button className="back-btn" onClick={handleBackClick} title="Back to dashboard">
                <ArrowLeft size={16} />
              </button>
            )}
            <span style={{ fontWeight: 600 }}>Assignment</span>
            {currentView === 'create' && (
              <>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                <span>Create New</span>
              </>
            )}
            {currentView === 'output' && selectedAssignment && (
              <>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {selectedAssignment.title}
                </span>
              </>
            )}
          </div>

          <div className="header-right">
            {/* Notifications Indicator */}
            <button className="notify-btn">
              <Bell size={18} />
              <div className="notify-badge"></div>
            </button>

            {/* Profile toggle prefill dropdown */}
            <div className="user-dropdown">
              <div className="avatar" style={{ marginRight: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span>John Doe</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        {/* Content routing */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'create' && <AssignmentForm />}
          {currentView === 'output' && <QuestionPaperView />}
        </div>
      </main>
    </div>
  );
}
