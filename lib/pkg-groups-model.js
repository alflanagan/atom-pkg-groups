/** @babel */

import Immutable from 'immutable'
import log4js from 'log4js'
import { Emitter } from 'atom'
import { AddGroupEvent, DeleteGroupEvent, ChangeGroupEvent } from './pkg-groups-events'
import PkgGroupsGroup from './pkg-groups-group'
import PkgGroupsMeta from './pkg-groups-meta'

const logger = log4js.getLogger('pkg-groups-model')
logger.level = 'info'

/**
 * ## Overview
 * Model for pkg-groups
 *
 * We have one or more groups of packages. The 'everything' group always exists
 *   and is a virtual group consisting of all installed packages.
 *
 * For other groups:
 *
 * * a 'group' is a list of packages, or a list of groups (called a meta-group)
 * * group state is set by meta-groups
 * * groups can be 'enabled', 'disabled', or neither
 * * 'enabled' groups have all packages enabled
 * * 'disabled' groups have all packages disabled
 * * conflicts are possible -- in general a 'disabled' setting overrides all
 *   'enabled' settings.
 *
 * The current state consists of a set of groups, and the state of each. We'll
 *   want to be able to serialize the current state.
 *
 * ## Notes
 *
 * For purposes of this documentation, objects typed as Map may actually be
 *   Immutable.Map, and objects typed Set may actually be Immutable.Set. A
 *   type like string[] actually means "an iterable returning strings", not
 *   necessarily an Array.
 *
 * @see https://facebook.github.io/immutable-js/docs/#/Map
 * @see https://facebook.github.io/immutable-js/docs/#/Set
 *
 */
export default class PkgGroupsModel {
  /**
   * Create a new PkgGroupsModel. A model contains groups, meta-groups, and a
   *   state ('enabled' or 'disabled') for each.
   * @param {Object|string} serialized - an object with these properties, or the
   *   equivalent JSON
   * @param {Array<PkgGroupsGroup>} serialized.groups - defined groups of packages
   * @param {Array<PkgGroupsMeta>} serialized.metas - defined meta-groups, groups +
   *   status
   * @param {Array<string>} serialized.enabled - the group/meta names to be enabled
   * @param {Array<string>} serialized.disabled - the group/meta names to be disabled
   */
  constructor (serialized) {
    let initData = { // empty default
      groups: [],
      metas: [],
      enabled: [],
      disabled: []
    }
    if (serialized) {
      if (typeof serialized === 'string') {
        initData = JSON.parse(serialized)
      } else if (typeof serialized === 'object') {
        initData = serialized
      } else {
        throw new TypeError(`PkgGroupsModel can't initialize from type ${typeof serialized}`)
      }
    }
    /**
     * packages to enable/disable
     * @type {Map<string, PkgGroupsGroup>}
     */
    this.groups = {}
    /**
     * list of meta-groups to enable-disable.
     * @type {Map<string, PkgGroupsMeta>}
     */
    this.metas = {}
    /**
      * groups or metas which are currently enabled
      * @type {Array<string>} - list of group/meta names
      */
    this.enabled = []
    /**
     * groups or metas currently disabled
     * @type {Array<string>} - list of group/meta names
     */
    this.disabled = []
    initData['groups'].forEach((group) => {
      this.groups[group.name] = new PkgGroupsGroup(group)
    })
    initData['metas'].forEach((meta) => {
      this.metas[meta.name] = new PkgGroupsMeta(meta)
    })
    if (initData['enabled']) {
      this.enabled.push(...initData['enabled'])
    }
    if (initData['disabled']) {
      this.disabled.push(...initData['disabled'])
    }
    this.groups = new Immutable.Map(this.groups)
    this.metas = new Immutable.Map(this.metas)
    this.enabled = new Immutable.Set(this.enabled)
    this.disabled = new Immutable.Set(this.disabled)
    this._emitter = new Emitter()
  } // constructor

  /**
   * Serialize to an object with only primitive values.
   * @return {{groups: Array<Object>, metas: Array<Object>, enabled: Array<string>, disabled: Array<string>, deserializer: 'PkgGroupsModel'}}
   */
  serialize () {
    /* eslint no-unused-vars: 0 */
    let groups = []
    let metas = []
    this.groups.forEach((group) => groups.push(group.serialize()))
    this.metas.forEach((meta) => metas.push(meta.serialize()))
    let enabled = this.enabled.toArray()
    let disabled = this.disabled.toArray()
    let deserializer = 'PkgGroupsModel'
    return {groups,
      metas,
      enabled,
      disabled,
      deserializer}
  }

  /**
   * Is a meta-group in this model?
   * @param {string} groupName - name to search for
   * @return {Boolean}
   */
  isMeta (groupName) {
    return this.metas.has(groupName)
  }

  /**
   * Is a group in this model?
   * @param {string} groupName - name to search for
   * @return {Boolean}
   */
  isGroup (groupName) {
    return this.groups.has(groupName)
  }

  /**
   * Names of the package groups known to this model
   * @type {string[]}
   */
  get groupNames () {
    return this.groups.keySeq()
  }

  /**
   * Names of the meta-groups known to this model
   * @type {string[]}
   */
  get metaNames () {
    return this.metas.keySeq()
  }

  /**
   * Find a group or meta by name.
   * @param {string} groupName - name to search for.
   * @return {?PkgGroupsMeta|PkgGroupsGroup} - group found.
   */
  group (groupName) {
    return this.groups.get(groupName) || this.metas.get(groupName)
  }

