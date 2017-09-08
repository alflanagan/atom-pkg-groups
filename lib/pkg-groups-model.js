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
  constructor (nameOrSerialized, pkgs) {
    if (typeof nameOrSerialized === 'undefined') {
      throw Error('a group must have a name')
    }
    /** a list of packages that comprise the group */
    if (pkgs === undefined) {
      const initData = JSON.parse(nameOrSerialized)
      this._name = initData['name']
      this._packages = new Immutable.Set(initData['packages'])
    } else {
      this._name = nameOrSerialized
      if (!(pkgs instanceof Immutable.Set)) {
        this._packages = new Immutable.Set(pkgs) // attempt conversion
      } else {
        this._packages = pkgs
      }
    }
  }

  toJSON () {
    let data = {}
    data['type'] = 'group'
    data['name'] = this._name
    data['packages'] = this._packages.toArray()
    return JSON.stringify(data)
  }

  get name () {
    return this._name
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
      if (typeof initData['name'] === 'undefined') {
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

  toJSON () {
    return JSON.stringify({
      'name': this._name,
      'type': 'meta',
      'states': this._states.toObject()})
  }

  /**
   * Return true if `aGroup` is a member of this meta group, directly or
   * indirectly.
   * @param (string, PkgGroupsMeta, PkgGroupsGroup) aGroup a group to find
   */
  has (aGroup) {
    return this._states.has(aGroup)
  }

  stateOf (groupName) {
    return this._states.get(groupName)
  }

  get name () {
    return this._name
  }

  get groups () {
    return this._states.keys()
  }

  get states () {
    return this._states
  }
}

export default class PkgGroupsModel {
  constructor (serialized) {
    let initData = {}
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

    for (let groupName in initData) {
      let thisGroup = initData[groupName]
      if (thisGroup['type'] === 'group') {
        this.groups[groupName] = new PkgGroupsGroup(thisGroup['name'], thisGroup['packages'])
      } else if (thisGroup['type'] === 'meta') {
        this.metas[groupName] = new PkgGroupsMeta(thisGroup['name'], thisGroup['states'])
      } else {
        throw new Error('Invalid "type" value in serialized data ' + thisGroup['type'])
      }
    }
    this.groups = new Immutable.Map(this.groups)
    this.metas = new Immutable.Map(this.metas)
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
      return this.groups.get(groupName)
    } else {
      return this.metas.get(groupName)
    }
  }
}
