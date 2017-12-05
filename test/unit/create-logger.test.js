'use strict';

const { EventEmitter } = require('events');

const { assert } = require('chai');
const elv = require('elv');

const createLogger = require('../../lib/create-logger');
const Logger = require('../../lib/logger');


class MockProcess extends EventEmitter {

  constructor(options) {
    super();
    const opts = elv.coalesce(options, {});
    this._listenerCount = elv.coalesce(opts.listenerCount, 1);
  }


  listenerCount() { return this._listenerCount; }

}


describe('createLogger', function() {
  it('return instance of Logger', function() {
    const logger = createLogger();
    assert.instanceOf(logger, Logger);
  });

  it('flushes logger on beforeExit if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('beforeExit');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on exit if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('exit');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on SIGHUP if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGHUP');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger async on SIGHUP if buffering >1 listeners', function(done) {
    const proc = new MockProcess({ listenerCount: 2 });
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGHUP');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on SIGINT if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGINT');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on SIGQUIT if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGQUIT');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on SIGTERM if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGTERM');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('flushes logger on uncaughtException if buffering', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('uncaughtException');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('does not terminate more than once', function(done) {
    const proc = new MockProcess();
    const logger = createLogger({ buffer: {} }, proc);

    logger.on('fd-resolved', () => {
      proc.emit('SIGQUIT');
      proc.emit('SIGINT');
    });

    logger.on('flushed', () => {
      done();
    });
  });

  it('resolves fd from handle if no fd', function(done) {
    const proc = new MockProcess();
    const stream = {
      _handle: { fd: 42 },
      write: () => {},
    };

    const logger = createLogger({ buffer: {}, stream }, proc);

    logger.on('fd-resolved', (fd) => {
      assert.strictEqual(fd, 42);
      done();
    });
  });

  it('errors if unable to resolve fd', function(done) {
    const proc = new MockProcess();
    const stream = {
      write: () => { },
    };

    const logger = createLogger({ buffer: {}, stream }, proc);

    logger.on('fd-resolved', () => {
      done('FD should not have been resolved');
    });

    logger.on('error', (err) => {
      if (err.code === 77) done();
      else done(err);
    });
  });
});
