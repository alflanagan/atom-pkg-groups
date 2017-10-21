/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine,browser  */
/* global waitsForPromise */

import etch from 'etch'
import log4js from 'log4js'
import path from 'path'

import PkgSelectList from '../lib/pkg-select-list-component'
import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars
import {promiseAnEvent} from '../lib/pkg-groups-functions'

const logger = log4js.getLogger(path.basename(__filename, '.js'))
logger.level = 'warn'

describe('PkgSelectList', () => {
  describe('construction', () => {
    const sl = new PkgSelectList()

    it('requires no arguments', () => {
      expect(sl).toBeInstanceOf(PkgSelectList)
      expect(sl.items).toEqual([])
      expect(sl.default).toBeNull()
    })

    it('sets properties', () => {
      const items = ['a', 'b', 'c']
      const psl = new PkgSelectList({items: items, 'default': 'b'})
      expect(psl.items).toEqual(items)
      expect(psl.default).toEqual('b')
    })
  })

  describe('a component renders', () => {
    it('renders an empty list', () => {
      const psl = new PkgSelectList()
      const dom = psl.render()
      const expected = <div className={PkgSelectList.classTag}>
        <ul on={{click: psl.didClick}} />
      </div>
      expect(dom).toEqual(expected)
    })

    it('renders as a list', () => {
      const items = ['a', 'b', 'c']
      const psl = new PkgSelectList({items})
      const dom = psl.render()
      const expected = <div className={PkgSelectList.classTag}>
        <ul on={{click: psl.didClick}}>
          <li value='0'>a</li>
          <li value='1'>b</li>
          <li value='2'>c</li>
        </ul>
      </div>
      // const diffs = new DomDiff(dom, expected)
      // if (!diffs.noDifferences()) {
      //   logger.debug(diffs.toString())
      // }
      expect(dom).toEqual(expected)
    })

    it('renders as a list with a selected item', () => {
      const items = ['a', 'b', 'c']
      const psl = new PkgSelectList({items: items, 'default': 'b'})
      const dom = psl.render()
      const expected = <div className={PkgSelectList.classTag}>
        <ul on={{click: psl.didClick}}>
          <li value='0'>a</li>
          <li className='selected' value='1'>b</li>
          <li value='2'>c</li>
        </ul>
      </div>
      expect(dom).toEqual(expected)
    })

    it('correctly renders class attribute', () => {
      const items = ['a', 'b', 'c']
      const psl = new PkgSelectList({items: items, 'default': 'b', className: 'fred wilma'})
      const dom = psl.render()
      const expected = <div className={`fred wilma ${PkgSelectList.classTag}`}>
        <ul on={{click: psl.didClick}}>
          <li value='0'>a</li>
          <li className='selected' value='1'>b</li>
          <li value='2'>c</li>
        </ul>
      </div>
      expect(dom).toEqual(expected)
    })
  })

  describe('a component may be updated', () => {
    it('renders using new properties', () => {
      const items = ['a', 'b', 'c']
      const psl = new PkgSelectList({
        items: ['1', '2', '3']
      })
      psl.update({items: items, 'default': 'b'})
      const dom = psl.render()
      const expected = <div className={PkgSelectList.classTag}>
        <ul on={{click: psl.didClick}}>
          <li value='0'>a</li>
          <li className='selected' value='1'>b</li>
          <li value='2'>c</li>
        </ul>
      </div>
      expect(dom).toEqual(expected)
    })
  })

  describe('event handling', () => {
    describe('a select list changes selected item on mouse click', () => {
      it('generates a change event', async() => {
        const items = ['a', 'b', 'c']
        const psl = new PkgSelectList({items: items, 'default': 'a', id: 'some-psl'})
        expect(psl.element).toBeInstanceOf(HTMLDivElement)
        /* create actual DOM for testing */
        const newElement = document.createElement('div')
        newElement.appendChild(psl.element)
        const itemb = newElement.children[0].children[0].children[1]
        expect(itemb.getAttribute('value')).toEqual('1')
        expect(itemb.tagName).toEqual('LI')
        /* this is undoubtedly more complex than it needs to be. but it works */
        let prom = promiseAnEvent(psl.onChange, () => itemb.click()).then((selected) => {
          expect(selected).toEqual('b')
          const dom = psl.render()
          const anonOnClick = dom.children[0].props['on']['click']
          const expected = <div className='pkg-select-list' id='some-psl'>
            <ul on={{'click': anonOnClick}}>
              <li value='0'>a</li>
              <li value='1' className='selected'>b</li>
              <li value='2'>c</li>
            </ul>
          </div>
          expect(dom).toEqual(expected)
          // expect(psl.props.default).toEqual('b')
        })
        waitsForPromise(() => prom)
      })

      it('correctly sets up event handler from JSX representation', () => {
        const newElement = document.createElement('div')
        // TODO: use jasmine spy instead
        let wasCalled = false
        const didClick = (evt) => {
          wasCalled = true
        }
        const psl = <PkgSelectList id='pkg-select-list-tester'
          items={['item1', 'item2', 'item3']}
          on={{click: didClick}} />

        newElement.appendChild(etch.render(psl))
        let item2 = newElement.children[0].children[0].children[1]
        item2.click()
        expect(wasCalled).toBe(true)
        /* now we re-render the element */
        newElement.removeChild(newElement.children[0])
        newElement.appendChild(etch.render(psl))
        /* and get the new item2 */
        item2 = newElement.children[0].children[0].children[1]

        let hasClass = false
        for (let attr of item2.attributes) {
          if (attr.name === 'value') {
            expect(attr.value).toEqual('1')
          }
          if (attr.name === 'class') {
            hasClass = true
            expect(attr.value).toEqual('selected')
          }
          expect(hasClass).toBe(true)
        }
      })
    })
  })
})
