import React, { useState } from 'react';
import { useAssignmentStore, IAssignment } from '../store/useAssignmentStore';
import { Search, MoreVertical, Plus, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const assignments = useAssignmentStore((state) => state.assignments);
  const setCurrentView = useAssignmentStore((state) => state.setCurrentView);
  const setSelectedAssignment = useAssignmentStore((state) => state.setSelectedAssignment);
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Filter list based on search query
  const filteredAssignments = assignments.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleCardClick = (assignment: IAssignment) => {
    setSelectedAssignment(assignment);
    setCurrentView('output');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(id);
    }
    setActiveDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  // Close dropdown on clicking anywhere
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (assignments.length === 0) {
    return (
      <div className="empty-state">
        {/* Empty state SVG graphic representing a document under a magnifying glass */}
        <div className="empty-graphic">
          <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="20" width="100" height="130" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="3" />
            <line x1="70" y1="50" x2="130" y2="50" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="75" x2="110" y2="75" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="100" x2="120" y2="100" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
            
            {/* Magnifying Glass with Red Cross */}
            <circle cx="130" cy="110" r="35" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="3" />
            <path d="M120 100L140 120" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <path d="M140 100L120 120" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="154" y1="134" x2="185" y2="165" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
            
            {/* Tiny stars decorations */}
            <path d="M40 70L42 74L46 75L42 76L40 80L38 76L34 75L38 74L40 70Z" fill="#ff4f19" opacity="0.6" />
            <path d="M180 40L181 44L185 45L181 46L180 50L179 46L175 45L179 44L180 40Z" fill="#3B82F6" opacity="0.6" />
          </svg>
        </div>

        <h3 className="empty-title">No assignments yet</h3>
        <p className="empty-desc">
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
        
        <button className="empty-create-btn" onClick={() => setCurrentView('create')}>
          <Plus size={16} />
          <span>Create Your First Assignment</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title Section */}
      <div className="page-title-section">
        <div className="title-badge"></div>
        <div>
          <h2 className="page-title">Assignments</h2>
          <p className="page-subtitle">Manage and create assignments for your classes.</p>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="filter-search-row">
        <button className="filter-btn" onClick={(e) => e.preventDefault()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9v6l4 2v-8L22 3z"/>
          </svg>
          <span>Filter By</span>
        </button>

        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search Assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="assignments-grid">
        {filteredAssignments.map((item) => (
          <div
            key={item._id}
            className="assignment-card"
            style={{ cursor: item.status === 'completed' ? 'pointer' : 'default' }}
            onClick={() => item.status === 'completed' && handleCardClick(item)}
          >
            <div className="card-top">
              <h3 className="card-title">{item.title}</h3>
              <div style={{ position: 'relative' }}>
                <button
                  className="card-menu-btn"
                  onClick={(e) => toggleDropdown(e, item._id)}
                >
                  <MoreVertical size={18} />
                </button>
                {activeDropdownId === item._id && (
                  <div className="card-menu-dropdown">
                    <button
                      className="dropdown-item"
                      disabled={item.status !== 'completed'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(item);
                      }}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={(e) => handleDelete(e, item._id)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card-details">
              <div className="card-info-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={13} style={{ color: 'var(--text-muted)' }} />
                <span>Subject: <strong>{item.subject}</strong> | {item.gradeClass}</span>
              </div>
              <div className="card-info-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                <span>Assigned on: <strong>{formatDate(item.createdAt)}</strong></span>
              </div>
            </div>

            <div className="card-status-row">
              <div className="card-info-item">
                Due: <strong>{formatDate(item.dueDate)}</strong>
              </div>
              <span className={`card-status-badge ${item.status}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (Matches populated Figma screen) */}
      <button className="floating-create-btn" onClick={() => setCurrentView('create')}>
        <Plus size={16} />
        <span>Create Assignment</span>
      </button>
    </div>
  );
}
