/** @babel */

/* eslint-env jasmine */
import Immutable from "immutable"

import { PkgGroupsGroup, PkgGroupsMeta, PkgGroupsModel } from '../lib/pkg-groups-model'

fdescribe('PkgGroupsGroup', () => {
  it('has a name', () => {
    let fred = new PkgGroupsGroup('fred', [])
    expect(fred.name).toBe('fred')
  })
  it('has a list of packages', () => {
    let pkgList = ['pkg-groups', 'MagicPython', 'project-manager']
    let betty = new PkgGroupsGroup('test1', pkgList)
    expect(betty.name).toBe('test1')
    expect(betty.packages).toEqual(new Immutable.Set(pkgList))
    for (let pkg of pkgList) {
      expect(betty.cont)
    }
  })
})

describe('PkgGroupsModel', () => {
  it('can construct as empty object', () => {
    let model = new PkgGroupsModel()
    expect(new Set(model.groupNames()).size).toBe(0)
    expect(new Set(model.metaNames()).size).toBe(0)
  })

  it('can construct from objet literal', () => {
    let model = new PkgGroupsModel({
      'group1': {'enabled': ['fred', 'sally', 'barney'],
        'disabled': ['betty']},
      'group2': {'enabled': ['frank'],
        'disabled': ['tom', 'dick', 'harry']},
      'meta1': ['group1', 'group2']
    })
    let names = new Set(model.groupNames())
    expect(names.size).toBe(2)
    expect(names).toContain('group1')
    expect(names).toContain('group2')
    let metas = new Set(model.metaNames())
    expect(metas.size).toBe(1)
    expect(metas).toContain('meta1')
    let groups = model.metaGroups('meta1')
    expect(groups).toContain('group1')
    expect(groups).toContain('group2')
  })
})
