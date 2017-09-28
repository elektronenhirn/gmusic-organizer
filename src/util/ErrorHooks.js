'use strict';

const logger = require('./Logger.js');

process.on('uncaughtException', function (err) {
  logger.error('uncaught Exception: ' + err);
  logger.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', function (err) {
  logger.error('unhandled Promise rejection: ' + err);
  logger.error(err.stack);
  process.exit(1);
});

process.stderr.write = logger.stderr;

