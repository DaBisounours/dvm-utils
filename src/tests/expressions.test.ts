import { test, expect } from '@jest/globals';
import { evaluate } from '../lib/main';
import { Program, DVMType } from '../types/program';
import { call, name, op, return_value, val } from '../lib/build';


test('expressions', () => {
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    call.statement('test', [
                        op.var.eq(name('a'), name('a')),
                        op.int.eq(name('a'), val(1)),
                        op.int.eq(val(1), name('a')),
                        op.str.eq(name('a'), val('s')),
                        op.str.eq(val('s'), name('a')),
                        op.var.eq(call('f', []), name('a')),
                        op.var.eq(name('a'), call('f', [])),
                        op.var.eq(call('f', []), call('g', [])),
                        op.int.eq(call('f', []), val(1)),
                        op.int.eq(val(1), call('f', [])),
                        op.str.eq(call('f', []), val('s')),
                        op.str.eq(val('s'), call('f', [])),
                        op.int.sub(name('a'), name('a')),
                        op.int.sub(call('f', []), name('a')),
                        op.int.sub(name('a'), call('f', [])),
                        op.int.sub(name('a'), op.int.sub(call('f', []), val(1))),
                    ], 10)

                ],
            },
            {
                name: 'a',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    return_value(0, 10)
                ],
            },
            {
                name: 'f',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    return_value(0, 10)
                ],
            }
        ],
    };
    const code = `Function Initialize() Uint64
    10 test(
        a == a,
        a == 1,
        1 == a,
        a == "s",
        "s" == a,
        f() == a,
        a == f(),
        f() == g(),
        f() == 1,
        1 == f(),
        f() == "s",
        "s" == f(),
        a - a,
        f() - a,
        a - f(),
        a - (f() - 1)
    )
  End Function
  
  Function a() Uint64
    10 RETURN 0
  End Function
  
  Function f() Uint64
    10 RETURN 0
  End Function`;
    expect(evaluate(code)).toMatchObject(expected)
});