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

  _setprops (newProps) {
    this.props = {}
    /* make copy for safety */
    Object.assign(this.props, newProps)
    this.rightList = new Immutable.Set(this.props.rightList)
    this.leftList = new Immutable.Set(this.props.leftList)
    /* remove those props so they don't get set on <div> */
    delete this.props.rightList
    delete this.props.leftList
    if (!this.props.className) {
      this.props.className = 'package-pick-list'
    } else if (!this.props.className.includes('package-pick-list')) {
      this.props.className = `package-pick-list {this.props.className}`
    }
    this.id = this.props.id/* we do want this set on <div> */
  }

  /**
   * an Immutable.Set of items on the left
   */
  get left () {
    return this.leftList
  }

  /**
   * an Immutable.Set of items on the right
   */
  get right () {
    return this.rightList
  }

  /**
   * Move the item `item` from the other side to the `direction` side
   * returns a Promise like update()
   * @param {String} direction -- either 'right' or 'left'
   * @param {any} item -- item to move. The item must be in the source list
   * or nothing will happen
   */
  move (direction, item) {
    let newProps = {}
    Object.assign(newProps, this.props)

    if (direction === 'right') {
      if (!(this.leftList.includes(item))) {
        throw new Error(`value ${item} not found in left list`)
      }
      newProps.rightList = this.rightList.add(item)
      newProps.leftList = this.leftList.delete(item)
    } else {
      if (!(this.rightList.includes(item))) {
        throw new Error(`value ${item} not found in right list`)
      }
      newProps.rightList = this.rightList.delete(item)
      newProps.leftList = this.leftList.add(item)
    }
    return this.update(newProps)
  }

  // Required: Update the component with new properties
  // note: if id not provided, component will retain old value
  // but a list not provided will be empty
  update (props) {
    this._setprops(props)
    logger.debug(this.rightList)
    return etch.update(this)
  }

  render () {
    return <div {...this.props}>
      <PkgListComponent className='pick-list-left-list' items={this.leftList} />
      <div className='pick-list-button-col'>
        <button className='pick-list-btn-move-right'>&lt;&lt;</button>
        <button className='pick-list-btn-move-left'>&gt;&gt;</button>
      </div>
      <PkgListComponent className='pick-list-right-list' items={this.rightList} />
    </div>
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
