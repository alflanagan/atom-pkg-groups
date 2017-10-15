/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import Immutable from 'immutable'
import log4js from 'log4js'
import {Emitter} from 'atom'
import PkgSelectList from './pkg-select-list-component'

const logger = log4js.getLogger('pkg-pick-list-component')
logger.level = 'warn'

/**
 * An Etch component to display two lists side-by-side, with buttons to move
 * selected items from one side to the other
 *
 * @param props.leftList -- Array of items to display on left side
 * @param props.rightList -- Array of items to display on right side
 * @param props.id -- will be the id= of the outermost <div>
 * consumes MouseEvent on buttons, PkgSelectListChangeEvent on lists
 * emits PickListChangeEvent
 */
export default class PkgPickList {
  constructor (props = {
    rightList: [],
    leftList: [],
    rightSelected: null,
    leftSelected: null
  }) {
    this._setprops(props)
    this._emitter = new Emitter()
    etch.initialize(this)
  }

  /* 'experimental' syntax handled by babel */
  handleRightButton = evt => {
    logger.debug('right button clicked')
    console.log('right button clicked')
    /*
     * 1. get selected item from left list
     * 2. move from left to right
     */
  }

  handleLeftButton = evt => {
    logger.debug('left button clicked')
    console.log('left button clicked')
  }

  /** update selected item on left list */
  handleLeftSelectListChange = evt => {
    console.log('intercepted PkgSelectListChangeEvent on left list')
  }

  /** update selected item on the right list */
  handleRightSelectListChange = evt => {
    console.log('intercepted PkgSelectListChangeEvent on right list')
  }

  /** ensure lists in this.props are Sets, and className includes 'package-pick-list' */
  _setprops (newProps) {
    this.props = newProps
    if (!(this.props.rightList instanceof Immutable.Set)) {
      this.props.rightList = new Immutable.Set(this.props.rightList || [])
    }
    if (!(this.props.leftList instanceof Immutable.Set)) {
      this.props.leftList = new Immutable.Set(this.props.leftList || [])
    }
    if (!this.props.className) {
      this.props.className = 'package-pick-list'
    } else if (!this.props.className.includes('package-pick-list')) {
      this.props.className = `package-pick-list ${this.props.className}`
    }
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
   * Move the item `item` from the other side to the `direction` side returns a
   *   Promise like update()
   *
   * @param {string} direction - either 'right' or 'left'.
   * @param {string} item - item to move.
   *
   * @throws {Error} if `item` is not found in the "from" list
   *
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
    return this.update(this.props)
  }

  /** Update the component with new properties `props` */
  update (props) {
    this._setprops(props)
    return etch.update(this)
  }

  render () {
    /* all properties *except* lists get sent to top-level <div> */
    const propFilter = new Immutable.Set(['rightList', 'leftList', 'rightSelected', 'leftSelected'])
    let passThroughProps = {}
    for (const prop in this.props) {
      propFilter.has(prop) || (passThroughProps[prop] = this.props[prop])
    }
    return <div {...passThroughProps}>
      <PkgSelectList className='pick-list-left-list' on={{PkgSelectListChangeEvent: this.handleLeftSelectListChange}} items={this.props.leftList} />
      <div className='pick-list-button-col'>
        <button onclick={this.handleLeftButton} className='pick-list-btn-move-right'>&lt;&lt;</button>
        <button onclick={this.handleRightButton} className='pick-list-btn-move-left'>&gt;&gt;</button>
      </div>
      <PkgSelectList className='pick-list-right-list' on={{PkgSelectListChangeEvent: this.handleRightSelectListChange}} items={this.props.rightList} />
    </div>
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
