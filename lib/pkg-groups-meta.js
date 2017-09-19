/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-meta')
logger.level = 'debug'

export default class PkgGroupsMeta {
  /* currently we don't store groups/meta-groups in a meta-group, just the names of the
     groups. This is simpler (?) but requires that operations that walk the
     tree of included metas can't be put here, must be in PkgGroupsModel.
     */

  /**
   * Expects a name (string) for the meta group, and a map of
   * group name ==> 'enabled' || 'disabled'
   * OR a serialized object like { name (string)
   *                               type (must === 'meta')
   *                               states (a map from name ==> state, where
   *                                       state is either 'enabled' or 'disabled') }
   * OR a JSON string which parses into the above object.
   */
  constructor (nameOrSerialized, stateMap) {
    if (typeof nameOrSerialized === 'undefined') {
      throw new Error('PkgGroupsMeta must have a name')
    }
    let initData = {}
    if (typeof stateMap === 'undefined') {
      if (typeof nameOrSerialized === 'string') {
        initData = JSON.parse(nameOrSerialized)
      } else {
        initData = nameOrSerialized
      }
      if (!initData.hasOwnProperty('name') || typeof initData['name'] === 'undefined') {
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
   * Return object with the following fields:
   * type: will always be 'meta'
   * name: this group's name
   * states: an object mapping the name of each included group to its states
   * deserializer: 'PkgGroupsMeta' since our constructor accepts this object.
   */
  serialize () {
    return {'type': 'meta', 'name': this._name, 'states': this._states.toObject(), 'deserializer': 'PkgGroupsMeta'}
  }

  /**
   * Return true if `aGroup` is a member of this meta group. Can only check
   * directly specified groups, you'll have to use 'PkgGroupsModel' if you need
   * to also check for groups included by a meta referenced by this meta.
   * @param (string, PkgGroupsMeta, PkgGroupsGroup) aGroup a group to find
   */
  has (aGroup) {
    return this._states.has(aGroup)
  }

  /** Returns the state of group with name groupName in this meta:
   * 'enabled', 'disabled', or undefined.
   */
  stateOf (groupName) {
    return this._states.get(groupName)
  }

  /** Name of this group. Must be unique in the model. */
  get name () {
    return this._name
  }

  /**
   * Returns a Map with keys of all package names determined by this meta-group,
   * and values of the state set for the package by this meta ('enabled' or
   * 'disabled')
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
   * list groups referenced indirectly by a meta which is included.
   */
  get groups () {
    return this._states.keys()
  }
}
