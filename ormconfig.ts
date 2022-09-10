import { DataSourceOptions } from 'typeorm';
const ormCfg = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'flomo',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  datestrings: true,
} as DataSourceOptions;

export default ormCfg;
