import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program, Statement } from '../types/program';


test('return', () => {
    const expected: Program = {
        headers: ['return'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    {
                        line: 100,
                        type: 'return',
                        expression: { type: 'value', value: 0 },
                    },
                ],
            },
        ],
    };
    const code = `// return
  Function Initialize() Uint64
    100 RETURN 0
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});

test('string expression ==', () => {
    const expected: Program = {
        headers: ['string expression =='],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    {
                        line: 100,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.String,
                            operator: { type: 'logical', logical: '==' },
                            operands: [
                                { type: 'value', value: 'a' },
                                { type: 'value', value: 'a' },
                            ],
                        },
                    },
                    {
                        line: 110,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.String,
                            operator: { type: 'logical', logical: '!=' },
                            operands: [
                                { type: 'value', value: 'a' },
                                { type: 'value', value: 'a' },
                            ],
                        },
                    },
                ],
            },
        ],
    };
    const code = `// string expression ==
  Function Initialize() Uint64
    100 RETURN "a" == "a"
    110 RETURN "a" != "a"
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});

test('string expression calc', () => {
    const expected: Program = {
        headers: ['string expression calc'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.String,
                args: [],
                statements: [
                    {
                        line: 100,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.String,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 'a' },
                                { type: 'value', value: 'a' },
                            ],
                        },
                    },
                ],
            },
        ],
    };
    const code = `// string expression calc
  Function Initialize() String
    100 RETURN "a" + "a"
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});



test('int expression cmp', () => {
    const expected: Program = {
        headers: ['int expression cmp'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: ['==', '!=', '<=', '>=', '<', '>']
                    .map((logical, index) => {
                        return {
                            line: 100 + 10 * index,
                            type: 'return',
                            expression: {
                                type: 'operation',
                                operationType: DVMType.Uint64,
                                operator: { type: 'logical', logical: logical as '==' | '!=' | '>' | '<' | '>=' | '<=' },
                                operands: [
                                    { type: 'value', value: 1 },
                                    { type: 'value', value: 1 },
                                ],
                            },
                        }
                    }),
            },
        ],
    };
    const code = `// int expression cmp
  Function Initialize() Uint64
    100 RETURN 1 == 1
    110 RETURN 1 != 1
    120 RETURN 1 <= 1
    130 RETURN 1 >= 1
    140 RETURN 1 < 1
    150 RETURN 1 > 1
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});



test('int expression calc', () => {
    const expected: Program = {
        headers: ['int expression calc'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    {
                        line: 100,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 1 },
                                { type: 'value', value: 1 },
                            ],
                        },
                    },
                    {
                        line: 110,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '-' },
                            operands: [
                                { type: 'value', value: 1 },
                                { type: 'value', value: 1 },
                            ],
                        },
                    },
                    {
                        line: 120,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '-' },
                            operands: [
                                {
                                    type: 'operation',
                                    operands: [
                                        { type: 'value', value: 1 },
                                        { type: 'value', value: 1 },
                                    ],
                                    operator: { type: 'calc', calc: '+' },
                                    operationType: DVMType.Uint64
                                },
                                { type: 'value', value: 1 },
                            ],
                        },
                    },
                    {
                        line: 130,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 1 },
                                {
                                    type: 'operation',
                                    operands: [
                                        { type: 'value', value: 1 },
                                        { type: 'value', value: 1 },
                                    ],
                                    operator: { type: 'calc', calc: '*' },
                                    operationType: DVMType.Uint64
                                },
                            ],
                        },
                    },
                    {
                        line: 140,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 1 },
                                {
                                    type: 'operation',
                                    operands: [
                                        { type: 'value', value: 1 },
                                        { type: 'value', value: 1 },
                                    ],
                                    operator: { type: 'calc', calc: '/' },
                                    operationType: DVMType.Uint64
                                },
                            ],
                        },
                    },
                    {
                        line: 150,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 1 },
                                {
                                    type: 'operation',
                                    operands: [
                                        { type: 'value', value: 1 },
                                    ],
                                    operator: { type: 'bitwise', bitwise: '!' },
                                    operationType: DVMType.Uint64
                                },
                            ],
                        },
                    },
                    {
                        line: 150,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '+' },
                            operands: [
                                { type: 'value', value: 1 },
                                {
                                    type: 'operation',
                                    operator: { type: 'bitwise', bitwise: '!' },
                                    operands: [
                                        {
                                            type: 'operation',
                                            operator: { type: 'calc', calc: '-' },
                                            operands: [
                                                { type: 'value', value: 1 },
                                                { type: 'value', value: 1 },
                                            ],
                                            operationType: DVMType.Uint64
                                        },
                                    ],
                                    operationType: DVMType.Uint64
                                },
                            ],
                        },
                    },
                    {
                        line: 160,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'calc', calc: '%' },
                            operands: [
                                { type: 'value', value: 1 },
                                { type: 'value', value: 1 },
                            ],
                        },
                    },
                ],
            },
        ],
    };
    const code = `// int expression calc
  Function Initialize() Uint64
    100 RETURN 1 + 1
    110 RETURN 1 - 1
    120 RETURN 1 + 1 - 1
    130 RETURN 1 + 1 * 1
    140 RETURN 1 + 1 / 1
    150 RETURN 1 + !1
    150 RETURN 1 + !(1 - 1)
    160 RETURN 1 % 1
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});

test('bitwise expression calc / cmp', () => {
    const expected: Program = {
        headers: ['int expression calc / cmp'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: ['&', '|', '<<', '>>', '^']
                    .map((bitwise, index) => {
                        return {
                            line: 100 + 10 * index,
                            type: 'return',
                            expression: {
                                type: 'operation',
                                operationType: DVMType.Uint64,
                                operator: { type: 'bitwise', bitwise: bitwise as '&' | '|' | '<<' | '>>' | '^' },
                                operands: [
                                    { type: 'value', value: 1 },
                                    { type: 'value', value: 1 },
                                ],
                            },
                        }
                    }),
            },
        ],
    };
    const code = `// int expression calc / cmp
  Function Initialize() Uint64
    100 RETURN 1 & 1
    110 RETURN 1 | 1
    120 RETURN 1 << 1
    130 RETURN 1 >> 1
    140 RETURN 1 ^ 1
    
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});
