import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { addGenerationJob } from '../queues/generationQueue';
import fs from 'fs';
import path from 'path';

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      title,
      dueDate,
      schoolName,
      subject,
      gradeClass,
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions
    } = req.body;

    // Input Validation
    if (!title || !dueDate || !schoolName || !subject || !gradeClass || !questionTypes) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const parsedQuestionTypes =
      typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;

    const numQuestions = parseInt(totalQuestions || '0', 10);
    const numMarks = parseInt(totalMarks || '0', 10);

    if (numQuestions <= 0 || numMarks <= 0) {
      return res.status(400).json({ error: 'Total Questions and Marks must be greater than zero.' });
    }

    // Create assignment document (pending state)
    const assignment = new Assignment({
      title,
      dueDate: new Date(dueDate),
      schoolName,
      subject,
      gradeClass,
      questionTypes: parsedQuestionTypes,
      totalQuestions: numQuestions,
      totalMarks: numMarks,
      additionalInstructions,
      status: 'pending'
    });

    await assignment.save();

    // Add job to BullMQ
    let fileInfo = undefined;
    if (req.file) {
      fileInfo = {
        path: req.file.path,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      };
    }

    await addGenerationJob(assignment._id.toString(), fileInfo);

    return res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    return res.json(assignments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.json(assignment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Clean up local PDF
    if (assignment.pdfPath) {
      const fullPath = path.join(__dirname, '..', '..', 'public', assignment.pdfPath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted associated PDF at: ${fullPath}`);
        } catch (err) {
          console.error(`Failed to delete associated PDF file:`, err);
        }
      }
    }

    await Assignment.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const regenerateAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = 'pending';
    assignment.error = undefined;
    await assignment.save();

    // Re-trigger the generation job
    await addGenerationJob(assignment._id.toString());

    return res.json(assignment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
