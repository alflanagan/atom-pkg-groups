/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'
import Immutable from 'immutable'

import PkgPickList from '../lib/pkg-pick-list-component'
import PkgListComponent from '../lib/pkg-list-component'

const logger = log4js.getLogger('pkg-pick-list-component-spec')
logger.level = 'debug'

describe('PkgSelectList', () => {
  describe('construction', () => {
    it('does not require arguments', () => {
      const ppl = new PkgPickList()
      expect(ppl.right.toJS()).toEqual([])
      expect(ppl.left.toJS()).toEqual([])
      expect(ppl.id).toBeUndefined()
    })

    it('correctly sets lists', () => {
      const ppl = new PkgPickList({
        rightList: [
          'a', 'b', 'c'
        ],
        leftList: ['1', '2', '3']
      })
      expect(ppl.right).toEqual(new Immutable.Set(['a', 'b', 'c']))
    })
  })

  describe('render', () => {
    it('renders with empty lists', () => {
      const pick = new PkgPickList()
      const dom = pick.render()
      expect(dom).toEqual(
        <div className='package-pick-list'>
          <PkgListComponent className='pick-list-left-list' items={new Immutable.Set([])} />
          <div className='pick-list-button-col'>
            <button className='pick-list-btn-move-right'>&lt;&lt;</button>
            <button className='pick-list-btn-move-left'>&gt;&gt;</button>
          </div>
          <PkgListComponent className='pick-list-right-list' items={new Immutable.Set([])} />
        </div>
      )
    })

    it('renders lists as expected', () => {
      const pick = new PkgPickList({
        rightList: [
          'pkg1', 'pkg2', 'pkg3'
        ],
        leftList: ['pkg4', 'pkg5']
      })
      const dom = pick.render()
      expect(dom).toEqual(
        <div className='package-pick-list'>
          <PkgListComponent className='pick-list-left-list' items={new Immutable.Set(['pkg4', 'pkg5'])} />
          <div className='pick-list-button-col'>
            <button className='pick-list-btn-move-right'>&lt;&lt;</button>
            <button className='pick-list-btn-move-left'>&gt;&gt;</button>
          </div>
          <PkgListComponent className='pick-list-right-list' items={new Immutable.Set(['pkg1', 'pkg2', 'pkg3'])} />
        </div>
      )
    })
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
      kumquat: 'fruitbat'
    })
    const dom = pick.render()
    expect(dom).toEqual(
      <div className='package-pick-list' id='my-pick-list' kumquat='fruitbat'>
        <PkgListComponent className='pick-list-left-list' items={new Immutable.Set(['pkg4', 'pkg5'])} />
        <div className='pick-list-button-col'>
          <button className='pick-list-btn-move-right'>&lt;&lt;</button>
          <button className='pick-list-btn-move-left'>&gt;&gt;</button>
        </div>
        <PkgListComponent className='pick-list-right-list' items={new Immutable.Set(['pkg1', 'pkg2', 'pkg3'])} />
      </div>
    )
  })
  describe('move', () => {})
})
