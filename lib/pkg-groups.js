/** @babel */

import fs from 'fs'
import log4js from 'log4js'

/* global atom */
import PkgGroupsView from './pkg-groups-view'
import PkgGroupsModel from './pkg-groups-model'
import {CompositeDisposable, Disposable} from 'atom'

let logger = log4js.getLogger('pkg-groups')
logger.level = 'debug'

const PKG_GROUPS_URI = 'atom://pkg-groups'

export default {

  subscriptions: null,
  model: null,
  view: null,

  getFileStore () {
    return atom.getConfigDirPath() + '.pkg-groups.json'
  },

  activate (state) {
    state['view'] = state['view'] || {}
    state['view']['groups'] = ['a', 'b', 'c']
    state['view']['available'] = ['package1', 'package2', 'package3']
    state['view']['selected'] = ['package4', 'package5']
    // logger.debug(state)
    this.view = new PkgGroupsView(state['view'])

    this.subscriptions = new CompositeDisposable(
      // opener for configuration view
      atom.workspace.addOpener(
        uri => {
          if (uri === 'atom://pkg-groups') {
            // ultimately this should return model, workspace will use View Registry to get view
            return this.view
          }
        },
      {searchAllPanes: true})
    )

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pkg-groups:toggle': () => this.toggle()
    }))

    // Destroy any views when package is deactivated
    this.subscriptions.add(new Disposable(() => {
      /* global item */
      if (item instanceof PkgGroupsView) {
        item.destroy()
      }
    }))

    // go from model to the (single) view
    this.subscriptions.add(atom.views.addViewProvider(PkgGroupsModel, model => {
      return this.view
    }))

    this.model = new PkgGroupsModel(state['model'])
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  serialize () {
    let view = {}
    let model = {}
    if (this.view instanceof PkgGroupsView) {
      view = this.view.serialize()
    }
    if (this.model instanceof PkgGroupsModel) {
      model = this.model.serialize()
    }
    return {view, model}
  },

  toggle () {
    // toggle(PKG_GROUPS_URI) doesn't close existing pane, not sure why
    // so explicitly search for it
    let myPane = null
    for (const pane of atom.workspace.getCenter().getPaneItems()) {
      if (pane instanceof PkgGroupsView) {
        myPane = pane
        break
      }
    }
    if (myPane !== null) {
      atom.workspace.toggle(myPane)
    } else {
      atom.workspace.toggle(PKG_GROUPS_URI)
    }
  },

  getGroups () {
    return JSON.parse(fs.readFileSync(this.getFileStore(), 'utf-8'))
  },

  saveGroups () {
    fs.writeFileSync(this.getFileStore(), JSON.stringify(this.serialize()), 'utf-8')
  },
  /**
   * not sure we need this. All state *should* be in the model. Might be faster
   * to deserialize than rebuild UI though.
   */
  deserializePkgGroupsView (serialized) {
    return new PkgGroupsView(serialized.props, serialized.children)
  },

  deserializePkgGroupsModel (serialized) {
    return new PkgGroupsModel(serialized)
  }
}
