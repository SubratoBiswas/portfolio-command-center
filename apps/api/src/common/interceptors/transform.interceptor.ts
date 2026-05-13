import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiEnvelope<T> {
  ok: true;
  data: T;
  meta?: { count?: number; took_ms?: number };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    const start = Date.now();
    return next.handle().pipe(
      map((data) => {
        const took_ms = Date.now() - start;
        const meta: ApiEnvelope<T>['meta'] = { took_ms };
        if (Array.isArray(data)) meta.count = data.length;
        return { ok: true, data, meta };
      }),
    );
  }
}
