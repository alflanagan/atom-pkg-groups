/** @babel */
/** @jsx etch.dom */

import Immutable from 'immutable'
import etch from 'etch'
import PkgListComponent from './pkg-list-component'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-pick-list-component')
logger.level = 'warn'

/**
 * An Etch component to display two lists side-by-side, with buttons to move
 * selected items from one side to the other
 *
 * @param props.leftList -- Array of items to display on left side
 * @param props.rightList -- Array of items to display on right side
 * @param props.id -- will be the id= of the outermost <div>
 */
export default class PkgPickList {
  constructor (props = {
    rightList: [],
    leftList: []
  }) {
    this._setprops(props)
    etch.initialize(this)
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
      this.props.className = `package-pick-list {this.props.className}`
    }
  }

  /**
   * an Immutable.Set of items on the left
   */
  get left () {
    return this.props.leftList
  }

  /**
   * an Immutable.Set of items on the right
   */
  get right () {
    return this.props.rightList
  }

  /**
   * Move the item `item` from the other side to the `direction` side
   * returns a Promise like update()
   * @param {String} direction -- either 'right' or 'left'
   * @param {any} item -- item to move. The item must be in the source list
   * or nothing will happen
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

  // Required: Update the component with new properties
  // note: if id not provided, component will retain old value
  // but a list not provided will be empty
  update (props) {
    this._setprops(props)
    return etch.update(this)
  }

  render () {
    /* all properties *except* lists get sent to top-level <div> */
    let passThroughProps = {}
    for (const prop in this.props) {
      if (prop !== 'rightList' && prop !== 'leftList') {
        passThroughProps[prop] = this.props[prop]
      }
    }
    return <div {...passThroughProps}>
      <PkgListComponent className='pick-list-left-list' items={this.props.leftList} />
      <div className='pick-list-button-col'>
        <button className='pick-list-btn-move-right'>&lt;&lt;</button>
        <button className='pick-list-btn-move-left'>&gt;&gt;</button>
      </div>
      <PkgListComponent className='pick-list-right-list' items={this.props.rightList} />
    </div>
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
