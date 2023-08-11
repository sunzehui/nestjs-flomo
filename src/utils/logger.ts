import { HttpStatus } from '@/types/logger';
import { Level } from 'pino';

export function getLogLevel(status: HttpStatus): Level {
  switch (status) {
    case HttpStatus.Continue:
    case HttpStatus.OK:
    case HttpStatus.Created:
    case HttpStatus.NoContent:
      return 'info';
    case HttpStatus.MovedPermanently:
    case HttpStatus.Found:
      return 'debug';
    case HttpStatus.BadRequest:
    case HttpStatus.Unauthorized:
    case HttpStatus.Forbidden:
    case HttpStatus.NotFound:
      return 'warn';
    case HttpStatus.InternalServerError:
    case HttpStatus.BadGateway:
    case HttpStatus.ServiceUnavailable:
      return 'error';
    default:
      return 'info'; // Default to info level if the HttpStatus is not recognized
  }
}
