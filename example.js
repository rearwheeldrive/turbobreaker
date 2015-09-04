import {TurboBreaker} from './src/turbobreaker';

let t = new TurboBreaker();

setInterval(() => {
  t.send({
    what: 'isup'
  });
}, 1000);