  /**
   * Finds differences between the actual state of packages installed and the
   *   package states defined in the model. Packages in Atom but not in the model are ignored.
   *
   * | Keys in returned Map |
   * | --- | --- |
   * | **enabled** | packages enabled in Atom but disabled in model |
   * | **disabled** | packages disabled in Atom but enabled in model |
   * | **missing** | packages listed in model but not installed in Atom |
   *
   * @param {Boolean} includeBundled - `true` to include bundled packages in the
   *   list of packages checked.
   * @returns {Map<string, string[]>} - all differences between actual
   *   state and model state.
   */
  differences (includeBundled) {
    const expectedStates = this.packageStates
    let actualStates = {}
    let enabled = []
    let disabled = []
    let pkgsFound = []

    for (let pkgName of atom.packages.getAvailablePackageNames()) {
      if (includeBundled || !atom.packages.isBundledPackage(pkgName)) {
        actualStates[pkgName] = atom.packages.isPackageDisabled(pkgName) ? 'disabled' : 'enabled'
      }
    }

    for (const pkgName in actualStates) {
      pkgsFound.push(pkgName)
    }
    pkgsFound = new Immutable.Set(pkgsFound)
    const missing = new Immutable.Set(expectedStates.keySeq()).subtract(pkgsFound)
    logger.debug(missing)
    for (let [pkgName, state] of expectedStates) {
      if (state === 'enabled' && actualStates[pkgName] === 'disabled') {
        disabled.push(pkgName)
      } else if (state === 'disabled' && actualStates[pkgName] === 'enabled') {
        enabled.push(pkgName)
      }
    }
    enabled = new Immutable.Set(enabled)
    disabled = new Immutable.Set(disabled)
    return Immutable.Map({enabled, disabled, missing})
  }

  /**
   * All the groups included in the meta group,
   * directly or indirectly.
   * @param {string} meta - the name of a meta group
   * @return {Set<string>} - a Set of group names
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
   * @param {string} groupName - the name of a group to search for
   * @param {PkgGroupsMeta} meta - a meta-group to search
   * @return {?string} - the state of the group
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
   * Find the state of a group.
   *
   * The state is 'enabled', 'disabled', or undefined.
   * If a group is marked both enabled and disabled, returns 'disabled'.
   * @return {?string} state of group `groupName`
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
   * A map of package name ==> state for all packages referenced by this model.
   * @type {Map<string, string>}
   */
  get packageStates () {
    let states = {}
    for (const [groupName, group] of this.groups) {
      if (this.disabled.has(groupName)) {
        for (const pkgName of group.packages) {
          states[pkgName] = 'disabled'
        }
      } else if (this.enabled.has(groupName)) {
        for (const pkgName of group.packages) {
          states[groupName] = 'enabled'
        }
      }
    }
    for (const [name, meta] of this.metas) {
      if (this.disabled.has(name)) {
        for (const groupName of this.groupsForMeta(meta)) {
          for (const pkgName of this.groups.get(groupName).packages) {
            states[pkgName] = 'disabled'
          }
        }
      } else if (this.enabled.has(name)) {
        for (const groupName of this.groupsForMeta(meta)) {
          for (const pkgName of this.groups.get(groupName).packages) {
            // don't enable if already marked 'disabled'
            states[pkgName] = states[pkgName] || 'enabled'
          }
        }
      }
    }
    return new Immutable.Map(states)
  }

  /**
   * Add a group to the model.
   * @param {string} groupName - name of group to be added. Must not be the name of any group already in model.
   * @param {Set<string>} memberIter - list of packages that are members of the group.
   * @emits {AddGroupEvent} if successful
   */
  addGroup (groupName, memberIter) {
    if (this.groups.has(groupName)) {
      throw Error(`A group named ${groupName} already exists.`)
    }
    if (memberIter instanceof Immutable.Set) {
      this.groups = this.groups.set(groupName, memberIter)
    } else {
      this.groups = this.groups.set(groupName, new Immutable.Set(memberIter))
    }
    this._emitter.emit(AddGroupEvent.tag, new AddGroupEvent(groupName, 'group'))
  }

  /**
   * Add a meta-group to the model.
   * @param {string} metaName the name of the new group.
   * @param {string[]} memberIter list of members of the group.
   * @emits {AddGroupEvent} if successful
   */
  addMeta (metaName, memberIter) {
    if (this.metas.has(metaName)) {
      throw Error(`A meta-group named ${metaName} already exists.`)
    }
    // TODO: add check that all groups in memberIter exist?
    if (memberIter instanceof Immutable.Set) {
      this.metas = this.metas.set(metaName, memberIter)
    } else {
      this.metas = this.groups.set(metaName, new Immutable.Set(memberIter))
    }
    this._emitter.emit(AddGroupEvent.tag, new AddGroupEvent(metaName, 'meta'))
  }

  /**
   * Add a handler function for event on-add-group
   * @param {Function} callback - handler to be called
   * @listens {AddGroupEvent}
   */
  onAddGroup (callback) {
    this._emitter.on(AddGroupEvent.tag, callback)
  }

  /**
   * Add a handler function for DeleteGroupEvent
   * @param {Function} callback - handler to be called
   * @listens {DeleteGroupEvent}
   */
  onDeleteGroup (callback) {
    this._emitter.on(DeleteGroupEvent.tag, callback)
  }

  /**
   * Add a handler function for event ChangeGroupEvent
   * @param {Function} callback - handler to be called
   * @listens {ChangeGroupEvent}
   */
  onChangeGroup (callback) {
    this._emitter.on(ChangeGroupEvent.tag, callback)
  }
} // PkgGroupsModel
