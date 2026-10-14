import { DataSource, DataSourceOptions } from "typeorm";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";

// 关键：本文件会被 app.module 在「模块导入期」求值，
// 此时 Nest 的 ConfigModule 还没执行，所以必须自己先把 .env 读进来，
// 否则 process.env 里的 DATABASE_* 等配置永远不会生效。
const nodeEnv = process.env.NODE_ENV || "development";
loadDotenv({ path: resolve(process.cwd(), ".env") });
loadDotenv({ path: resolve(process.cwd(), `.env.${nodeEnv}`) });

export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: (env.DATABASE_TYPE as "sqlite") || "sqlite",
    database: env.DATABASE_PATH || "src/core/sql/sqlite.db",
    entities: [env.ENTITIES_PATH || "dist/src/**/*.entity{.ts,.js}"],
    migrations: [
      env.MIGRATIONS_PATH || "dist/src/core/sql/migration/*{.ts,.js}",
    ],
    synchronize: env.SYNCHRONIZE === "true",
    dateStrings: true,
  } as DataSourceOptions;
}

export const dataSource: DataSourceOptions = buildDataSourceOptions();

export default new DataSource(dataSource);
