import mongoose from 'mongoose';

let hasConnectionAttempt = false;

export const connectToDatabase = async (mongodbUri: string) => {
  if (!mongodbUri) {
    console.warn('MONGODB_URI is not configured. Skipping MongoDB connection.');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  hasConnectionAttempt = true;

  await mongoose.connect(mongodbUri);
};

const databaseStates: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const getDatabaseState = () => ({
  state: hasConnectionAttempt
    ? databaseStates[mongoose.connection.readyState] ?? 'unknown'
    : 'not_configured',
  ready: mongoose.connection.readyState === 1,
});
