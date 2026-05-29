import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ApiEnvelope<T> {
    ok: true;
    data: T;
    meta?: {
        count?: number;
        took_ms?: number;
    };
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>>;
}
