/** @babel */

import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-model')
logger.level = 'info'

/**
 * A minimal mock for PackageManager, to substitute for atom.packages
 * in test scripts.
 */

export default class MockPackageManager {
  /**
   * Create a new mock. It will report packages with names in `pkgList`, and
   * will identify as "bundled" any package in the list `bundled`, or "disabled"
   * any package in the list `disabled`
   */
  constructor (pkgList, bundled, disabled) {
    this.pkgList = pkgList
    this.bundled = bundled
    this.disabled = disabled
  }

  getAvailablePackageNames () {
    return this.pkgList
  }

  isBundledPackage (pkgName) {
    for (const pkg of this.bundled) {
      if (pkg === pkgName) {
        return true
      }
    }
    return false
  }

  isPackageDisabled (pkgName) {
    for (const pkg of this.disabled) {
      if (pkg === pkgName) {
        return true
      }
    }
    return false
  }
}
