/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import log4js from 'log4js'
import etch from 'etch'
import PkgSelectList from '../lib/pkg-select-list-component'
import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars

const logger = log4js.getLogger('pkg-groups-group-spec')
logger.level = 'warn'

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
      // get ref to actual handlers so they compare equal
      const onHandler = actual.children[0].children[0].props.on
      const expected = <div className='select-list pkg-select-list'><ol className='list-group' ref='items'>
        <li className='' value='0' on={onHandler}>item1</li>
        <li className='' value='1' on={onHandler}>item2</li>
        <li className='' value='2' on={onHandler}>item3</li>
      </ol></div>
      expect(actual).toEqual(expected)
    })

    it('renders a selected item', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      comp.selectedIndex = 0
      const actual = comp.render()
      const onHandler = actual.children[0].children[0].props.on
      const expected = <div className='select-list pkg-select-list'><ol className='list-group' ref='items'>
        <li className='selected' value='0' on={onHandler}>item1</li>
        <li className='' value='1' on={onHandler}>item2</li>
        <li className='' value='2' on={onHandler}>item3</li>
      </ol></div>
      expect(actual).toEqual(expected)
    })

    it('optionally does not select items', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        selectableItems: false
      })
      comp.selectedIndex = 0
      let actual = comp.render()
      const onHandler = actual.children[0].children[0].props.on
      const expected = <div className='select-list pkg-select-list'><ol className='list-group' ref='items'>
        <li className='' value='0' on={onHandler}>item1</li>
        <li className='' value='1' on={onHandler}>item2</li>
        <li className='' value='2' on={onHandler}>item3</li>
      </ol></div>
      expect(actual).toEqual(expected)
    })
  })

  describe('selectIndex', () => {
    it('can update selection', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      waitsForPromise(() => {
        return comp.selectFirst().then(() => {
          expect(comp.selectedIndex).toBe(0)
          let actual = comp.virtualNode
          expect(actual.children[0].children[0].props.className).toEqual('selected')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('')
          waitsForPromise(() => {
            return comp.selectIndex(2).then(() => {
              actual = comp.virtualNode
              expect(comp.selectedIndex).toBe(2)
              expect(actual.children[0].children[0].props.className).toEqual('')
              expect(actual.children[0].children[1].props.className).toEqual('')
              expect(actual.children[0].children[2].props.className).toEqual('selected')
            })
          })
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
      waitsForPromise(() => {
        return comp.selectFirst().then(() => {
          expect(evts).toEqual(['item1'])
          let actual = comp.virtualNode
          expect(comp.selectedIndex).toBe(0)
          expect(actual.children[0].children[0].props.className).toEqual('selected')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('')
          waitsForPromise(() => {
            return comp.selectLast().then(() => {
              expect(evts).toEqual(['item1', 'item3'])
              actual = comp.virtualNode
              expect(comp.selectedIndex).toBe(2)
              expect(actual.children[0].children[0].props.className).toEqual('')
              expect(actual.children[0].children[1].props.className).toEqual('')
              expect(actual.children[0].children[2].props.className).toEqual('selected')
              expect(evts.length).toBe(2)
            })
          })
        })
      })
    })
  })

  describe('event handling', () => {
    it('handles click events', () => {
      let evts = []
      const onChange = function (item, index) {
        evts.push(item)
        logger.debug(`onChange got ${item}, ${index}`)
      }
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        on: {change: onChange}
      })
      expect(comp.selectedIndex).toBe(null)
      expect(comp.props.selectableItems).toBe(true)
      // click on item 1
      logger.debug(`click on index 0`)
      comp.element.children[0].children[0].click()

      waitsFor(() => evts.length > 0)

      runs(() => {
        expect(evts).toEqual(['item1'])
        expect(comp.selectedIndex).toBe(0)
        expect(comp.props.selectableItems).toBe(true)
        let actual = comp.render()  // did not re-render automatically
        expect(actual.children[0].children[0].props.className).toEqual('selected')
        expect(actual.children[0].children[1].props.className).toEqual('')
        expect(actual.children[0].children[2].props.className).toEqual('')

        // click on item 3
        logger.debug(`click on index 2`)
        comp.element.children[0].children[2].click()

        waitsFor(() => evts.length > 1)

        runs(() => {
          expect(evts).toEqual(['item1', 'item3'])
          expect(comp.selectedIndex).toBe(2)
          let actual = comp.render()
          expect(actual.children[0].children[0].props.className).toEqual('')
          expect(actual.children[0].children[1].props.className).toEqual('')
          expect(actual.children[0].children[2].props.className).toEqual('selected')
        })
      })
    })
  })
})
