/** @babel */
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom'
import etch from 'etch'
import log4js from 'log4js'

// const $ = etch.dom

const logger = log4js.getLogger('pkg-select-list-component')
logger.level = 'warn'

/**
 * A displayable list of items, which respond to clicks. Optionally the clicked
 *   item becomes 'selected'.
 */
export default class PkgSelectList {
  /*
   * This code is stripped down from 'select-list-view.js' in atom-select-list package.
   * Removed the query box, and converted to JSX as appropriate.
   * And removed the ListItemView class. Really, the atom-select-list approach
   * seems a bit bonkers.
   */
  static setScheduler = (scheduler) => etch.setScheduler(scheduler)

  static getScheduler = (scheduler) => etch.getScheduler()

  /**
   * Creates a PkgSelectList from properties.
   *
   * @param {Object} props - set of component properties
   * @param {Object[]} props.items - list of items to be displayed
   * @param {string} props.emptyMessage - message to display if list is empty
   * @param {string} props.errorMessage - error message to display
   * @param {string} props.infoMessage - information message to display
   * @param {string} props.loadingMessage - loading message to display
   * @param {string} props.loadingBadge - "badge" to display while loading
   * @param {Bool} props.skipCommandsRegistration - if `true` atom commands not
   *   registered for component
   * @param {Bool} props.selectableItems - if `true`, items are selected when
   *   clicked and subsequent clicks on that item don't trigger an event. If
   *   `false` items aren't selected and each click fires an event. Default
   *   `true`.
   * @param {integer} props.index - index of selected item in the
   *   `items` list. Ignored if `props.selectableItems` is `false`.
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

  get selectedIndex () {
    return this.props.index
  }

  set selectedIndex (value) {
    if (value !== undefined && value !== null) {
      const parsed = global.parseInt(value)
      if (isNaN(parsed)) {
        throw new Error(`Attempt to set selectedIndex to ${value} -- must be a number or null`)
      }
      this.props.index = parsed
    } else {
      this.props.index = null
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
    this.props.items = props.items || []
    this.props.emptyMessage = props.emptyMessage || ''
    this.props.errorMessage = props.errorMessage || ''
    this.props.infoMessage = props.infoMessage || ''
    this.props.loadingMessage = props.loadingMessage || ''
    this.props.loadingBadge = props.loadingBadge || ''
    this.props.skipCommandsRegistration = props.skipCommandsRegistration || false
    this.props.on = props.on || {}
    this.props.selectableItems = true
    if (props.selectableItems === false) {
      this.props.selectableItems = false
    }
    // honor 'onChange' prop only if on={{change: fn}} not specified.
    if (props.onChange && !this.props.on.change) {
      this.props.on.change = props.onChange
    }
    this.selectedIndex = props.index
  }

  update (props) {
    this._setProps(props)
    return etch.update(this)
  }

  render = () => <div className='select-list pkg-select-list'>
    {[this.renderLoadingMessage(),
      this.renderInfoMessage(),
      this.renderErrorMessage()].filter(item => item)}
    {this.renderItems()}
  </div>

  ignore (evt) {
    evt.preventDefault()
  }

  renderItems () {
    if (this.props.items.length > 0) {
      const liItems = this.props.items.map(
        (item, index) => {
          const selected = (this.props.selectableItems && this.selectedIndex === index)
          return <li value={String(index)} className={selected ? 'selected' : ''}
            on={{click: this.didClickItem, mousedown: this.ignore, mouseup: this.ignore}}>{item}</li>
        }
      )
      return <ol className='list-group' ref='items'>
        {liItems}
      </ol>
    }

    if (!this.props.loadingMessage && this.props.emptyMessage) {
      return <span className='emptyMessage'>{this.props.emptyMessage}</span>
    }
    return <div className='emptyList' />
  }

  renderErrorMessage = () => this.props.errorMessage
    ? <span className='errorMessage'>{this.props.errorMessage}</span>
    : ''

  renderInfoMessage = () => this.props.infoMessage
    ? <span className='infoMessage'>{this.props.infoMessage}</span>
    : ''

  renderLoadingMessage () {
    if (this.props.loadingMessage) {
      const badge = this.props.loadingBadge
        ? <span ref='loadingBadge' className='badge'>{this.props.loadingBadge}</span>
        : ''
      return <div className='loading'>
        <span ref='loadingMessage' className='loading-message'>{this.props.loadingMessage}</span>
        {badge}
      </div>
    }
    return ''
  }

  /**
   * Select the item at the index given. Optionally update the component.
   *
   * @param {integer} index The index of the item in the list, from `0` to
   *   `length-1`.
   *
   * @param {Boolean} [updateComponent=true] Update the component's element.
   *
   * @return {Promise} If the component was updated, resolves on completion of
   *   the update, otherwise  resolves immediately.
   *
   * @emits change - if `props.selectableItems` is `true` and `updateComponent`
   *   is `true`, when a non-selected item is clicked, otherwise when any item
   *   is clicked.
   */
  selectIndex (index, updateComponent = true) {
    if (index >= this.props.items.length) {
      index = this.props.items.length - 1
    } else if (index < 0) {
      index = 0
    }

    // if items not selected, always fire 'change', else only fire if changed
    if (this.selectedIndex !== index || !this.props.selectableItems) {
      if (this.props.on && this.props.on.change) {
        this.props.on.change(this.props.items[index], index)
      }
      this.selectedIndex = index  // validation, sets props

      logger.debug(`selectionIndex is ${this.selectedIndex}`)
    }

    if (updateComponent) {
      return this.update(this.props)
    }

    // always return a promise, even if we didn't do anything
    return Promise.resolve()
  }

  selectPrevious = () => this.selectedIndex > 0 ? this.selectIndex(this.selectedIndex - 1) : Promise.resolve()

  selectNext = () => this.selectedIndex < this.props.items.length - 1 ? this.selectIndex(this.selectedIndex + 1) : Promise.resolve()

  selectFirst = () => this.selectIndex(0)

  selectLast = () => this.selectIndex(this.props.items.length - 1)

  getSelectedItem = () => this.props.items[this.selectedIndex]

  /** onClick handler for items */
  didClickItem = evt => {
    evt.preventDefault()
    this.selectIndex(evt.target.value)
  }

  scrollIntoViewIfNeeded = () => {
    if (this.selectedIndex) {
      const liItem = this.element.children[0].children[this.selectedIndex]
      liItem.scrollIntoViewIfNeeded()
    }
  }

  async destroy () {
    this.disposables.dispose()
    await etch.destroy(this)
  }
}
