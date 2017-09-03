/** @babel */

import Immutable from 'immutable'

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
  constructor (name, pkgs) {
    if (!name) {
      throw Error('a group must have a name')
    }
    this.name = name.toString()
    /** a list of packages that comprise the group */
    if (pkgs === undefined) {
      this._packages = new Immutable.Set()
    } else if (!(pkgs instanceof Immutable.Set)) {
      this._packages = new Immutable.Set(pkgs) // attempt conversion
    } else {
      this._packages = pkgs
    }
    /** a Boolean: true if package enabled, false if disabled, undefined
      * if neither
      */
    this.enabled = undefined
  }

  has (pkg) {
    return this._packages.has(pkg)
  }

  get packages () {
    return this._packages
  }

  clone (newName) {
    return new PkgGroupsGroup(newName, this._packages)
  }

  get size () {
    return this._packages.size
  }

  add (newPkg) {
    const newSet = this._packages.add(newPkg)
    return new PkgGroupsGroup(this.name, newSet)
  }

  delete (pkg) {
    const newSet = this._packages.delete(pkg)
    return new PkgGroupsGroup(this.name, newSet)
  }

  forEach (callbackFn, thisArg) {
    this._packages.forEach(callbackFn, thisArg)
  }
}

export class PkgGroupsMeta {
  constructor (name, groups, stateMap) {
    this.groups = new Immutable.Set(groups)
    this._name = name
    this.states = new Immutable.Map(stateMap)
  }

  /**
   * Return true if `aGroup` is a member of this meta group, directly or
   * indirectly.
   * @param (string, PkgGroupsMeta, PkgGroupsGroup) aGroup a group to find
   */
  has (aGroup) {
    if (typeof aGroup === 'string') {
      for (let member of this.groups) {
        if (member instanceof PkgGroupsGroup && member.name === aGroup) {
          return true
        } else {
          console.assert(member instanceof PkgGroupsMeta)
          if (member.has(aGroup)) {
            return true
          }
        }
      }
    } else {
      for (let member of this.groups) {
        if (member === aGroup) {
          return true
        } else if (member instanceof PkgGroupsMeta && member.has(aGroup)) {
          return true
        }
      }
    }
    return false
  }

  stateOf (groupName) {
    return this.states[groupName]
  }

  get names () {
    return this.groups.keys()
  }
}

export default class PkgGroupsModel {
  constructor (serialized) {
    let initData = {}
    if (serialized) {
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
    for (let groupName of initData) {
      let thisGroup = initData[groupName]
      if (thisGroup['type'] === 'group') {
        this.groups[groupName] = {
          enabled: new Immutable.Set(thisGroup['enabled']),
          disabled: new Immutable.Set(thisGroup['disabled'])
        }
      } else if (thisGroup['type'] === 'meta') {
        this.metas[groupName] = new Immutable.Set(thisGroup['groups'])
      } else {
        throw new Error('Invalid "type" value in serialized data ' + thisGroup['type'])
      }
    }
    this.groups = new Immutable.Map(this.groups)
    this.metas = new Immutable.Map(this.groups)
  } // constructor

  isMeta (groupName) {
    return this.metas.has(groupName)
  }

  isGroup (groupName) {
    return this.groups.has(groupName)
  }

  get groupNames () {
    return this.groups.keySeq()
  }

  get metaNames () {
    return this.metas.keySeq()
  }

  group (groupName) {
    if (this.groups.has(groupName)) {
      return this.groups[groupName]
    } else {
      return this.metas[groupName]
    }
  }
}
