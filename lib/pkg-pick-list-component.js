/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import Immutable from 'immutable'
import log4js from 'log4js'

import PkgSelectList from './pkg-select-list-component'
import {addIfMissing} from './pkg-groups-functions'

const logger = log4js.getLogger('pkg-pick-list-component')
logger.level = 'warn'

/**
 * An Etch component to display two lists side-by-side, with buttons to move
 *   selected items from one side to the other
 * @param {Object} props
 * @param {string[]} props.leftList - Array of items to display on left side
 * @param {string[]} props.rightList - Array of items to display on right side
 * @param {?string} props.id - will be the id= of the outermost <div>
 * @param {?integer} props.rightSelected - index of current selection in
 *   rightList, if any
 * @param {?integer} props.leftSelected - index of current selection in
 *   leftList, if any
 * @param {?string} props.leftLabel - label applied to left list
 * @param {?string} props.rightLabel - label applied to right list
 * @emits change - when an item is moved from one list to the other. The Event
 *   object will have a property `data` which [direction, item] where
 *   `direction` is 'right' or 'left' and item is the item moved.
 */
export default class PkgPickList {
  constructor (props = {
    id: '',
    rightList: [],
    leftList: [],
    rightSelected: null,
    leftSelected: null,
    leftLabel: '',
    rightLabel: ''
  }) {
    this._setprops(props)
    etch.initialize(this)
  }

  static propFilter = new Immutable.Set(['rightList', 'leftList', 'rightSelected', 'leftSelected', 'rightLabel', 'leftLabel'])

  didClickRightItem = (item, index) => this.move('left', item)

  didClickLeftItem = (item, index) => this.move('right', item)

  /** ensure lists in this.props are Sets, and className includes 'package-pick-list' */
  _setprops (newProps) {
    this.props = newProps

    // ensure some defaults
    this.props.leftLabel = newProps.leftLabel || ''
    this.props.rightLabel = newProps.rightLabel || ''
    if (this.props.className === '') {
      // make sure addIfMissing doesn't stick space in front
      this.props.className = null
    }
    if (!(this.props.rightList instanceof Immutable.Set)) {
      this.props.rightList = new Immutable.Set(this.props.rightList)
    }
    if (!(this.props.leftList instanceof Immutable.Set)) {
      this.props.leftList = new Immutable.Set(this.props.leftList)
    }
    this.props.className = addIfMissing(this.props.className, 'package-pick-list', ' ')
  }

  /**
   * items on the left
   * @type {Immutable.Set}
   */
  get left () {
    return this.props.leftList
  }

  /**
   * items on the right
   * @type {Immutable.Set}
   */
  get right () {
    return this.props.rightList
  }

  /**
   * Move the item `item` from the other side to the `direction` side.
   *
   * @param {string} direction - either 'right' or 'left'.
   * @param {string} item - item to move.
   *
   * @throws {Error} if `item` is not found in the "from" list
   * @emits change
   * @return {Promise} the promise from `update()`
   */
  move (direction, item) {
    if (direction === 'right') {
      if (!(this.props.leftList.includes(item))) {
        throw new Error(`value ${item} not found in left list`)
      }
      this.props.rightList = this.props.rightList.add(item)
      this.props.leftList = this.props.leftList.delete(item)
    } else {
      if (!(this.props.rightList.includes(item))) {
        throw new Error(`value ${item} not found in right list`)
      }
      this.props.rightList = this.props.rightList.delete(item)
      this.props.leftList = this.props.leftList.add(item)
    }
    return this.update(this.props).then(() => {
      if (this.props.on && this.props.on.change) {
        this.props.on.change({'data': [direction, item]})
      }
    })
  }

  /**
   * Update the component with new properties `props`
   * @return {Promise} promise resolved when etch completes update
   */
  update (props) {
    this._setprops(props)
    return etch.update(this)
  }

  /**
   * Standard etch render()
   * @return {{tag: string, props: Object, children: Array<Object>}} The constructed component
   */
  render () {
    /* creae set of properties that apply to top-level div */
    let passThroughProps = {}
    for (const key in this.props) {
      if (!PkgPickList.propFilter.has(key)) {
        passThroughProps[key] = this.props[key]
      }
    }
    const leftItems = this.props.leftList.toJS()
    const rightItems = this.props.rightList.toJS()

    return <div {...passThroughProps}>
      <div className='pick-list-left-list'>
        <p className='pick-list-header'>{this.props.leftLabel}</p>
        <PkgSelectList on={{change: this.didClickLeftItem}} items={leftItems}
          emptyMessage={'no packages found'} selectableItems={false} />
      </div>
      <div className='pick-list-right-list'>
        <p className='pick-list-header'>{this.props.rightLabel}</p>
        <PkgSelectList on={{change: this.didClickRightItem}} items={rightItems}
          emptyMessage={'no packages selected'} selectableItems={false} />
      </div>
    </div>
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
