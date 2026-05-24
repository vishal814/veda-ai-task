import { Queue } from 'bullmq';
import { getRedisOptions } from '../config/redis';

const redisOpts = getRedisOptions();

export interface IJobFile {
  path: string;
  mimetype: string;
  originalname: string;
}

export const questionQueue = new Queue('question-generation', {
  connection: redisOpts.connection as any
});

export const addGenerationJob = async (assignmentId: string, file?: IJobFile) => {
  await questionQueue.add(
    'generate-paper',
    { assignmentId, file },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  );
};
