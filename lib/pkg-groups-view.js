/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import PkgListComponent from './pkg_list_component'

/**
 * This is the "big" view -- a pane to set up package groups. A different
 * view will be used to just enable/disable groups.
 */
export default class PkgGroupsView {
  constructor (props, children) {
    this.props = props || {}
    this.children = children
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
    if (this.props && this.props.hasOwnProperty('groups')) {
      this.props['groups'].forEach((name, index, groups) => {
        listitems.push(<li>{name}</li>)
      })
    }
    let packages
    if (this.props.hasOwnProperty('packages')) {
      packages = this.props['packages']
    } else {
      packages = []
    }

    let pkgcomp
    if (packages.length === 0) {
      pkgcomp = <div className='alert alert-info loading-area icon icon-hourglass'>Loading packages…</div>
    } else {
      console.debug('creating PkgListComponent')
      /* pkgcomp = <PkgListComponent packages={packages} /> */
      pkgcomp = new PkgListComponent({'packages': packages})
      if (pkgcomp === undefined) {
        console.debug('Failed to create pkg list component!')
      } else {
        console.debug(`created with ${pkgcomp.count} packages.`)
      }
    }

    // Create root element
    this.element = <div class='pkg-groups'>
      <atom-panel class='modal' id='group-select-panel'>
        <div class='inset-panel padded'>
          <h1>Package Groups Setup</h1>
          <div class='inset-panel padded'>
            <h2>Defined Groups</h2>
            <div class='select-list'>
              <ol class='list-group' id='groups-name-list'>
                {listitems}
                <li class='selected'>Everything</li>
              </ol>
            </div>
            <div id='add-group-div'>
              <button class='btn btn-primary icon icon-plus' type='button'
                onClick={this.onAddGroup}>
                New Group
              </button>
            </div>
          </div>
          <div class='inset-panel padded'>
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
      deserializer: 'pkg-groups/PkgGroupsView'
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
