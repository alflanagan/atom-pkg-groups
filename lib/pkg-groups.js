/** @babel */

/* global atom */
import PkgGroupsView from './pkg-groups-view'
import PkgGroupsModel from './pkg-groups-model'
import { CompositeDisposable, Disposable } from 'atom'

export default {

  subscriptions: null,
  model: null,
  view: null,

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable(
      // opener for configuration view
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://pkg-groups') {
          this.view = new PkgGroupsView(state['view'])
          return this.view
        }
      })
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
    return { view, model }
  },

  toggle () {
    atom.workspace.toggle('atom://pkg-groups')
  },

  deserializePkgGroupsView (serialized) {
    this.view = new PkgGroupsView(serialized)
    return this.view
  }
}
