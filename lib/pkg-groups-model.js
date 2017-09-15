/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-model')

logger.level = 'debug'
/**
 *  Model for pkg-groups
 *
 * We have one or more groups of packages. The 'everything' group always exists
 * and is a virtual group consisting of all installed packages.
 * For other groups:
 *  * a 'group' is a list of packages, or a list of groups
 *  * groups can be 'enabled', 'disabled', or neither
 *  * 'enabled' groups have all packages enabled
 *  * 'disabled' groups have all packages disabled
 *  * conflicts are possible -- how do we resolve??
 *
 * The current state consists of a set of groups, and the state of each. We'll
 * want to be able to serialize the current state.
 *
 * If we make the various lists immutable it solves a lot of synch problems. But
 * we'll need event notifications for changing a group.
 */

export class PkgGroupsGroup {
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
   */
  constructor (nameOrSerialized, pkgs) {
    if (typeof nameOrSerialized === 'undefined') {
      throw Error('a group must have a name')
    }
    /** a list of packages that comprise the group */
    if (typeof pkgs === 'undefined') {
      let initData = nameOrSerialized
      if (typeof nameOrSerialized === 'string') {
        initData = JSON.parse(nameOrSerialized)
      }
      this._name = initData['name']
      this._packages = new Immutable.Set(initData['packages'])
    } else {
      this._name = nameOrSerialized
      if (!(pkgs instanceof Immutable.Set)) {
        this._packages = new Immutable.Set(pkgs)
      } else {
        this._packages = pkgs // (very?) minor optimization
      }
    }
  }

  /**
   * Returns an Object with these fields:
   * name (string)
   * type (always 'group')
   * packages (arry of string)
   * deserializer: 'PkgGroupsGroup' since constructor accepts this Ojbect
   */
  serialize () {
    return {'type': 'group', 'name': this._name, 'packages': this._packages.toArray(), 'deserializer': 'PkgGroupsGroup'}
  }

  get name () {
    return this._name
  }

  /** Return `true` if pkg is the name of a package in this group */
  has (pkg) {
    return this._packages.has(pkg)
  }

  /** The set of package names contained in this group */
  get packages () {
    return this._packages
  }

  /**
   * Returns the number of packages in this group.
   */
  get size () {
    return this._packages.size
  }

  /**
   * Calls callbackFn with this value of thisArg for each package in this group.
   * The sole parameter for callbackFn is the package name.
   */
  forEach (callbackFn, thisArg) {
    this._packages.forEach(callbackFn, thisArg)
  }
}

export class PkgGroupsMeta {
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
   * Iterator for groups or metas included in this meta. Does not include in the
   * list groups referenced indirectly by a meta which is included.
   */
  get groups () {
    return this._states.keys()
  }
}

export default class PkgGroupsModel {
  /**
   * Create a new PkgGroupsModel. A model contains groups, meta-groups, and
   * a state ('enabled' or 'disabled') for each.
   * `serialized` may be an object like this: {
   * groups => PkgGroupsGroup objects
   * metas => PkgGroupMeta objects
   * enabled => a list of the group/meta names to be enabled
   * disabled => a list of the group/meta names to be disabled
   * }
   * OR a JSON string which parses into an object with that structure
   */
  constructor (serialized) {
    let initData = {
      groups: [],
      metas: [],
      enabled: [],
      disabled: []
    }
    if (serialized !== undefined) {
      if (typeof serialized === 'string') {
        initData = JSON.parse(serialized)
      } else if (typeof serialized === 'object') {
        initData = serialized
      } else {
        throw new TypeError('PkgGroupsModel can\'t initialize from type ' + typeof serialized)
      }
    }
    /** lists of packages to enable/disable */
    this.groups = {}
    /** lists of groups to treat like a group */
    this.metas = {}
    /** groups or metas which are currently enabled */
    this.enabled = []
    /** groups or metas currently disabled */
    this.disabled = []
    if (typeof initData['groups'] !== 'undefined') {
      for (let groupData of initData['groups']) {
        let group = new PkgGroupsGroup(groupData)
        this.groups[group.name] = group
      }
    }
    if (typeof initData['metas'] !== 'undefined') {
      for (let metaData of initData['metas']) {
        let meta = new PkgGroupsMeta(metaData)
        this.metas[meta.name] = meta
      }
    }
    this.groups = new Immutable.Map(this.groups)
    this.metas = new Immutable.Map(this.metas)
    this.enabled = new Immutable.Set(this.enabled)
    this.disabled = new Immutable.Set(this.disabled)
  } // constructor

