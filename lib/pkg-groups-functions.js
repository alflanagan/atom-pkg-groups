/** @babel */

import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-functions')
logger.level = 'debug'

/**
 * Add a string to another string, unless the string is already a substring.
 *
 * @param {string} source Any string
 * @param {string} newStuff A string to append to `source` only if it is not
 * already found in `source`.
 * @param {string} [sep=''] If `newStuff` is appended, this string will be appended
 * first.
 *
 * @return {string} The modified string. If `source` is undefined, returns `newStuff`.
 */
export function addIfMissing (source, newStuff, sep = '') {
  if (!(typeof source === 'string')) { return newStuff }
  if (!source.includes(newStuff)) {
    return `${source}${sep}${newStuff}`
  }
  return source
}

/**
 * Create a promise that resolves when an event fires. The resolve() Function
 * will be passed the event.
 *
 * @param {Function} eventRegisterFunction - a function that takes a function argument and registers it as a handler for the event.
 * @param {?Function} functionThatFires - A function (w/ no arguments) that should trigger the event when executed.
 *
 * @return {Promise} - A Promise that will resolve when the event fires, or reject after a timeout.
 */
export function promiseAnEvent (eventRegisterFunction, functionThatFires) {
  return new Promise((resolve, reject) => {
    eventRegisterFunction(evt => resolve(evt))
    functionThatFires && functionThatFires()
  })
}
