import test from 'tape';
import {TurboBreaker} from '../src/turbobreaker';
import EventSource from 'eventsource';
import http from 'http';
import fetch from 'node-fetch';

test('exposes a TurboBreaker class', t => {
  t.ok(TurboBreaker, 'TurboBreaker is defined');
  t.equal(typeof TurboBreaker, 'function');
  t.throws(() => {
    TurboBreaker();
  });
  t.end();
});

test('creates an HTTP server', t => {
  const turbo = new TurboBreaker(() => {
    t.ok(turbo.server, 'has an internal server property');
    t.ok(turbo.server instanceof http.Server, 'should be an instance of http.Server');
    fetch('http://127.0.0.1:8080/').then((res) => {
      t.equal(res.status, 404, 'should respond with a 404');
      t.end();
      turbo.stop();
    }, (e) => {
      t.fail('Unknown error occured when fetching localhost.');
      console.error(e.stack);
      t.end();
    });
  });
});

test('closes the HTTP server with the "stop" method', t => {
  const turbo = new TurboBreaker(() => {
    turbo.server.on('close', () => {
      t.pass('server close event was emitted');
      t.end();
    });
    turbo.stop();
  });
});

test('emits a server-sent event via the "command" method', t => {
  const expected = {
    hello: 'TurboBreaker',
    working: true
  };
  const turbo = new TurboBreaker(() => {
    var es = new EventSource('http://127.0.0.1:8080/hystrix.stream');
    es.onmessage = function(e) {
      t.deepEqual(JSON.parse(e.data), expected, 'data payload should be equal');
      t.end();
      es.close();
      turbo.stop();
    };

    es.onerror = function() {
      t.fail('Unexpected error occured.');
      t.end();
    };

    // Allow eventsource to connect:
    setTimeout(function() {
      turbo.command(expected);
    }, 10);
  });

  t.ok(turbo.command, 'TurboBreaker#command is defined');
});

test('should emit the same data to multiple connected clients', t => {
  t.end();
});