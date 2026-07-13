import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log(`Connecting to Redis at: ${redisUrl}`);

const client = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  connectTimeout: 5000
});

client.on('connect', () => {
  console.log('✅ Connection established successfully!');
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
  process.exit(1);
});

async function runTest() {
  try {
    const key = 'test:diag:check';
    const value = JSON.stringify({ status: 'active', timestamp: new Date().toISOString() });

    console.log(`Setting key "${key}"...`);
    await client.set(key, value, 'EX', 10);
    console.log('✅ Key set successfully.');

    console.log(`Reading key "${key}"...`);
    const result = await client.get(key);
    console.log('✅ Key retrieved successfully. Content:', result);

    console.log('Deleting key...');
    await client.del(key);
    console.log('✅ Key deleted successfully.');

    console.log('🎉 Redis connection and operations verified 100%!');
    client.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    client.disconnect();
    process.exit(1);
  }
}

// Wait a brief moment for the connection to establish before running tests
setTimeout(runTest, 1000);
