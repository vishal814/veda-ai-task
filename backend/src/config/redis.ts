import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const getRedisOptions = () => {
  // If there's a full Redis URL, parse it, or let ioredis/BullMQ handle it.
  // BullMQ requires maxRetriesPerRequest to be null on the redis connection.
  if (process.env.REDIS_URL) {
    return {
      connection: new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
      }),
    };
  }

  return {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    }
  };
};

export const getRedisInstance = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  return new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  });
};
