/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'

import PkgSelectList from './pkg-select-list-component'
import PkgPickList from './pkg-pick-list-component'
import PkgTristateList from './pkg-tristate-list-component'

const logger = log4js.getLogger('pkg-groups-view')
logger.level = 'debug'

/**
 * This is the "big" view -- a pane to set up package groups. A different
 * view will be used to just enable/disable groups.
 */
export default class PkgGroupsView {
  /**
   * Create a view instance.
   *
   * @param {Object} props properties for initial view
   *
   * @param {string[]} props.available - list of packages to show in the
   *   'available' list
   *
   * @param {string[]} props.selected - list of packages to show in the
   *   'selected' list for the selected group
   *
   * @param {string[]} props.groups - list of groups to show in 'groups'
   *   select list
   *
   * @param {string[]} props.metas - list of meta-groups to show in 'metas'
   *   select list
   *
   * @param {Object} props.on - registered callbacks for events
   * @param {Function} props.on.change - callback called when user clicks on
   *   package in picklist
   *
   * @param {Function} props.on.select - callback called when user clicks on
   *   groups list to select a new group
   *
   * @param {Object[]} children currently unused
   */
  constructor (props, children) {
    this._setProps(props)
    this.children = children || []

    // temporary, useful for testing:
    // this.props.available = this.props.available || ['package1', 'package2', 'package3']

    /* see etch file lib/scheduler-assignment.js */
    etch.setScheduler(atom.views)
    etch.initialize(this)
  }

  _setProps (props) {
    this.props = props || {}
    this.props.available = this.props.available || []
    this.props.selected = this.props.selected || []
    this.props.groups = this.props.groups || []
    this.props.metas = this.props.metas || []
    this.props.on = this.props.on || {change: null, select: null}
    if (props && props.on) {
      if (props.on.change) {
        this.props.on.change = props.on.change
      }
      if (props.on.select) {
        this.props.on.select = props.on.select
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
          <button id='groups-add-group' name='add-group' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
          <button id='groups-delete-group' name='delete-group' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
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

  static getURI () { 'atom://pkg-groups' }

  // Returns an object that can be retrieved when package is activated
  /**
   * Converts PkgGroupsView object to an object that is JSON-compatible.
   *
   * @return {Object} object with keys 'props' and 'children' for instance
   *   state, and 'deserializer' to tell Atom how to recreate this view.
   */
  serialize () {
    return {
      deserializer: 'pkg-groups/PkgGroupsView',
      props: this.props,
      children: this.children
    }
  }

  // Tear down any state and detach
  async destroy () {
    await etch.destroy(this)
  }

  getElement () { return this.element }
}
