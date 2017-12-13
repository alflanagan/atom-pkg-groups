/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import log4js from 'log4js'
import etch from 'etch'
import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars
import PkgTristateList from '../lib/pkg-tristate-list-component'

const logger = log4js.getLogger('tristate-list-spec')
logger.level = log4js.levels.INFO

describe('Tristate list component', () => {
  describe('constructor', () => {
    it('requires at least a list of items', () => {
      PkgTristateList.withoutLogging(
        () => expect(() => new PkgTristateList()).toThrow('Cannot create tristate list without items property.')
      )
    })

    it('dislikes invalid states', () => {
      PkgTristateList.withoutLogging(
        () => expect(() => new PkgTristateList({items: {item1: 'fred'}})).toThrow("Got state of fred, legal values are 'enabled', 'disabled', 'unchanged'.")
      )
    })

    it('sets properties', () => {
      const frack = () => {}
      const comp = new PkgTristateList({items: {item1: 'enabled', item2: 'disabled'},
        skipCommandsRegistration: false,
        on: {change: frack}})
      expect(comp.props.items).toEqual({item1: 'enabled', item2: 'disabled'})
      expect(comp.props.skipCommandsRegistration).toBe(false)
      expect(comp.props.on).toEqual({change: frack})
    })

    it('combines passed class names with a standard one', () => {
      const comp = new PkgTristateList({items: {item1: 'enabled', item2: 'disabled'},
        skipCommandsRegistration: false,
        className: 'my-special-class'})
      expect(comp.props.items).toEqual({item1: 'enabled', item2: 'disabled'})
      expect(comp.props.skipCommandsRegistration).toBe(false)
      expect(comp.props.className).toEqual('my-special-class tristate-list')
    })
  })

  describe('render', () => {
    it('renders items with the correct DOM for the state', () => {
      const props = {items: {item1: 'enabled', item2: 'disabled', item3: 'unchanged'}}
      const comp = new PkgTristateList(props)
      const dom = comp.render()
      const expected = <div className='tristate-list'><ol>
        <li on={{click: comp.didClick}}>item1{comp.STATES_CONFIG['enabled']}</li>
        <li on={{click: comp.didClick}}>item2{comp.STATES_CONFIG['disabled']}</li>
        <li on={{click: comp.didClick}}>item3{comp.STATES_CONFIG['unchanged']}</li>
      </ol></div>
      expect(dom).toEqual(expected)
    })
  })

  describe('event handling', () => {
    it('responds to clicks', () => {
      const props = {items: {item1: 'enabled', item2: 'disabled', item3: 'unchanged'}}
      const comp = new PkgTristateList(props)
      comp.render()
      const div = document.createElement('div')
      div.appendChild(comp.element)
      const item2Elem = comp.element.children[0].children[1]
      expect(item2Elem.innerText).toEqual('item2')
      item2Elem.click()
      let dom = comp.render()
      let expected = <div className='tristate-list' ><ol>
        <li on={{click: comp.didClick}}>item1{comp.STATES_CONFIG['enabled']}</li>
        <li on={{click: comp.didClick}}>item2{comp.STATES_CONFIG['unchanged']}</li>
        <li on={{click: comp.didClick}}>item3{comp.STATES_CONFIG['unchanged']}</li>
      </ol></div>
      let diff = new DomDiff(dom, expected)
      logger.debug(diff.toString())
      expect(dom).toEqual(expected)
      item2Elem.click()
      dom = comp.render()
      expected = <div className='tristate-list' ><ol>
        <li on={{click: comp.didClick}}>item1{comp.STATES_CONFIG['enabled']}</li>
        <li on={{click: comp.didClick}}>item2{comp.STATES_CONFIG['enabled']}</li>
        <li on={{click: comp.didClick}}>item3{comp.STATES_CONFIG['unchanged']}</li>
      </ol></div>
      expect(dom).toEqual(expected)
      item2Elem.click()
      dom = comp.render()
      expected = <div className='tristate-list' ><ol>
        <li on={{click: comp.didClick}}>item1{comp.STATES_CONFIG['enabled']}</li>
        <li on={{click: comp.didClick}}>item2{comp.STATES_CONFIG['disabled']}</li>
        <li on={{click: comp.didClick}}>item3{comp.STATES_CONFIG['unchanged']}</li>
      </ol></div>
      expect(dom).toEqual(expected)
    })

    it('emits change event when clicked', () => {
      const onChange = jasmine.createSpy('change')
      const props = {items: {item1: 'enabled', item2: 'disabled', item3: 'unchanged'},
        on: {change: onChange}}
      const comp = new PkgTristateList(props)
      expect(comp.props.on.change).toBe(onChange)
      comp.render()
      const div = document.createElement('div')
      div.appendChild(comp.element)
      const item2Elem = comp.element.children[0].children[1]
      expect(item2Elem.innerText).toEqual('item2')
      item2Elem.click()
      waitsFor(() => onChange.callCount > 0)
      runs(() => {
        expect(onChange).toHaveBeenCalledWith('item2', 'unchanged')
        const item1Elem = comp.element.children[0].children[0]
        expect(item1Elem.innerText).toEqual('item1')
        item1Elem.click()
        waitsFor(() => onChange.callCount > 1)
        runs(() => {
          expect(onChange).toHaveBeenCalledWith('item1', 'disabled')
          const item3Elem = comp.element.children[0].children[2]
          expect(item3Elem.innerText).toEqual('item3')
          item3Elem.click()
          waitsFor(() => onChange.callCount > 2)
          runs(() => {
            expect(onChange).toHaveBeenCalledWith('item3', 'enabled')
          })
        })
      })
    })
  })
})
