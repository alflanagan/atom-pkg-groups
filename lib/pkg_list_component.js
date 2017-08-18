/** @babel */
/** @jsx etch.dom */

const etch = require('etch')

/**
 * An Etch component to display a list of packages
 *
 * @param props should have a key 'packages' which is a list of package
 *        names to display
 */
export default class PkgListComponent {
  constructor (props, children) {
    if (!props.hasOwnProperty('packages')) {
      throw new Error('Component requires property "packages"')
    }
    this.props = props
    this.children = children
    this.packages = this.props['packages']
    this.element = <div class='package-list' />
    etch.initialize(this)
    console.log('constructed')
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
    for (var i = 0; i < this.packages.length; i++) {
      litems.push(<li>{this.packages[i]}</li>)
    }
    this.element = <div class='package-list'>
      <ul>
        {litems}
      </ul>
    </div>
    return this.element
  }

  // Required: Update the component with new properties and children.
  update (props, children) {
    this.props = props
    this.children = children
    this.packages = this.props['packages']
    // perform custom update logic here...
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  get count () {
    if (this.packages !== undefined) {
      return this.packages.length
    }
    return 0
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy () {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
  }
}
