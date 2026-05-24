import { Worker, Job } from 'bullmq';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { getRedisOptions } from '../config/redis';
import Assignment from '../models/Assignment';
import { generateQuestionPaper } from '../services/llmService';
import { generatePDF } from '../services/pdfService';
import { notifyStatusChange } from '../websocket';

const redisOpts = getRedisOptions();

export const initWorker = () => {
  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId, file } = job.data;
      console.log(`Processing background generation job for Assignment: ${assignmentId}`);

      // 1. Fetch assignment
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment with ID ${assignmentId} not found`);
      }

      // 2. Set status to processing
      assignment.status = 'processing';
      await assignment.save();
      notifyStatusChange(assignmentId, 'processing');

      let contextText: string | undefined = undefined;
      let base64Image: string | undefined = undefined;
      let imageMimeType: string | undefined = undefined;

      try {
        // If file uploaded, parse based on type
        if (file && fs.existsSync(file.path)) {
          console.log(`Parsing uploaded material file: ${file.originalname} (${file.mimetype})`);
          if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            contextText = pdfData.text;
          } else if (file.mimetype.startsWith('text/') || file.originalname.endsWith('.txt')) {
            contextText = fs.readFileSync(file.path, 'utf-8');
          } else if (file.mimetype.startsWith('image/')) {
            const imageBuffer = fs.readFileSync(file.path);
            base64Image = imageBuffer.toString('base64');
            imageMimeType = file.mimetype;
          }
        }

        // 3. Generate structured exam paper via OpenAI
        const paper = await generateQuestionPaper(
          assignment.schoolName,
          assignment.subject,
          assignment.gradeClass,
          assignment.questionTypes,
          assignment.totalQuestions,
          assignment.totalMarks,
          assignment.additionalInstructions,
          contextText,
          base64Image,
          imageMimeType
        );

        // 4. Update assignment with generated paper structure
        assignment.questionPaper = paper;
        await assignment.save();

        // 5. Generate exam PDF
        const pdfPath = await generatePDF(assignmentId, paper);

        // 6. Update document with completed status and PDF location
        assignment.pdfPath = pdfPath;
        assignment.status = 'completed';
        await assignment.save();

        // 7. Notify client with completed assignment document
        notifyStatusChange(assignmentId, 'completed', assignment);
        console.log(`Successfully completed assignment generation: ${assignmentId}`);
      } catch (err: any) {
        console.error(`Error in generation worker:`, err);
        assignment.status = 'failed';
        assignment.error = err.message || 'Unknown generation error';
        await assignment.save();

        notifyStatusChange(assignmentId, 'failed', { error: assignment.error });
        throw err; // Re-throw to let BullMQ register failure
      } finally {
        // Clean up temp uploads
        if (file && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
            console.log(`Cleaned up temp upload file: ${file.path}`);
          } catch (unlinkErr) {
            console.error('Failed to delete temp file:', unlinkErr);
          }
        }
      }
    },
    {
      connection: redisOpts.connection as any,
      concurrency: 1 // Single job concurrency for rate-limits
    }
  );

  worker.on('active', (job) => {
    console.log(`Job ${job.id} started processing`);
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
};