  /**
   * Serialize to an object with only primitive values
   */
  serialize () {
    let groups = []
    let metas = []
    let enabled = this.enabled.toArray()
    let disabled = this.disabled.toArray()
    let deserializer = 'PkgGroupsModel'
    for (let group in this.groups) {
      groups.push(group.serialize())
    }
    for (let meta in this.metas) {
      metas.push(meta.serialize())
    }
    return {groups,
      metas,
      enabled,
      disabled,
      deserializer}
  }

  isMeta (groupName) {
    return this.metas.has(groupName)
  }

  isGroup (groupName) {
    return this.groups.has(groupName)
  }

  /** Names of the package groups known to this model */
  get groupNames () {
    return this.groups.keySeq()
  }

  /** Names of the meta-groups known to this model */
  get metaNames () {
    return this.metas.keySeq()
  }

  /**
   * Returns the group, whether a group or a meta, with the name `groupName`.
   * returns ``undefined`` if group not found.
   */
  group (groupName) {
    if (this.groups.has(groupName)) {
      return this.groups.get(groupName)
    } else {
      return this.metas.get(groupName)
    }
  }

  /**
   * Compares the actual state of packages installed to the packages defined
   * in the model. Returns an object with these fields:
   * enabled -- packages which are enabled in Atom but not the model
   * disabled -- packages which are enabled in the model but not in Atom
   * missing -- packages in the model which are not installed in Atom
   */
  get differences () {
    /* get list of groups whose state is set by the model (need to recursively
      * traverse metas).
      * get list of packages in those groups with the desired state (packages
      * marked both enabled and disabled will be treated as disabled)
      * get list of packages in Atom, compare to previous list to see what's
      * missing.
      * get states for packages in list. if state differs from that determined
      * by model, add to appropriate list in return object.
      */
  }

  /**
   * Returns a Set of all the groups included in the meta group named `meta`,
   * directly or indirectly.
   */
  groupsForMeta (meta) {
    if (!(meta instanceof PkgGroupsMeta)) {
      throw Error('Expected PkgGroupsMeta object')
    }
    let groups = []
    for (let group in meta.groups) {
      if (this.groups.has(group)) {
        groups.push(group)
      } else {
        if (this.metas.has(group)) {
          groups.concat(this.groupsForMeta(group))
        }
      }
    }
    return new Immutable.Set(groups)
  }

  /**
   * return a list of all groups referenced in the model, include those
   * included indirectly by a meta.
   */
  get allGroups () {
    let allGroups = this.groups.slice()
    for (let meta of this.metas) {
      allGroups = allGroups.concat(this.groupsForMeta(meta))
    }
    return new Immutable.Set(allGroups)
  }

  /**
   * Returns 'enabled' if the group with name groupName is enabled in the model,
   * 'disabled' if it is disabled, and undefined if its state is not specified
   * by the model.
   * If a group is marked both enabled and disabled, returns 'disabled'.
   */
  groupState (groupName) {
    /* check direct includes first, for speed */
    if (this.disabled.has(groupName)) {
      return 'disabled'
    }
    if (this.enabled.has(groupName)) {
      return 'enabled'
    }
    for (let meta of this.metas) {
      if (this.disabled.has(meta)) {
        if (this.groupsForMeta(meta).has(groupName)) {
          /* whether it's marked for disabled or enabled, keep it disabled */
          return 'disabled'
        }
      }
      /* if a meta enables the group, return 'enabled' */
      if (this.enabled.has(meta)) {}
    }
  }
}
