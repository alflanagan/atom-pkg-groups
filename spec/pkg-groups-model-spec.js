/** @babel */

/* eslint-env jasmine */

import PkgGroupsModel from '../lib/pkg-groups-model'

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
