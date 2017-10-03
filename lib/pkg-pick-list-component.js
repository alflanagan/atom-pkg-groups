/** @babel */
/** @jsx etch.dom */

import Immutable from 'immutable'
import etch from 'etch'
import PkgListComponent from './pkg-list-component'

/**
 * An Etch component to display two lists side-by-side, with buttons to move
 * selected items from one side to the other
 *
 * @param props
 *    * leftList -- Array of items to display on left side
 *    * rightList -- Array of items to display on right side
 *    * id -- will be the id= of the outermost <div>
 */
export default class PkgPickList {
  constructor (props = {rightList: [], leftList: []}) {
    this.rightList = new Immutable.Set(props.rightList)
    this.leftList = new Immutable.Set(props.leftList)
    this.id = props.id
    etch.initialize(this)
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
    let newProps = {rightList: [], leftList: []}
    // set up source, destination lists according to direction
    const [fromList, newFrom] = direction === 'right' ? [this.leftList, newProps.leftList] : [this.rightList, this.props.rightList]
    const [toList, newTo] = direction === 'right' ? [this.rightList, this.props.rightList] : [this.leftList, this.props.leftList]
    for (const member of fromList) {
      if (member !== item) {
        newFrom.push(member)
      } else {
        // Set() guarantees this happens once, or never
        newTo.push(item)
        newTo.push(...toList.toJS())
      }
    }
    return this.update(newProps)
  }

  // Required: Update the component with new properties
  // note: if id not provided, component will retain old value
  // but a list not provided will be empty
  update (props) {
    this.props = props || {}
    this.rightList = new Immutable.Set(props.rightList)
    this.leftList = new Immutable.Set(props.leftList)
    this.id = props.id || this.id
    return etch.update(this)
  }

  render () {
    return <div className='package-pick-list'>
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
