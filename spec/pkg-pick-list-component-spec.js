/** @babel */
/** @jsx etch.dom */

/*
 * note: env setting is read from package.json calling 'standard' from command
 *   line, but not when atom-ide-ui does diagnostics. Bug?
 */
/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'
import Immutable from 'immutable'

import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars
import PkgPickList from '../lib/pkg-pick-list-component'
import PkgSelectList from '../lib/pkg-select-list-component'

const logger = log4js.getLogger('pkg-pick-list-component-spec')
logger.level = 'warn'

describe('PkgPickList', () => {
  describe('construction', () => {
    it('does not require arguments', () => {
      const ppl = new PkgPickList()
      expect(ppl.right.toJS()).toEqual([])
      expect(ppl.left.toJS()).toEqual([])
      expect(ppl.id).toBeUndefined()
    })

    it('correctly sets properties', () => {
      const ppl = new PkgPickList({
        rightList: [
          'a', 'b', 'c'
        ],
        leftList: ['1', '2', '3'],
        id: 'test-pkg-pick-list',
        rightSelected: 'b',
        leftSelected: null,
        leftLabel: 'left',
        rightLabel: 'right'
      })
      expect(ppl.right).toEqual(new Immutable.Set(['a', 'b', 'c']))
      expect(ppl.left).toEqual(new Immutable.Set(['1', '2', '3']))
      expect(ppl.props.id).toEqual('test-pkg-pick-list')
      expect(ppl.props.rightSelected).toEqual('b')
      expect(ppl.props.leftSelected).toBe(null)
      expect(ppl.props.rightLabel).toEqual('right')
      expect(ppl.props.leftLabel).toEqual('left')
    })
  })

  describe('render', () => {
    it('renders with empty lists', () => {
      const fred = new PkgPickList()
      const dom = fred.virtualNode
      // we're not testing PkgSelectList, so just accept what was rendered
      const leftList = <PkgSelectList on={{change: fred.didClickLeftItem}} items={[]}
        emptyMessage={'no packages found'} selectableItems={false} />
      const rightList = <PkgSelectList on={{change: fred.didClickRightItem}} items={[]}
        emptyMessage={'no packages selected'} selectableItems={false} />

      const expected = <div id='' className='package-pick-list'>
        <div className='pick-list-left-list'>
          <p className='pick-list-header'>{''}</p>
          {leftList}
        </div>
        <div className='pick-list-right-list'>
          <p className='pick-list-header'>{''}</p>
          {rightList}
        </div>
      </div>
      /*
       *  <div {...passThroughProps}>
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
       */
      const diff = new DomDiff(dom, expected)
      logger.debug(diff.toString())
      expect(diff.noDifferences()).toBe(true)
    })

    it('renders lists as expected', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5'],
        id: 'a-test-pick-list',
        leftLabel: 'Left Items',
        rightLabel: 'Right Items'
      })
      const dom = pick.render()
      const expected = <div id='a-test-pick-list' className='package-pick-list'>
        <div className='pick-list-left-list'>
          <p className='pick-list-header'>Left Items</p>
          <PkgSelectList on={{change: pick.didClickLeftItem}} items={['pkg4', 'pkg5']}
            emptyMessage={'no packages found'} selectableItems={false} />
        </div>
        <div className='pick-list-right-list'>
          <p className='pick-list-header'>Right Items</p>
          <PkgSelectList on={{change: pick.didClickRightItem}} items={['pkg1', 'pkg2', 'pkg3']}
            emptyMessage={'no packages selected'} selectableItems={false} />
        </div>
      </div>
      const diff = new DomDiff(dom, expected)
      logger.debug(diff.toString())
      expect(dom).toEqual(expected)
    })

    it('appends other properties to top-level div', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: [
          'pkg4', 'pkg5'
        ],
        id: 'my-pick-list',
        kumquat: 'fruitbat',
        leftLabel: 'fred',
        rightLabel: 'barney'
      })
      const dom = pick.render()
      const expected = <div id='my-pick-list' className='package-pick-list' kumquat='fruitbat'>
        <div className='pick-list-left-list'>
          <p className='pick-list-header'>fred</p>
          <PkgSelectList on={{change: pick.didClickLeftItem}} items={['pkg4', 'pkg5']}
            emptyMessage={'no packages found'} selectableItems={false} />
        </div>
        <div className='pick-list-right-list'>
          <p className='pick-list-header'>barney</p>
          <PkgSelectList on={{change: pick.didClickRightItem}} items={['pkg1', 'pkg2', 'pkg3']}
            emptyMessage={'no packages selected'} selectableItems={false} />
        </div>
      </div>
      expect(dom).toEqual(expected)
    })

    it('appends other classes to top-level div', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: [
          'pkg4', 'pkg5'
        ],
        className: 'some-class some-other-class'
      })
      const dom = pick.render()
      const expected = <div className='some-class some-other-class package-pick-list'>
        <div className='pick-list-left-list'>
          <p className='pick-list-header'>{''}</p>
          <PkgSelectList on={{change: pick.didClickLeftItem}} items={['pkg4', 'pkg5']}
            emptyMessage={'no packages found'} selectableItems={false} />
        </div>
        <div className='pick-list-right-list'>
          <p className='pick-list-header'>{''}</p>
          <PkgSelectList on={{change: pick.didClickRightItem}} items={['pkg1', 'pkg2', 'pkg3']}
            emptyMessage={'no packages selected'} selectableItems={false} />
        </div>
      </div>
      expect(dom).toEqual(expected)
    })
  })

  describe('move', () => {
    it('can move an item from left to right, and re-render.', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5']
      })
      pick.move('right', 'pkg5').then(() => {
        expect(pick.leftList.toJS()).toEqual(['pkg4'])
        expect(pick.rightList.toJS()).toEqual(['pkg1', 'pkg2', 'pkg3', 'pkg5'])
        let dom = pick.element
        expect(dom.children[0].props['items'].toJS()).toEqual(['pkg4'])
        expect(dom.children[2].props['items'].toJS()).toEqual(['pkg1', 'pkg2', 'pkg3', 'pkg5'])
        const expected = <div className='package-pick-list'>
          <div className='pick-list-left-list'>
            <p className='pick-list-header'>{''}</p>
            <PkgSelectList on={{change: pick.didClickLeftItem}} items={['pkg4']}
              emptyMessage={'no packages found'} selectableItems={false} />
          </div>
          <div className='pick-list-right-list'>
            <p className='pick-list-header'>{''}</p>
            <PkgSelectList on={{change: pick.didClickRightItem}} items={['pkg1', 'pkg2', 'pkg3', 'pkg5']}
              emptyMessage={'no packages selected'} selectableItems={false} />
          </div>
        </div>
        expect(dom).toEqual(expected)
      })
    })

    it('can move an item from right to left, and re-render.', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5']
      })
      pick.move('left', 'pkg3').then(() => {
        expect(pick.leftList.toJS()).toEqual(['pkg4', 'pkg5', 'pkg3'])
        expect(pick.rightList.toJS()).toEqual(['pkg1', 'pkg2'])
        let dom = pick.element
        expect(dom.children[0].props['items'].toJS()).toEqual(['pkg4', 'pkg5', 'pkg3'])
        expect(dom.children[2].props['items'].toJS()).toEqual(['pkg1', 'pkg2'])
        const expected = <div className='package-pick-list'>
          <div className='pick-list-left-list'>
            <p className='pick-list-header'>{''}</p>
            <PkgSelectList on={{change: pick.didClickLeftItem}} items={['pkg4', 'pkg5', 'pkg3']}
              emptyMessage={'no packages found'} selectableItems={false} />
          </div>
          <div className='pick-list-right-list'>
            <p className='pick-list-header'>{''}</p>
            <PkgSelectList on={{change: pick.didClickRightItem}} items={['pkg1', 'pkg2']}
              emptyMessage={'no packages selected'} selectableItems={false} />
          </div>
        </div>
        expect(dom).toEqual(expected)
      })
    })
  })

  describe('event handling', () => {
    it('raises change event', () => {
      let wasCalled = false
      const changeCallback = evt => {
        logger.debug(`raises change event: changeCallback called with ${evt}`)
        expect(evt.data).toEqual(['right', 'pkg4'])
        wasCalled = true
      }
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5'],
        on: {change: changeCallback}
      })

      pick.move('right', 'pkg4').then(() => {
        expect(wasCalled).toBe(true)
      })
    })

    it('responds to click in select list', () => {
      let wasCalled = false
      function changeCallback (evt) {
        logger.debug(`responds to click: changeCallback called with ${evt}`)
        expect(evt.data).toEqual(['right', 'pkg5'])
        wasCalled = true
      }
      const pick = <PkgPickList rightList={['pkg1', 'pkg2', 'pkg3']} leftList={['pkg4', 'pkg5']} on={{change: changeCallback}} />
      let newElem = document.createElement('div')
      let dom = etch.render(pick)
      newElem.appendChild(dom)
      /* sheesh. XPath library, anyone? */
      let pkg5Li = newElem.children[0].children[0].children[1].children[0].children[1]
      expect(pkg5Li.tagName).toEqual('LI')
      expect(pkg5Li.innerHTML).toEqual('pkg5')  // got the right element
      pkg5Li.click()
      waitsFor(() => wasCalled)
      runs(() => expect(wasCalled).toBe(true))
    })
  })
})
