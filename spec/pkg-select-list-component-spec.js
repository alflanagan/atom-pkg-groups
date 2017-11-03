/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import log4js from 'log4js'
import PkgSelectList from '../lib/pkg-select-list-component'
import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars

const logger = log4js.getLogger('pkg-groups-group-spec')
logger.level = 'debug'

describe('PkgSelectList component', () => {
  describe('constructor', () => {
    it('requires items', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      expect(comp.props.items).toEqual(['item1', 'item2', 'item3'])
      expect(comp.element.classList.contains('pkg-select-list')).toBe(true)
    })

    it('accepts a bunch of properties', () => {
      const props = {
        items: ['1', '2', '3'],
        emptyMessage: 'this list is not empty',
        errorMessage: 'uh oh, something is wrong',
        infoMessage: 'the more you know...',
        loadingMessage: 'hey, I\'m loading here',
        loadingBadge: 'a silly badge',
        skipCommandsRegistration: true,
        selectableItems: false,
        on: {change: 'fred'}
      }
      const psl = new PkgSelectList(props)
      expect(psl.props.items).toEqual(props.items)
      expect(psl.props.emptyMessage).toEqual(props.emptyMessage)
      expect(psl.props.errorMessage).toEqual(props.errorMessage)
      expect(psl.props.infoMessage).toEqual(props.infoMessage)
      expect(psl.props.loadingMessage).toEqual(props.loadingMessage)
      expect(psl.props.loadingBadge).toEqual(props.loadingBadge)
      expect(psl.props.skipCommandsRegistration).toBe(true)
      expect(psl.props.selectableItems).toBe(false)
      expect(psl.props.on.change).toEqual('fred')
    })
  })

  describe('render', () => {
    it('renders the simplest case OK', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      const actual = comp.render()
      const itemSet = new Set(['item1', 'item2', 'item3'])
      // alas, there's no way to use equal to compare these (?)
      expect(actual.tag).toEqual('div')
      expect(actual.props.className).toEqual('select-list pkg-select-list')
      expect(actual.children.length).toBe(1)
      expect(actual.children[0].tag).toEqual('ol')
      expect(actual.children[0].props.className).toEqual('list-group')
      expect(actual.children[0].props.ref).toEqual('items')
      for (let liv of actual.children[0].children) {
        expect(liv.tag).toEqual('li')
        expect(liv.props.className).toBe('')
        expect(liv.props.on.click).toBe(comp.didClickItem)
        expect(liv.children.length).toBe(1)
        expect(itemSet.has(liv.children[0].text)).toBe(true)
      }
    })

    it('renders a selected item', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      comp.props.selectionIndex = 0
      const actual = comp.render()
      const itemSet = new Set(['item1', 'item2', 'item3'])
      // alas, there's no way to use equal to compare these
      expect(actual.tag).toEqual('div')
      expect(actual.props.className).toEqual('select-list pkg-select-list')
      expect(actual.children.length).toBe(1)
      expect(actual.children[0].tag).toEqual('ol')
      expect(actual.children[0].props.className).toEqual('list-group')
      expect(actual.children[0].props.ref).toEqual('items')
      for (let liv of actual.children[0].children) {
        expect(liv.tag).toEqual('li')
        expect(liv.props.on.click).toBe(comp.didClickItem)
        expect(liv.children.length).toBe(1)
        expect(itemSet.has(liv.children[0].text)).toBe(true)
      }
      // logger.debug(actual.children[0].children[0])
      expect(actual.children[0].children[0].props.className).toEqual('selected')
      expect(actual.children[0].children[1].props.className).toEqual('')
      expect(actual.children[0].children[2].props.className).toEqual('')
    })

    it('optionally does not select items', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        selectableItems: false
      })
      comp.props.selectionIndex = 0
      let actual = comp.render()
      expect(comp.props.selectableItems).toBe(false)
      expect(comp.props.selectionIndex).toEqual(0)
      expect(actual.children[0].children[0].props.className).toEqual('')
      expect(actual.children[0].children[1].props.className).toEqual('')
      expect(actual.children[0].children[2].props.className).toEqual('')
    })
  })

  describe('selectIndex', () => {
    it('can update selection', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      comp.selectFirst().then(() => {
        expect(comp.props.selectionIndex).toBe(0)
        let actual = comp.virtualNode
        expect(actual.children[0].children[0].props.className).toEqual('selected')
        expect(actual.children[0].children[1].props.className).toEqual('')
        expect(actual.children[0].children[2].props.className).toEqual('')
        comp.selectIndex(2).then(() => {
          actual = comp.virtualNode
          expect(comp.props.selectionIndex).toBe(2)
          expect(actual.children[0].children[0].props.className).toEqual('')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('selected')
        })
      })
    })

    it('triggers callback on change', () => {
      let evts = []
      const onChange = function (item) {
        evts.push(item)
      }
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        on: {change: onChange}
      })
      comp.selectFirst().then(() => {
        expect(evts).toEqual(['item1'])
        let actual = comp.virtualNode
        expect(comp.props.selectionIndex).toBe(0)
        expect(actual.children[0].children[0].props.className).toEqual('selected')
        expect(actual.children[0].children[1].props.className).toEqual('')
        expect(actual.children[0].children[2].props.className).toEqual('')
        comp.selectLast().then(() => {
          expect(evts).toEqual(['item1', 'item3'])
          actual = comp.virtualNode
          expect(comp.props.selectionIndex).toBe(2)
          expect(actual.children[0].children[0].props.className).toEqual('')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('selected')
          expect(evts.length).toBe(2)
        })
      })
    })
  })

  describe('event handling', () => {
    it('handles click events', () => {
      let evts = []
      const onChange = function (item, index) {
        evts.push(item)
      }
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        on: {change: onChange}
      })
      expect(comp.selectionIndex).toBe(undefined)
      // click on item 1
      comp.element.children[0].children[0].click()

      waitsFor(() => evts.length > 0)

      runs(() => {
        expect(evts).toEqual(['item1'])
        expect(comp.props.selectionIndex).toBe(0)
        expect(comp.props.selectableItems).toBe(true)
        let actual = comp.virtualNode
        expect(actual.children[0].children[0].props.className).toEqual('selected')
        expect(actual.children[0].children[1].props.className).toEqual('')
        expect(actual.children[0].children[2].props.className).toEqual('')

        // click on item 3
        comp.element.children[0].children[2].click()

        waitsFor(() => evts.length > 1)

        runs(() => {
          expect(evts).toEqual(['item1', 'item3'])
          expect(comp.props.selectionIndex).toBe(2)
          let actual = comp.virtualNode
          expect(actual.children[0].children[0].props.className).toEqual('')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('selected')
        })
      })
    })
  })
})
