const { createLogger, format, transports, addColors } = require("winston");

const { combine, timestamp, prettyPrint, colorize, errors, simple } = format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
  // can set custom also
};
// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };

const logger = createLogger({
  levels: logLevels,
  format: format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    // new transports.Console(),
    // new (transports.Console)({ level: 'info' }),
    // new (transports.File)({ filename: '/var/log/log-file.log' })  // for absolute root path of local drive
    // note in windows it will create directory from windows C drive // that is from root drive
    // new (transports.File)({ filename: 'winston-logs.log' }) // for relative path
    //
    // new (transports.File)({
    //   level: 'info',
    //   filename: './logs/all-logs.log',
    //   handleExceptions: true,
    //   json: true,
    //   maxsize: 5242880, //5MB
    //   maxFiles: 5,
    //   colorize: false
    // }),
    // new (transports.Console)({
    //   level: 'debug',
    //   handleExceptions: true,
    //   json: false,
    //   colorize: true
    // })
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' }),
  ],
  exitOnError: false
});

addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
  trace: "green"
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//

const print = format.printf((info) => {
  const log = `${info.level}: ${info.message}`;

  return info.stack ? `${log}\n${info.stack}` : log;
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      level: "trace",
      // format: format.json(),
      // format: format.simple(),
      // format: format.combine(format.colorize(), format.simple()),
      format: format.combine(
        errors({ stack: true }), // <-- use errors format
        colorize(),
        // timestamp(),
        // prettyPrint(),
        simple(),
        print
      )
      // colorize: true,
      // timestamp: function () {
      //     return (new Date()).toLocaleTimeString();
      // },
      // prettyPrint: true
    })
  );
}

// logger.info("System launch"); // {"message":"System launch","level":"info"}
// logger.fatal("A critical failure!"); // {"message":"A critical failure!","level":"fatal"}
// // logger.fatal(["A critical failure!", "asd"]); // {"message":"A critical failure!","level":"fatal"}
// logger.debug("Ade critical failure!", () => { console.log(1) }); // {"message":"A critical failure!","level":"fatal"}
// logger.trace("Atra critical failure!"); // {"message":"A critical failure!","level":"fatal"}
// logger.log({
//   level: 'info',
//   message: 'Hello distributed log files!'
// });

// TEST CASE FOR CHECKING ERROR STACK IS PRINTING OR NOT
// const error = new Error('Ooops');
// logger.error(error);
// logger.error('An error occurred:', error);

module.exports = logger;

// https://github.com/winstonjs/winston/issues/1338
// https://stackoverflow.com/questions/47231677/how-to-log-full-stack-trace-with-winston-3
// https://stackoverflow.com/questions/48027266/winston-logger-nodejs-debug-console-logs-not-showing-in-vscode
// https://stackoverflow.com/questions/45539958/node-js-winston-logging-visual-studio-debug-console-not-print
// https://stackoverflow.com/questions/47133451/can-i-change-the-color-of-log-data-in-winston
// https://github.com/awslabs/aws-lambda-powertools-typescript/issues/926
// https://www.npmjs.com/package/winston
// http://tostring.it/2014/06/23/advanced-logging-with-nodejs/
// https://stackoverflow.com/questions/27906551/node-js-logging-use-morgan-and-winston
// https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html
// https://medium.com/google-cloud/whats-the-best-way-to-log-errors-in-node-js-b3dfd2fe07a7
// https://www.google.com/search?q=logger.error+nodejs&oq=logger.error+nodejs&aqs=chrome..69i57.3271j0j1&sourceid=chrome&ie=UTF-8

// https://unpkg.com/browse/mongoose-paginate-v2@1.3.15/README.md
// https://www.npmjs.com/package/mongoose-aggregate-paginate-v2
// https://engage.so/blog/a-deep-dive-into-offset-and-cursor-based-pagination-in-mongodb/
// https://unpkg.com/browse/mongoose-paginate-v2@1.3.15/README.md
