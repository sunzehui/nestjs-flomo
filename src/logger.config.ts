import { Request, Response } from 'express';
import {
  SerializedError,
  SerializedRequest,
  SerializedResponse,
} from 'pino-std-serializers';
export function pinoHttpOption(envDevMode = 'development') {
  return {
    customAttributeKeys: {
      req: '请求信息',
      res: '响应信息',
      err: '错误信息',
      responseTime: '响应时间(ms)',
    },
    level: envDevMode !== 'production' ? 'debug' : 'info',
    customLogLevel(_: Request, res: Response) {
      if (res.statusCode <= 300) return 'info';
      return 'error';
    },
    serializers: {
      // 自定义请求日志
      req(_req: SerializedRequest) {
        const santizedReq = {
          method: _req.method,
          url: _req.url,
          params: (_req.raw as Request).params,
          query: (_req.raw as Request).query,
          body: (_req.raw as Request).body,
        };
        return santizedReq;
      },
      res(_res: SerializedResponse) {
        const santizedRes = {
          status: _res.statusCode,
        };
        return santizedRes;
      },
      // 自定义错误日志
      err(_err: SerializedError) {
        const santizedErr = {
          ..._err,
        };
        return santizedErr;
      },
    },
    transport: {
      target: 'pino-pretty',
      // 美化插件配置
      options:
        envDevMode === 'development'
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
