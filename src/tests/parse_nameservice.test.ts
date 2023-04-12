

import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';

import { return_value, store, name, val, call, op, if_then, comment, declare } from '../lib/utils';


test('nameservice', () => {
    const expected: Program = {
        headers: [`Name Service SMART CONTRACT in DVM-BASIC.  
    Allows a user to register names which could be looked by wallets for easy to use name while transfer`,
            'This function is used to initialize parameters during install time',
            'Register a name, limit names of 5 or less length'
        ],
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
        ],
    };
    const code = `/* Name Service SMART CONTRACT in DVM-BASIC.  
    Allows a user to register names which could be looked by wallets for easy to use name while transfer
    */
    
    
    // This function is used to initialize parameters during install time
     Function Initialize() Uint64
     5   DIM test String
     6   DIM testInt Uint64
     10  RETURN 0 
     End Function 
     ` + `
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
    
     `/* + `  
     // This function is used to change owner of Name is an string form of address 
     Function TransferOwnership(name String,newowner String) Uint64 
     10  IF LOAD(name) != SIGNER() THEN GOTO 30 
     20  STORE(name,ADDRESS_RAW(newowner))
     30  RETURN 0
     End Function
    
    ` + `  
     // This function is used to change SC owner 
     Function TransferSCOwnership(newowner String) Uint64 
     10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  STORE("own1",ADDRESS_RAW(newowner))
     40  RETURN 0
     End Function
     ` + `  
     // Until the new owner claims ownership, existing owner remains owner
     Function ClaimSCOwnership() Uint64 
     10  IF LOAD("own1") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  STORE("owner",SIGNER()) // ownership claim successful
     40  RETURN 0
     End Function
     ` + `  
     // If signer is owner, provide him rights to update code anytime
     // make sure update is always available to SC
     Function UpdateCode(SC_CODE String) Uint64 
     10  IF LOAD("owner") == SIGNER() THEN GOTO 30 
     20  RETURN 1
     30  UPDATE_SC_CODE(SC_CODE)
     40  RETURN 0
     End Function
    `*/
    expect(parse(code)).toMatchObject(expected)
})


