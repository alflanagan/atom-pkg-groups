/** @babel */
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom'
import etch from 'etch'
import log4js from 'log4js'

// const $ = etch.dom

const logger = log4js.getLogger('pkg-select-list-component')
logger.level = 'debug'

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
   * @param {integer} props.selectionIndex - index of selected item in the
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
    this.props.selectableItems = (props.selectableItems || typeof props.selectableItems === 'undefined')
    // honor 'onChange' prop only if on={{change: fn}} not specified.
    if (props.onChange && !this.props.on.change) {
      this.props.on.change = props.onChange
    }
    if (typeof props.selectionIndex === 'string') {
      this.props.selectionIndex = global.parseInt(props.selectionIndex)
    } else {
      this.props.selectionIndex = props.selectionIndex
    }
  }

  update (props) {
    this._setProps(props)
    return etch.update(this).then(() => {
      if (this.props.on && this.props.on.change) {
        this.props.on.change(this.props.items[this.props.selectionIndex], this.props.selectionIndex)
      }
    })
  }

  render = () => {
    let newDom = <div className='select-list pkg-select-list'>
      {[this.renderLoadingMessage(),
        this.renderInfoMessage(),
        this.renderErrorMessage()].filter(item => item)}
      {this.renderItems()}
    </div>
    return newDom
  }

  renderItems () {
    if (this.props.items.length > 0) {
      const liItems = this.props.items.map(
        (item, index) => {
          const selected = (this.props.selectableItems && this.props.selectionIndex === index)
          return <li value={String(index)} className={selected ? 'selected' : ''}
            on={{click: this.didClickItem,
              mousedown: evt => evt.preventDefault(),
              mouseup: evt => evt.preventDefault()}}>{item}</li>
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

    if (this.props.selectionIndex !== index) {
      this.props.selectionIndex = index
      if (updateComponent) {
        return this.update(this.props)
      }
    } else if (!this.props.selectableItems && updateComponent) {
      return this.update(this.props)
    }

    // always return a promise, even if we didn't do anything
    return Promise.resolve()
  }

  selectPrevious = () => this.selectIndex(this.props.selectionIndex - 1)

  selectNext = () => this.selectIndex(this.props.selectionIndex + 1)

  selectFirst = () => this.selectIndex(0)

  selectLast = () => this.selectIndex(this.props.items.length - 1)

  getSelectedItem = () => this.props.items[this.props.selectionIndex]

  /** onClick handler for items */
  didClickItem = evt => {
    evt.preventDefault()
    this.selectIndex(evt.target.value)
  }

  scrollIntoViewIfNeeded = () => {
    if (this.props.selectionIndex) {
      const liItem = this.element.children[0].children[this.props.selectionIndex]
      liItem.scrollIntoViewIfNeeded()
    }
  }

  async destroy () {
    this.disposables.dispose()
    await etch.destroy(this)
  }
}
