export class ResultData {
  constructor(code = 200, message?: string, data?: any) {
    this.code = code;
    this.msg = message || 'ok';
    this.data = data || null;
  }
  code: number;

  msg?: string;

  data?: any;

  static ok(data?: any, message?: string): ResultData {
    return new ResultData(200, message, data);
  }

  static fail(code: number, message?: string, data?: any): ResultData {
    return new ResultData(code || 500, message || 'fail', data);
  }
}
