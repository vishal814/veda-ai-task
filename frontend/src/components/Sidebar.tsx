import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { Home, Users, FileText, Wrench, BookOpen, Settings, Plus, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const currentView = useAssignmentStore((state) => state.currentView);
  const setCurrentView = useAssignmentStore((state) => state.setCurrentView);
  const assignments = useAssignmentStore((state) => state.assignments);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Close button for mobile views */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>

        <div>
          {/* Branding */}
          <div className="sidebar-logo">
            <div className="logo-icon">V</div>
            <span className="logo-text">VedaAI</span>
          </div>

          {/* Primary Action Button */}
          <button className="create-btn" onClick={() => {
            setCurrentView('create');
            onClose();
          }}>
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>

          {/* Navigation list */}
          <nav>
            <ul className="nav-links">
              <li>
                <a
                  href="#"
                  className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('dashboard');
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Home size={18} />
                    <span>Home</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={18} />
                    <span>My Groups</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`nav-item ${currentView === 'dashboard' || currentView === 'output' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('dashboard');
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={18} />
                    <span>Assignments</span>
                  </div>
                  {completedCount > 0 && (
                    <span className="nav-item-badge">{completedCount}</span>
                  )}
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Wrench size={18} />
                    <span>AI Teacher's Toolkit</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BookOpen size={18} />
                    <span>My Library</span>
                  </div>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer profile card */}
        <div className="sidebar-bottom">
          <a href="#" className="settings-link" onClick={(e) => e.preventDefault()}>
            <Settings size={18} />
            <span>Settings</span>
          </a>

          <div className="profile-card">
            <div className="avatar">
              {/* Simple fallback avatar */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="profile-info">
              <h4>Delhi Public School</h4>
              <p>Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
