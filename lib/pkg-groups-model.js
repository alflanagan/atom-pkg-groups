/** @babel */

import Immutable from 'immutable'

/**
 * A model to describe defined groups.
 * A group is
 */
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
  }  // constructor

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
