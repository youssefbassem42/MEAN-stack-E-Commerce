export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptimeInSeconds: number;
  database: {
    state: string;
    ready: boolean;
  };
}
