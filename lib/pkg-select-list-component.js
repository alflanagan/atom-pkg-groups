/** @babel */
/** @jsx etch.dom */

const etch = require('etch')

/**
 * An Etch component to display a list of items, allowing one (and only one)
 * to be selected at a time.
 *
 * @param props Object like {
 *                            items: <list of strings>
 *                            selected: null, or member of items
 *                          }
 */
export default class PkgSelectList {
  constructor (props) {
    this.props = props || {}
    this.element = <div className={PkgSelectList.classTag} />
    etch.initialize(this)
  }

  static get classTag () {
    return 'pkg-select-list'
  }

  get items () {
    return this.props.items || []
  }

  get default () {
    return this.props.default
  }

  // Required: The `render` method returns a virtual DOM tree representing the
  // current state of the component. Etch will call `render` to build and update
  // the component's associated DOM element. Babel is instructed to call the
  // `etch.dom` helper in compiled JSX expressions by the `@jsx` pragma above.
  render () {
    let litems = []
    const items = this.props.items || []
    const defitem = this.props.default || ''
    for (const item of items) {
      if (item === defitem) {
        litems.push(
          <li className='selected'>{item}</li>
        )
      } else {
        litems.push(
          <li>{item}</li>
        )
      }
    }
    this.element = <div className={PkgSelectList.classTag}>
      <ul>
        {litems}
      </ul>
    </div>
    return this.element
  }

  // Required: Update the component with new properties and children.
  update (props) {
    this.props = props || {}
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
