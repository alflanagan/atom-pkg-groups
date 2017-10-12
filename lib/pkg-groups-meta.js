/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-meta')
logger.level = 'debug'

/**
 * A list of package groups, plus a state (enabled/disabled) for each group.
 *   Currently calling this a 'configuration' in the user docs, as that term
 *   seems more understandable to me.
 */
export default class PkgGroupsMeta {
  // currently we don't store groups/meta-groups in a meta-group, just the names
  // of the groups. This is simpler (?) but requires that operations that walk
  // the tree of included metas can't be put here, must be in PkgGroupsModel.

  /**
   * Create a meta-group instance.
   * @param {string|Object} nameOrSerialized - package name, or JSON string, or
   *   serialized Object. If `stateMap` is non-null, this will be the name of
   *   the package, otherwise it is assumed to be a serialized object or the
   *   JSON string for such an object.
   * @param {string} nameOrSerialized.name - name of this meta-group
   * @param {string} nameOrSerialized.type - type of group (always `meta`)
   * @param {Map<string, string>} nameOrSerialized.states - map from each group
   *   name to a state (either 'enabled' or 'disabled')
   * @param {?Map<string, string>} stateMap - a Map from each group name to a
   *   state (either 'enabled' or 'disabled')
   */
  constructor (nameOrSerialized, stateMap) {
    if (nameOrSerialized == null) {
      throw new Error('PkgGroupsMeta must have a name')
    }
    let initData = {}
    if (stateMap == null) {
      if (typeof nameOrSerialized === 'string') {
        initData = JSON.parse(nameOrSerialized)
      } else {
        initData = nameOrSerialized
      }
      if (initData['name'] == null) {
        throw new Error('PkgGroupsMeta must have a name')
      }
      if (initData['type'] !== 'meta') {
        throw new Error(`PkgGroupsMeta cannot be created from record type ${initData['type']}`)
      }
      this._name = initData['name']
      this._states = new Immutable.Map(initData['states'])
    } else {
      this._name = nameOrSerialized
      this._states = new Immutable.Map(stateMap)
    }
  }

  /**
   * Get a serializable object representing the current state.
   * @returns {{type: 'meta', name: string, states: Map<string, string>,
   *   deserializer: 'PkgGroupsMeta'}}
   */
  serialize () {
    return {type: 'meta', name: this._name, states: this._states.toObject(), deserializer: 'PkgGroupsMeta'}
  }

  /**
   * Is `aGroup` a member of this meta-group?
   * @param {string|PkgGroupsMeta|PkgGroupsGroup} aGroup - group to search for
   *   __NOTE__ does not do deep compare of objects.
   * @return {boolean}
   */
  has (aGroup) {
    return this._states.has(aGroup)
  }

  /**
   * Get the state of the group with name `groupName` in this meta-group.
   * @param {string} groupName
   * @return {string|undefined} - `'enabled'`, `'disabled'`, or `undefined` (not present)
   */
  stateOf (groupName) {
    return this._states.get(groupName)
  }

  /**
   * Name of this group. Must be unique in the model.
   * @type {string}
   */
  get name () {
    return this._name
  }

  /**
   * Find state for all packages in groups referenced by this meta-group.
   * @return {Map<string,string>} a mapping from package names to state
   *   ('enabled' or 'disabled') as determined by this meta-group.
   */
  packagesWithState () {
    /** map from package name ==> 'enabled' | 'disabled' */
    let states = {}
    for (let [group, gState] in this._states) {
      for (let [pkg, pState] in group.packagesWithState(gState)) {
        if (states[pkg] !== 'disabled') {
          states[pkg] = pState
        }
      }
    }
    return new Immutable.Map(states)
  }

  /**
   * Iterator for groups or metas included in this meta. Does not include in the
   *   list groups referenced indirectly by a meta which is included.
   * @type {Immutable.Iterator}
   */
  get groups () {
    return this._states.keys()
  }
}
