import React, { useState } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { Upload, X, Calendar, Plus, ChevronLeft, ChevronRight, Mic, Sparkles } from 'lucide-react';

interface QuestionTypeRow {
  type: string;
  count: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True / False Questions'
];

export default function AssignmentForm() {
  const currentStep = useAssignmentStore((state) => state.currentStep);
  const setCurrentStep = useAssignmentStore((state) => state.setCurrentStep);
  const setCurrentView = useAssignmentStore((state) => state.setCurrentView);
  const createAssignment = useAssignmentStore((state) => state.createAssignment);
  const isGenerating = useAssignmentStore((state) => state.isGenerating);

  // Form states - Step 1
  const [title, setTitle] = useState('');
  const [schoolName, setSchoolName] = useState('Delhi Public School, Sector-4, Bokaro');
  const [subject, setSubject] = useState('English');
  const [gradeClass, setGradeClass] = useState('Class: 5th');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states - Step 2
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeRow[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Questions', count: 3, marks: 2 },
    { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { type: 'Numerical Problems', count: 5, marks: 5 }
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Calculate totals
  const totalQuestions = questionTypes.reduce((sum, item) => sum + item.count, 0);
  const totalMarks = questionTypes.reduce((sum, item) => sum + (item.count * item.marks), 0);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Question Row Handlers
  const handleAddRow = () => {
    setQuestionTypes([
      ...questionTypes,
      { type: 'Multiple Choice Questions', count: 1, marks: 1 }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const nextList = [...questionTypes];
    nextList.splice(index, 1);
    setQuestionTypes(nextList);
  };

  const handleRowTypeChange = (index: number, val: string) => {
    const nextList = [...questionTypes];
    nextList[index].type = val;
    setQuestionTypes(nextList);
  };

  const handleCountIncrement = (index: number, stepVal: number) => {
    const nextList = [...questionTypes];
    nextList[index].count = Math.max(1, nextList[index].count + stepVal);
    setQuestionTypes(nextList);
  };

  const handleMarksIncrement = (index: number, stepVal: number) => {
    const nextList = [...questionTypes];
    nextList[index].marks = Math.max(1, nextList[index].marks + stepVal);
    setQuestionTypes(nextList);
  };

  // Submit and Validation
  const validateStep1 = () => {
    if (!title.trim()) return 'Assignment Title is required';
    if (!schoolName.trim()) return 'School Name is required';
    if (!subject.trim()) return 'Subject is required';
    if (!gradeClass.trim()) return 'Class/Grade is required';
    if (!dueDate) return 'Due Date is required';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      alert(err);
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSubmit = async () => {
    if (questionTypes.length === 0) {
      alert('At least one Question Type configuration must be added.');
      return;
    }

    const payload = new FormData();
    payload.append('title', title);
    payload.append('schoolName', schoolName);
    payload.append('subject', subject);
    payload.append('gradeClass', gradeClass);
    payload.append('dueDate', dueDate);
    payload.append('questionTypes', JSON.stringify(questionTypes));
    payload.append('totalQuestions', String(totalQuestions));
    payload.append('totalMarks', String(totalMarks));
    
    if (additionalInstructions.trim()) {
      payload.append('additionalInstructions', additionalInstructions);
    }

    if (selectedFile) {
      payload.append('material', selectedFile);
    }

    try {
      await createAssignment(payload);
    } catch (err: any) {
      alert(err.message || 'Generation failed.');
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Page Title */}
      <div className="page-title-section">
        <div className="title-badge"></div>
        <div>
          <h2 className="page-title">Create Assignment</h2>
          <p className="page-subtitle">Set up a new assignment for your students</p>
        </div>
      </div>

      {/* Multi-step progress bar */}
      <div className="wizard-progress-bar">
        <div className={`wizard-progress-fill step-${currentStep}`}></div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        {currentStep === 1 ? (
          /* STEP 1: Details and Files */
          <div>
            <h3 className="form-section-title">Assignment Details</h3>
            <p className="form-section-subtitle">Basic information about your assignment</p>

            {/* Title field */}
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Quiz on Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* School details prefill inputs */}
            <div className="form-group">
              <label className="form-label">School Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Delhi Public School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. English"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class / Grade</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Class: 5th"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                />
              </div>
            </div>

            {/* Date field */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div className="form-input-with-icon">
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <Calendar className="input-icon-right" size={18} />
              </div>
            </div>

            {/* File Drop zone */}
            <div className="form-group">
              <label className="form-label">Upload Material (Optional)</label>
              {!selectedFile ? (
                <div
                  className="dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="dropzone-icon" size={32} />
                  <p className="dropzone-title">Choose a file or drag & drop it here</p>
                  <p className="dropzone-subtitle">PDF, TEXT, JPEG, PNG (upto 10MB)</p>
                  
                  <input
                    type="file"
                    id="material-upload"
                    style={{ display: 'none' }}
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                  <button
                    className="browse-btn"
                    onClick={() => document.getElementById('material-upload')?.click()}
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="file-selected-banner">
                  <div className="file-info-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                    <X size={16} />
                  </button>
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>
                Upload images or document PDF/Text of your preferred reference study material.
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Question types distribution and prompt instructions */
          <div>
            <h3 className="form-section-title">Question Paper Configuration</h3>
            <p className="form-section-subtitle">Define the paper distribution structure and guidelines</p>

            {/* Question Types List */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="form-label">Question Type</span>
                <span className="form-label" style={{ marginRight: '75px' }}>No. of Questions</span>
                <span className="form-label" style={{ marginRight: '24px' }}>Marks</span>
              </div>

              <div className="qtypes-list">
                {questionTypes.map((row, idx) => (
                  <div key={idx} className="qtype-row">
                    <select
                      className="qtype-select"
                      value={row.type}
                      onChange={(e) => handleRowTypeChange(idx, e.target.value)}
                    >
                      {QUESTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button className="remove-qtype-btn" onClick={() => handleRemoveRow(idx)}>
                      <X size={16} />
                    </button>

                    {/* Quantity counter */}
                    <div className="counter-container">
                      <button
                        className="counter-btn"
                        disabled={row.count <= 1}
                        onClick={() => handleCountIncrement(idx, -1)}
                      >
                        -
                      </button>
                      <span className="counter-val">{row.count}</span>
                      <button
                        className="counter-btn"
                        onClick={() => handleCountIncrement(idx, 1)}
                      >
                        +
                      </button>
                    </div>

                    {/* Marks counter */}
                    <div className="counter-container">
                      <button
                        className="counter-btn"
                        disabled={row.marks <= 1}
                        onClick={() => handleMarksIncrement(idx, -1)}
                      >
                        -
                      </button>
                      <span className="counter-val">{row.marks}</span>
                      <button
                        className="counter-btn"
                        onClick={() => handleMarksIncrement(idx, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Type button */}
              <button className="add-qtype-btn" onClick={handleAddRow}>
                <Plus size={14} />
                <span>Add Question Type</span>
              </button>

              {/* Summary Label */}
              <div className="form-totals-row">
                <span>Total Questions : <strong>{totalQuestions}</strong></span>
                <span>Total Marks : <strong>{totalMarks}</strong></span>
              </div>
            </div>

            {/* Additional Info textarea */}
            <div className="form-group">
              <label className="form-label">Additional Information (For better output)</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration. Focus on chapter 4 electricity electromagnetism theories..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
                <Mic
                  className="input-icon-right"
                  size={16}
                  style={{ bottom: '16px', top: 'auto', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="form-actions-bar">
          <button className="btn-prev" onClick={handlePrevious} disabled={isGenerating}>
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {currentStep === 1 ? (
            <button className="btn-next" onClick={handleNext}>
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-next" onClick={handleSubmit} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="spinner"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Paper</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
