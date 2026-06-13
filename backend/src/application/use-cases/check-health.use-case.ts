import type { HealthStatus } from '../../domain/entities/health.entity.js';
import { getDatabaseState } from '../../infrastructure/database/mongoose.connection.js';

export const checkHealth = (): HealthStatus => {
  const database = getDatabaseState();

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeInSeconds: Math.floor(process.uptime()),
    database,
  };
};
