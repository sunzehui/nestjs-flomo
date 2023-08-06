import { Config } from '@/types/config-service';
import { getLogLevel } from '@utils/logger';
import {Request, Response} from 'express';
import { Options } from 'pino-http';

type EnvMode = Config['NODE_ENV'];
export function pinoHttpOption(envMode: EnvMode = 'development'): Options {
    return {
        customAttributeKeys: {
            req: 'request:',
            res: 'response:',
            err: 'error:',
            responseTime: 'time(ms)',
        },
        customLogLevel(_: Request, res: Response) {
            if(envMode === 'production'){
                return 'silent'
            }
            return getLogLevel(res.statusCode);
        },
        serializers: {
            // 自定义请求日志
            req(_req) {
                const santizedReq = {
                    method: _req.method,
                    url: _req.url,
                    params: _req.raw .params,
                    query: _req.raw .query,
                    body: _req.raw .body,
                };
                return santizedReq;
            },
            res(_res: Response) {
                return {
                    status: _res.statusCode,
                };
            },
            // err: pino.stdSerializers.err,
        },
        transport: {
            target: 'pino-pretty',
            // 美化插件配置
            options:
                envMode === 'development'
                    ? {
                        colorize: true, // 带颜色输出
                        levelFirst: true,
                        // 转换时间格式
                        translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
                    }
                    : {
                        colorize: false,
                        levelFirst: true,
                        translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
                        //  保存日志到文件
                        destination: './log/combined.log',
                        mkdir: true,
                    },
        },
    };
}
