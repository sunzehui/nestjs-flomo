import { DataSource, DataSourceOptions } from "typeorm";

export const dataSource: DataSourceOptions = {
  type: process.env.DATABASE_TYPE as any || "sqlite",
  database: process.env.DATABASE_PATH || "src/core/sql/sqlite.db",
  entities: [process.env.ENTITIES_PATH || "dist/src/**/*.entity{.ts,.js}"],
  migrations: [process.env.MIGRATIONS_PATH || "dist/src/core/sql/migration/*{.ts,.js}"],
  synchronize: process.env.SYNCHRONIZE === 'true' || false,
  dateStrings: true,
};

export default new DataSource(dataSource);
