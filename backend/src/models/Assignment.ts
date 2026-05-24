import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
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

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true }
});

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true }
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AnswerSchema = new Schema<IAnswer>({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true }
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  gradeClass: { type: String, required: true },
  timeAllowedMinutes: { type: Number, required: true },
  sections: [SectionSchema],
  answers: [AnswerSchema]
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    gradeClass: { type: String, required: true },
    questionTypes: [QuestionTypeSchema],
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: { type: String },
    questionPaper: { type: QuestionPaperSchema },
    pdfPath: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
