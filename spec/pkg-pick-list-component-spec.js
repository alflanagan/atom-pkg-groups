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
logger.level = 'debug'

describe('PkgPickList', () => {
  describe('construction', () => {
    it('does not require arguments', () => {
      const ppl = new PkgPickList()
      expect(ppl.right.toJS()).toEqual([])
      expect(ppl.left.toJS()).toEqual([])
      expect(ppl.props.id).toBeUndefined()
      expect(ppl.props.on).toEqual({})
      expect(ppl.props.leftLabel).toEqual('')
      expect(ppl.props.rightLabel).toEqual('')
      expect(ppl.props.className).toEqual('package-pick-list')
    })

    it('correctly sets properties', () => {
      const ppl = new PkgPickList({
        rightList: [
          'a', 'b', 'c'
        ],
        leftList: ['1', '2', '3'],
        id: 'test-pkg-pick-list',
        leftLabel: 'left',
        rightLabel: 'right'
      })
      expect(ppl.right).toEqual(new Immutable.Set(['a', 'b', 'c']))
      expect(ppl.left).toEqual(new Immutable.Set(['1', '2', '3']))
      expect(ppl.props.id).toEqual('test-pkg-pick-list')
      expect(ppl.props.rightLabel).toEqual('right')
      expect(ppl.props.leftLabel).toEqual('left')
      expect(ppl.props.className).toEqual('package-pick-list')
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

      const expected = <div className='package-pick-list'>
        <div className='pick-list-left-list'>
          <p className='pick-list-header'>{''}</p>
          {leftList}
        </div>
        <div className='pick-list-right-list'>
          <p className='pick-list-header'>{''}</p>
          {rightList}
        </div>
      </div>
      const element = etch.render(dom)
      let found = false
      for (let i = 0; i < element.attributes.length; i++) {
        if (element.attributes[i].name === 'class') {
          expect(element.attributes[i].value).toEqual('package-pick-list')
          found = true
        }
      }
      expect(found).toBe(true)
      const diff = new DomDiff(dom, expected)
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
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
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
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

  describe('event handling', () => {
    it('responds to click in left select list', () => {
      const changeCallback = jasmine.createSpy('changeCallback')
      const pick = <PkgPickList rightList={['pkg1', 'pkg2', 'pkg3']} leftList={['pkg4', 'pkg5']}
        on={{selectLeft: changeCallback}} />
      const newElem = document.createElement('div')
      const dom = etch.render(pick)
      newElem.appendChild(dom)

      const pkg5Li = newElem.querySelector('.pick-list-left-list ol.list-group').children[1]
      expect(pkg5Li.tagName).toEqual('LI')
      expect(pkg5Li.innerHTML).toEqual('pkg5')  // got the right element
      pkg5Li.click()
      waitsFor(() => changeCallback.calls.length === 1)
      runs(() => {
        expect(changeCallback).toHaveBeenCalledWith('pkg5')
      })
    })

    it('responds to click in right select list', () => {
      const changeCallback2 = jasmine.createSpy('changeCallback2')
      const pick = <PkgPickList rightList={['pkg1', 'pkg2', 'pkg3']} leftList={['pkg4', 'pkg5']}
        on={{selectRight: changeCallback2}} />
      let newElem = document.createElement('div')
      let dom = etch.render(pick)
      newElem.appendChild(dom)

      const pkg2Li = newElem.querySelector('.pick-list-right-list ol.list-group').children[1]
      expect(pkg2Li.tagName).toEqual('LI')
      expect(pkg2Li.innerHTML).toEqual('pkg2')  // got the right element
      pkg2Li.click()
      waitsFor(() => changeCallback2.calls.length === 1)
      runs(() => {
        expect(changeCallback2).toHaveBeenCalledWith('pkg2')
      })
    })
  })
})
