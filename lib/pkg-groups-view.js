/** @babel */
/** @jsx etch.dom */

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
   * @property {string[]} props.selected - list of packages to show in the 'selected' list for the selected group
   * @property {string[]} props.groups -- list of groups to show in 'groups' select list
   * @property {string[]} props.metas -- list of meta-groups to show in 'metas' select list
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
  }

  didSelectGroup = evt => {
    console.log(evt)
    /* reset picklist */
    /* load group members list */
    /* fill picklist */
  }

  didChange = evt => {
    console.log(evt.data)
  }

  render () {
    // Create root element
    return <div className='pkg-groups'>
      <atom-panel className='modal' id='group-select-panel'>
        <div className='inset-panel padded'>
          <h1>Package Groups Setup</h1>
          <div id='pkg-groups-upper-panel' className='inset-panel padded'>
            <h2>Defined Groups</h2>
            <div className='select-list'>
              <PkgSelectList items={this.props.groups} on={{change: this.didSelectGroup}} />
            </div>
            <div id='add-group-div'>
              <div className='block'>
                <button className='btn btn-primary icon icon-plus' type='button'>
                  New Group
                </button>
              </div>
            </div>
          </div>
          <div id='pkg-groups-lower-panel' className='inset-panel padded'>
            <h2>Modify Group</h2>
            <div className='sub-section installed-packages'>
              <PkgPickList leftList={this.props.available} rightList={this.props.selected} id='pkg-groups-group-pick'
                leftLabel='available packages' rightLabel='packages in group' on={{change: this.didChange}} />
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

  getTitle = () => 'Package Groups' // for Atom tab

  getURI = () => 'atom://pkg-groups'

  // Returns an object that can be retrieved when package is activated
  serialize = () => ({
    deserializer: 'pkg-groups/PkgGroupsView',
    props: this.props,
    children: this.children
  })

  // Tear down any state and detach
  async destroy () {
    await etch.destroy(this)
  }

  getElement = () => this.element
}
