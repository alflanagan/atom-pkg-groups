/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import DomDiff from '../lib/pkg-groups-dom-diff'
import log4js from 'log4js'
import etch from 'etch'
import path from 'path'

const logger = log4js.getLogger(path.basename(__filename, '.js'))
logger.level = 'debug'

describe('DomDiff', () => {
  describe('constructor', () => {
    it('can find properties with different values', () => {
      let diff = new DomDiff(<div className='dom1' />, <div className='dom2' />)
      expect(diff.in1Only).toEqual([])
      expect(diff.in2Only).toEqual([])
      expect(diff.props).toEqual({className: ['dom1', 'dom2']})
      expect(diff.children).toEqual({})
    })

    it('finds nodes with different tags', () => {
      const diff = new DomDiff(<div className='dom1' />, <span className='dom1' />)
      expect(diff.tags).toEqual(['div', 'span'])
    })

    it('finds properites in one DOM but not the other', () => {
      const diff = new DomDiff(<div fred='wilma' />, <div barney='betty' />)
      expect(diff.in1Only).toEqual(['fred'])
      expect(diff.in2Only).toEqual(['barney'])
    })

    it('finds properties with different values', () => {
      const diff = new DomDiff(<div fred='wilma' />, <div fred='betty' />)
      expect(diff.props['fred']).toEqual(['wilma', 'betty'])
    })

    it('detects when nodes have differing numbers of children', () => {
      const diff = new DomDiff(<ul><li>fred</li><li>barney</li></ul>, <ul><li property='notchecked'>fred</li></ul>)
      expect(diff.childCount).toEqual([2, 1])
      /* because we don't check children if counts aren't the same... */
      expect(Object.keys(diff.children).length).toEqual(0)
    })

    it('recursively finds differences between child nodes', () => {
      const diff = new DomDiff(<ul><li>fred</li><li>barney</li></ul>, <ul><li property='checked'>fred</li><li>thomas</li></ul>)
      /* found 1 child which is different... */
      expect(Object.keys(diff.children).length).toEqual(1)
      /* because it has 1 child which is different */
      for (let key in diff.children) {
        expect(Object.keys(diff.children[key].children).length).toEqual(1)
      }
    })
  })

  describe('noDifferences', () => {
    it('is true when initial doms are same object', () => {
      const dom1 = <div className='fred' />
      const diff = new DomDiff(dom1, dom1)
      expect(diff.noDifferences()).toBe(true)
    })

    it('is false when tags are different', () => {
      const diff = new DomDiff(<div className='dom1' />, <span className='dom1' />)
      expect(diff.noDifferences()).toBe(false)
    })

    it('is false when property keys differ', () => {
      let diff = new DomDiff(<div className='dom1' />, <div freakazoid='dom1' />)
      expect(diff.noDifferences()).toBe(false)
      expect(diff.in1Only).toEqual(['className'])
      expect(diff.in2Only).toEqual(['freakazoid'])
      diff = new DomDiff(<div className='dom1' />, <div className='dom1' freakazoid='dom1' />)
      expect(diff.noDifferences()).toBe(false)
      expect(diff.in1Only).toEqual([])
      expect(diff.in2Only).toEqual(['freakazoid'])
    })
  })

  describe('toString', () => {
    it('reports no differences simply', () => {
      const dom1 = <div className='fred' />
      const diff = new DomDiff(dom1, dom1)
      expect('' + diff).toEqual('No differences found.')
    })

    it('reports different tags', () => {
      const diff = new DomDiff(<div className='dom1' />, <span className='dom1' />)
      expect('' + diff).toEqual('Tag of first DOM was div, but second was span.')
    })

    it('reports extra props in either dom', () => {
      const diff = new DomDiff(<div fred='wilma' />, <div barney='betty' />)
      expect(diff.toString()).toEqual('Properties found in 1st DOM but not the second: fred\nProperties found in 2nd DOM but not the first: barney')
    })

    it('reports properties with different values', () => {
      const diff = new DomDiff(<div fred='wilma' />, <div fred='betty' />)
      expect(diff.toString()).toEqual('Property "fred" is "wilma" in 1st DOM but "betty" in the second.')
    })

    it('reports cases where nodes have differing numbers of children', () => {
      const diff = new DomDiff(<ul><li>fred</li><li>barney</li></ul>, <ul><li property='notchecked'>fred</li></ul>)
      expect(diff.toString()).toEqual('The 1st DOM has 2 children but the second has 1 (children not compared).')
    })

    it('recursively reports differences between child nodes', () => {
      const diff = new DomDiff(<ul><li>fred</li><li>barney</li></ul>, <ul><li property='notchecked'>fred</li><li>thomas</li></ul>)
      expect(diff.toString()).toEqual('The DOMs have differing children at index 1. Differences:\n\tThe DOMs have differing children at index 0. Differences:\n\t\tFirst DOM has text barney, but second has thomas.')
    })
  })
})
