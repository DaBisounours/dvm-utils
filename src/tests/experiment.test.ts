import { test, expect } from '@jest/globals';
import { parse } from '../lib/parse';
import { Program, DVMType } from '../types/program';
import { call, if_then, name, op, return_value, store, val } from '../lib/build';


test('experiment #1', () => {
    const expected: Program = {
        functions: [
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then.else(op.int.eq(
                        call('EXISTS', [op.str.concat(
                            name('scid'),
                            val('owner'))
                        ]),
                        val(1)
                    ), 20, 100, 10
                    ),
                    if_then.else(op.var.eq(
                        call('LOAD', [
                            op.str.concat(
                                name('scid'),
                                val('owner')
                            ),
                        ]),
                        call('SIGNER', [])
                    ), 30, 100, 20
                    ),
                    if_then(op.int.lt(
                        call('DEROVALUE', []),
                        val(200)
                    ), 100, 30
                    ),
                    store(val("balance"), op.var.plus(
                        call("LOAD", [val("balance")]),
                        call("DEROVALUE")
                    ), 40),
                    store(name("scid"),
                        op.str.concat(
                            name('name'),
                            op.str.concat(
                                op.str.concat(
                                    op.str.concat(
                                        val(";"),
                                        name("descr")    
                                    ),
                                    val(";")
                                ),
                                name("icon")
                            )
                        )
                        , 50),
                    return_value(0, 100)
                ],
            },
        ],
        headers: [],
    };
    //console.dir({expected}, {depth: null});
    
    const code = `Function Initialize() Uint64
    10  IF EXISTS(scid + "owner") == 1 THEN GOTO 20 ELSE GOTO 100
    20  IF LOAD(scid + "owner") == SIGNER() THEN GOTO 30 ELSE GOTO 100
    30  IF DEROVALUE() < 200 THEN GOTO 100
    40  STORE("balance", LOAD("balance") + DEROVALUE())
    50  STORE(scid, name + ";" + descr + ";" + icon)

    100 RETURN 0
  End Function`;
    expect(parse(code)).toMatchObject(expected)
});