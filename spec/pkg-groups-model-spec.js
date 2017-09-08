/** @babel */

/* eslint-env jasmine */
import Immutable from 'immutable'

import PkgGroupsModel, { PkgGroupsGroup, PkgGroupsMeta } from '../lib/pkg-groups-model'

describe('PkgGroupsGroup', () => {
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
      expect(betty.has(pkg))
    }
  })

  it('serializes', () => {
    let pkgList = ['pkg-groups', 'MagicPython', 'project-manager']
    let betty = new PkgGroupsGroup('test1', pkgList)
    let json = betty.toJSON()
    // rather than test against a string, whose exact form is not guaranteed,
    // parse the string and check resulting object
    let data = JSON.parse(json)
    expect(data['type']).toEqual('group')
    expect(data['name']).toEqual('test1')
    expect(data['packages']).toContain('pkg-groups')
  })
})

describe('PkgGroupsMeta', () => {
  it('can construct from parameters', () => {
    let fred = new PkgGroupsMeta(
      'fred',
      {'pkg1': 'enabled', 'pkg2': 'enabled'})
    expect(fred.name).toBe('fred')
  })

  it('can construct from JSON', () => {
    let source = '{"name":"fred","type":"meta","states":{"pkg1":"enabled","pkg2":"disabled"}}'
    let fred = new PkgGroupsMeta(source)
    expect(fred.name).toBe('fred')
    expect(fred.has('pkg1')).toBe(true)
    expect(fred.has('pkg2')).toBe(true)
    expect(fred.stateOf('pkg1')).toEqual('enabled')
    expect(fred.stateOf('pkg2')).toEqual('disabled')
  })

  it('can convert to JSON', () => {
    let source = '{"name":"fred","type":"meta","states":{"pkg1":"enabled","pkg2":"disabled"}}'
    let fred = new PkgGroupsMeta(source)
    // a little dangerous since order not guaranteed, but works
    expect(fred.toJSON()).toEqual(source)
  })
})

describe('PkgGroupsModel', () => {
  it('can construct from object literal', () => {
    let model = new PkgGroupsModel({
      'group1': {'type': 'group',
        'name': 'group1',
        'packages': ['fred', 'sally', 'barney']},
      'group2': {'type': 'group',
        'name': 'group2',
        'packages': ['frank', 'tom', 'dick', 'harry']},
      'meta1': {'type': 'meta',
        'name': 'meta1',
        'states': {'group1': 'enabled', 'group2': 'enabled'}}})
    let names = new Set(model.groupNames)
    expect(names.size).toBe(2)
    expect(names.has('group1')).toBe(true)
    expect(names.has('group2')).toBe(true)
    let metas = new Set(model.metaNames)
    expect(metas.size).toBe(1)
    expect(metas.has('meta1')).toBe(true)
    expect(model.metas.get('meta1')).toBeInstanceOf(PkgGroupsMeta)
    let theMeta = model.group('meta1')
    expect(theMeta.has('group1')).toBe(true)
    expect(theMeta.has('group2')).toBe(true)
  })
})
