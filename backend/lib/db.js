import { MongoClient } from 'mongodb';
import { requireEnv } from './env.js';

// Serverless connection reuse. A warm invocation keeps module scope, but `vercel dev` (and
// Vercel's own module reloading) can re-evaluate this file, so the promise is parked on
// globalThis to survive that and avoid rebuilding a pool per request.
//
// maxPoolSize is deliberately small: the driver defaults to 100, and enough concurrent lambda
// instances each opening a 100-connection pool will blow past Atlas M0's 500-connection cap
// and start failing requests.
const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 10000,
};

function connect() {
  return new MongoClient(requireEnv('MONGODB_URI'), MONGO_OPTIONS).connect();
}

export async function getMongoClient() {
  if (!globalThis.__usbMongoClientPromise) {
    // Clear a rejected promise so the next request retries, instead of the instance being
    // stuck with a permanently failed connection for the rest of its life.
    globalThis.__usbMongoClientPromise = connect().catch((error) => {
      globalThis.__usbMongoClientPromise = undefined;
      throw error;
    });
  }

  return globalThis.__usbMongoClientPromise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(requireEnv('MONGODB_DB'));
}
