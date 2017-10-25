/** @babel */

/* eslint-env jasmine */
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-dom-diff')
logger.level = 'debug'

/** module-level to track recursive calls to toString() to set tabs */
let tabLevel = 0

/**
 * A class to represent the differences between two DOM structures. Used to
 * produce useful messages for debugging specs.
 *
 * NOTE: seems like we should be able to use etch packages `patch` function.
 */
export default class DomDiff {
  constructor (dom1, dom2) {
    /** the two tags of the doms, only if not the same */
    this.tags = []
    /** the text contents of the doms, only if not the same */
    this.texts = []
    /** list of props in dom1 not found in dom2 */
    this.in1Only = []
    /** list of props in dom2 not found in dom1 */
    this.in2Only = []
    /** map from property name ==> array [value in dom1, value in dom 2] only if those values differ */
    this.props = {}
    /** map from index in children array ==> DomDiff object for the child if diffs were found */
    this.children = {}
    /** child counts for dom1, dom2. */
    this.childCount = [dom1.children ? dom1.children.length : 0,
      dom2.children ? dom2.children.length : 0]

    /* text nodes don't have tags, possibly others */
    if (dom1.tag && dom1.tag !== dom2.tag) {
      this.tags = [dom1.tag, dom2.tag]
    }
    /* compare text contents */
    if (dom1.text || dom2.text) {
      if (dom1.text !== dom2.text) {
        this.texts = [dom1.text, dom2.text]
      }
    }
    /* check for properties found only in dom1, and for different values */
    for (const key in dom1.props) {
      if (dom2.props && dom2.props.hasOwnProperty(key)) {
        if (dom1.props[key] !== dom2.props[key]) {
          this.props[key] = [dom1.props[key], dom2.props[key]]
        }
      } else {
        this.in1Only.push(key)
      }
    }
    /* check for properties found only in dom2 */
    for (const key in dom2.props) {
      if (!(dom1.props && dom1.props.hasOwnProperty(key))) {
        // note we already checked for values !=
        this.in2Only.push(key)
      }
    }
    if (this.childCount[0] === this.childCount[1]) {
      for (let i = 0; i < this.childCount[0]; i++) {
        // logger.debug(dom1.children[i])
        // logger.debug(dom2.children[i])
        const childDiff = new DomDiff(dom1.children[i], dom2.children[i])
        // logger.debug(childDiff)
        if (!childDiff.noDifferences()) {
          this.children[i] = childDiff
        }
      }
    }
  }

  /**
   * @returns true if the two doms turned out to be equal.
   */
  noDifferences () {
    for (const key in this.props) {
      return false
    }
    // logger.debug(this.children)
    for (const key in this.children) {
      return false
    }
    return (this.tags.length === 0 && this.in1Only.length === 0 && this.in2Only.length === 0 && this.childCount[0] === this.childCount[1] && this.texts.length === 0)
  }

  /**
   * Provide legible error message on what the differences are. This is why
   * this class exists.
   */
  toString () {
    const tabs = '\t'.repeat(tabLevel)
    if (this.noDifferences()) {
      return `${tabs}No differences found.`
    }
    let diffList = []
    if (this.tags[0] && this.tags[1]) {
      diffList.push(`${tabs}Tag of first DOM was ${this.tags[0]}, but second was ${this.tags[1]}.`)
    }
    if (this.texts.length > 0) {
      diffList.push(`${tabs}First DOM has text ${this.texts[0]}, but second has ${this.texts[1]}.`)
    }
    if (this.in1Only && this.in1Only.length > 0) {
      diffList.push(`${tabs}Properties found in 1st DOM but not the second: ${this.in1Only}`)
    }
    if (this.in2Only && this.in2Only.length > 0) {
      diffList.push(`${tabs}Properties found in 2nd DOM but not the first: ${this.in2Only}`)
    }
    for (const key in this.props) {
      diffList.push(`${tabs}Property "${key}" is "${this.props[key][0]}" in 1st DOM but "${this.props[key][1]}" in the second.`)
    }
    if (this.childCount[0] !== this.childCount[1]) {
      diffList.push(`${tabs}The 1st DOM has ${this.childCount[0]} children but the second has ${this.childCount[1]} (children not compared).`)
    } else {
      try {
        tabLevel += 1
        for (const key in this.children) {
          diffList.push(`${tabs}The DOMs have differing children at index ${key}. Differences:`)
          diffList.push(`${this.children[key]}`)
        }
      } finally {
        tabLevel -= 1
      }
    }
    return diffList.join('\n')
  }
}
