import test from 'tape';
import {TurboBreaker} from '../src/turbobreaker';

test('it should pass', t => {
  console.log('hi');
  t.pass('it passes');
  t.end();
});