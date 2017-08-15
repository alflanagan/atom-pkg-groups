/** @babel */

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
        this.groups[groupName] = { enabled: new Set(), disabled: new Set() }
        let enabledSet = this.groups[groupName].enabled
        for (let i = 0; i < thisGroup['enabled']; i++) {
          enabledSet.add(thisGroup['enabled'][i])
        }
        let disabledSet = this.groups[groupName].disabled
        for (let i = 0; i < thisGroup['disabled']; i++) {
          disabledSet.add(thisGroup['disabled'][i])
        }
      } else if (thisGroup['type'] === 'meta') {
        this.metas[groupName] = new Set()
        for (let group of thisGroup['groups']) {
          this.metas[groupName].add(group)
        }
      } else {
        throw new Error('Invalid "type" value in serialized data ' + thisGroup['type'])
      }
    }
  }  // constructor

  * groupNames () {
    for (let gName of this.groups) {
      yield gName
    }
  }

  * metaNames () {
    for (let mName of this.metas) {
      yield mName
    }
  }

  * groupMembersEnable (groupName) {
    for (let member of this.groups.enabled) {
      yield member
    }
  }

  * groupMembersDisable (groupName) {
    for (let member of this.groups.disabled) {
      yield member
    }
  }

  * metaGroups (metaName) {
    for (let gName of this.metas[metaName]) {
      yield gName
    }
  }
}
