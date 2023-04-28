import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program, Statement } from '../types/program';
import { assign, declare, op, return_expression, return_value, val } from '../lib/build';



test('dim', () => {
    const expected: Program = {
        //headers: ['return'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    return_value(0, 10),
                    declare('var', DVMType.Uint64, 100),
                    declare('var2', DVMType.String, 110),
                    ...declare.multiple(['var3', "var4"], DVMType.Uint64, 120),
                ],
            },
        ],
    };
    const code = `// return
  Function Initialize() Uint64
    10 RETURN 0
    100 DIM var AS Uint64
    110 DIM var2 AS String
    120 DIM var3, var4 as Uint64
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});


test('let', () => {
    const expected: Program = {
        //headers: ['return'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    declare('var', DVMType.Uint64, 100),
                    assign('var', val(3), 110),
                    return_value(0, 120),
                ],
            },
        ],
    };
    const code = `// return
  Function Initialize() Uint64
    
    100 DIM var as Uint64
    110 LET var = 3
    120 RETURN 0
  End Function
      `;
    expect(parse(code)).toMatchObject(expected)
});


test('return', () => {
    const expected: Program = {
        //headers: ['return'],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    return_value(0, 100)
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
        //headers: ['string expression =='],
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    /*{
                        line: 100,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'logical', logical: '==' },
                            operands: [
                                { type: 'value', value: 'a' },
                                { type: 'value', value: 'a' },
                            ],
                        },
                    },*/
                    return_expression(op.str.eq(val('a'), val('a')), 100),

                    /*{
                        line: 110,
                        type: 'return',
                        expression: {
                            type: 'operation',
                            operationType: DVMType.Uint64,
                            operator: { type: 'logical', logical: '!=' },
                            operands: [
                                { type: 'value', value: 'a' },
                                { type: 'value', value: 'a' },
                            ],
                        },
                    },*/
                    return_expression(op.str.ne(val('a'), val('a')), 110),
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
        //headers: ['string expression calc'],
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
        //headers: ['int expression cmp'],
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
        //headers: ['int expression calc'],
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
        //headers: ['int expression calc / cmp'],
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
