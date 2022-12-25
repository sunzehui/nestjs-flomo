import {DataSourceOptions} from 'typeorm';
import 'dotenv'

let ormCfg = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'flomo',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
    dateStrings: true,
} as DataSourceOptions;
// 线上预览模式
const isPreview = process.env.NODE_ENV;
if (isPreview) {
    ormCfg = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'flomo',
        password: 'flomo',
        database: 'flomo',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        dateStrings: true,
    } as DataSourceOptions;
}
export default ormCfg;
