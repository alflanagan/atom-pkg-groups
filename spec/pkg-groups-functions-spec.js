/** @babel */
/** @jsx etch.dom */

/* eslint-env jasmine */
import {addIfMissing, firstTrue, objectEqual} from '../lib/pkg-groups-functions'
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

describe('firstTrue', () => {
  it('calls 1st function if 1st arg is true', () => {
    const fred = firstTrue(true, () => 'hello')
    expect(fred).toEqual('hello')
  })

  it('calls else function if 1st arg is false', () => {
    const fred = firstTrue(false, () => 'hello', () => 'goodbye')
    expect(fred).toEqual('goodbye')
  })

  it('handles multiple conditionals', () => {
    const fred = firstTrue(1 === 2, () => 'one', 3 === 4, () => 'two', 2 + 3 === 5, () => 'three', 7 === 8, () => 'four')
    expect(fred).toEqual('three')
  })

  it('throws an error if all cases are false (and no default)', () => {
    const badCall = () => firstTrue(false, () => 'bad', false, () => 'call')
    expect(badCall).toThrow('firstTrue: all conditions were false, and no else value was found')
  })
})

describe('objectEqual', () => {
  it('returns true for empty objects', () => {
    const empty1 = {}
    const empty2 = {}
    expect(empty1 === empty2).toBe(false)
    // because jasmine has its own object equality
    expect(empty1).toEqual(empty2)
    expect(objectEqual(empty1, empty2)).toBe(true)
  })

  it('returns true for simple key-value pairs', () => {
    let fred = {a: 7, b: 'hello', fred: 'barney'}
    let barney = {a: 7, b: 'hello', fred: 'barney'}
    expect(fred === barney).toBe(false)
    expect(fred).toEqual(barney)
    expect(objectEqual(fred, barney)).toBe(true)
  })

  it('handles object values', () => {
    let obj1 = {a: 7, b: {c: 8, d: 9}, e: 'fred'}
    let obj2 = {a: 7, b: {c: 8, d: 9}, e: 'fred'}
    expect(obj1 === obj2).toBe(false)
    expect(obj1).toEqual(obj2)
    expect(objectEqual(obj1, obj2)).toBe(true)
  })

  it('handles array values', () => {
    let obj1 = {a: 7, b: ['c', 8, 'd', 9], e: 'fred'}
    let obj2 = {a: 7, b: ['c', 8, 'd', 9], e: 'fred'}
    expect(obj1 === obj2).toBe(false)
    expect(obj1).toEqual(obj2)
    expect(objectEqual(obj1, obj2)).toBe(true)
  })

  it('handles object values that are objects and arrays', () => {
    let obj1 = {a: 7, b: {c: 8, d: {f: 12, g: [1, 2, 3]}}, e: 'fred'}
    let obj2 = {a: 7, b: {c: 8, d: {f: 12, g: [1, 2, 3]}}, e: 'fred'}
    expect(obj1 === obj2).toBe(false)
    expect(obj1).toEqual(obj2)
    expect(objectEqual(obj1, obj2)).toBe(true)
  })
})
