declare module 'socket.io' {
  import { Server as HttpServer } from 'http';
  
  export class Server {
    constructor(httpServer: HttpServer, options?: any);
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
  }
} 