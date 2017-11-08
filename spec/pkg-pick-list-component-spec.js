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
      const dom = fred.render()
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
      expect(dom).toEqual(expected)
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
      expect(diff.noDifferences()).toBe(true)
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
      waitsForPromise(() => {
        return pick.move('right', 'pkg5').then(() => {
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
          expect(pick.render()).toEqual(expected)
        })
      })
    })

    it('can move an item from right to left, and re-render.', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5']
      })
      waitsForPromise(() => {
        return pick.move('left', 'pkg3').then(() => {
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
          expect(pick.render()).toEqual(expected)
        })
      })
    })

    it('raises change event', () => {
      const changeCallback = jasmine.createSpy('changeCallback')
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5'],
        on: {change: changeCallback}
      })

      waitsForPromise(() => {
        return pick.move('right', 'pkg4').then(() => {
          expect(changeCallback).toHaveBeenCalledWith({data: ['right', 'pkg4']})
        })
      })
    })
  })

  describe('event handling', () => {
    it('responds to click in left select list', () => {
      const changeCallback = jasmine.createSpy('changeCallback')
      const pick = <PkgPickList rightList={['pkg1', 'pkg2', 'pkg3']} leftList={['pkg4', 'pkg5']} on={{change: changeCallback}} />
      let newElem = document.createElement('div')
      let dom = etch.render(pick)
      newElem.appendChild(dom)
      /* sheesh. XPath library, anyone? */
      let pkg5Li = newElem.children[0].children[0].children[1].children[0].children[1]
      expect(pkg5Li.tagName).toEqual('LI')
      expect(pkg5Li.innerHTML).toEqual('pkg5')  // got the right element
      pkg5Li.click()
      waitsFor(() => changeCallback.calls.length === 1)
      runs(() => {
        expect(changeCallback).toHaveBeenCalledWith({data: ['right', 'pkg5']})
        const leftFunc = pick.component.virtualNode.children[0].children[1].props.on.change
        const rightFunc = pick.component.virtualNode.children[1].children[1].props.on.change
        const leftList = <PkgSelectList on={{change: leftFunc}} items={['pkg4']}
          emptyMessage={'no packages found'} selectableItems={false} />
        const rightList = <PkgSelectList on={{change: rightFunc}} items={['pkg1', 'pkg2', 'pkg3', 'pkg5']}
          emptyMessage={'no packages selected'} selectableItems={false} />

        const expected = <div on={{change: changeCallback}} className='package-pick-list'>
          <div className='pick-list-left-list'>
            <p className='pick-list-header'>{''}</p>
            {leftList}
          </div>
          <div className='pick-list-right-list'>
            <p className='pick-list-header'>{''}</p>
            {rightList}
          </div>
        </div>

        const diff = new DomDiff(pick.component.virtualNode, expected)
        logger.debug(diff.toString())
        expect(diff.noDifferences()).toBe(true)
      })
    })

    it('responds to click in right select list', () => {
      const changeCallback2 = jasmine.createSpy('changeCallback2')
      const pick = <PkgPickList rightList={['pkg1', 'pkg2', 'pkg3']} leftList={['pkg4', 'pkg5']} on={{change: changeCallback2}} />
      let newElem = document.createElement('div')
      let dom = etch.render(pick)
      newElem.appendChild(dom)
      /* sheesh. XPath library, anyone? */
      const pkg2Li = newElem.children[0].children[1].children[1].children[0].children[1]
      expect(pkg2Li.tagName).toEqual('LI')
      expect(pkg2Li.innerHTML).toEqual('pkg2')  // got the right element
      pkg2Li.click()
      waitsFor(() => changeCallback2.calls.length === 1)
      runs(() => {
        expect(changeCallback2).toHaveBeenCalledWith({data: ['left', 'pkg2']})
        const leftFunc = pick.component.virtualNode.children[0].children[1].props.on.change
        const rightFunc = pick.component.virtualNode.children[1].children[1].props.on.change
        const leftList = <PkgSelectList on={{change: leftFunc}} items={['pkg4', 'pkg5', 'pkg2']}
          emptyMessage={'no packages found'} selectableItems={false} />
        const rightList = <PkgSelectList on={{change: rightFunc}} items={['pkg1', 'pkg3', 'pkg5']}
          emptyMessage={'no packages selected'} selectableItems={false} />

        const expected = <div on={{change: changeCallback2}} className='package-pick-list'>
          <div className='pick-list-left-list'>
            <p className='pick-list-header'>{''}</p>
            {leftList}
          </div>
          <div className='pick-list-right-list'>
            <p className='pick-list-header'>{''}</p>
            {rightList}
          </div>
        </div>

        const diff = new DomDiff(pick.component.virtualNode, expected)
        logger.debug(diff.toString())
        expect(diff.noDifferences()).toBe(true)
      })
    })
  })
})
