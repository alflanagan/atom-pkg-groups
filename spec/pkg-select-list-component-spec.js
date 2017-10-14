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
import {PkgSelectListChangeEvent} from '../lib/pkg-groups-events'

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
      const dom = new PkgSelectList().render()
      /* this is kind of cheating, but was easiest thing that worked */
      const cback = dom.children[0].props['onclick']
      const expected = <div className={PkgSelectList.classTag}>
        <ul onclick={cback} />
      </div>
      expect(dom).toEqual(expected)
    })

    it('renders as a list', () => {
      const items = ['a', 'b', 'c']
      const dom = new PkgSelectList({items}).render()
      const cback = dom.children[0].props['onclick']
      const expected = <div className={PkgSelectList.classTag}>
        <ul onclick={cback}>
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
      const dom = new PkgSelectList({items: items, 'default': 'b'}).render()
      const cback = dom.children[0].props['onclick']
      const expected = <div className={PkgSelectList.classTag}>
        <ul onclick={cback}>
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
        <ul onclick={psl.handleClick}>
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
      const cback = dom.children[0].props['onclick']
      const expected = <div className={PkgSelectList.classTag}>
        <ul onclick={cback}>
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
      it('generates a PkgSelectListChangeEvent', async() => {
        logger.debug('test PkgSelectListChangeEvent')
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
        let prom = promiseAnEvent(psl.onChange, () => itemb.click()).then((evt) => {
          expect(evt).toBeInstanceOf(PkgSelectListChangeEvent)
          logger.debug('change event complete')
          const dom = psl.render()
          const expected = <div className='pkg-select-list'>
            <ul onclick={psl.handleClick}>
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
    })
  })
})
