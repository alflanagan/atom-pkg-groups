/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-list-component')
logger.level = 'warn'

/**
 * An Etch component to display a list of packages
 *
 * @param props should have a key 'packages' which is a list of package
 *        names to display
 */
export default class PkgListComponent {
  constructor (props) {
    this.props = props || {}
    this.element = <div className='package-list' />
    etch.initialize(this)
  }

  // Required: The `render` method returns a virtual DOM tree representing the
  // current state of the component. Etch will call `render` to build and update
  // the component's associated DOM element. Babel is instructed to call the
  // `etch.dom` helper in compiled JSX expressions by the `@jsx` pragma above.
  /**
   * Returns the package list in <div><ul> structure
   */
  render () {
    let litems = []
    const pkgs = this.props.packages || []
    for (let pkg of pkgs) {
      litems.push(<li>{pkg}</li>)
    }

    logger.debug(this.props)
    let pkgListClasses = 'package-list'
    if (this.props['className']) {
      pkgListClasses = `${this.props['className']} package-list`
    }
    this.element = <div className={pkgListClasses}>
      <ul>
        {litems}
      </ul>
    </div>
    return this.element
  }

  // Required: Update the component with new properties
  update (props) {
    this.props = props || {}
    return etch.update(this)
  }

  get count () {
    const pkgs = this.props.packages || []
    return pkgs.length
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
