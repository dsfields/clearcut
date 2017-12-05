'use strict';

const elv = require('elv');

const Logger = require('./logger');


//
// ERROR MESSAGES
//


const msg = {
  noFileDesc: 'Streams must have a file descriptor if buffering is enabled',
};


//
// PROCESS EXIT EVENT HANDLERS
//


function onExit() {
  if (this.terminated) return;
  this.terminated = true;
  this.logger.flushSync();
}


function onHup() {
  if (this.process.listenerCount('SIGHUP') === 1) return onExit.call(this);
  return this.logger.flush();
}


function getFd(stream) {
  if (elv(stream.fd)) return stream.fd;
  // eslint-disable-next-line no-underscore-dangle
  if (elv(stream._handle) && elv(stream._handle.fd)) return stream._handle.fd;
  return null;
}


function wireExitHandlers(logger, proc, tries) {
  const fd = getFd(logger.stream);
  if (elv(fd)) {
    const context = { logger, process: proc, terminated: false };

    proc.on('beforeExit', onExit.bind(context));
    proc.on('exit', onExit.bind(context));
    proc.on('SIGHUP', onHup.bind(context));
    proc.on('SIGINT', onExit.bind(context));
    proc.on('SIGQUIT', onExit.bind(context));
    proc.on('uncaughtException', onExit.bind(context));
    proc.on('SIGTERM', onExit.bind(context));

    logger.onFd(fd);
    return;
  }

  if (tries > 10) {
    const err = new Error(msg.noFileDesc);
    err.code = 77; // EBADFD
    logger.emit('error', err);
  }

  setTimeout(wireExitHandlers, 100, logger, proc, tries + 1);
}


//
// LOGGER FACTORY
//


module.exports = function createLogger(options, proc) {
  const logger = new Logger(options);

  if (logger.isBuffering) {
    const p = elv.coalesce(proc, process);
    setTimeout(wireExitHandlers, 100, logger, p, 1);
  }

  return logger;
};
