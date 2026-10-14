export interface Config {
  NODE_ENV: 'development' | 'production' | 'preview';
  port: number;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  SERVER_URL: string;
  CORS_ORIGINS?: string;
  DATABASE_TYPE?: string;
  DATABASE_PATH?: string;
  ENTITIES_PATH?: string;
  MIGRATIONS_PATH?: string;
  SYNCHRONIZE?: string;
}
