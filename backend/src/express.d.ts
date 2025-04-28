declare module 'express' {
  import * as http from 'http';
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface Request extends IncomingMessage {
    body: any;
    params: any;
    query: any;
  }
  
  export interface Response extends ServerResponse {
    status(code: number): Response;
    json(body: any): Response;
    send(body: any): Response;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export function json(): any;
  export function urlencoded(options: any): any;
  
  export interface Router {
    use(...handlers: any[]): Router;
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
  }
  
  export interface Express extends Router {
    request: Request;
    response: Response;
    set(setting: string, val: any): this;
    listen(port: number, callback?: () => void): http.Server;
  }
  
  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }
  
  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
  }
  
  export default function(): Express;
  export function Router(): Router;
} 