/** @babel */

/* eslint-env jasmine */
import fs from 'fs'
import log4js from 'log4js'
import Immutable from 'immutable'
import PkgGroupsModel from '../lib/pkg-groups-model'
import PkgGroupsGroup from '../lib/pkg-groups-group'
import PkgGroupsMeta from '../lib/pkg-groups-meta'
import MockPackageManager from './atom-packages-mock'

const logger = log4js.getLogger('pkg-groups-model-spec')
logger.level = 'warn'

describe('PkgGroupsModel', () => {
  let model/* PkgGroupsModel */
  let model2
  let model3

  const mockPkgManager = new MockPackageManager([
    'ide-php',
    'ide-typescript',
    'image-view',
    'incompatible-packages',
    'intentions',
    'jumpy',
    'keybinding-resolver',
    'language-babel',
    'language-c',
    'language-clojure',
    'language-coffee-script',
    'language-csharp',
    'language-css',
    'language-forth',
    'language-generic-config',
    'language-gfm',
    'language-git',
    'language-go',
    'language-html',
    'language-hyperlink',
    'language-ini',
    'language-java'
  ], [
    'keybinding-resolver',
    'language-c',
    'language-clojure',
    'language-coffee-script',
    'language-css',
    'language-gfm',
    'language-html',
    'language-hyperlink'
  ], [
    'image-view',
    'incompatible-packages',
    'intentions'
  ])

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
          packages: ['language-csharp', 'language-css', 'incompatible-packages']
        }, {
          type: 'group',
          name: 'group2',
          packages: ['language-go', 'language-clojure', 'language-html', 'language-spanish']
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
      const rawdata = fs.readFileSync('spec/fixtures/test_model1.json')
      let s = JSON.parse(rawdata)
      let model = new PkgGroupsModel(s)
      expect(model.groups.size).toBe(5)
      expect(model.metas.size).toBe(2)
      expect(model.enabled).toEqual(new Immutable.Set(['Web Programming']))
      expect(model.disabled).toEqual(new Immutable.Set(['python']))
      expect(model.isMeta('systems')).toBe(true)
      expect(model.isGroup('javascript')).toBe(true)
      const group = model.group('system languages')
      expect(group).toBeInstanceOf(PkgGroupsGroup)
      expect(group.size).toBe(7)
      const meta = model.group('systems')
      expect(meta).toBeInstanceOf(PkgGroupsMeta)
      expect(meta.stateOf('javascript')).toEqual('disabled')
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

    it('works for complex model', () => {
      const model4 = new PkgGroupsModel(model3.serialize())
      model4.addGroup('all_installed', atom.packages.getAvailablePackageNames().filter((x) => !atom.packages.isBundledPackage(x)))
      logger.debug(JSON.stringify(model4.serialize()))
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
    it('returns three sets of packages names', () => {
      const realPkgMgr = atom.packages
      atom.packages = mockPkgManager
      try {
        let diffs = model3.differences(true)
        expect(diffs).toBeInstanceOf(Immutable.Map)
        expect(diffs.get('enabled').toJS()).toEqual(['language-go', 'language-clojure', 'language-html'])
        expect(diffs.get('disabled').toJS()).toEqual(['incompatible-packages'])
        expect(diffs.get('missing').toJS()).toEqual(['language-spanish'])
      } finally {
        // this might be important ;)
        atom.packages = realPkgMgr
      }
    })
  })
})
