/** @babel */

import path from 'path'
import log4js from 'log4js'

const logger = log4js.getLogger(path.basename(__filename, '.js'))

/**
 * Event classes -- basic objects for passing to event hanlders.
 */

/*
 * Model events -- emitted by model, received by controller.
 */
/** Event emitted by model when a group is added to the model. */
export class AddGroupEvent {
  /**
   * Create a new AddGroupEvent
   * @param {string} grpName - name of the new group
   * @param {string} grpType - either `'group'` or `'meta'`
   */
  constructor (grpName, grpType) {
    /**
     * name of group
     * @type {string}
     */
    this.name = grpName
    /**
     * type of group - 'group' or 'meta'
     * @type {string}
     */
    this.type = grpType
  }
}

AddGroupEvent.tag = 'on-add-group'

/** Event emitted by model when a group is deleted from the model */
export class DeleteGroupEvent {
  constructor (grpName, grpType) {
    /**
     * name of group
     * @type {string}
     */
    this.name = grpName
    /**
     * type of group - 'group' or 'meta'
     * @type {string}
     */
    this.type = grpType
  }
}

DeleteGroupEvent.tag = 'on-delete-group'

/** Event emitted by the model after a group has changed. */
export class ChangeGroupEvent {
  constructor (grpName, grpType, grpMembers) {
    /**
     * name of group
     * @type {string}
     */
    this.name = grpName
    /**
     * type of group - 'group' or 'meta'
     * @type {string}
     */
    this.type = grpType
    /**
     * members of group
     * @type {string[]}
     */
    this.members = grpMembers
  }
}

ChangeGroupEvent.tag = 'on-change-group'

/*
 * View events -- emitted by View, received by controller
 */

/** Event emitted by pick list when one of the "move" buttons is clicked */
export class PickListChangeEvent {
  constructor (direction, pkgName) {
    /**
     * The direction of the requested move - 'right' or 'left'
     * @type {string}
     */
    this.direction = direction
    /**
     * The name of the selected package at time of event
     * @type {string}
     */
    this.pkgName = pkgName
  }
}

PickListChangeEvent.tag = 'on-pick-list-change'
/*
 * at this time, don't think it's necessary to fire event when selected item of
 *   one of the lists changes.
 */

/** Event emitted when user changes which group is selected for update */
export class ViewGroupSelectChangeEvent {
  constructor (groupName, groupType, prevName) {
    /**
     * The name of the newly selected group.
     * @type {string}
     */
    this.name = groupName
    /**
     * Type of newly selected group -- 'group' or 'meta'
     * @type {string}
     */
    this.grpType = groupType
    /**
     * Name of previously selected group, if any
     * @type {?string}
     */
    this.prev = prevName
  }
}

ViewGroupSelectChangeEvent.tag = 'view-group-select-change'

/** Event emitted by view when user has entered name, type of a new group */
export class ViewGroupAddedEvent {
  constructor (groupName, groupType) {
    /**
     * The requested name of the group.
     * @type {string}
     */
    this.name = groupName
    /**
     * The type of the group, 'group' or 'meta'.
     * @type {string}
     */
    this.grpType = groupType
  }
}

ViewGroupAddedEvent.tag = 'view-group-added'

/** Event emitted by PkgSelectList component when user chooses new item */
export class PkgSelectListChangeEvent {
  constructor (itemSelected, items) {
    /**
     * The newly-selected item
     * @type {string}
     */
    this.selected = itemSelected
    /**
     * The list of all items
     * @type {string[]}
     */
    this.items = items
    logger.debug(`PkgSelectListChangeEvent created, itemSelect is ${itemSelected}`)
  }
}

PkgSelectListChangeEvent.tag = 'on-pkg-select-list-change'
