import { test, expect } from '@jest/globals';
import { parse } from '../lib/main';
import { Program, DVMType } from '../types/program';
import { call, comment, if_then, name, op, return_expression, return_value, store, val } from '../lib/build';


test('name function check', () => {
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then.else(
                        call('nameExists', [val('owner')]),
                        20, 100, 10
                    ),
                    return_value(0, 20),
                    return_value(1, 100)
                ],
            },
            {
                name: 'nameExists',
                return: DVMType.Uint64,
                args: [
                    { name: 'name', type: DVMType.String }
                ],
                statements: [
                    return_expression(call('EXISTS', [name('name')]), 10)
                ],
            },
        ],
    };

    const code = `Function Initialize() Uint64
    10  IF nameExists("owner") THEN GOTO 20 ELSE GOTO 100
    20  RETURN 0
    100 RETURN 1
  End Function
  
  Function nameExists(name String) Uint64
    10  RETURN EXISTS(name)
  End Function
  `;

    expect(parse(code)).toMatchObject(expected);

});

test('name not found', () => {
    const wrongName = 'EXISTSE'
    const expectedErr = new Error('function "EXISTSE" not found');
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then.else(
                        call(wrongName, [val('owner')]),
                        20, 100, 10
                    ),
                    return_value(0, 20),
                    return_value(1, 100)
                ],
            },
        ],
    };

    const code = `Function Initialize() Uint64
    10  IF ${wrongName}("owner") THEN GOTO 20 ELSE GOTO 100
    20 RETURN 0
    100 RETURN 1
  End Function`;
    try {
        const parsed = parse(code)
        expect(parsed).toMatchObject(expected)
    } catch (error) {
        expect(error).toStrictEqual(expectedErr)
    }

});


test('name wrong function as var', () => {
    const expectedErr = new Error('dvm-function "EXISTS" exists but is used as a value');
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then.else(
                        call("EXISTS", [val('owner')]),
                        20, 100, 10
                    ),
                    return_expression(name("EXISTS"), 20),
                    return_value(1, 100)
                ],
            },
        ],
    };

    const code = `Function Initialize() Uint64
    10  IF EXISTS("owner") THEN GOTO 20 ELSE GOTO 100
    20 RETURN EXISTS
    100 RETURN 1
  End Function`;
    try {
        const parsed = parse(code)
        expect(parsed).toMatchObject(expected)
    } catch (error) {
        expect(error).toStrictEqual(expectedErr)
    }

});


test('name wrong var as function', () => {
    const expectedErr = new Error('argument "a" exists but is used as a function');
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [{ name: 'a', type: DVMType.String }],
                statements: [
                    if_then.else(
                        call("EXISTS", [val('owner')]),
                        20, 100, 10
                    ),
                    return_expression(call("a"), 20),
                    return_value(1, 100)
                ],
            },
        ],
    };

    const code = `Function Initialize(a String) Uint64
    10  IF EXISTS("owner") THEN GOTO 20 ELSE GOTO 100
    20 RETURN a()
    100 RETURN 1
  End Function`;
    try {
        const parsed = parse(code)
        expect(parsed).toMatchObject(expected)
    } catch (error) {
        expect(error).toStrictEqual(expectedErr)
    }

});

