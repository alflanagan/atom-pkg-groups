/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import log4js from 'log4js'

import DomDiff from '../lib/pkg-groups-dom-diff' // eslint-disable-line no-unused-vars
import PkgSelectList from '../lib/pkg-select-list-component'
import PkgPickList from '../lib/pkg-pick-list-component'
import PkgTristateList from '../lib/pkg-tristate-list-component'
import PkgGroupsView from '../lib/pkg-groups-view'
import PkgGroupsModel from '../lib/pkg-groups-model'
import PkgGroupsGroup from '../lib/pkg-groups-group'
import PkgGroupsMeta from '../lib/pkg-groups-meta'

const logger = log4js.getLogger('pkg-groups-view-spec')
logger.level = 'debug'

describe('PkgGroupsView', () => {
  describe('constructor', () => {
    it('sets properties correctly', () => {
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const groups = []
      for (const grp of tgroups) {
        groups.push(new PkgGroupsGroup({name: grp, type: 'group', packages: tselected}))
      }
      const tmetas = {baseball: 'enabled', basketball: 'disabled'}
      const metas = []
      for (const name in tmetas) {
        metas.push(new PkgGroupsMeta({name}))
      }
      const model = new PkgGroupsModel({groups, metas})
      const pkgView = new PkgGroupsView({
        model: model
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
        <atom-panel id='group-select-panel'>
          <div id='pkg-groups-upper-panel' className='inset-panel padded'>
            <h1>Set Up Package Groups</h1>
            <PkgSelectList id='groups-select-list' items={view.props.groups} on={{change: view._didSelectGroup}} />
            <button id='groups-add-group' name='add-group' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
            <button id='groups-delete-group' name='delete-group' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
            <PkgPickList leftList={view.props.available} rightList={view.props.selected} id='pkg-groups-group-pick'
              leftLabel='Packages Available' rightLabel='Packages In Group' on={{change: view._didChange}} />
            <p className='group-select-hint'>Click Package Name to Select/Deselect</p>
          </div>
          <div id='pkg-groups-lower-panel' className='inset-panel padded'>
            <div id='defined-metas-panel'>
              <h1>Set Up Configurations</h1>
              <div id='meta-select-list'>
                <PkgSelectList items={view.props.metas} on={{change: view._didSelectMeta}} />
                <button id='meta-add-meta' name='add-meta' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
                <button id='meta-delete-meta' name='delete-meta' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
              </div>
            </div>
            <div id='specify-metas-panel'>
              <h2>Activate / Deactivate Groups</h2>
              <div className='sub-section group-selection'>
                <PkgTristateList items={view.props.metas} on={{change: view._didChangeMeta}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      expect(dom).toEqual(expected)
      const diff = new DomDiff(dom, expected)
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
      expect(diff.noDifferences()).toBe(true)
      logger.debug(view.getElement())
    })

    it('renders properties as expected', () => {
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = {'baseball': 'disabled', 'basketball': 'enabled'}
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas
      })
      const actual = pkgView.render()
      const expected = <div className='pkg-groups'>
        <atom-panel id='group-select-panel'>
          <div id='pkg-groups-upper-panel' className='inset-panel padded'>
            <h1>Set Up Package Groups</h1>
            <PkgSelectList id='groups-select-list' items={tgroups} on={{change: pkgView._didSelectGroup}} />
            <button id='groups-add-group' name='add-group' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
            <button id='groups-delete-group' name='delete-group' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
            <PkgPickList leftList={tavailable} rightList={tselected} id='pkg-groups-group-pick'
              leftLabel='Packages Available' rightLabel='Packages In Group' on={{change: pkgView._didChange}} />
            <p className='group-select-hint'>Click Package Name to Select/Deselect</p>
          </div>
          <div id='pkg-groups-lower-panel' className='inset-panel padded'>
            <div id='defined-metas-panel'>
              <h1>Set Up Configurations</h1>
              <div id='meta-select-list'>
                <PkgSelectList items={tmetas} on={{change: pkgView._didSelectMeta}} />
                <button id='meta-add-meta' name='add-meta' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
                <button id='meta-delete-meta' name='delete-meta' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
              </div>
            </div>
            <div id='specify-metas-panel'>
              <h2>Activate / Deactivate Groups</h2>
              <div className='sub-section group-selection'>
                <PkgTristateList items={tmetas} on={{change: pkgView._didChangeMeta}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      const diff = new DomDiff(actual, expected)
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('event handling', () => {
    it('responds to clicks in group select', () => {
      const mySpy = jasmine.createSpy((item, index) => {})
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = {'baseball': 'disabled', 'basketball': 'enabled'}
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas,
        on: {select: mySpy}
      })
      const parent = document.createElement('div')
      parent.appendChild(etch.render(pkgView))
      logger.debug(pkgView.element.querySelector('#groups-select-list'))
      const groupElem = pkgView.element.querySelector('#groups-select-list>ol').children[1]
      expect(groupElem).toBeInstanceOf(global.HTMLLIElement)
      expect(groupElem.innerText).toEqual('Wolfpack')
      const index = global.parseInt(groupElem.attributes.item(0).value)
      groupElem.click()
      // this should select a group and display its packages. Since we don't have a model,
      // the only thing that happens is the callback is called
      const actual = pkgView.render()
      const expected = <div className='pkg-groups'>
        <atom-panel id='group-select-panel'>
          <div id='pkg-groups-upper-panel' className='inset-panel padded'>
            <h1>Set Up Package Groups</h1>
            <PkgSelectList id='groups-select-list' items={tgroups} on={{change: pkgView._didSelectGroup}} />
            <button id='groups-add-group' name='add-group' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
            <button id='groups-delete-group' name='delete-group' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
            <PkgPickList leftList={tavailable} rightList={tselected} id='pkg-groups-group-pick'
              leftLabel='Packages Available' rightLabel='Packages In Group' on={{change: pkgView._didChange}} />
            <p className='group-select-hint'>Click Package Name to Select/Deselect</p>
          </div>
          <div id='pkg-groups-lower-panel' className='inset-panel padded'>
            <div id='defined-metas-panel'>
              <h1>Set Up Configurations</h1>
              <div id='meta-select-list'>
                <PkgSelectList items={tmetas} on={{change: pkgView._didSelectMeta}} />
                <button id='meta-add-meta' name='add-meta' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
                <button id='meta-delete-meta' name='delete-meta' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
              </div>
            </div>
            <div id='specify-metas-panel'>
              <h2>Activate / Deactivate Groups</h2>
              <div className='sub-section group-selection'>
                <PkgTristateList items={tmetas} on={{change: pkgView._didChangeMeta}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      const diff = new DomDiff(actual, expected)
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
      expect(actual).toEqual(expected)
      expect(mySpy).toHaveBeenCalled()
      expect(mySpy.calls[0].args).toEqual([groupElem.innerText, index])
    })

    it('responds to clicks on available list', () => {
      logger.debug('test click on package start')
      const mySpy = jasmine.createSpy((item, index) => {})
      const tavailable = ['package1', 'package2', 'package3']
      const tselected = ['package4', 'package5']
      const tgroups = ['Tar Heels', 'Wolfpack', 'Wildcats']
      const tmetas = {'baseball': 'disabled', 'basketball': 'enabled'}
      const pkgView = new PkgGroupsView({
        available: tavailable,
        selected: tselected,
        groups: tgroups,
        metas: tmetas,
        on: {change: mySpy}
      })
      const parent = document.createElement('div')
      parent.appendChild(etch.render(pkgView))
      logger.debug(pkgView.element.querySelector('#pkg-groups-group-pick'))
      const pkg2Elem = pkgView.element.querySelector('#pkg-groups-group-pick .pick-list-left-list .pkg-select-list>ol').children[1]
      expect(pkg2Elem).toBeInstanceOf(global.HTMLLIElement)
      expect(pkg2Elem.innerText).toEqual('package2')
      const index = global.parseInt(pkg2Elem.attributes.item(0).value)
      pkg2Elem.click()
      logger.debug('after click()')
      expect(pkgView.props.available).toEqual(['package1', 'package3'])
      const actual = pkgView.render()
      logger.debug('after render()')
      const expected = <div className='pkg-groups'>
        <atom-panel id='group-select-panel'>
          <div id='pkg-groups-upper-panel' className='inset-panel padded'>
            <h1>Set Up Package Groups</h1>
            <PkgSelectList id='groups-select-list' items={tgroups} on={{change: pkgView._didSelectGroup}} />
            <button id='groups-add-group' name='add-group' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
            <button id='groups-delete-group' name='delete-group' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
            <PkgPickList leftList={tavailable} rightList={tselected} id='pkg-groups-group-pick'
              leftLabel='Packages Available' rightLabel='Packages In Group' on={{change: pkgView._didChange}} />
            <p className='group-select-hint'>Click Package Name to Select/Deselect</p>
          </div>
          <div id='pkg-groups-lower-panel' className='inset-panel padded'>
            <div id='defined-metas-panel'>
              <h1>Set Up Configurations</h1>
              <div id='meta-select-list'>
                <PkgSelectList items={tmetas} on={{change: pkgView._didSelectMeta}} />
                <button id='meta-add-meta' name='add-meta' type='button' ><i class='fa fa-plus-circle' aria-hidden='true' /></button>
                <button id='meta-delete-meta' name='delete-meta' type='button' ><i class='fa fa-minus-circle' aria-hidden='true' /></button>
              </div>
            </div>
            <div id='specify-metas-panel'>
              <h2>Activate / Deactivate Groups</h2>
              <div className='sub-section group-selection'>
                <PkgTristateList items={tmetas} on={{change: pkgView._didChangeMeta}} />
              </div>
            </div>
          </div>
        </atom-panel>
      </div>
      logger.debug('created expected')
      const diff = new DomDiff(actual, expected)
      if (!diff.noDifferences()) {
        logger.warn(diff.toString())
      }
      expect(actual).toEqual(expected)
      expect(mySpy).toHaveBeenCalled()
      logger.debug('after toHaveBeenCalled()')
      if (mySpy.calls[0].args) {
        expect(mySpy.calls[0].args).toEqual([pkg2Elem.innerText, index])
      }
      logger.debug('test click on package end')
    })
  })
})
