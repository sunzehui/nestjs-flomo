import {DataSourceOptions} from 'typeorm';
import 'dotenv'

let ormCfg = {
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
        datestrings: true,
    } as DataSourceOptions;
}
export default ormCfg;
