declare module 'express' {
  import * as http from 'http';
  
  export interface Request {}
  export interface Response {}
  export interface NextFunction {}
  
  export function json(): any;
  export function urlencoded(options: any): any;
  
  export interface Express {
    use: (middleware: any) => void;
    get: (path: string, handler: any) => void;
    post: (path: string, handler: any) => void;
    put: (path: string, handler: any) => void;
    delete: (path: string, handler: any) => void;
  }
  
  export default function(): Express;
} 