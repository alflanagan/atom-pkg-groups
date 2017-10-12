/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-group')

logger.level = 'debug'

/**
 * An object representing a group of packages.
 */
export default class PkgGroupsGroup {
  /**
   * Create a new PkgGroupsGroup object.
   *
   * @param {string|Object} nameOrSerialized - Object or JSON representation
   * @param {string} nameOrSerialized.type - must be `"group"`
   * @param {string} nameOrSerialized.name - name of the group
   * @param {string[]} nameOrSerialized.packages - list of package names
   * @param {string[]|undefined} pkgs - list of package names. If present `nameOrSerialized` will be the group's name.
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
      /** The set of package names contained in this group
       * @type {Immutable.Set}
       */
      this.packages = new Immutable.Set(initData['packages'])
    } else {
      this._name = nameOrSerialized
      this.packages = pkgs instanceof Immutable.Set
        ? pkgs
        : new Immutable.Set(pkgs)
    }
  }

  /**
   * @returns {{name: string, type: 'group', packages: string[], deserializer: 'PkgGroupsGroup'}}
   * the JSON representation of this instance.
   */
  serialize () {
    return {type: 'group', name: this._name, packages: this.packages.toArray(), deserializer: 'PkgGroupsGroup'}
  }

  /** the unique name of the group
   * @type {string}
   */
  get name () {
    return this._name
  }

  /**
   * Is `pkg` a member of this group?
   * @param {string} pkg -- package name
   * @returns {boolean}
   */
  has (pkg) {
    return this.packages.has(pkg)
  }

  /**
   * Convenience function.
   * @param {string} state - a package state, such as 'enabled', 'disabled'
   * @returns {Object} - mapping from package names to `state`
   */
  packagesWithState (state) {
    let states = {}
    this.packages.reduce((accum, value) => {
      accum[value] = state
      return accum
    }, states)
  }

  /**
   * count of packages in this group
   * @type {number}
   */
  get size () {
    return this.packages.size
  }

  /**
   * Calls a function `sideEffect` for each package name in the group.
   * @param {function(value: string, key: string, iter: string[])} sideEffect - function which will will be called with
   * `value` === `key` === package name, `iter` === this.packages
   * @param {?Object} context - object which will be bound as `this` for calls to `sideEffect`
   * @returns {number} - count of calls to `sideEffect`
   */
  forEach (sideEffect, context) {
    return this.packages.forEach(sideEffect, context)
  }
}
