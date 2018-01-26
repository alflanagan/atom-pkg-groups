/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import Immutable from 'immutable'
import log4js from 'log4js'

import PkgSelectList from './pkg-select-list-component'
import {addIfMissing} from './pkg-groups-functions'

const logger = log4js.getLogger('pkg-pick-list-component')
logger.level = 'debug'

/**
 * An Etch component to display two lists side-by-side, with buttons to move
 *   selected items from one side to the other
 *
 * Note click on button just emits event, parent is expected to call update()
 * with results of user interaction.
 *
 * @param {Object} props
 * @param {string[]} props.leftList - Array of items to display on left side
 * @param {string[]} props.rightList - Array of items to display on right side
 * @param {?string} props.leftLabel - label applied to left list
 * @param {?string} props.rightLabel - label applied to right list
 *
 * Other properties will become properties on the top-most &lt;div&gt; in the
 * rendered component.
 *
 * @emits selectLeft when user clicks item in left list. Event object will have
 * property `data` with the text of the item clicked.
 *
 * @emits selectRight when user clicks item in right list. Event object will have
 * property `data` with the text of the item clicked.
 */
export default class PkgPickList {
  constructor (props = {
    rightList: [],
    leftList: [],
    leftLabel: '',
    rightLabel: ''
  }) {
    this._setprops(props)
    etch.initialize(this)
  }

  static propFilter = new Immutable.Set(['rightList', 'leftList', 'rightLabel', 'leftLabel', 'on'])

  didClickRightItem = (item) => {
    if (this.props.on.selectRight) {
      return this.props.on.selectRight(item)
    }
  }

  didClickLeftItem = (item) => {
    if (this.props.on.selectLeft) {
      return this.props.on.selectLeft(item)
    }
  }

  /** ensure lists in this.props are Sets, and className includes 'package-pick-list' */
  _setprops (newProps) {
    try {
      this.props = newProps

      // ensure some defaults
      this.props.on = newProps.on || {}
      this.props.leftLabel = newProps.leftLabel || ''
      this.props.rightLabel = newProps.rightLabel || ''
      if (!(this.props.rightList instanceof Immutable.Set)) {
        this.props.rightList = new Immutable.Set(this.props.rightList)
      }
      if (!(this.props.leftList instanceof Immutable.Set)) {
        this.props.leftList = new Immutable.Set(this.props.leftList)
      }
      this.props.className = addIfMissing(this.props.className, 'package-pick-list', ' ')
    } catch (e) {
      logger.error(`Error caught in PkgPickList::_setprops: ${e}`)
      throw e
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
    /* create set of properties that apply to top-level div */
    try {
      let passThroughProps = {}
      for (const key in this.props) {
        if (!PkgPickList.propFilter.has(key)) {
          passThroughProps[key] = this.props[key]
        }
      }
      const leftItems = this.props.leftList.toJS()
      const rightItems = this.props.rightList.toJS()

      return <div className={this.props.className} {...passThroughProps}>
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
    } catch (e) {
      logger.error(`Got error in PkgPickList.render: ${e}`)
      throw e
    }
  }

  async destroy () {
    await etch.destroy(this)
    this.props = null
  }
}
