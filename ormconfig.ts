import { DataSource, DataSourceOptions } from "typeorm";


export const datasourceOptions = {
  type: "sqlite",
  database: "src/lib/sqlite.db", // Replace this with your desired database file path
  autoLoadEntities: true,
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: true,
  dateStrings: true,
  migrations: ["dist/src/core/sql/*.js"]
} as DataSourceOptions;

export default new DataSource(datasourceOptions)
