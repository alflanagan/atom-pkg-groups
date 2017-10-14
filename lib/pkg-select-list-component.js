/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'
import {Emitter} from 'atom'
import {PkgSelectListChangeEvent} from './pkg-groups-events'
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
   */
  constructor (props = {
    items: [],
    default: null
  }) {
    this._setProps(props)
    this._emitter = new Emitter()
    etch.initialize(this)
  }

  _setProps (newProps) {
    const props = {}
    Object.assign(props, newProps)
    if (props.className) {
      props.className = addIfMissing(props.className, PkgSelectList.classTag, ' ')
    } else {
      props.className = PkgSelectList.classTag
    }
    this.props = props
  }

  /**
   * onClick event handler for the list.
   * @listens {MouseEvent}
   * @emits {PkgSelectListChangeEvent}
   */
  /* 'experimental' syntax here, but bind() in constructor not working (??) */
  handleClick = evt => {
    logger.debug('handling click')
    // logger.debug(this)
    // logger.debug(this.props)
    const selectedGroup = this.props.items[evt.target.value]
    // logger.debug(`selected group is ${selectedGroup}, default is ${this.props.default}`)
    if (this.props.default !== selectedGroup) {
      const copy = {}
      Object.assign(copy, this.props)
      copy.default = selectedGroup
      // logger.debug(`set default to ${selectedGroup}`)
      this.update(copy).then(() => {
        logger.debug(`triggering ${PkgSelectListChangeEvent.tag}`)
        this._emitter.emit(PkgSelectListChangeEvent.tag,
          new PkgSelectListChangeEvent(this.props.default, this.props.items))
        console.log(`select list change event, ${this.props.default}`)
      })
    }
  }

  on = (evt, fn) => {
    console.log(`on called with event ${evt}`)
  }

  /**
   * Register a listener for our PkgSelectListChangeEvent.
   * @param {Function} handler - a function that gets called when event fires.
   */
  onPkgSelectListChangeEvent = fn => {
    // logger.debug(`registering ${fn} to ${PkgSelectListChangeEvent.tag}`)
    this._emitter.on(PkgSelectListChangeEvent.tag, fn)
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
    return <div className={this.props.className}>
      <ul onclick={this.handleClick}>
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
