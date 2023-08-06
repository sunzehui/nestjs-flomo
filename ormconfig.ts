import { DataSourceOptions } from 'typeorm';

import 'dotenv'

export default {
    "type": "sqlite",
    "database": "src/lib/sqlite.db", // Replace this with your desired database file path
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
    dateStrings: true,
} as DataSourceOptions;
