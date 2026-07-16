import { MongoClient } from 'mongodb';

let mongoClient;

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(uri);
  }

  return mongoClient;
}

export async function getDb() {
  const client = getMongoClient();
  await client.connect();
  return client.db('usb_board');
}
