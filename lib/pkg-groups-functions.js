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

/**
 * Evaluates `condition`, if true returns the result of calling `trueFunc`, otherwise returns the result of calling `falseFunc`.
 * @param {Boolean} condition An expression resulting in a value that can be interpreted in a Boolean context
 * @param {Function(): any} trueFunc Function called if condition is true
 * @param {Function(): any} falseFunc Function called if condition is false
 * @return {any} A value returned by one of the two functions.
 */
export function ifElse (condition, trueFunc, falseFunc) {
  if (condition) {
    return trueFunc()
  }
  return falseFunc()
}

/**
 * Return a value selected by a series of conditionals.
 *
 * Arguments should be of the form `value`, `function`, `value`, `function`,
 *   `...` [`function`]. Each `value` will be checked in turn, if `value` is
 *   `true` the result of calling the next argument as a function will be
 *   returned. If no value is `true` and an additional function is found at the
 *   end of the list, that function is called (acts as an `else`). If no value
 *   is true and no extra function is present, throws an Error.
 *
 * # Examples:
 *
 * ```javascript
 * firstTrue(1==2, () => 'oops', 3==4, () => 'still wrong', 5==5, () => 'correct')
 * ```
 *
 * will return the string 'correct'.
 *
 * ```javascript
 * firstTrue(1==2, () => 'nope', () => 'correct')
 * ```
 *
 * will also return the string 'correct'.
 * @param {{Boolean|Function}[]} args a series of alternating values and
 *   functions, optionally followed by a single function.
 * @return {any} The result of a call to the selected function.
 * @throws Error if no value is `true` and there is no 'else' function
 */
// TODO: This needs a better name! LISP equiv. is called COND, but I'm not crazy about that either
export function firstTrue (...args) {
  for (let i = 0; i < args.length - 1; i += 2) {
    if (args[i]) {
      return args[i + 1]()
    }
  }
  if (args.length % 2 === 1) {
    /* odd # of args ==> this is the 'else' clause */
    return args[args.length - 1]()
  }
  throw Error(`firstTrue: all conditions were false, and no else value was found`)
}

export function isEmptyArray (value) {
  return (value instanceof Array && value.length === 0)
}

/**
 * Useful equality for `Array` type. May be more efficient than comparing iterators.
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Boolean} `true` if `arr1` and `arr2` are both arrays, have the same length, and `arr1[x] === arr2[x]` for every index x.
 */
export function arrayEqual (arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false
  }
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}
