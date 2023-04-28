

import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';

import { return_value, store, name, val, call, op, if_then, comment, declare } from '../lib/build';


test('nameservice', () => {
    const expected: Program = {
        /*headers: [`Name Service SMART CONTRACT in DVM-BASIC.  
    Allows a user to register names which could be looked by wallets for easy to use name while transfer`,
            'This function is used to initialize parameters during install time',
            'Register a name, limit names of 5 or less length',
            'This function is used to change owner of Name is an string form of address',
            'This function is used to change SC owner',
            'Until the new owner claims ownership, existing owner remains owner',
            'If signer is owner, provide him rights to update code anytime',
            'make sure update is always available to SC'
        ],*/
        functions: [
            // Initialize
            {
                name: 'Initialize',
                return: DVMType.Uint64,
                args: [],
                statements: [
                    declare('test', DVMType.String, 5),
                    declare('testInt', DVMType.Uint64, 6),
                    return_value(0, 10),
                ],
            },

            // Register
            {
                name: 'Register',
                return: DVMType.Uint64,
                args: [
                    { name: 'name', type: DVMType.String },
                ],
                statements: [
                    if_then(op.str.eq(
                        name('name'),
                        val('C')
                    ), 50, 5
                    ),
                    comment("avoid surprise failure in future now", 5),
                    if_then(
                        call('EXISTS', [name('name')]
                        ), 50, 10
                    ),
                    comment("if name is already used, it cannot reregistered", 10),
                    if_then(op.int.ge(
                        call('STRLEN', [name('name')]),
                        val(64)
                    ), 50, 15
                    ),
                    comment("skip names misuse", 15),
                    if_then(op.int.ge(
                        call('STRLEN', [name('name')]),
                        val(6)
                    ), 40, 20
                    ),
                    if_then(op.var.ne(
                        call('SIGNER', []),
                        call('address_raw', [
                            val('dero1qykyta6ntpd27nl0yq4xtzaf4ls6p5e9pqu0k2x4x3pqq5xavjsdxqgny8270')
                        ])
                    ), 50, 35
                    ),
                    store(name('name'), call('SIGNER', []), 40),
                    return_value(0, 50),
                ],
            },

            // TransferOwnership
            {
                name: 'TransferOwnership',
                return: DVMType.Uint64,
                args: [
                    { name: 'name', type: DVMType.String },
                    { name: 'newowner', type: DVMType.String },
                ],
                statements: [
                    if_then(op.var.ne(
                        call("LOAD", [name("name")]),
                        call("SIGNER")
                    ), 30, 10
                    ),
                    store(
                        name('name'),
                        call("ADDRESS_RAW", [
                            name('newowner')
                        ]), 20),
                    return_value(0, 30),
                ],
            },

            // TransferSCOwnership
            {
                name: 'TransferSCOwnership',
                args: [
                    { name: 'newowner', type: DVMType.String }
                ],
                return: DVMType.Uint64,
                statements: [
                    // 10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
                    if_then(op.var.eq(
                        call("LOAD", [val("owner")]),
                        call("SIGNER")
                    ), 30, 10
                    ),
                    // 20  RETURN 1
                    return_value(1, 20),
                    // 30  STORE("own1", ADDRESS_RAW(newowner))
                    store(val("own1"), call("ADDRESS_RAW", [name("newowner")]), 30),
                    // 40  RETURN 0
                    return_value(0, 40),
                ]
            },


            // ClaimSCOwnership
            {
                name: "ClaimSCOwnership",
                return: DVMType.Uint64,
                args: [],
                statements: [
                    //10  IF LOAD("own1") == SIGNER() THEN GOTO 30 
                    if_then(op.var.eq(call("LOAD", [val("own1")]), call("SIGNER")), 30, 10),
                    //20  RETURN 1
                    return_value(1, 20),
                    //30  STORE("owner",SIGNER()) // ownership claim successful
                    store(val("owner"), call("SIGNER"), 30),
                    comment("ownership claim successful", 30),
                    //40  RETURN 0
                    return_value(0, 40)
                ]
            },

            // UpdateCode
            {
                name: "UpdateCode",
                return: DVMType.Uint64,
                args: [
                    { name: "SC_CODE", type: DVMType.String }
                ],
                statements: [
                    // 10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
                    if_then(op.var.eq(
                        call("LOAD", [val("owner")]),
                        call("SIGNER")
                    ), 30, 10
                    ),
                    // 20  RETURN 1
                    return_value(1, 20),
                    // 30  UPDATE_SC_CODE(SC_CODE)
                    call.statement("UPDATE_SC_CODE", [name("SC_CODE")], 30),
                    // 40  RETURN 0
                    return_value(0, 40)
                ]
            },
        ],
    };
    const code = `/* Name Service SMART CONTRACT in DVM-BASIC.  
    Allows a user to register names which could be looked by wallets for easy to use name while transfer
    */
    
    
    // This function is used to initialize parameters during install time
     Function Initialize() Uint64
     5   DIM test AS String
     6   DIM testInt AS Uint64
     10  RETURN 0 
     End Function 
     
     // Register a name, limit names of 5 or less length
     Function Register(name String) Uint64 
      5  IF name == "C" THEN GOTO 50    // avoid surprise failure in future now
     10  IF EXISTS(name) THEN GOTO 50   // if name is already used, it cannot reregistered
     15  IF STRLEN(name) >= 64 THEN GOTO 50 // skip names misuse
     20  IF STRLEN(name) >= 6 THEN GOTO 40 
     35  IF SIGNER() != address_raw("dero1qykyta6ntpd27nl0yq4xtzaf4ls6p5e9pqu0k2x4x3pqq5xavjsdxqgny8270") THEN GOTO 50 
     40  STORE(name,SIGNER())
     50  RETURN 0
     End Function
     
     // This function is used to change owner of Name is an string form of address 
     Function TransferOwnership(name String,newowner String) Uint64 
     10  IF LOAD(name) != SIGNER() THEN GOTO 30 
     20  STORE(name,ADDRESS_RAW(newowner))
     30  RETURN 0
     End Function
    
     // This function is used to change SC owner 
     Function TransferSCOwnership(newowner String) Uint64 
     10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  STORE("own1",ADDRESS_RAW(newowner))
     40  RETURN 0
     End Function
     
     // Until the new owner claims ownership, existing owner remains owner
     Function ClaimSCOwnership() Uint64 
     10  IF LOAD("own1") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  STORE("owner",SIGNER()) // ownership claim successful
     40  RETURN 0
     End Function

     // If signer is owner, provide him rights to update code anytime
     // make sure update is always available to SC
     Function UpdateCode(SC_CODE String) Uint64 
     10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  UPDATE_SC_CODE(SC_CODE)
     40  RETURN 0
     End Function
    `
    expect(parse(code)).toMatchObject(expected)
})


