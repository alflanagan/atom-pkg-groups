/** @babel */

/* eslint-env jasmine */

import PkgGroupsView from '../lib/pkg-groups-view'

describe('PkgGroupsView', () => {
  it('constructs', () => {
    let view = new PkgGroupsView()
    expect(view instanceof PkgGroupsView).toBe(true)
    expect(view.props).toEqual({})
    expect(view.children).toEqual([])
  })
})
