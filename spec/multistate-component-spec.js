/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import log4js from 'log4js'
import etch from 'etch'
import MultistateComponent from '../lib/multistate-component'
import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars

const logger = log4js.getLogger('multistate-component-spec')
logger.level = 'debug'

xdescribe('Multistate component', () => {
  describe('constructor', () => {
    it('requires a minimum of 2 states', () => {
      expect(() => new MultistateComponent({states: []})).toThrow('Multistate component should have at least 2 states')
    })
    it('requires a valid current state', () => {
      expect(() => {
        const props = {states: [['fred', <p>this is fred</p>],
                               ['barney', <p>this is barney</p>]],
          currentState: 'wilma',
          registerAtomCommands: true
        }
        expect(() => new MultistateComponent(props)).toThrow(`State 'wilma' does not match any state.`)
      })
    })
  })

  describe('render', () => {
    it('renders a <div> with inner html from states array', () => {
      const props = {states: [['fred', <p>this is fred</p>],
                             ['barney', <p>this is barney</p>]],
        currentState: 'fred',
        registerAtomCommands: true
      }
      const comp = new MultistateComponent(props)
      const dom = comp.render()
      const expected = <div className='multi-state-component' on={{click: comp.didClick}}><p>this is fred</p></div>
      // so why does it add domNodes to the structure? add them to expected
      expected.children[0].children[0].domNode = dom.children[0].children[0].domNode
      expected.children[0].domNode = dom.children[0].domNode
      expect(dom).toEqual(expected)
    })
  })

  describe('selectNext()', () => {
    it('steps through the states, wrapping around end', async () => {
      const props = {
        states: [['fred', <p>this is fred</p>],
                 ['barney', <p>this is barney</p>],
                 ['wilma', <p>this is wilma</p>]],
        currentState: 'fred',
        registerAtomCommands: true
      }
      const comp = new MultistateComponent(props)
      expect(comp.props.currentState).toEqual('fred')
      await comp.selectNext()
      expect(comp.props.currentState).toEqual('barney')
      await comp.selectNext()
      expect(comp.props.currentState).toEqual('wilma')
      await comp.selectNext()
      expect(comp.props.currentState).toEqual('fred')
    })
  })

  describe('selectPrevious()', () => {
    it('steps backward through states, wrapping around at beginning', async () => {
      const props = {
        states: [['fred', <p>this is fred</p>],
                 ['barney', <p>this is barney</p>],
                 ['wilma', <p>this is wilma</p>]],
        currentState: 'wilma',
        registerAtomCommands: true
      }
      const comp = new MultistateComponent(props)
      expect(comp.props.currentState).toEqual('wilma')
      await comp.selectPrevious()
      expect(comp.props.currentState).toEqual('barney')
      await comp.selectPrevious()
      expect(comp.props.currentState).toEqual('fred')
      await comp.selectPrevious()
      expect(comp.props.currentState).toEqual('wilma')
    })
  })

  describe('event handling', () => {
    it('responds to clicks', async () => {
      const props = {
        states: [['fred', <p>this is fred</p>],
                 ['barney', <p>this is barney</p>],
                 ['wilma', <p>this is wilma</p>]],
        currentState: 'wilma',
        registerAtomCommands: true
      }
      const comp = new MultistateComponent(props)
      comp.render()
      const htmlDivElement = comp.element
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('fred')
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('barney')
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('wilma')
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('fred')
    })

    it('emits change event when clicked', async () => {
      const onChange = jasmine.createSpy('changeCallback')
      const props = {
        states: [['fred', <p>this is fred</p>],
                 ['barney', <p>this is barney</p>],
                 ['wilma', <p>this is wilma</p>]],
        currentState: 'wilma',
        registerAtomCommands: true,
        on: {change: onChange}
      }
      const comp = new MultistateComponent(props)
      comp.render()
      const htmlDivElement = comp.element
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('fred')
      expect(onChange).toHaveBeenCalledWith('fred', props.states[0][1])
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('barney')
      expect(onChange).toHaveBeenCalledWith('barney', props.states[1][1])
      htmlDivElement.click()
      await etch.getScheduler().getNextUpdatePromise()
      expect(comp.props.currentState).toEqual('wilma')
      expect(onChange).toHaveBeenCalledWith('wilma', props.states[2][1])
    })
  })
})
