import { DataSourceOptions } from 'typeorm'
const ormCfg = {
"type": "mysql",
"host": "0.0.0.0",
"port": 3306,
"username": "flomo",
"password": "flomo",
"database": "flomo",
"entities": ["dist/**/*.entity{.ts,.js}"],
"synchronize": true,
"datestrings": true
} as DataSourceOptions
 
export default ormCfg 
