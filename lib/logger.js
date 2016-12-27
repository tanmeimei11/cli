'use strict'

const chalk = require('chalk')
const format = require('util').format
const version = require('../package.json').version

/**
 * Prefix.
 */

const prefix = `[in-cli@${version}]`
const sep = chalk.gray('·')

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

exports.log = function () {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

exports.fatal = function (message) {
  if (message instanceof Error) {
  	message = message.message.trim()
  }

  let msg = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, msg)
  
  process.exit(1)
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

exports.success = function () {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}
