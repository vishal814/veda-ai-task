import React from 'react';
import { useAssignmentStore, IAssignment } from '../store/useAssignmentStore';
import { Download, RefreshCw, AlertTriangle, Printer, Sparkles, BookOpen } from 'lucide-react';

export default function QuestionPaperView() {
  const selectedAssignment = useAssignmentStore((state) => state.selectedAssignment);
  const regenerateAssignment = useAssignmentStore((state) => state.regenerateAssignment);
  const isGenerating = useAssignmentStore((state) => state.isGenerating);
  const setCurrentView = useAssignmentStore((state) => state.setCurrentView);

  if (!selectedAssignment) {
    return (
      <div className="empty-state">
        <p className="empty-desc">No assignment selected. Return to Dashboard.</p>
        <button className="empty-create-btn" onClick={() => setCurrentView('dashboard')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { status, error, questionPaper, pdfPath } = selectedAssignment;

  // 1. LOADING / GENERATING STATE
  if (status === 'pending' || status === 'processing') {
    return (
      <div className="empty-state" style={{ padding: '60px 40px' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '24px' }}>
          {/* Animated pulsing orbit loader */}
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid var(--primary-light)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid transparent',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            inset: '20px',
            background: 'var(--primary-gradient)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(255, 79, 25, 0.3)'
          }}>
            <Sparkles size={24} style={{ animation: 'pulse 1.5s infinite alternate' }} />
          </div>
        </div>

        <h3 className="empty-title">Generating Question Paper</h3>
        <p className="empty-desc" style={{ maxWidth: '420px' }}>
          Our AI is analyzing your configurations and drafting a professional question paper.
          This takes about 15-30 seconds.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          padding: '10px 20px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)'
        }}>
          <div className="spinner spinner-dark"></div>
          <span>Current status: <strong>{status}...</strong></span>
        </div>
      </div>
    );
  }

  // 2. FAILED STATE
  if (status === 'failed') {
    return (
      <div className="empty-state">
        <div style={{
          width: '64px',
          height: '64px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '20px'
        }}>
          <AlertTriangle size={32} />
        </div>
        <h3 className="empty-title">Question Generation Failed</h3>
        <p className="empty-desc" style={{ maxWidth: '480px' }}>
          An error occurred while compiling your assessment: <br />
          <strong style={{ color: '#b91c1c' }}>{error || 'Unknown API or Queue Timeout'}</strong>
        </p>
        <button
          className="empty-create-btn"
          style={{ background: '#dc2626' }}
          disabled={isGenerating}
          onClick={() => regenerateAssignment(selectedAssignment._id)}
        >
          {isGenerating ? (
            <>
              <div className="spinner"></div>
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span>Retry Generation</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // 3. SUCCESS / COMPLETED STATE
  if (!questionPaper) {
    return (
      <div className="empty-state">
        <p className="empty-desc">Error parsing question paper structure.</p>
        <button className="empty-create-btn" onClick={() => setCurrentView('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    if (pdfPath) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      window.open(`${backendUrl}${pdfPath}`, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = async () => {
    if (confirm('Are you sure you want to regenerate this question paper? This will overwrite the current content.')) {
      await regenerateAssignment(selectedAssignment._id);
    }
  };

  // Render question list counters
  let globalQuestionNumber = 1;

  return (
    <div className="output-container">
      {/* Top action bar */}
      <div className="action-banner-card">
        <div className="action-banner-message">
          Certainly, John Doe! Here is the customized Question Paper for your {selectedAssignment.schoolName} classes:
        </div>
        
        <div className="banner-actions">
          <button className="btn-regenerate" onClick={handlePrint} title="Print exam paper">
            <Printer size={15} />
            <span>Print</span>
          </button>
          
          <button className="btn-regenerate" onClick={handleRegenerate} disabled={isGenerating}>
            <RefreshCw size={15} className={isGenerating ? 'spin' : ''} />
            <span>Regenerate</span>
          </button>

          <button className="btn-download-pdf" onClick={handleDownload} disabled={!pdfPath}>
            <Download size={15} />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="paper-sheet">
        {/* School Name */}
        <h1 className="paper-school-name">{questionPaper.schoolName}</h1>
        {/* Subject */}
        <h3 className="paper-subject">Subject: {questionPaper.subject}</h3>
        {/* Grade / Class */}
        <h4 className="paper-class">{questionPaper.gradeClass}</h4>

        {/* Time and Marks Info Row */}
        <div className="paper-meta-row">
          <span>Time Allowed: {questionPaper.timeAllowedMinutes} minutes</span>
          <span>Maximum Marks: {selectedAssignment.totalMarks}</span>
        </div>

        <p className="paper-instruction-line">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Blanks inputs for students */}
        <div className="paper-student-info">
          <div>Name: <span className="info-line"></span></div>
          <div>Roll Number: <span className="info-line"></span></div>
          <div>
            Class: {questionPaper.gradeClass} Section: <span className="info-line" style={{ width: '100px' }}></span>
          </div>
        </div>

        {/* Sections listing */}
        {questionPaper.sections.map((section, sIdx) => (
          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 className="paper-section-title">{section.title}</h2>
            <h5 className="paper-section-subheader">
              {section.title === 'Section A' ? 'Short Answer Questions' : 'Questions'}
            </h5>
            <p className="paper-section-instruction">{section.instruction}</p>

            <ul className="questions-list">
              {section.questions.map((q, qIdx) => {
                const currentNumber = globalQuestionNumber++;
                return (
                  <li key={qIdx} className="question-item">
                    <div className="question-text-block">
                      <span>{currentNumber}.</span>
                      <div>
                        <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                          {q.difficulty}
                        </span>
                        <span>{q.text}</span>
                      </div>
                    </div>
                    <span className="question-marks">
                      [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* End Label */}
        <div className="end-paper-tag">End of Question Paper</div>

        {/* Answer Key page breaker */}
        <div className="answer-key-section">
          <h2 className="answer-key-title">Answer Key:</h2>
          <div>
            {questionPaper.answers.map((ans, aIdx) => (
              <div key={aIdx} className="answer-item">
                <strong>{ans.questionNumber}.</strong>
                <p>{ans.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
