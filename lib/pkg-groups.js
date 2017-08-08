/** @babel */

/* global atom */
import PkgGroupsView from './pkg-groups-view'
import { CompositeDisposable, Disposable } from 'atom'

export default {

  subscriptions: null,

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable(
      // opener for configuration view
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://pkg-groups') {
          return new PkgGroupsView()
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
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  toggle () {
    atom.workspace.toggle('atom://pkg-groups')
  },

  deserializePkgGroupsView (serialized) {
    return new PkgGroupsView(serialized)
  }
}
