/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'
import {Emitter} from 'atom'
import {addIfMissing} from './pkg-groups-functions'

const logger = log4js.getLogger('pkg-select-list-component')
logger.level = 'warn'

/**
 * An etch component to display a list of items, allow one to be selected.
 */
export default class PkgSelectList {
  /**
   * Create a new select list.
   * @param {Object} props
   * @property {Array<string>} props.items - a list of strings to display
   * @property {?string} props.default - member of `items` which is initially selected
   * @property {Function} props.on - mapping from event names to callbacks. Only event supported is 'change'.
   */
  constructor (props = {
    items: [],
    default: null
  }) {
    /** properties 'consumed' by this component, and not passed on to top-level node */
    this.filtered = new Set(['className', 'items', 'default'])
    this._setProps(props)
    this._emitter = new Emitter()
    etch.initialize(this)
  }

  _setProps (newProps) {
    newProps.className = addIfMissing(newProps.className, PkgSelectList.classTag, ' ')
    this.props = newProps
  }

  onChange = cback => {
    this._emitter.on('change', cback)
  }

  on (event, cback) {
    if (event === 'change') {
      this.onChange(cback)
    }
  }
  /**
   * onClick event handler for the list.
   * @listens {MouseEvent}
   * @emits 'change'
   */
  didClick (evt) {
    const selectedGroup = this.props.items[evt.target.value]
    if (this.props.default !== selectedGroup) {
      this.props.default = selectedGroup
      this.update(this.props).then(() => {
        this._emitter.emit('change', selectedGroup)
      })
    }
  }

  /**
   * A unique CSS class applied to the top-level tag of the component
   * @type {string}
   */
  static get classTag () {
    return 'pkg-select-list'
  }

  /**
   * The list of items displayed
   * @type {string[]}
   */
  get items () {
    return this.props.items || []
  }

  /**
   * The currently selected item, if any
   * @type {?string}
   */
  get default () {
    return this.props.default
  }

  /**
   * A virtual DOM tree representing the current state of the component.
   * @return {Object}
   */
  render () {
    let litems = []
    let itemStrings = this.props.items || []
    itemStrings.forEach((item, index) => {
      litems.push(item === this.props.default
        ? <li className='selected' value={String(index)}>{item}</li>
        : <li value={String(index)}>{item}</li>)
    })
    let extras = {}
    for (const key in this.props) {
      if (!this.filtered.has(key) && this.props[key]) {
        extras[key] = this.props[key]
      }
    }
    return <div className={this.props.className} {...extras}>
      <ul on={{click: this.didClick}}>
        {litems}
      </ul>
    </div>
  }

  /**
   * Update the component with new properties.
   * @param {Object} props
   */
  update (props) {
    this._setProps(props || {})
    return etch.update(this)
  }

  /**
   * Destroy the component, free resources.
   * @return {Promise}
   */
  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
