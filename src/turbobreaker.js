import http from 'http';
import {parse} from 'url';
import 'es6-collections';

const HYSTRIX_STREAM_PATH = '/hystrix.stream';

const clients = new Set();
const noop = () => {};

export class TurboBreaker {
  constructor(config = {}, callback = noop) {
    if (typeof config === 'function') {
      callback = config;
      config = {};
    }
    this.server = this.createServer(callback);
  }

  command(data) {
    clients.forEach(res => {
      res.write("data: " + JSON.stringify(data) + "\n\n");
    });
  }

  stop() {
    this.server.close();
  }

  createServer(callback) {
    const server = http.createServer((req, res) => {
      const path = parse(req.url).path;
      if (path === HYSTRIX_STREAM_PATH) {
        // Stop the connection from timing out:
        req.setTimeout(0);
        // Get the client to understand us:
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        res.write("\n");

        res.on('finish', () => {
          clients.delete(res);
        });

        clients.add(res);
      } else {
        // Reject the request:
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(8080, callback);
    return server;
  }
}