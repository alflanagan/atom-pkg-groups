/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'
import { addIfMissing } from './pkg-groups-functions'

const logger = log4js.getLogger('pkg-list-component')
logger.level = 'warn'

/**
 * An Etch component to display a list of packages
 *
 * @param props should have a key 'packages' which is a list of package
 *        names to display. All other properties are passed through to
 *        the top-level <div> in the rendered HTML.
 */
export default class PkgListComponent {
  constructor (props) {
    this._setProps(props)
    etch.initialize(this)  // sets props element, virtualNode, refs
  }

  _setProps (newProps) {
    this.props = newProps || {}
    /* add a standard class to those passed in */
    if (this.props.className) {
      this.props.className = addIfMissing(this.props.className, 'package-list', ' ')
    } else {
      this.props.className = 'package-list'
    }

    /* properties "pass-through" to top-level element */
    /* except for "packages" */
    if (this.props.packages) {
      this.packages = this.props.packages
      delete this.props['packages']
    } else {
      this.packages = []
    }
  }

  /**
   * Returns the package list in <div><ul> DOM structure
   */
  render () {
    let litems = []
    for (const pkg of this.packages) {
      litems.push(
        <li>{pkg}</li>
      )
    }

    return <div {...this.props}>
      <ul>
        {litems}
      </ul>
    </div>
  }

  // Required: Update the component with new properties
  update (props) {
    this._setProps(props)
    return etch.update(this)
  }

  /** @returns the current number of packages in list */
  get count () {
    return this.packages.length
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
    this.packages = null
  }
}
