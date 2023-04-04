import { test, expect } from '@jest/globals';
import { true_split } from '../utils/misc';

test('true split', () => {
    expect(true_split('a,b,c,d', ',')).toStrictEqual(['a', 'b', 'c', 'd'])
})

test('true split limit 0', () => {
    expect(true_split('a,b,c,d', ',', 0)).toStrictEqual(['a', 'b', 'c', 'd'])
})

test('true split limit 1', () => {
    expect(true_split('a,b,c,d', ',', 1)).toStrictEqual(['a', 'b,c,d'])
})

test('true split limit 2', () => {
    expect(true_split('a,b,c,d', ',', 2)).toStrictEqual(['a', 'b', 'c,d'])
})

test('true split limit 3', () => {
    expect(true_split('a,b,c,d', ',', 3)).toStrictEqual(['a', 'b', 'c', 'd'])
})

test('true split limit last', () => {
    expect(true_split('a,b,c,d', ',', 4)).toStrictEqual(['a', 'b', 'c', 'd'])
})


test('true split limit +1', () => {
    expect(true_split('a,b,c,d', ',', 5)).toStrictEqual(['a', 'b', 'c', 'd'])
})

test('true split empty', () => {
    expect(true_split('', ' ')).toStrictEqual([''])
})

