import test from 'tape';
import {TurboBreaker} from '../src/turbobreaker';
import EventSource from 'eventsource';
import http from 'http';
import fetch from 'node-fetch';
import {parallel} from 'async';

const STREAM_LOCATION = 'http://127.0.0.1:8080/hystrix.stream';

test('exposes a TurboBreaker class', t => {
  t.ok(TurboBreaker, 'TurboBreaker is defined');
  t.equal(typeof TurboBreaker, 'function');
  t.throws(() => {
    TurboBreaker();
  });
  t.end();
});

test('can be called with config object and a callback', t => {
  const allArgs = new TurboBreaker({
    port: 8081
  }, () => {
    t.equal(allArgs.server.address().port, 8081);
    t.pass('expected callback was called');
    allArgs.stop();
    t.end();
  });
});

test('callback is optional', t => {
  t.doesNotThrow(() => {
    const turbo = new TurboBreaker();
    turbo.server.on('listening', () => {
      turbo.stop();
      t.end();
    });
  });
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
    var es = new EventSource(STREAM_LOCATION);
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
    es.onopen = () => {
      turbo.command(expected);
    };
  });

  t.ok(turbo.command, 'TurboBreaker#command is defined');
});

test('should not emit to clients that disconnect', t => {
  const turbo = new TurboBreaker(() => {
    var es = new EventSource(STREAM_LOCATION);
    es.onmessage = function(e) {
      t.fail('recieved message when none was expected');
    };

    es.onopen = () => {
      es.close();
      turbo.command({});
      turbo.stop();
      t.pass('did not send to clients that were diconnected');
      t.end();
    }
  });
});

test('should emit the same data to multiple connected clients', t => {
  t.plan(3);
  const turbo = new TurboBreaker(() => {
    var es1 = new EventSource(STREAM_LOCATION);
    var es2 = new EventSource(STREAM_LOCATION);
    var es3 = new EventSource(STREAM_LOCATION);

    const handler = function() {
      t.pass('recieved event on client');
      this.close();
    }

    es1.onmessage = handler.bind(es1);
    es2.onmessage = handler.bind(es2);
    es3.onmessage = handler.bind(es3);

    parallel([
      (cb) => es1.onopen = cb,
      (cb) => es2.onopen = cb,
      (cb) => es3.onopen = cb
    ], function() {
      // This should blast to all clients:
      turbo.command({
        num: 3
      });
      turbo.stop();
    });
  });
});