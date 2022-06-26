import { DataSourceOptions } from 'typeorm'
const ormCfg = {
"type": "mysql",
"host": "0.0.0.0",
"port": 3306,
"username": "tttttt",
"password": "tttttt",
"database": "tttttt",
"entities": ["dist/**/*.entity{.ts,.js}"],
"synchronize": true,
"datestrings": true
} as DataSourceOptions
 
export default ormCfg 
