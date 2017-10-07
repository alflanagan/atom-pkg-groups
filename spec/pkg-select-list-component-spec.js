/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'
import path from 'path'

import PkgSelectList from '../lib/pkg-select-list-component'

const logger = log4js.getLogger(path.basename(__filename, '.js'))
logger.level = 'debug'

describe('PkgSelectList', () => {
  describe('construction', () => {
    const sl = new PkgSelectList()
    it('reuires no arguments', () => {
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

  describe('a component with no props', () => {
    it('renders an empty list', () => {
      const dom = new PkgSelectList().render()
      expect(dom).toEqual(
        <div className={PkgSelectList.classTag}>
          <ul />
        </div>
      )
    })
  })

  describe('A component may have items', () => {
    it('renders as a list', () => {
      const items = ['a', 'b', 'c']
      const dom = new PkgSelectList({items}).render()
      expect(dom).toEqual((
        <div className={PkgSelectList.classTag}>
          <ul>
            <li>a</li>
            <li>b</li>
            <li>c</li>
          </ul>
        </div>
      ))
    })
  })

  describe('a component may have a default selection', () => {
    it('renders as a list', () => {
      const items = ['a', 'b', 'c']
      const dom = new PkgSelectList({items: items, 'default': 'b'}).render()
      expect(dom).toEqual((
        <div className={PkgSelectList.classTag}>
          <ul>
            <li>a</li>
            <li className='selected'>b</li>
            <li>c</li>
          </ul>
        </div>
      ))
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
      expect(dom).toEqual((
        <div className={PkgSelectList.classTag}>
          <ul>
            <li>a</li>
            <li className='selected'>b</li>
            <li>c</li>
          </ul>
        </div>
      ))
    })
  })
})
