import http from 'http';
import {parse} from 'url';

const HYSTRIX_STREAM_PATH = '/hystrix.stream';

export class TurboBreaker {
  constructor(config = {}) {
    if (!config.httpServer) {
      config.httpServer = this.createServer();
    }
    this.server = config.httpServer;
  }

  createServer() {
    var server = http.createServer((req, res) => {
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

        function sendSse(data) {
          res.write("data: " + JSON.stringify(data) + "\n\n");
        }
      } else {
        // Reject the request:
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(8080);
  }
}