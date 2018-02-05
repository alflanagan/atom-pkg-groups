/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'
import Immutable from 'immutable'

import PkgSelectList from './pkg-select-list-component'
import PkgPickList from './pkg-pick-list-component'
import PkgTristateList from './pkg-tristate-list-component'
// possible to decouple view from model, doesn't seem necessary
import PkgGroupsModel from './pkg-groups-model'

const logger = log4js.getLogger('pkg-groups-view')
logger.level = 'debug'

/**
 * This is the "big" view -- a pane to set up package groups.
 *
 * This component does 2 things:
 * 1. display a model
 * 2. translate user input into events
 *
 *     * selects group (upper pane)
 *     * clicks "add group" button
 *     * clicks "delete group" button
 *     * clicks on package in 'available'
 *     * clicks on package in 'selected'
 *     * selects configuration
 *     * clicks on "add configuration" button
 *     * clicks on "delete configuration" button
 *     * clicks on a group to toggle its state in configuration.
 */
export default class PkgGroupsView {
  events = Object.freeze({
    select_group: 'user selected a group',
    add_group_btn: 'user clicked add group button',
    del_group_btn: 3,
    select_avail_pkg: 4,
    select_selected_pkg: 5,
    select_config: 6,
    add_config_btn: 7,
    del_config_btn: 8,
    toggle_group: 9
  })

  /**
   * Create a view instance.
   *
   * @param {Object} props - properties for view
   *
   * @param {PkgGroupsModel} props.model - data to display
   *
   * @param {Object} props.on - registered callbacks for events
   *
   * @param {Function} props.on.select_group - called when user clicks group
   *
   * @param {Function} props.on.add_group_btn - called when user clicks 'add group' button
   *
   * @param {Function} props.on.del_group_btn
   *
   * @param {Function} props.on.select_avail_pkg
   *
   * @param {Function} props.on.select_selected_pkg
   *
   * @param {Function} props.on.select_config
   *
   * @param {Function} props.on.add_config_btn
   *
   * @param {Function} props.on.del_config_btn
   *
   * @param {Function} props.on.toggle_group
   *
   * @param {Object[]} children currently unused
   */
  constructor (props, children) {
    this._setProps(props)
    this.children = children || []
    /* see etch file lib/scheduler-assignment.js */
    etch.setScheduler(atom.views)
    etch.initialize(this)
  }

  /**
   * @Private
   */
  _setProps (props) {
    this.props = {}
    if (!(props.model instanceof PkgGroupsModel)) {
      throw new Error('The PkgGroupsView view requires a model!')
    }
    this.props.model = props.model
    this.props.on = props.on || {}
    for (const key in this.props.on) {
      if (this.props.on[key] && !(typeof this.props.on[key] === 'function')) {
        throw new Error(`attempted to set ${key} callback to non-function`)
      }
    }
  }

  /**
   * Handler for 'change' event from group list.
   *
   * @param {string} item The text of the list item selected.
   * @param {Number} index The index of the item in the list item collection.
   *
   * @emits select
   */
  _didSelectGroup = (item, index) => {
    if (this.props.on.select) {
      this.props.on.select(item, index)
    }
  }

  _didChange = (data) => {
    if (this.props.on.change) {
      this.props.on.change(data)
    }
  }

  _didChangeMeta = (item, state) => {
    logger.debug('_didChangeMeta')
  }

  render () {
    // Create root element
    return <div className='pkg-groups'>
      <atom-panel id='group-select-panel'>
        <div id='pkg-groups-upper-panel' className='inset-panel padded'>
          <h1>Set Up Package Groups</h1>
          <PkgSelectList id='groups-select-list' items={this.props.groups} on={{change: this._didSelectGroup}} />
          <button id='groups-add-group' name='add-group' type='button' on={{click: this._didClickAddGroup}}><i class='fa fa-plus-circle' aria-hidden='true' /></button>
          <button id='groups-delete-group' name='delete-group' type='button' on={{click: this._didClickDeleteGroup}}><i class='fa fa-minus-circle' aria-hidden='true' /></button>
          <PkgPickList leftList={this.props.available} rightList={this.props.selected} id='pkg-groups-group-pick'
            leftLabel='Packages Available' rightLabel='Packages In Group' on={{change: this._didChange}} />
          <p className='group-select-hint'>Click Package Name to Select/Deselect</p>
        </div>
        <div id='pkg-groups-lower-panel' className='inset-panel padded'>
          <div id='defined-metas-panel'>
            <h1>Set Up Configurations</h1>
            <div id='meta-select-list'>
              <PkgSelectList items={this.props.metas} on={{change: this._didSelectMeta}} />
              <button id='meta-add-meta' name='add-meta' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
              <button id='meta-delete-meta' name='delete-meta' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
            </div>
          </div>
          <div id='specify-metas-panel'>
            <h2>Activate / Deactivate Groups</h2>
            <div className='sub-section group-selection'>
              <PkgTristateList items={this.props.metas} on={{change: this._didChangeMeta}} />
            </div>
          </div>
        </div>
      </atom-panel>
    </div>
  }

  /**
   * Updates the view with a new set of properties.
   *
   * @param {Object} props - same as for constructor
   * @param children - ignored
   *
   * @return {Promise} a promise that will resolve when the requested update has been
   *     completed.
   */
  update (props, children) {
    this._setProps(props)
    this.children = children || []
    return etch.update(this)
  }

  /**
   * A page title to be used for the Package Groups tab
   *
   * @return {string}
   */
  getTitle () { return 'Package Groups' } // for Atom tab

  /**
   * The URI which Atom will open with this view.
   *
   * @return {string}
   */
  static getURI () { 'atom://pkg-groups' }

  /**
   * Called by etch to tear down this component.
   *
   * @return {Promise} resolved when instance is destroyed.
   */
  async destroy () {
    await etch.destroy(this)
  }

  /**
   * The DOM element generated for this component.
   *
   * @return {Object}
   */
  getElement () { return this.element }
}
