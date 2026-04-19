import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Standard ioredis client
let redisClient: any;

const USE_MOCK = true; // Temporary mock to bypass local docker issues

if (USE_MOCK) {
  redisClient = {
    get: async () => null,
    setex: async () => 'OK',
    on: (event: string, cb: any) => {
      if (event === 'connect') cb();
    },
  };
  console.log('Using Mock Redis Client');
} else {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });
  
  redisClient.on('error', (err: any) => {
    console.error('Redis connection error:', err);
  });
}

export default redisClient as Redis;
