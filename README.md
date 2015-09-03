# turbobreaker 
[![npm version](https://badge.fury.io/js/turbobreaker.svg)](http://badge.fury.io/js/turbobreaker) [![Build Status](https://api.travis-ci.org/rearwheeldrive/turbobreaker.svg)](https://travis-ci.org/rearwheeldrive/turbobreaker) [![Coverage Status](https://coveralls.io/repos/rearwheeldrive/turbobreaker/badge.svg?branch=master&service=github)](https://coveralls.io/github/rearwheeldrive/turbobreaker?branch=master) [![Dependency Status](https://david-dm.org/rearwheeldrive/turbobreaker.svg)](https://david-dm.org/rearwheeldrive/turbobreaker)

Takes circuit breaker metrics and pipes them to turbine.

## Usage

First, install the module into your node project:

```shell
npm install turbobreaker --save
```

## Tests

The test for the module are written using mocha and chai. To run the unit tests, you can use the gulp `test` task:

```shell
gulp test
```

If you wish to have the tests watch the `src/` and `test/` directories for changes, you can use the `test:watch` gulp task:

```shell
gulp test:watch
```

