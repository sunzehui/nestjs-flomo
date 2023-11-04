import { DataSource, DataSourceOptions } from "typeorm";

export const dataSource = {
  type: "sqlite",
  database: "src/core/sql/sqlite.db", // Replace this with your desired database file path
  autoLoadEntities: true,
  entities: ["dist/src/**/*.entity{.ts,.js}"],
  migrations: ["dist/src/core/sql/migration/*{.ts,.js}"],
  synchronize: false,
  dateStrings: true,
} as DataSourceOptions
export default new DataSource(dataSource);
