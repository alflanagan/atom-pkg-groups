/** @babel */
/** @jsx etch.dom */

import {Disposable, CompositeDisposable} from 'atom'
import etch from 'etch'
import log4js from 'log4js'
import {firstTrue} from './pkg-groups-functions'

// const $ = etch.dom

const logger = log4js.getLogger('pkg-select-list-component-2')
logger.level = 'debug'

export default class PkgSelectList {
  /*
   * This code is stripped down from 'select-list-view.js' in atom-select-list package.
   * Removed the query box, and converted to JSX as appropriate.
   */
  static setScheduler (scheduler) {
    etch.setScheduler(scheduler)
  }

  static getScheduler (scheduler) {
    return etch.getScheduler()
  }

  /**
   * Creates a PkgSelectList from properties.
   * @param {Object} props - set of component properties
   * @param {Object[]} props.items - list of items to be displayed
   * @param {string} props.emptyMessage - message to display if list is empty
   * @param {string} props.errorMessage - error message to display
   * @param {string} props.infoMessage - information message to display
   * @param {string} props.loadingMessage - loading message to display
   * @param {string} props.loadingBadge - "badge" to display while loading
   * @param {string[]} props.itemsClassList - extra classes to add to each item
   * @param {Function} props.didChangeSelection - function called when selection changes
   * @param {Bool} props.skipCommandsRegistration - if `true` atom commands not registered for component
   */
  // TODO: add a 'never select' option that causes control to not select an item on click
  constructor (props) {
    this.props = {}
    this._setProps(props)
    this.disposables = new CompositeDisposable()
    etch.initialize(this)
    this.element.classList.add('pkg-select-list')
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
      },
      'core:confirm': (event) => {
        this.confirmSelection()
        event.stopPropagation()
      },
      'core:cancel': (event) => {
        this.cancelSelection()
        event.stopPropagation()
      }
    })
  }

  _setProps (props) {
    this.items = props.items || []
    this.props.emptyMessage = props.emptyMessage || ''
    this.props.errorMessage = props.errorMessage || ''
    this.props.infoMessage = props.infoMessage || ''
    this.props.loadingMessage = props.loadingMessage || ''
    this.props.loadingBadge = props.loadingBadge || ''
    this.props.itemsClassList = props.itemsClassList || []
    this.props.didChangeSelection = props.didChangeSelection
    this.props.skipCommandsRegistration = props.skipCommandsRegistration
  }

  update (props = {}) {
    this._setProps(props)
    return etch.update(this)
  }

  render () {
    let msgs = [
      this.renderLoadingMessage(),
      this.renderInfoMessage(),
      this.renderErrorMessage()]
    let msgList = msgs.filter((item) => item)
    return <div className='select-list pkg-select-list'>
      {msgList}
      {this.renderItems()}
    </div>
  }

  renderItems () {
    if (this.items.length > 0) {
      const className = firstTrue(this.props.itemsClassList,
          () => ['list-group'].concat(this.props.itemsClassList).join(' '),
          () => 'list-group')
      const liItems = this.items.map((item, index) => {
        let elem
        const selected = (this.selectionIndex === index)
        elem = firstTrue(selected,
            () => etch.render(<li className='selected' value={String(index)}>{item}</li>),
            () => etch.render(<li value={String(index)}>{item}</li>))
        return <_ListItemView element={elem}
          selected={selected} onclick={this.didClickItem} />
      })
      return <ol className={className} ref='items'>
        {liItems}
      </ol>
    }

    return firstTrue(!this.props.loadingMessage && this.props.emptyMessage,
        () => <span className='emptyMessage'>{this.props.emptyMessage}</span>,
        () => undefined)
  }

  renderErrorMessage () {
    return firstTrue(this.props.errorMessage,
      () => <span className='errorMessage'>{this.props.errorMessage}</span>,
      () => '')
  }

  renderInfoMessage () {
    return firstTrue(this.props.infoMessage,
      () => <span className='infoMessage'>{this.props.infoMessage}</span>,
      () => undefined)
  }

  renderLoadingMessage () {
    return firstTrue(this.props.loadingMessage,
      () => {
        const badge = this.props.loadingBadge ? <span ref='loadingBadge' className='badge'>{this.props.loadingBadge}</span> : ''
        return <div className='loading'>
          <span ref='loadingMessage' className='loading-message'>{this.props.loadingMessage}</span>
          {badge}
        </div>
      },
      () => '')
  }

  selectIndex (index, updateComponent = true) {
    /* not sure this is clearer than the if () else if () else construct, but interesting */
    index = firstTrue(index > this.items.length,
      () => 0,
      () => firstTrue(index < 0,
          () => this.items.length - 1,
          () => index))
    if (this.selectionIndex !== index) {
      this.selectionIndex = index
      if (this.props.didChangeSelection) {
        this.props.didChangeSelection(this.getSelectedItem(), this.selectionIndex)
      }
      if (updateComponent) {
        return etch.update(this)
      }
    }
    return Promise.resolve()
  }

  selectPrevious = () => this.selectIndex(this.selectionIndex - 1)

  selectNext = () => this.selectIndex(this.selectionIndex + 1)

  selectFirst = () => this.selectIndex(0)

  selectLast = () => this.selectIndex(this.items.length - 1)

  getSelectedItem = () => this.items[this.selectionIndex]

  destroy () {
    this.disposables.dispose()
    return etch.destroy(this)
  }

  didClickItem = (item, value) => {
    etch.update(this)
    return this.selectIndex(value)
  }
}

export class _ListItemView {
  constructor (props) {
    this.selected = props.selected
    this.onclick = props.onclick
    this.element = props.element
    this.addListeners()
    if (this.selected) {
      this.element.classList.add('selected')
    }
    this.domEventsDisposable = new Disposable(() => {
      this.removeListeners()
    })
    etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded)
  }

  addListeners = () => {
    this.element.addEventListener('mousedown', this.mouseDown)
    this.element.addEventListener('mouseup', this.mouseUp)
    this.element.addEventListener('click', this.didClick)
  }

  removeListeners = () => {
    this.element.removeEventListener('mousedown', this.mouseDown)
    this.element.removeEventListener('mouseup', this.mouseUp)
    this.element.removeEventListener('click', this.didClick)
  }

  mouseDown = event => event.preventDefault()

  mouseUp = event => event.preventDefault()

  didClick = event => {
    event.preventDefault()
    if (typeof this.onclick === 'function') {
      this.onclick(event.target.textContent, event.target.value)
    }
  }

  destroy () {
    this.element.remove()
    this.domEventsDisposable.dispose()
  }

  update (props) {
    this.removeListeners()

    this.element.parentNode.replaceChild(props.element, this.element)
    this.element = props.element
    this.addListeners()
    if (props.selected) {
      this.element.classList.add('selected')
    }

    this.selected = props.selected
    this.onclick = props.onclick
    etch.getScheduler().updateDocument(this.scrollIntoViewIfNeeded)
  }

  scrollIntoViewIfNeeded = () => {
    if (this.selected) {
      this.element.scrollIntoViewIfNeeded()
    }
  }
}
