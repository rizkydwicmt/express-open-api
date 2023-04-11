const winston = require('winston')
require('winston-daily-rotate-file')
const path = require('path')
const fs = require('fs')
const datetime = require('./datetime')

const logDir = 'logs'

const PROJECT_ROOT = path.join(__dirname, '..')

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-log.log`,
  datePattern: 'YYYY-MM-DD',
})

function getStackInfo(stackIndex) {
  const stacklist = new Error().stack.split('\n').slice(3)

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  const s = stacklist[stackIndex] || stacklist[0]
  const sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n'),
    }
  }

  return null
}

const logger = winston.createLogger({
  level: 'debug',
  defaultMeta: { service: 'callback-vms' },
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      let msg = info.message ? info.message : info.code
      if (typeof msg === 'object') {
        msg = JSON.stringify(info.message ? info.message : info.code, null, 4)
      }
      return `${datetime.now(true)} [${info.level}]: ${msg}`
    })
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf((info) => {
          let msg = info.message ? info.message : info.code
          if (typeof msg === 'object') {
            msg = JSON.stringify(info.message ? info.message : info.code, null, 4)
          }
          return `${datetime.now(true)} [${info.level}]: ${msg}`
        })
      ),
    }),
    dailyRotateFileTransport,
  ],
})

module.exports = {
  debug: logger.debug.bind(logger),
  verbose: logger.verbose.bind(logger),
  http: logger.http.bind(logger),
  info: logger.info.bind(logger),
  warn: (args) => {
    logger.warn(args)

    const stackInfo = getStackInfo(0)
    if (stackInfo) {
      logger.warn(`    ${stackInfo.relativePath}:${stackInfo.line}`)
    }
  },
  error: (args) => {
    logger.error(args)

    const stackInfo = getStackInfo(0)
    if (stackInfo) {
      logger.error(`    ${stackInfo.relativePath}:${stackInfo.line}`)
    }
  },
}
