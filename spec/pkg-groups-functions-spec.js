/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import {addIfMissing} from '../lib/pkg-groups-functions'
import log4js from 'log4js'

const logger = log4js.getLogger('pkg-groups-functions-spec')
logger.level = 'debug'

describe('addIfMissing', () => {
  it('has no effect if the suffix already present in string', () => {
    const testStr = addIfMissing('this is a test', 'is a', 'foghat')
    expect(testStr).toEqual('this is a test')
  })

  it('appends the suffix to the string', () => {
    const testStr = addIfMissing('this is a test', ' of the emergency')
    expect(testStr).toEqual('this is a test of the emergency')
  })

  it('appends with a separator if given', () => {
    const testStr = addIfMissing('some string', 'other string', ' separated from ')
    expect(testStr).toEqual('some string separated from other string')
  })

  it('behaves reasonably with empty strings', () => {
    let testStr = addIfMissing('some string', '', 'separator')
    expect(testStr).toEqual('some string')
    testStr = addIfMissing('some string', 'another string', '')
    expect(testStr).toEqual('some stringanother string')
    testStr = addIfMissing('', 'function worked', 'this ')
    expect(testStr).toEqual('this function worked')
    testStr = addIfMissing('', '', '')
    expect(testStr).toEqual('')
  })

  it('returns only 2nd argument if first is not a string', () => {
    let testStr = addIfMissing(undefined, 'land of confusion', 'this is the ')
    expect(testStr).toEqual('land of confusion')
    testStr = addIfMissing({ completely: 'wrong' }, 'blah blah blah', '')
    expect(testStr).toEqual('blah blah blah')
  })
})
