import { create } from 'zustand';

export interface IQuestionType {
  _id?: string;
  type: string;
  count: number;
  marks: number;
}

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswer {
  questionNumber: number;
  text: string;
}

export interface IQuestionPaper {
  schoolName: string;
  subject: string;
  gradeClass: string;
  timeAllowedMinutes: number;
  sections: ISection[];
  answers: IAnswer[];
}

export interface IAssignment {
  _id: string;
  title: string;
  dueDate: string;
  schoolName: string;
  subject: string;
  gradeClass: string;
  questionTypes: IQuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  questionPaper?: IQuestionPaper;
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentStore {
  assignments: IAssignment[];
  currentView: 'dashboard' | 'create' | 'output';
  selectedAssignment: IAssignment | null;
  isLoading: boolean;
  isGenerating: boolean;
  currentStep: 1 | 2;
  setAssignments: (assignments: IAssignment[]) => void;
  setCurrentView: (view: 'dashboard' | 'create' | 'output') => void;
  setSelectedAssignment: (assignment: IAssignment | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  setCurrentStep: (step: 1 | 2) => void;
  fetchAssignments: () => Promise<void>;
  createAssignment: (formData: FormData) => Promise<IAssignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  updateAssignmentStatus: (id: string, status: IAssignment['status'], data?: any) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api/assignments`;

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentView: 'dashboard',
  selectedAssignment: null,
  isLoading: false,
  isGenerating: false,
  currentStep: 1,

  setAssignments: (assignments) => set({ assignments }),
  setCurrentView: (currentView) => set({ currentView }),
  setSelectedAssignment: (selectedAssignment) => set({ selectedAssignment }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentStep: (currentStep) => set({ currentStep }),

  fetchAssignments: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      set({ assignments: data });
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createAssignment: async (formData) => {
    set({ isGenerating: true });
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create assignment');
      }
      const newAssignment = await response.json();
      
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        selectedAssignment: newAssignment,
        currentView: 'output',
        currentStep: 1
      }));
      return newAssignment;
    } catch (error) {
      set({ isGenerating: false });
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      
      set((state) => {
        const filtered = state.assignments.filter((a) => a._id !== id);
        const nextSelected = state.selectedAssignment?._id === id ? null : state.selectedAssignment;
        const nextView = state.selectedAssignment?._id === id ? 'dashboard' : state.currentView;
        return {
          assignments: filtered,
          selectedAssignment: nextSelected,
          currentView: nextView
        };
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  regenerateAssignment: async (id) => {
    set({ isGenerating: true });
    try {
      const response = await fetch(`${API_BASE}/${id}/regenerate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to regenerate assignment');
      const updated = await response.json();
      
      set((state) => {
        const idx = state.assignments.findIndex((a) => a._id === id);
        const updatedList = [...state.assignments];
        if (idx !== -1) {
          updatedList[idx] = updated;
        }
        return {
          assignments: updatedList,
          selectedAssignment: updated,
          isGenerating: true
        };
      });
    } catch (error) {
      set({ isGenerating: false });
      console.error('Error regenerating assignment:', error);
      throw error;
    }
  },

  updateAssignmentStatus: (id, status, data) => {
    set((state) => {
      // Find and update item in array
      const updatedList = state.assignments.map((item) => {
        if (item._id === id) {
          const base = { ...item, status };
          if (status === 'completed' && data) {
            return { ...base, ...data };
          }
          if (status === 'failed' && data?.error) {
            return { ...base, error: data.error };
          }
          return base;
        }
        return item;
      });

      // Update active selection if it's the one that changed
      let nextSelected = state.selectedAssignment;
      if (nextSelected?._id === id) {
        const updatedObj = { ...nextSelected, status };
        if (status === 'completed' && data) {
          Object.assign(updatedObj, data);
        }
        if (status === 'failed' && data?.error) {
          updatedObj.error = data.error;
        }
        nextSelected = updatedObj;
      }

      // Check if we finished generation to stop loaders
      const stillGenerating = status === 'pending' || status === 'processing';

      return {
        assignments: updatedList,
        selectedAssignment: nextSelected,
        isGenerating: stillGenerating ? state.isGenerating : false
      };
    });
  }
}));
