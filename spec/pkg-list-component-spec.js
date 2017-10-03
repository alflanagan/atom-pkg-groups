/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'

import PkgListComponent from '../lib/pkg-list-component'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgListComponent', () => {
  it('shows an empty list', () => {
    const fred = new PkgListComponent()
    expect(fred.count).toBe(0)
    const dom = fred.render()
    expect(dom).toEqual(<div className='package-list'><ul /></div>)
  })
  it('lists packages in its properties', () => {
    const fred = new PkgListComponent({packages: ['barney', 'betty', 'bam-bam']})
    expect(fred.count).toBe(3)
    const dom = fred.render()
    expect(dom).toEqual(<div className='package-list'><ul><li>barney</li><li>betty</li><li>bam-bam</li></ul></div>)
  })
  it('passes through className property', () => {
    let bub = new PkgListComponent({className: 'CSC266', packages: ['pkg1', 'pkg2', 'pkg3']})
    expect(bub.count).toBe(3)
    const dom = bub.render()
    expect(dom).toEqual(<div className='CSC266 package-list'><ul><li>pkg1</li><li>pkg2</li><li>pkg3</li></ul></div>)
  })
  it('passes through other properties', () => {
    let bub = new PkgListComponent({className: 'CSC266',
      packages: ['pkg1', 'pkg2', 'pkg3'],
      id: 'my-pkg-list',
      frobozz: 'gulash'})
    expect(bub.count).toBe(3)
    const dom = bub.render()
    expect(dom).toEqual(<div className='CSC266 package-list' id='my-pkg-list' frobozz='gulash'><ul><li>pkg1</li><li>pkg2</li><li>pkg3</li></ul></div>)
  })
})
