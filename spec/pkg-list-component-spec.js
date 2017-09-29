/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */

import etch from 'etch'
import log4js from 'log4js'

import PkgListComponent from '../lib/pkg-list-component'

const logger = log4js.getLogger('pkg-groups-spec')
logger.level = 'debug'

describe('PkgListComponent', () => {
  it('shows a loading message when no packages are listed', () => {
    const fred = new PkgListComponent()
    expect(fred.count).toBe(0)
    const dom = fred.render()
    expect(dom).toEqual(<div className='alert alert-info loading-area icon icon-hourglass'>Loading packages&hellip;</div>)
  })
  it('lists packages in its properties', () => {
    const fred = new PkgListComponent({packages: ['barney', 'betty', 'bam-bam']})
    expect(fred.count).toBe(3)
    const dom = fred.render()
    expect(dom).toEqual(<div className='package-list'><ul><li>barney</li><li>betty</li><li>bam-bam</li></ul></div>)
  })
})
