import { createServer } from 'node:http';
import { env } from './infrastructure/config/env.js';
import { connectToDatabase } from './infrastructure/database/mongoose.connection.js';
import { createApp } from './presentation/http/app.js';

const bootstrap = async () => {
  await connectToDatabase(env.mongodbUri);

  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend.', error);
  process.exitCode = 1;
});
