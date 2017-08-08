/** @babel */
/** @jsx etch.dom */

import etch from "etch"

/**
 * This is the "big" view -- a pane to set up package groups. A different
 * view will be used to just enable/disable groups.
 */
export default class PkgGroupsView {

  /* eslint no-unused-vars: "off" */
  constructor(props, children) {
    etch.initialize(this)
  }

  render() {
    // Create root element
    this.element = <div class="pkg-groups">
      <p>Package Groups view</p>
    </div>
    return this.element
  }

  update(props, children) {
    return etch.update(this)
  }

  getTitle() {
    // for Atom tab
    return "Package Groups"
  }

  getURI() {
    return "atom://pkg-groups"
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      deserializer: "pkg-groups/PkgGroupsView"
    }
  }

  // Tear down any state and detach
  async destroy() {
    await etch.destroy(this)
  }

  getElement() {
    return this.element
  }

}
