import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';
/*
test('gnomon', (t) => {
  t.is(parse(`
  // Copyright 2022 Civilware. All rights reserved.
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
  End Function
  `), {});
});
*/

test('empty', () => {
  const expected: Program = {
    functions: [],
  };
  expect(parse(``)).toMatchObject(expected)
});

test('no function', () => {
  const expected: Program = {
    functions: [],
  };
  expect(parse(`// Some random comment without a Function`)).toMatchObject(expected)
});



test('initialize', () => {
  const expected: Program = {
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [],
      },
    ],
  };
  const code = `Function Initialize() Uint64
End Function`;
  expect(parse(code)).toMatchObject(expected)
});


test('header', () => {
  const expected: Program = {
    headers: [`// header
// Singleline
/* Multiline */`],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [],
      },
    ],
  };
  const code = `// header
// Singleline
/* Multiline */
Function Initialize() Uint64
End Function`;
  expect(parse(code)).toMatchObject(expected)
});


test('arg', () => {
  const expected: Program = {
    headers: ['// arg'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [
          { name: 'myArg', type: DVMType.Uint64 },
          { name: 'mySecondArg', type: DVMType.String },
        ],
        statements: [],
      },
    ],
  };
  const code = `// arg
Function Initialize(myArg Uint64, mySecondArg String) Uint64
End Function`;
  expect(parse(code)).toMatchObject(expected)
});

test('comment', () => {
  const expected: Program = {
    headers: ['// comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          { line: 0, type: 'comment', comment: 'Comment' },
          { line: 0, type: 'comment', comment: 'Comment' },
        ],
      },
    ],
  };
  const code = `// comment
Function Initialize() Uint64
  // Comment
  /* Comment */  
End Function
    `;
  expect(parse(code)).toMatchObject(expected)
});


test('inline comment', () => {
  const expected: Program = {
    headers: ['// inline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          { line: 10, type: 'comment', comment: 'Comment // whatever /* Whatever */' },
          { line: 11, type: 'comment', comment: 'Whatever //' },
          { line: 11, type: 'comment', comment: 'inline' },
          { line: 11, type: 'comment', comment: 'Whatever*' },
        ],
      },
    ],
  };
  const code = `// inline comment
Function Initialize() Uint64
  10 // Comment // whatever /* Whatever */
  11 /*Whatever // */someCodeHere(/*inline*/)  /* Whatever**/
End Function
    `;
});

test('multiline comment', () => {
  const expected: Program = {
    headers: ['// multiline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          /*{ line: 0, type: 'comment', comment: 'multi\nwithout line number\n' }, //! Ignored case */
          { line: 10, type: 'comment', comment: 'multi\nline' },
          { line: 10, type: 'comment', comment: 'Comment // whatever /* Whatever */' },
          { line: 11, type: 'comment', comment: 'Whatever //' },
          { line: 11, type: 'comment', comment: 'Whatever*' },
        ],
      },
    ],
  };
  const code = `// multiline comment
Function Initialize() Uint64
/* multi
without line number
*/
  10 // Comment // whatever /* Whatever */
  /* multi
  line */
  11 /*Whatever // */ /* Whatever**/
End Function
        `;
  expect(parse(code)).toMatchObject(expected)
});


test('return', () => {
  const expected: Program = {
    headers: ['// return'],
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
    headers: ['// string expression =='],
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
        ],
      },
    ],
  };
  const code = `// string expression ==
Function Initialize() Uint64
  100 RETURN "a" == "a"
End Function
    `;
  expect(parse(code)).toMatchObject(expected)
});

