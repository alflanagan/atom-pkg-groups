/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import etch from 'etch'
import log4js from 'log4js'
import PkgSelectList, {_ListItemView} from '../lib/pkg-select-list-component'

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
      expect(comp.items).toEqual(['item1', 'item2', 'item3'])
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
        itemsClassList: ['class1', 'class2'],
        didChangeSelection: event => console.log('wow something changed'),
        skipCommandsRegistration: true
      }
      const psl = new PkgSelectList(props)
      expect(psl.items).toEqual(props.items)
      expect(psl.props.emptyMessage).toEqual(props.emptyMessage)
      expect(psl.props.errorMessage).toEqual(props.errorMessage)
      expect(psl.props.infoMessage).toEqual(props.infoMessage)
      expect(psl.props.loadingMessage).toEqual(props.loadingMessage)
      expect(psl.props.loadingBadge).toEqual(props.loadingBadge)
      expect(psl.props.itemsClassList).toEqual(props.itemsClassList)
      expect(psl.props.didChangeSelection).toBe(props.didChangeSelection)
      expect(psl.props.skipCommandsRegistration).toBe(true)
    })
  })

  describe('render', () => {
    it('renders the simplest case OK', () => {
      const elementForItem = item => etch.render(<li>{item}</li>)
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        elementForItem: elementForItem
      })
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
        expect(liv.tag).toEqual(_ListItemView)
        expect(liv.props.selected).toBe(false)
        expect(liv.props.onclick).toBe(comp.didClickItem)
        expect(liv.children.length).toBe(0)
        expect(liv.props.element.nodeName).toEqual('LI')
        expect(itemSet.has(liv.props.element.textContent)).toBe(true)
      }
    })

    it('renders a selected item', () => {
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ]
      })
      comp.selectFirst()
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
        expect(liv.tag).toEqual(_ListItemView)
        expect(liv.props.onclick).toBe(comp.didClickItem)
        expect(liv.children.length).toBe(0)
        expect(liv.props.element.nodeName).toEqual('LI')
        expect(itemSet.has(liv.props.element.textContent)).toBe(true)
      }
      expect(actual.children[0].children[0].props.selected).toBe(true)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(false)
    })

    it('can update selection', () => {
      const elementForItem = item => etch.render(<li>{item}</li>)
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        elementForItem: elementForItem
      })
      comp.selectFirst()
      expect(comp.selectionIndex).toBe(0)
      let actual = comp.render()
      expect(actual.children[0].children[0].props.selected).toBe(true)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(false)
      comp.selectIndex(2)
      actual = comp.render()
      expect(comp.selectionIndex).toBe(2)
      expect(actual.children[0].children[0].props.selected).toBe(false)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(true)
    })

    it('triggers callback on change', () => {
      let evts = []
      const onChange = function (evt) {
        evts.push(evt)
      }
      const elementForItem = item => etch.render(<li>{item}</li>)
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        elementForItem: elementForItem,
        didChangeSelection: onChange
      })
      expect(comp.props.didChangeSelection).toBe(onChange)
      comp.selectFirst()
      expect(evts).toEqual(['item1'])
      let actual = comp.render()
      expect(comp.selectionIndex).toBe(0)
      expect(actual.children[0].children[0].props.selected).toBe(true)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(false)
      comp.selectLast()
      expect(evts).toEqual(['item1', 'item3'])
      actual = comp.render()
      expect(comp.selectionIndex).toBe(2)
      expect(actual.children[0].children[0].props.selected).toBe(false)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(true)
      expect(evts.length).toBe(2)
    })

    it('handles click events', () => {
      let evts = []
      const onChange = function (evt) {
        evts.push(evt)
      }
      const elementForItem = item => etch.render(<li>{item}</li>)
      const comp = new PkgSelectList({
        items: [
          'item1', 'item2', 'item3'
        ],
        elementForItem: elementForItem,
        didChangeSelection: onChange
      })
      expect(comp.props.didChangeSelection).toBe(onChange)
      let actual = comp.render()

      // click on item 1
      comp.element.children[0].children[0].click()

      expect(evts).toEqual(['item1'])
      expect(comp.selectionIndex).toBe(0)
      actual = comp.render()
      expect(actual.children[0].children[0].props.selected).toBe(true)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(false)
      expect(actual.children[0].children[0].props.element.className).toBe('selected')

      // click on item 3
      comp.element.children[0].children[2].click()

      expect(evts).toEqual(['item1', 'item3'])
      expect(comp.selectionIndex).toBe(2)
      expect(evts.length).toBe(2)
      actual = comp.render()
      expect(actual.children[0].children[0].props.selected).toBe(false)
      expect(actual.children[0].children[1].props.selected).toBe(false)
      expect(actual.children[0].children[2].props.selected).toBe(true)
      expect(actual.children[0].children[0].props.element.className).toBe('')
      expect(actual.children[0].children[1].props.element.className).toBe('')
      expect(actual.children[0].children[2].props.element.className).toBe('selected')
    })
  })
})

describe('_ListItemView component', () => {
  it('sets up an onclick handler', () => {
    // cheap substitute for jasmine's spy
    let wasCalled = false
    const onClick = (event) => {
      wasCalled = true
    }
    const elem = etch.render(<li>Some Item</li>)
    const liv = new _ListItemView({element: elem, selected: false, onclick: onClick})
    liv.element.click()
    expect(wasCalled).toBe(true)
  })

  it('sets a class name for a selected item', () => {
    const elem = etch.render(<li>Some Item</li>)
    const liv = new _ListItemView({element: elem, selected: true})
    expect(liv.element.classList.contains('selected')).toBe(true)
  })

  it('updates correctly', () => {
    // cheap substitute for jasmine's spy
    let wasCalled = false
    const onClick = (event) => {
      wasCalled = true
    }
    // note update requires element to have  parent
    const elem = etch.render(<div><li>Some Item</li></div>).children[0]
    const liv = new _ListItemView({element: elem, selected: false})
    expect(liv.element).toBe(elem)
    expect(liv.element.classList.contains('selected')).toBe(false)
    const elem2 = etch.render(<li>Other Item</li>)
    liv.update({element: elem2, selected: true, onclick: onClick})
    expect(liv.element).toBe(elem2)
    expect(liv.element.classList.contains('selected')).toBe(true)
    expect(wasCalled).toBe(false)
    liv.element.click()
    expect(wasCalled).toBe(true)
  })
})
