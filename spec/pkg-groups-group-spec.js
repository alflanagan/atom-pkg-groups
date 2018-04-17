/** @babel */

/* eslint-env jasmine */
import log4js from 'log4js'
import PkgGroupsGroup from '../lib/pkg-groups-group'

const logger = log4js.getLogger('pkg-groups-group-spec')
logger.level = 'debug'

describe('PkgGroupsGroup', () => {
  let betty
  const pkgList = ['pkg-groups', 'MagicPython', 'project-manager']

  beforeEach(() => {
    betty = new PkgGroupsGroup({name: 'test1', packages: pkgList, type: 'group', deserializer: 'pkgGroupsGroup'})
  })

  it('has a name', () => {
    let fred = new PkgGroupsGroup({name: 'fred', packages: [], type: 'group'})
    expect(fred.name).toBe('fred')
  })

  it('has a list of packages', () => {
    expect(betty.name).toBe('test1')
    for (const pkg of pkgList) {
      expect(betty.has(pkg))
    }
    expect(betty.size).toEqual(pkgList.length)
  })

  it('serializes', () => {
    let data = betty.serialize()
    // verify that data is in fact convertible
    let checkConvert = JSON.stringify(data)
    expect(checkConvert).toContain('"type":"group"')
    expect(data['type']).toEqual('group')
    expect(data['name']).toEqual('test1')
    expect(data['packages']).toContain('pkg-groups')
    expect(data['deserializer']).toEqual('PkgGroupsGroup')
  })

  it('can call a function with each package', () => {
    let actual = []
    /* actual signature is (value, key, iter) */
    /* for a Set value === key, and iter === the Set */
    const add = (value) => actual.push(value)
    betty.forEach(add)
    const expected = ['pkg-groups', 'MagicPython', 'project-manager']
    expect(actual).toEqual(expected)
  })

  it('can pass a context to the callback', () => {
    let actualContext = { pkgs: [] }
    const expected = ['pkg-groups', 'MagicPython', 'project-manager']
    /* actual signature is (value, key, iter) */
    /* for a Set value === key, and iter === the Set */
    const add = function (value) { this.pkgs.push(value) }
    betty.forEach(add, actualContext)
    expect(actualContext.pkgs).toEqual(expected)
  })
})
