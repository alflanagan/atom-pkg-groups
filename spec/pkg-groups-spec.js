/** @babel */

/* eslint-env jasmine */
/* global waitsForPromise */ // missing from jasmine environment
import log4js from 'log4js'

// import PkgGroups from '../lib/pkg-groups'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgGroups', () => {
  let workspaceElement, activationPromise

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('pkg-groups')
  })

  describe('when the pkg-groups:toggle event is triggered', () => {
    it('hides and shows the setup panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.pkg-groups')).not.toExist()

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'pkg-groups:toggle')

      // make sure package is activated
      waitsForPromise(() => {
        return activationPromise
      })

      runs(() => {
        let pkgGroupsElement = workspaceElement.querySelector('.pkg-groups')
        expect(pkgGroupsElement).toExist()
        atom.commands.dispatch(workspaceElement, 'pkg-groups:toggle')
        pkgGroupsElement = workspaceElement.querySelector('.pkg-groups')
        expect(pkgGroupsElement).not.toExist()
      })
    })

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement)

      expect(workspaceElement.querySelector('.pkg-groups')).not.toExist()

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'pkg-groups:toggle')

      waitsForPromise(() => {
        return activationPromise
      })

      runs(() => {
        // Now we can test for view visibility
        let pkgGroupsElement = workspaceElement.querySelector('.pkg-groups')
        expect(pkgGroupsElement).toBeVisible()
        atom.commands.dispatch(workspaceElement, 'pkg-groups:toggle')
        expect(pkgGroupsElement).not.toBeVisible()
      })
    })
  })
})
