declare module 'socket.io' {
  import { Server as HttpServer } from 'http';
  
  export interface Socket {
    id: string;
    rooms: Set<string>;
    join(room: string | string[]): Promise<void>;
    leave(room: string): Promise<void>;
    to(room: string | string[]): BroadcastOperator;
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
    disconnect(close?: boolean): void;
  }
  
  export interface BroadcastOperator {
    emit(event: string, ...args: any[]): boolean;
  }
  
  export interface ServerOptions {
    path?: string;
    serveClient?: boolean;
    adapter?: any;
    cors?: {
      origin?: string | string[] | boolean;
      methods?: string[];
      credentials?: boolean;
    };
    transports?: string[];
    allowEIO3?: boolean;
  }
  
  export class Server {
    constructor(httpServer: HttpServer, options?: ServerOptions);
    on(event: 'connection', listener: (socket: Socket) => void): this;
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
    to(room: string): BroadcastOperator;
    in(room: string): BroadcastOperator;
  }
} 