/** @babel */
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom'
import etch from 'etch'
import log4js from 'log4js'

// const $ = etch.dom

const logger = log4js.getLogger('multistate-component')
logger.level = 'info'

/**
 * A component which has multiple "states", each with its own appearance.
 *   Clicking repeatedly will cycle through the states.
 */
export default class MultistateComponent {
  static setScheduler = (scheduler) => etch.setScheduler(scheduler)

  static getScheduler = (scheduler) => etch.getScheduler()

  /**
   * Creates a TristateComponent from properties.
   *
   * @param {Object} props - set of component properties
   * @param {Tuple<name, state>[]} props.states - An ordered list of names and
   *   states. The state is the DOM to be displayed when that state is selected.
   *
   * @param {string} props.currentState - the state to be displayed. This will
   *   be changed by user input.
   *
   * @param {Boolean} props.skipCommandsRegistration - If `true`, component will
   *   not register commands with Atom (and state will not be changeable with
   *   keyboard!)
   */
  constructor (props) {
    this.props = {}
    this._setProps(props)
    this.disposables = new CompositeDisposable()
    etch.initialize(this)
    if (!props.skipCommandsRegistration) {
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
      }
    })
  }

  _setProps (props) {
    let currentValid = false
    this.props = {states: [],
      currentState: null,
      skipCommandsRegistration: false
    }
    if (props.states.length < 2) {
      throw new Error('Multistate component should have at least 2 states')
    }
    for (const entry of props.states) {
      if (entry.length !== 2) {
        throw new Error(`Invalid entry in states array: [${entry}]`)
      }
      if (entry[0] === props.currentState) {
        currentValid = true
      }
      this.props.states.push(entry)
    }
    if (!currentValid) {
      throw new Error(`State '${props.currentState}' does not match any state.`)
    }
    this.props.currentState = props.currentState
    this.props.skipCommandsRegistration = props.skipCommandsRegistration || false
    this.props.on = props.on || {}
    // honor 'onChange' prop only if on={{change: fn}} not specified.
    if (props.onChange && !this.props.on.change) {
      this.props.on.change = props.onChange
    }
  }

  update = (props) => {
    this._setProps(props)
    return etch.update(this).then(() => {
      if (typeof this.props.on.change === 'function') {
        logger.info('triggering change event')
        this.props.on.change(
          this.props.currentState,
          this._valueForKey(this.props.currentState))
      }
    })
  }

  _valueForKey (key) {
    for (const entry of this.props.states) {
      if (entry[0] === key) {
        return entry[1]
      }
    }
  }

  render = () => <div className='multi-state-component' on={{click: this.didClick}}>
    {this._valueForKey(this.props.currentState)}
  </div>

  ignore (evt) {
    evt.preventDefault()
  }

  selectPrevious = () => {
    // if current state is first in array, previous state is last
    let previousState = this.props.states[this.props.states.length - 1][0]
    for (let entry of this.prop.states) {
      if (entry[0] === this.props.currentState) {
        this.props.currentState = previousState
        break
      }
      previousState = entry[0]
    }
    return this.update(this.props)
  }

  selectNext = () => {
    let nextState = this.props.states[0][0]
    // check every element except last -- if last matches, `nextState` is already correct.
    for (let i = 0; i < this.props.states.length - 1; i++) {
      if (this.props.states[i][0] === this.props.currentState) {
        nextState = this.props.states[i + 1][0]
      }
    }
    logger.debug(`SelectNext(): ${this.props.currentState} --> ${nextState}`)
    this.props.currentState = nextState
    return this.update(this.props)
  }

  /** onClick handler for items */
  didClick = evt => {
    evt.preventDefault()
    logger.debug('MultistateComponent.didClick')
    this.selectNext()
  }

  async destroy () {
    this.disposables.dispose()
    await etch.destroy(this)
  }
}
