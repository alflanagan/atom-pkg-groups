/** @babel */

/* eslint-env jasmine */
import log4js from 'log4js'
import Immutable from 'immutable'
import PkgGroupsModel from '../lib/pkg-groups-model'
import PkgGroupsGroup from '../lib/pkg-groups-group'
import PkgGroupsMeta from '../lib/pkg-groups-meta'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgGroupsModel', () => {
  let model  /* PkgGroupsModel */
  let model2
  let model3

  beforeEach(() => {
    model = new PkgGroupsModel({
      groups: [
        {
          type: 'group',
          name: 'group1',
          packages: ['fred', 'sally', 'barney']
        }, {
          type: 'group',
          name: 'group2',
          packages: ['frank', 'tom', 'dick', 'harry']
        }
      ],
      metas: [
        {
          type: 'meta',
          name: 'meta1',
          states: {
            group1: 'enabled',
            group2: 'enabled'
          }
        }
      ],
      enabled: ['meta1'],
      disabled: ['group2']
    })
    model2 = new PkgGroupsModel({
      groups: [
        {
          type: 'group',
          name: 'group1',
          packages: ['language-php', 'language-python', 'language-ruby']
        }, {
          type: 'group',
          name: 'group2',
          packages: ['whitespace', 'timecop', 'dick', 'harry']
        }, {
          type: 'group',
          name: 'group3',
          packages: ['a', 'b', 'c', 'd']
        }, {
          type: 'group',
          name: 'group4',
          packages: ['alpha', 'beta', 'gamma', 'epsilon']
        }
      ],
      metas: [
        {
          type: 'meta',
          name: 'meta1',
          states: {
            group1: 'enabled',
            group2: 'disabled',
            meta2: 'enabled'
          }
        }, {
          type: 'meta',
          name: 'meta2',
          states: {
            group3: 'enabled',
            group4: 'disabled',
            group1: 'enabled'
          }
        }
      ],
      enabled: [
        'meta1', 'meta2'
      ],
      disabled: ['group2']
    })
    model3 = new PkgGroupsModel({
      groups: [
        {
          type: 'group',
          name: 'group1',
          packages: ['fred', 'sally', 'barney']
        }, {
          type: 'group',
          name: 'group2',
          packages: ['frank', 'tom', 'dick', 'harry']
        }
      ],
      metas: [
        {
          type: 'meta',
          name: 'meta1',
          states: {
            group1: 'enabled',
            group2: 'enabled'
          }
        }
      ],
      enabled: ['meta1'],
      disabled: ['group2']
    })
    // waitsForPromise(atom.packages.loadPackages())
    // waitsForPromise(atom.packages.activatePackages())
  })

  describe('constructor()', () => {
    it('can construct from object literal', () => {
      let groups = new Set(model.groupNames)
      expect(groups.size).toBe(2)
      expect(groups.has('group1')).toBe(true)
      expect(groups.has('group2')).toBe(true)
      let metas = new Set(model.metaNames)
      expect(metas.size).toBe(1)
      expect(metas.has('meta1')).toBe(true)
      expect(model.metas.get('meta1')).toBeInstanceOf(PkgGroupsMeta)
      let theMeta = model.group('meta1')
      expect(theMeta.has('group1')).toBe(true)
      expect(theMeta.has('group2')).toBe(true)
    })

    it('can construct with no params', () => {
      let model = new PkgGroupsModel()
      let groups = new Set(model.groupNames)
      expect(groups.size).toBe(0)
      let metas = new Set(model.metaNames)
      expect(metas.size).toBe(0)
      expect(model.enabled.size).toBe(0)
      expect(model.disabled.size).toBe(0)
    })

    it('can deserialize', () => {
      let mjson = `{"groups":[{"type":"group",
                               "name":"group1",
                               "packages":["fred","sally","barney"],
                               "deserializer":"PkgGroupsGroup"},
                               {"type":"group",
                               "name":"group2",
                               "packages":["frank","tom","dick","harry"],
                               "deserializer":"PkgGroupsGroup"}],
                    "metas":[{"type":"meta",
                              "name":"meta1",
                              "states":{"group1":"enabled","group2":"enabled"},
                              "deserializer":"PkgGroupsMeta"}],
                    "enabled":["group1", "meta1"],
                    "disabled":["group2"],
                    "deserializer":"PkgGroupsModel"}`
      let s = JSON.parse(mjson)
      let model = new PkgGroupsModel(s)
      expect(model.groups.size).toBe(2)
      expect(model.metas.size).toBe(1)
      expect(model.enabled).toEqual(new Immutable.Set(['group1', 'meta1']))
      expect(model.disabled).toEqual(new Immutable.Set(['group2']))
    })
  })

  describe('serialize()', () => {
    it('returns a JS object', () => {
      const obj = model.serialize()
      for (const propName of ['groups',
        'metas',
        'enabled',
        'disabled']) {
        expect(obj.hasOwnProperty(propName)).toBe(true)
        expect(obj[propName]).toBeInstanceOf(Array)
      }
      for (const groupObj of obj['groups']) {
        expect(groupObj['type']).toEqual('group')
        expect(['group1', 'group2']).toContain(groupObj['name'])
        expect(groupObj['packages']).toBeInstanceOf(Array)
      }
      for (const metaObj of obj['metas']) {
        expect(metaObj['type']).toEqual('meta')
        expect(metaObj['name']).toEqual('meta1')
        expect(metaObj['states']).toEqual({group1: 'enabled', group2: 'enabled'})
      }
    })

    it('works for empty model', () => {
      const fred = new PkgGroupsModel()
      expect(fred.serialize()).toEqual({groups: [], metas: [], enabled: [], disabled: [], deserializer: 'PkgGroupsModel'})
    })
  })

  describe('isMeta()', () => {
    it('can find a meta', () => {
      expect(model.isMeta('meta1')).toBe(true)
      expect(model.isMeta('group1')).toBe(false)
    })
  })

  describe('isGroup()', () => {
    it('can find a group', () => {
      expect(model.isGroup('group1')).toBe(true)
      expect(model.isGroup('meta1')).toBe(false)
    })
  })

  describe('group()', () => {
    it('can return a group', () => {
      const grp = model.group('group1')
      expect(grp).toBeInstanceOf(PkgGroupsGroup)
      expect(grp.packages).toEqual(new Immutable.Set(['fred', 'sally', 'barney']))
    })

    it('can return a meta-group', () => {
      const meta = model.group('meta1')
      expect(meta).toBeInstanceOf(PkgGroupsMeta)
      expect(meta.stateOf('group1')).toEqual('enabled')
      expect(meta.stateOf('group2')).toEqual('enabled')
    })

    it('can return undefined', () => {
      const notThere = model.group('fred')
      expect(typeof notThere).toEqual('undefined')
    })
  })

  describe('groupNames()', () => {
    it('returns a list of groups', () => {
      expect(model.groupNames.toJS()).toEqual(['group1', 'group2'])
    })
    it('may not find any', () => {
      const empty = new PkgGroupsModel()
      expect(empty.groupNames.toJS()).toEqual([])
    })
  })

  describe('metaNames()', () => {
    it('returns a list of meta-groups', () => {
      expect(model.metaNames.toJS()).toEqual(['meta1'])
    })
    it('may not find any', () => {
      const empty = new PkgGroupsModel()
      expect(empty.metaNames.toJS()).toEqual([])
    })
  })

  describe('groupsForMeta()', () => {
    it('finds top-level groups', () => {
      expect(model.metas.get('meta1')).toBeInstanceOf(PkgGroupsMeta)
      expect(model.groupsForMeta(model.metas.get('meta1'))).toEqual(new Immutable.Set(['group1', 'group2']))
    })
    it('might get name of a non-existent meta', () => {
      let newMeta = new PkgGroupsMeta({
        type: 'meta',
        name: 'fred',
        states: {
          pkg1: 'enabled',
          pkg2: 'disabled'
        }
      })
      expect(model.groupsForMeta(newMeta)).toEqual(new Immutable.Set([]))
    })
    it('might get an invalid object', () => {
      const callInvalid = () => {
        model.groupsForMeta({fred: 'wilma'})
      }
      expect(callInvalid).toThrow(new Error('Expected PkgGroupsMeta object'))
    })
    it('finds groups in nested meta-groups', () => {
      const meta = model2.metas.get('meta1')
      expect(meta).toBeInstanceOf(PkgGroupsMeta)
      expect(model2.groupsForMeta(meta)).toEqual(new Immutable.Set(['group1', 'group2', 'group3', 'group4']))
    })
  })

  describe('groupState()', () => {
    it('can get correct state for all groups in the model', () => {
      let expected = Immutable.Map({group1: 'enabled', group2: 'disabled', group3: 'enabled', group4: 'disabled'})
      for (let [key, value] of expected) {
        expect(model2.groupState(key)).toEqual(value)
      }
    })
  })

  describe('packageStates()', () => {
    it('handles the basic case', () => {
      const map = model.packageStates
      expect(map.toJS()).toEqual({
        fred: 'enabled',
        sally: 'enabled',
        barney: 'enabled',
        frank: 'disabled',
        tom: 'disabled',
        dick: 'disabled',
        harry: 'disabled'
      })
    })
    it('can handle meta-groups in meta-groups', () => {
      const map = model2.packageStates
      expect(map.toJS()).toEqual({
        'language-php': 'enabled',
        'language-python': 'enabled',
        'language-ruby': 'enabled',
        whitespace: 'disabled',
        timecop: 'disabled',
        dick: 'disabled',
        harry: 'disabled',
        a: 'enabled',
        b: 'enabled',
        c: 'enabled',
        d: 'enabled',
        alpha: 'enabled',
        beta: 'enabled',
        gamma: 'enabled',
        epsilon: 'enabled'
      })
    })
    // TODO: test specific scenarios
  })

  describe('differences()', () => {
    it('returns a map of package names => states', () => {
      let diffs = model3.differences(true)
      expect(diffs.get('enabled').toJS()).toEqual([])
      expect(diffs.get('disabled').size).toEqual(0)
      expect(diffs.get('missing')).toEqual(
        new Immutable.Set(['fred', 'sally', 'barney', 'frank', 'tom', 'dick', 'harry']))

      let allPkgNames = atom.packages.getAvailablePackageNames()
      allPkgNames = allPkgNames.filter((x) => atom.packages.isBundledPackage(x))
      model3.groups = model3.groups.merge({
        bundled: new PkgGroupsGroup('bundled', allPkgNames)
      })
      model3.enabled = new Immutable.Set(['bundled'])
      diffs = model3.differences(true)
      expect(diffs).toBeInstanceOf(Immutable.Map)
      expect(diffs.get('disabled').size).toEqual(0)
      expect(diffs.get('enabled').size).toBeGreaterThan(80)
      expect(diffs.get('missing')).toEqual(new Immutable.Set(['harry', 'dick', 'tom', 'frank']))
      logger.debug(diffs)
      /**
       * Real problem here. when run under test, all the non-bundled packages are
       * 'available' but not 'loaded' or 'enabled'. Will need to
       * 1. load and enable specific packages for testing (but user may not have *any* installed)
       * 2. Create some mock packages.
       * Will try '1' first as 'the simplest thing that will possibly work', then build on that
       * to implement '2'
       */
    })
  })
})
