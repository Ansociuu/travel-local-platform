import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${Date.now() - now}ms`);
      }),
      catchError((error) => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR ${status}`);
        console.error('Error Details:', error);
        if (body && Object.keys(body).length > 0) {
          console.error('Request Body:', JSON.stringify(body, null, 2));
        }
        return throwError(() => error);
      }),
    );
  }
}
