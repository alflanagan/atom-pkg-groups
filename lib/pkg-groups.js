'use babel';

import PkgGroupsView from './pkg-groups-view';
import { CompositeDisposable } from 'atom';

export default {

  pkgGroupsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.pkgGroupsView = new PkgGroupsView(state.pkgGroupsViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.pkgGroupsView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pkg-groups:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.pkgGroupsView.destroy();
  },

  serialize() {
    return {
      pkgGroupsViewState: this.pkgGroupsView.serialize()
    };
  },

  toggle() {
    console.log('PkgGroups was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
