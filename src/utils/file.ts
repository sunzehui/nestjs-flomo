import * as crypto from 'crypto';

export function calculateMD5(buffer: Buffer): string {
  const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
  return md5Hash;
}
