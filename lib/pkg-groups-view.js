/** @babel */
/** @jsx etch.dom */

import {Emitter} from 'atom'
import etch from 'etch'
import log4js from 'log4js'

import PkgSelectList from './pkg-select-list-component'
import PkgPickList from './pkg-pick-list-component'

const logger = log4js.getLogger('pkg-groups-view')
logger.level = 'info'

/**
 * This is the "big" view -- a pane to set up package groups. A different
 * view will be used to just enable/disable groups.
 */
export default class PkgGroupsView {
  /**
   * Create a view instance.
   * @param {Object} props properties for initial view
   * @property {string[]} props.available - list of packages to show in the 'available' list
   * @property {string[]} props.pkgsSelected - list of packages to show in the 'selected' list for the selected group
   * @property {string[]} props.groups -- list of groups to show in 'groups' select list
   * @property {string[]} props.metas -- list of meta-groups to show in 'metas' select list
   * @param {Object[]} children currently unused
   */
  constructor (props, children) {
    this.props = props || {}
    this.children = children || []
    this.props.packages = this.props.packages || []
    // useful for testing:
    // this.props.packages.push(...['package1', 'package2', 'package3'])
    this._emitter = new Emitter()
    /* see etch file lib/scheduler-assignment.js */
    etch.setScheduler(atom.views)
    etch.initialize(this)
  }

  render () {
    // Create root element
    let pkgCount = (this.props.packages || []).length
    this.element = <div className='pkg-groups'>
      <atom-panel className='modal' id='group-select-panel'>
        <div className='inset-panel padded'>
          <h1>Package Groups Setup</h1>
          <div className='inset-panel padded'>
            <h2>Defined Groups</h2>
            <div className='select-list'>
              <PkgSelectList items={this.props.groups} />
            </div>
            <div id='add-group-div'>
              <div className='block'>
                <button className='btn btn-primary icon icon-plus' type='button'>
                  New Group
                </button>
              </div>
            </div>
          </div>
          <div className='inset-panel padded'>
            <h2>Modify Group</h2>
            <div className='sub-section installed-packages'>
              <PkgPickList leftList={this.props.packages} id='pkg-groups-group-pick' />
            </div>
          </div>
        </div>
        <p id='pkg_count'>There are {pkgCount} avallable packages.</p>
      </atom-panel>
    </div>

    return this.element
  }

  update (props, children) {
    this.props = props
    this.children = children
    return etch.update(this)
  }

  getTitle () {
    // for Atom tab
    return 'Package Groups'
  }

  getURI () {
    return 'atom://pkg-groups'
  }

  // Returns an object that can be retrieved when package is activated
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

  getElement () {
    return this.element
  }
}
