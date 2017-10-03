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
 *        names to display. All other properties are passed through to
 *        the top-level <div> in the rendered HTML.
 */
export default class PkgListComponent {
  constructor (props) {
    this.props = props || {}
    /* add a standard class to those passed in */
    if (this.props['className']) {
      this.props['className'] = `${this.props['className']} package-list`
    } else {
      this.props['className'] = 'package-list'
    }
    /* get packages into separate variable, don't want to pass through */
    this.packages = this.props['packages'] || []
    delete this.props['packages']

    this.element = <div {...this.props} />
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
    for (const pkg of this.packages) {
      litems.push(<li>{pkg}</li>)
    }

    this.element = <div {...this.props}>
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
    return this.packages.length
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
