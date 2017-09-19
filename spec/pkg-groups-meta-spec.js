/** @babel */

/* eslint-env jasmine */
import log4js from 'log4js'
import PkgGroupsMeta from '../lib/pkg-groups-meta'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgGroupsMeta', () => {
  describe('constructor()', () => {
    it('can construct from parameters', () => {
      let fred = new PkgGroupsMeta('fred', {
        'pkg1': 'enabled',
        'pkg2': 'enabled'
      })
      expect(fred.name).toBe('fred')
      expect(fred._states.toJS()).toEqual({'pkg1': 'enabled', 'pkg2': 'enabled'})
    })

    it('can construct from object literal', () => {
      let fred = new PkgGroupsMeta({
        type: 'meta',
        name: 'fred',
        states: {
          pkg1: 'enabled',
          pkg2: 'disabled'
        },
        deserializer: 'PkgGroupsMeta'
      })

      expect(fred.name).toBe('fred')
      expect(fred.has('pkg1')).toBe(true)
      expect(fred.has('pkg2')).toBe(true)
      expect(fred.stateOf('pkg1')).toEqual('enabled')
      expect(fred.stateOf('pkg2')).toEqual('disabled')
    })

    it('can construct from JSON', () => {
      let fred = new PkgGroupsMeta(`{"type":"meta",
        "name":"fred",
        "states":{"pkg1": "enabled", "pkg2": "disabled"},
        "deserializer":"PkgGroupsMeta"}`)

      expect(fred.name).toBe('fred')
      expect(fred.has('pkg1')).toBe(true)
      expect(fred.has('pkg2')).toBe(true)
      expect(fred.stateOf('pkg1')).toEqual('enabled')
      expect(fred.stateOf('pkg2')).toEqual('disabled')
    })

    it('requires a name', () => {
      let callNoParam = function () {
        let _ = new PkgGroupsMeta()/* eslint no-unused-vars: 0 */
      }
      expect(callNoParam).toThrow(new Error('PkgGroupsMeta must have a name'))
    })

    it('requires a stateMap', () => {
      let callNameOnly = function () {
        let _ = new PkgGroupsMeta('aname')
      }
      expect(callNameOnly).toThrow(new SyntaxError('Unexpected token a in JSON at position 0'))
    })
  })

  it('can serialize', () => {
    let fred = new PkgGroupsMeta({
      'name': 'fred',
      'type': 'meta',
      'states': {
        'pkg1': 'enabled',
        'pkg2': 'disabled'
      }
    })
    let data = fred.serialize()
    expect(data['name']).toEqual('fred')
    expect(data['type']).toEqual('meta')
    expect(data['states']).toBeInstanceOf(Object)
    expect(data['states']['pkg1']).toEqual('enabled')
    expect(data['states']['pkg2']).toEqual('disabled')
  })
})
