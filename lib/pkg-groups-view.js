/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'

import PkgListComponent from './pkg-list-component'

const logger = log4js.getLogger('pkg-groups-view')
logger.level = 'info'

/**
 * This is the "big" view -- a pane to set up package groups. A different
 * view will be used to just enable/disable groups.
 */
/*
 * Elements needed:
 * * list of defined groups
 * * list of defined metas
 * * two lists side-by-side to act as selection dialog, showing groups or metas
 *   available and those selected
 * * button for new groups/metas (allow typing new name directly in list?)
 */
export default class PkgGroupsView {
  constructor (props, children) {
    logger.debug('PkgGroupsView called with props=')
    logger.debug(props)
    logger.debug('PkgGroupsView called with children=')
    logger.debug(children)
    this.props = props || {}
    this.children = children || []
    this.onAddGroup = this.onAddGroup.bind(this)
    this.getPackageList()
    etch.initialize(this)
  }

  onAddGroup (evt) {
    /* eslint no-console: "off" */
    console.log('button add group pushed')
  }

  render () {
    let listitems = []
    let groups = this.props['groups'] || []
    groups.forEach((name) => {
      listitems.push(<li className='list-item'>{name}</li>)
    })

    let packages = this.props['packages'] || []

    let pkgcomp
    if (packages.length === 0) {
      pkgcomp = <div className='alert alert-info loading-area icon icon-hourglass'>Loading packages…</div>
    } else {
      /* pkgcomp = <PkgListComponent packages={packages} /> */
      pkgcomp = new PkgListComponent({'packages': packages})
      if (pkgcomp === undefined) {
        throw new Error('Failed to create pkg list component!')
      }
    }

    // Create root element
    this.element = <div className='pkg-groups'>
      <atom-panel className='modal' id='group-select-panel'>
        <div className='inset-panel padded'>
          <h1>Package Groups Setup</h1>
          <div className='inset-panel padded'>
            <h2>Defined Groups</h2>
            <div className='select-list'>
              <ol className='list-group mark-active' id='groups-name-list'>
                {listitems}
                <li className='selected'>Everything</li>
              </ol>
            </div>
            <div id='add-group-div'>
              <div className='block'>
                <button className='btn btn-primary icon icon-plus' type='button'
                  onClick={this.onAddGroup}>
                  New Group
                </button>
              </div>
            </div>
          </div>
          <div className='inset-panel padded'>
            <h2>Modify Group</h2>
            <section className='sub-section installed-packages'>
              {pkgcomp}
            </section>
          </div>
        </div>
        <p id='pkg_count'>There are {packages.length} avallable packages.</p>
      </atom-panel>
    </div>

    return this.element
  }

  update (props, children) {
    this.props = props
    this.children = children
    return etch.update(this)
  }

  async getPackageList () {
    const pkgs = await atom.packages.getAvailablePackageNames()
    this.props['packages'] = pkgs
    this.update(this.props, this.children)
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
