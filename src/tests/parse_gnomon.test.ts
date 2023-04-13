
import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';

import { return_value, store, name, val, call, op, if_then } from '../lib/build';


test('gnomon', () => {
    const expected: Program = {
        headers: ['Copyright 2022 Civilware. All rights reserved.',
            'Gnomon - DERO Network Indexer (https://github.com/civilware/Gnomon)',
            'Usernames: Gnomon, gnomon'],
        functions: [
            // InitializePrivate
            {
                name: 'InitializePrivate',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then(op.int.eq(
                        call('EXISTS', [val('owner')]),
                        val(0)
                    ), 30, 10),
                    return_value(1, 20),
                    store(val('owner'), call('SIGNER', []), 30),
                    store(val('signature'), val(""), 40),
                    store(val('balance'), val(0), 50),
                    return_value(0, 100),
                ],
            },

            // InputSCID
            {
                name: 'InputSCID',
                return: DVMType.Uint64,
                args: [
                    { name: "scid", type: DVMType.String },
                    { name: "scowner", type: DVMType.String },
                    { name: "deployheight", type: DVMType.Uint64 },
                ],
                statements: [
                    if_then.else(op.var.eq(
                        call('LOAD', [
                            val('owner')]),
                        call('SIGNER', []
                        )), 20, 100, 10
                    ),
                    if_then.else(op.int.eq(
                        call('EXISTS', [name('scid')]),
                        val(0)), 30, 100, 20
                    ),
                    if_then.else(op.str.ne(
                        name('scowner'),
                        val('')), 40, 100, 30
                    ),
                    if_then.else(op.int.eq(
                        call('IS_ADDRESS_VALID', [call('ADDRESS_RAW', [name('scowner')])]),
                        val(1),
                    ), 50, 100, 40
                    ),
                    store(
                        name('scid'),
                        val(''),
                        50
                    ),
                    store(
                        op.str.concat(name('scid'), val('owner')),
                        call('ADDRESS_RAW', [name('scowner')]),
                        60
                    ),
                    store(
                        op.str.concat(name('scid'), val('height')),
                        name('deployheight'),
                        70
                    ),
                    return_value(0, 100)
                ],
            },

            {
                name: 'RemoveSCID',
                return: DVMType.Uint64,
                args: [
                    { name: "scid", type: DVMType.String },
                ],
                statements: [
                    if_then.else(op.var.eq(
                        call('LOAD', [val('owner')]),
                        call('SIGNER', [])
                    ), 20, 100, 10
                    ),
                    if_then.else(op.int.eq(
                        call('EXISTS', [name('scid')]),
                        val(1)
                    ), 30, 100, 20
                    ),
                    call.statement('DELETE', [name('scid')], 30),
                    call.statement('DELETE', [op.str.concat(name('scid'), val('owner'))], 40),
                    call.statement('DELETE', [op.str.concat(name('scid'), val('height'))], 50),
                    return_value(0, 100)
                ],
            },

            // SetSCIDHeaders
            {
                name: 'SetSCIDHeaders',
                return: DVMType.Uint64,
                args: [
                    { name: "scid", type: DVMType.String },
                    { name: "name", type: DVMType.String },
                    { name: "descr", type: DVMType.String },
                    { name: "icon", type: DVMType.String },
                ],
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

            // Withdraw
            {
                name: 'Withdraw',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    if_then.else(op.var.eq(
                        call('LOAD', [val("owner")]),
                        call("SIGNER")
                    ), 20, 100, 10
                    ),
                    if_then.else(op.int.gt(
                        call('LOAD', [val("balance")]),
                        val(0)
                    ), 30, 100, 20
                    ),
                    call.statement("SEND_DERO_TO_ADDRESS", [
                        call("SIGNER"),
                        call("LOAD", [val("balance")])
                    ], 30),
                    store(val("balance"), val(0), 40),
                    return_value(0, 100)
                ],
            },
            // UpdateSignature
            {
                name: 'UpdateSignature',
                return: DVMType.Uint64,
                args: [
                    { name: "SC_SIG", type: DVMType.String },
                ],
                statements: [
                    if_then.else(op.var.eq(
                        call('LOAD', [val("owner")]),
                        call("SIGNER")
                    ), 20, 100, 10
                    ),
                    if_then.else(op.str.ne(
                        name("SC_SIG"),
                        val("")
                    ), 30, 100, 20
                    ),
                    store(val("signature"), name("SC_SIG"), 30),
                    return_value(0, 100)
                ],
            },
            // UpdateCode
            {
                name: 'UpdateCode',
                return: DVMType.Uint64,
                args: [
                    { name: "SC_CODE", type: DVMType.String },
                    { name: "SC_SIG", type: DVMType.String },
                ],
                statements: [
                    if_then.else(op.var.eq(
                        call('LOAD', [val("owner")]),
                        call("SIGNER")
                    ), 20, 100, 10
                    ),
                    if_then.else(op.str.ne(
                        name("SC_CODE"),
                        val("")
                    ), 30, 100, 20
                    ),
                    call.statement("UPDATE_SC_CODE", [
                        name("SC_CODE")
                    ], 30),
                    if_then.else(op.str.ne(
                        name("SC_SIG"),
                        val("")
                    ), 50, 100, 40
                    ),
                    store(val("signature"), name("SC_SIG"), 50),
                    return_value(0, 100)
                ],
            },
        ],
    };
    const code = `// Copyright 2022 Civilware. All rights reserved.
    // Gnomon - DERO Network Indexer (https://github.com/civilware/Gnomon)
    // Usernames: Gnomon, gnomon
    
    Function InitializePrivate() Uint64
        10  IF EXISTS("owner") == 0 THEN GOTO 30
        20  RETURN 1
        30  STORE("owner", SIGNER())
        40  STORE("signature", "")
        50  STORE("balance", 0)
    
        100 RETURN 0
    End Function
    
    Function InputSCID(scid String, scowner String, deployheight Uint64) Uint64
        10  IF LOAD("owner") == SIGNER() THEN GOTO 20 ELSE GOTO 100
        20  IF EXISTS(scid) == 0 THEN GOTO 30 ELSE GOTO 100
        30  IF scowner != "" THEN GOTO 40 ELSE GOTO 100
        40  IF IS_ADDRESS_VALID(ADDRESS_RAW(scowner)) == 1 THEN GOTO 50 ELSE GOTO 100
    
        50  STORE(scid, "")
        60  STORE(scid + "owner", ADDRESS_RAW(scowner))
        70  STORE(scid + "height", deployheight)
    
        100 RETURN 0
    End Function
    
    Function RemoveSCID(scid String) Uint64
        10  IF LOAD("owner") == SIGNER() THEN GOTO 20 ELSE GOTO 100
        20  IF EXISTS(scid) == 1 THEN GOTO 30 ELSE GOTO 100
        30  DELETE(scid)
        40  DELETE(scid + "owner")
        50  DELETE(scid + "height")
    
        100 RETURN 0
    End Function
    
    Function SetSCIDHeaders(scid String, name String, descr String, icon String) Uint64
        10  IF EXISTS(scid + "owner") == 1 THEN GOTO 20 ELSE GOTO 100
        20  IF LOAD(scid + "owner") == SIGNER() THEN GOTO 30 ELSE GOTO 100
        30  IF DEROVALUE() < 200 THEN GOTO 100
        40  STORE("balance", LOAD("balance") + DEROVALUE())
        50  STORE(scid, name + ";" + descr + ";" + icon)
    
        100 RETURN 0
    End Function
    
    Function Withdraw() Uint64
        10  IF LOAD("owner") == SIGNER() THEN GOTO 20 ELSE GOTO 100
        20  IF LOAD("balance") > 0 THEN GOTO 30 ELSE GOTO 100
        30  SEND_DERO_TO_ADDRESS(SIGNER(), LOAD("balance"))
        40  STORE("balance", 0)
    
        100 RETURN 0
    End Function
    
    Function UpdateSignature(SC_SIG String) Uint64
        10  IF LOAD("owner") == SIGNER() THEN GOTO 20 ELSE GOTO 100
        20  IF SC_SIG != "" THEN GOTO 30 ELSE GOTO 100
        30  STORE("signature", SC_SIG)
    
        100 RETURN 0
    End Function
    
    Function UpdateCode(SC_CODE String, SC_SIG String) Uint64 
        10  IF LOAD("owner") == SIGNER() THEN GOTO 20 ELSE GOTO 100
        20  IF SC_CODE != "" THEN GOTO 30 ELSE GOTO 100
        30  UPDATE_SC_CODE(SC_CODE)
        40  IF SC_SIG != "" THEN GOTO 50 ELSE GOTO 100
        50  STORE("signature", SC_SIG)
    
        100 RETURN 0
    End Function`;
    expect(parse(code)).toMatchObject(expected)
})
