/** @babel */
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom'
import etch from 'etch'
import log4js from 'log4js'
import {addIfMissing} from './pkg-groups-functions'

const LOG_DEFAULT = log4js.levels.INFO
const logger = log4js.getLogger('pkg-tristate-list-component')
logger.level = LOG_DEFAULT

/**
 * A displayable list of items. Each item has one of three states, 'enabled',
 *   'disabled', or 'unchanged'.
 */
export default class PkgTristateList {
  /**
   * List of valid states for an item. Note order of list determines sequence of
   *   state transitions.
   *
   * @type {Array}
   */
  ALLOWED_STATES = ['enabled', 'disabled', 'unchanged']
  /**
   * Mapping from the possible states for an item, to the DOM to be rendered for
   *   that state.
   *
   * @type {Object}
   */
  STATES_CONFIG = {
    enabled: <div className='enabled' />,
    disabled: <div className='disabled' />,
    unchanged: <div className='unchanged' />
  }

  static disableLogging () {
    logger.level = log4js.levels.OFF
  }

  static enableLogging () {
    logger.level = LOG_DEFAULT
  }

  /**
   * execute a function with logging disabled (testing only)
   *
   * @param {Function} fn a function of 0 parameters
   *
   * @return {Any} value returned by `fn`
   */
  static withoutLogging (fn) {
    logger.level = log4js.levels.OFF
    const value = fn()
    logger.level = LOG_DEFAULT
    return value
  }
  /**
   * Creates a PkgTristateList from properties.
   *
   * @param {Object} props - set of component properties
   * @param {Map<string, string>[]} props.items - list of items to be displayed.
   *   The key is the name of a meta-package, the value is one of 'enabled',
   *   'disabled', or 'unchanged'.
   *
   * @param {Bool} props.skipCommandsRegistration - if `true` atom commands not
   *   registered for component
   *
   * @param {Object} props.on - event handlers to be called. Currently only
   *   'change' event is provided.
   */
  constructor (props) {
    this._setProps(props)
    this.disposables = new CompositeDisposable()
    etch.initialize(this)
    if (!this.props.skipCommandsRegistration) {
      this.disposables.add(this.registerAtomCommands())
    }
  }

  // support standard commands when we have focus
  registerAtomCommands () {
    return global.atom.commands.add(this.element, {
      'core:move-up': (event) => {
        this.selectPrevious()
        event.stopPropagation()
      },
      'core:move-down': (event) => {
        this.selectNext()
        event.stopPropagation()
      },
      'core:move-to-top': (event) => {
        this.selectFirst()
        event.stopPropagation()
      },
      'core:move-to-bottom': (event) => {
        this.selectLast()
        event.stopPropagation()
      }
    })
  }

  _setProps (props) {
    try {
      if (!props || !props.hasOwnProperty('items')) {
        throw new Error('Cannot create tristate list without items property.')
      }
      this.props = {}
      this.props.items = {}
      for (const key in props.items) {
        if (this.ALLOWED_STATES.includes(props.items[key])) {
          this.props.items[key] = props.items[key]
        } else {
          throw new Error(`Got state of ${props.items[key]}, legal values are '${this.ALLOWED_STATES.join('\', \'')}'.`)
        }
      }
      this.props.skipCommandsRegistration = props.skipCommandsRegistration
      this.props.on = {}
      if (props.on && props.on.hasOwnProperty('change')) {
        if (typeof props.on.change === 'function' || props.on.change === null) {
          this.props.on.change = props.on.change
        } else {
          throw new Error(`Attempted to set change handler to non-function: ${props.on.change}`)
        }
      } else {
        this.props.on.change = null
      }
      this.props.className = addIfMissing(props.className, 'tristate-list', ' ')
    } catch (e) {
      logger.error(`Caught error in PkgTristateList._setProps: ${e}`)
      throw e
    }
  }

  update (props) {
    this._setProps(props)
    return etch.update(this)
  }

  render = () => {
    const itemList = []
    for (const key in this.props.items) {
      itemList.push(<li on={{click: this.didClick}}>{key}{this.STATES_CONFIG[this.props.items[key]]}</li>)
    }
    return <div className={this.props.className}>
      <ol>{itemList}</ol>
    </div>
  }

  /**
   * Handle click event from any one of the items.
   *
   * @param {MouseEvent} evt the click event
   */
  didClick = evt => {
    const theItem = evt.currentTarget.innerText
    const state = this.props.items[theItem]
    let index = this.ALLOWED_STATES.indexOf(state)
    index = (index + 1) % this.ALLOWED_STATES.length
    this.props.items[theItem] = this.ALLOWED_STATES[index]
    return this.update(this.props).then(() => {
      if (this.props.on && this.props.on.change) {
        this.props.on.change(theItem, this.props.items[theItem])
      }
    })
  }

  async destroy () {
    this.disposables.dispose()
    await etch.destroy(this)
  }
}
