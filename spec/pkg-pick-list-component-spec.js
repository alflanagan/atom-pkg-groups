/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'
import Immutable from 'immutable'

import PkgPickList from '../lib/pkg-pick-list-component'

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
      const ppl = new PkgPickList({rightList: ['a', 'b', 'c'], leftList: ['1', '2', '3']})
      expect(ppl.right).toEqual(new Immutable.Set(['a', 'b', 'c']))
    })
  })
})
