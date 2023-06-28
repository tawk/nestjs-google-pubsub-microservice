import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class TimeoutInterceptor implements NestInterceptor {
  private reflector;
  constructor(reflector: Reflector);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
export declare function GCPubSubClientTimeoutInterceptor(
  ms: number,
): <TFunction extends Function, Y>(
  target: object | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void;
