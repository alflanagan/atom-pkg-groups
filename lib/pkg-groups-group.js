/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-group')

logger.level = 'debug'

export default class PkgGroupsGroup {
  /**
   * Create a new PkgGroupsGroup object. Parameters are either:
   * nameOrSerialized -- the package name (string)
   * pkgs - An iterable of package names
   * OR a serialized object like
   * { type: must === 'group',
   *   name: a string,
   *   packages: an array of package names (strings)
   * }
   * OR a string which contains a JSON represntation of the above object.
   * @param {string|Object} nameOrSerialized
   * @param {iterable<string>} pkgs
   */
  constructor (nameOrSerialized, pkgs) {
    if (!nameOrSerialized) {
      throw Error('a group must have a name')
    }
    if (pkgs == null) {
      let initData = nameOrSerialized
      if (typeof nameOrSerialized === 'string') {
        initData = JSON.parse(nameOrSerialized)
      }
      /** unique (?) name for group */
      this._name = initData['name']
      /** The set of package names contained in this group */
      this.packages = new Immutable.Set(initData['packages'])
    } else {
      this._name = nameOrSerialized
      this.packages = pkgs instanceof Immutable.Set ? pkgs : new Immutable.Set(pkgs)
    }
  }

  /**
   * Returns an Object with these fields:
   * name (string)
   * type (always 'group')
   * packages (arry of string)
   * deserializer: 'PkgGroupsGroup' since constructor accepts this Ojbect
   * @returns {Object}
   */
  serialize () {
    return {type: 'group', name: this._name, packages: this.packages.toArray(), deserializer: 'PkgGroupsGroup'}
  }

  /** @returns {string} */
  get name () {
    return this._name
  }

  /** Return `true` if `pkg` is in this group
   * @param {string} pkg -- package name
   */
  has (pkg) {
    return this.packages.has(pkg)
  }

  /**
   * Convenience function: return object whose keys are package names and values
   * are the state provided
   */
  packagesWithState (state) {
    let states = {}
    this.packages.reduce((accum, value) => {
      accum[value] = state
      return accum
    }, states)
  }

  /**
   * Returns the number of packages in this group.
   */
  get size () {
    return this.packages.size
  }

  /**
   * Calls callbackFn with this value of thisArg for each package in this group.
   * The sole parameter for callbackFn is the package name.
   */
  forEach (callbackFn, thisArg) {
    this.packages.forEach(callbackFn, thisArg)
  }
}
