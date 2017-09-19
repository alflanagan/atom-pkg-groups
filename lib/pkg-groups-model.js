/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'
import PkgGroupsGroup from './pkg-groups-group'
import PkgGroupsMeta from './pkg-groups-meta'

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
    if (initData.hasOwnProperty('enabled')) {
      for (let groupName of initData['enabled']) {
        this.enabled.push(groupName)
      }
    }
    if (initData.hasOwnProperty('disabled')) {
      for (let groupName of initData['disabled']) {
        this.disabled.push(groupName)
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
    /* eslint no-unused-vars: 0 */
    let groups = []
    let metas = []
    let enabled = this.enabled.toArray()
    let disabled = this.disabled.toArray()
    let deserializer = 'PkgGroupsModel'
    for (let [_, group] of this.groups) {
      groups.push(group.serialize())
    }
    for (let [_, meta] of this.metas) {
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
   * in the model. Returns a Map with these fields:
   * enabled -- packages which are enabled in Atom but not the model
   * disabled -- packages which are enabled in the model but not in Atom
   * missing -- packages in the model which are not installed in Atom
   */
  differences (includeBundled) {
    if (includeBundled !== true) {
      includeBundled = false
    }
    const expectedStates = this.packageStates
    let actualStates = {}
    for (let pkgName of atom.packages.getAvailablePackageNames()) {
      if (includeBundled || !atom.packages.isBundledPackage(pkgName)) {
        actualStates[pkgName] = atom.packages.isPackageDisabled(pkgName) ? 'disabled' : 'enabled'
      }
    }
    let enabled = []
    let disabled = []
    let missing = []
    for (let [pkgName, state] of expectedStates) {
      if (!actualStates.has(pkgName)) {
        missing.push(pkgName)
      } else if (state === 'enabled') {
        if (actualStates[pkgName] === 'disabled') {
          disabled.push(pkgName)
        } else {
          if (actualStates[pkgName] === 'enabled') {
            enabled.push(pkgName)
          }
        }
      }
    }
    enabled = Immutable.Set(enabled)
    disabled = Immutable.Set(disabled)
    missing = Immutable.Set(missing)
    return Immutable.Map({enabled, disabled, missing})
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
    for (let groupName of meta.groups) {
      if (this.groups.has(groupName)) {
        groups.push(groupName)
      } else {
        if (this.metas.has(groupName)) {
          let subGroups = this.groupsForMeta(this.metas.get(groupName)).toJS()
          groups.push(...subGroups)
        }
      }
    }
    return new Immutable.Set(groups)
  }

  /**
   * given a group name and a PkgGroupsMeta object, searches tree of metas to
   * find a state for that group
   */
  getStateFromMetas (groupName, meta) {
    if (!(meta instanceof PkgGroupsMeta)) {
      throw Error('getStateFromMetas must be given a meta object')
    }
    let state = meta.stateOf(groupName)
    if (typeof state === 'string') {
      return state
    } else {
      for (let metaName of meta.groups) {
        if (this.metas.has(metaName)) {
          return this.getStateFromMetas(groupName, this.metas.get(metaName))
        }
      }
    }
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
    for (let [key, value] of this.metas) {
      let state = this.getStateFromMetas(groupName, value)
      if (typeof state === 'string') {
        return state
      }
    }
  }

  /**
   * A map from package name ==> 'enabled'|'disabled' for each
   * package referenced by this model.
   */
  get packageStates () {
    let states = new Immutable.Map()
    states = states.withMutations(map => {
      for (let [groupName, group] of this.groups) {
        if (this.disabled.has(groupName)) {
          map.set(groupName, 'disabled')
        } else if (this.enabled.has(groupName)) {
          map.set(groupName, 'enabled')
        }
      }
      for (let [name, meta] of this.metas) {
        if (this.disabled.has(name)) {
          for (let groupName of this.groupsForMeta(meta)) {
            map.set(groupName, 'disabled')
          }
        } else if (this.enabled.has(name)) {
          for (let groupName of this.groupsForMeta(meta)) {
            map.set(groupName, this.groupState(groupName))
          }
        }
      }
    })
    return states
  }
}
