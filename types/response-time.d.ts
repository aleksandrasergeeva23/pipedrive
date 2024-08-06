// types/response-time.d.ts
import { RequestHandler, Request, Response, NextFunction } from 'express';

declare module 'response-time' {
  interface ResponseTimeFunction {
    (req: Request, res: Response, time: number): void;
  }

  interface ResponseTimeOptions {
    digits?: number;
    header?: string;
    suffix?: boolean;
  }

  function responseTime(fn: ResponseTimeFunction): RequestHandler;
  function responseTime(options?: ResponseTimeOptions): RequestHandler;

  export = responseTime;
}
