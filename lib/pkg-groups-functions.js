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
 * @returns {string} The modified string.
 */
export function addIfMissing (source, newStuff, sep = '') {
  if (!source.includes(newStuff)) {
    return `${source}${sep}${newStuff}`
  }
  return source
}
