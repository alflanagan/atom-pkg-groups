/** @babel */

import fs from 'fs'
import log4js from 'log4js'

/* global atom */
import PkgGroupsView from './pkg-groups-view'
import PkgGroupsModel from './pkg-groups-model'
import PkgGroupsGroup from './pkg-groups-group'
import {CompositeDisposable, Disposable} from 'atom'

let logger = log4js.getLogger('pkg-groups')
logger.level = 'debug'

const PKG_GROUPS_URI = 'atom://pkg-groups'

/**
 * Controller instance.
 *
 * User input on the view causes updates to the model.
 * Updates to the model cause updates to the view.
 */
export default {

  subscriptions: null,
  model: null,
  view: null,

  getFileStore () {
    return atom.getConfigDirPath() + '.pkg-groups.json'
  },

  /**
   * Before the user ever starts setting up a model, we need a 'starter' model.
   *
   * @return {PkgGroupsModel} the model a user first sees, before customizing
   */
  getDefaultModel () {
    const pkgsAvailable = []
    for (const pkgName of atom.packages.getAvailablePackageNames()) {
      if (!atom.packages.isBundledPackage(pkgName)) {
        pkgsAvailable.push(pkgName)
      }
    }
    const allGroup = new PkgGroupsGroup({name: 'everything', packages: pkgsAvailable, type: 'group', deserializer: 'pkg-groups/PkgGroupsGroup'})
    return new PkgGroupsModel({enabled: ['everything'], disabled: [], groups: [allGroup], metas: []})
  },

  activate (state) {
    console.log('activating pkg-groups')
    console.log(state)
    if (!state.hasOwnProperty('model')) {
      this.model = this.getDefaultModel()
    } else {
      this.model = new PkgGroupsModel(state['model'])
    }
    this.view = new PkgGroupsView({model: this.model,
      on: {
        select_group: null,
        add_group_btn: null,
        del_group_btn: null,
        select_avail_pkg: null,
        select_selected_pkg: null,
        select_config: null,
        add_config_btn: null,
        del_config_btn: null,
        toggle_group: null
      }
    })

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
  },

  deactivate () {
    this.subscriptions.dispose()
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

  deserializePkgGroupsModel (serialized) {
    console.log('deserializePkgGroupsModel')
    return new PkgGroupsModel(serialized)
  }
}
