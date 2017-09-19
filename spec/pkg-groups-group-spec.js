/** @babel */

/* eslint-env jasmine */
import log4js from 'log4js'
import Immutable from 'immutable'
import PkgGroupsGroup from '../lib/pkg-groups-group'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgGroupsGroup', () => {
  let betty
  const pkgList = ['pkg-groups', 'MagicPython', 'project-manager']

  beforeEach(() => {
    betty = new PkgGroupsGroup('test1', pkgList)
  })

  it('has a name', () => {
    let fred = new PkgGroupsGroup('fred', [])
    expect(fred.name).toBe('fred')
  })

  it('has a list of packages', () => {
    expect(betty.name).toBe('test1')
    expect(betty.packages).toEqual(new Immutable.Set(pkgList))
    for (let pkg of pkgList) {
      expect(betty.has(pkg))
    }
  })

  it('serializes', () => {
    let data = betty.serialize()
    // verify that data is in fact convertible
    let checkConvert = JSON.stringify(data)
    expect(checkConvert).toContain('"type":"group"')
    expect(data['type']).toEqual('group')
    expect(data['name']).toEqual('test1')
    expect(data['packages']).toContain('pkg-groups')
  })

  it('can call a function with each package', () => {})
})
