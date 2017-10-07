/** @babel */
/* eslint-env jasmine */

import PkgGroupsView from '../lib/pkg-groups-view'

describe('PkgGroupsView', () => {
  describe('constructor', () => {
    it('does not require arguments', () => {
      let fred = new PkgGroupsView()
      expect(fred.children).not.toExist()
      expect(fred.props).toEqual({})
      // attributes added to component by etch.initialize()
      expect(fred.virtualNode['tag']).toEqual('div')
      expect(fred.virtualNode['props']['className']).toEqual('pkg-groups')
      expect(fred.virtualNode['children']).toBeInstanceOf(Array)
      expect(fred.element).toExist()
      expect(fred.refs).toEqual({})
    })
  })
})
