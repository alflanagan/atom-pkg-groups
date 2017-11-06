/** @babel */
/** @jsx etch.dom */
/* eslint-env jasmine */
import etch from 'etch'
import log4js from 'log4js'

import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars
import PkgSelectList from '../lib/pkg-select-list-component'
import PkgPickList from '../lib/pkg-pick-list-component'
import PkgGroupsView from '../lib/pkg-groups-view'

const logger = log4js.getLogger('pkg-groups-view-spec')
logger.level = 'debug'

describe('PkgGroupsView', () => {
  describe('constructor', () => {
    it('does not require arguments', () => {
      let fred = new PkgGroupsView()
      expect(fred.children).not.toExist()
      expect(fred.props).toEqual({available: [], selected: [], groups: [], metas: []})
      // attributes added to component by etch.initialize()
      expect(fred.virtualNode['tag']).toEqual('div')
      expect(fred.virtualNode['props']['className']).toEqual('pkg-groups')
      expect(fred.virtualNode['children']).toBeInstanceOf(Array)
      expect(fred.virtualNode.children[0].props).toEqual({className: 'modal', id: 'group-select-panel'})
      expect(fred.element).toExist()
      expect(fred.refs).toEqual({})
    })

    it('sets properties correctly', () => {
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = ['baseball', 'basketball']
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas
      })
      expect(pkgView.props.available).toEqual(tavailable)
      expect(pkgView.props.selected).toEqual(tselected)
      expect(pkgView.props.groups).toEqual(tgroups)
      expect(pkgView.props.metas).toEqual(tmetas)
    })
  })

  describe('render', () => {
    it('renders a blank view', () => {
      const view = new PkgGroupsView()
      const dom = view.render()
      const expected = <div className='pkg-groups'>
        <atom-panel className='modal' id='group-select-panel'>
          <div className='inset-panel padded'>
            <h1>Package Groups Setup</h1>
            <div id='pkg-groups-upper-panel' className='inset-panel padded'>
              <h2>Defined Groups</h2>
              <div className='select-list'>
                <PkgSelectList items={[]} on={{change: view.didSelectGroup}} />
              </div>
              <div id='add-group-div'>
                <div className='block'>
                  <button className='btn btn-primary icon icon-plus' type='button'>New Group</button>
                </div>
              </div>
            </div>
            <div id='pkg-groups-lower-panel' className='inset-panel padded'>
              <h2>Modify Group</h2>
              <div className='sub-section installed-packages'>
                <PkgPickList leftList={[]} rightList={[]} id='pkg-groups-group-pick'
                  leftLabel='available packages' rightLabel='packages in group'
                  on={{change: view.didChange}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      expect(dom).toEqual(expected)
    })

    it('renders properties as expected', () => {
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = ['baseball', 'basketball']
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas
      })
      const actual = pkgView.render()
      const expected = <div className='pkg-groups'>
        <atom-panel className='modal' id='group-select-panel'>
          <div className='inset-panel padded'>
            <h1>Package Groups Setup</h1>
            <div id='pkg-groups-upper-panel' className='inset-panel padded'>
              <h2>Defined Groups</h2>
              <div className='select-list'>
                <PkgSelectList items={tgroups} on={{change: pkgView.didSelectGroup}} />
              </div>
              <div id='add-group-div'>
                <div className='block'>
                  <button className='btn btn-primary icon icon-plus' type='button'>New Group</button>
                </div>
              </div>
            </div>
            <div id='pkg-groups-lower-panel' className='inset-panel padded'>
              <h2>Modify Group</h2>
              <div className='sub-section installed-packages'>
                <PkgPickList leftList={tavailable} rightList={tselected} id='pkg-groups-group-pick'
                  leftLabel='available packages' rightLabel='packages in group'
                  on={{change: pkgView.didChange}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      expect(actual).toEqual(expected)
    })
  })

  describe('event handling', () => {
    it('responds to clicks in group select', () => {
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = ['baseball', 'basketball']
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas
      })
      const parent = document.createElement('div')
      parent.appendChild(etch.render(pkgView))
      pkgView.element.querySelector('.select-list>div>ol').children[1].click()
    })
  })
})
