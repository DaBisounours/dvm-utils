import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';
import { call, comment, noop } from '../lib/build';


test('inline comment', () => {
  const expected: Program = {
    headers: ['inline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          noop(10),
          comment('Comment // whatever /* Whatever */', 10),
          call.statement("someCodeHere", [], 11),
          comment('Whatever //', 11),
          comment('Whatever*', 11),
        ],
      },
    ],
  };
  const code = `// inline comment
Function Initialize() Uint64
  10 // Comment // whatever /* Whatever */
  11 /*Whatever // */someCodeHere()  /* Whatever**/
End Function
    `;
  expect(parse(code)).toMatchObject(expected)
});


test('multiline comment', () => {
  const expected: Program = {
    headers: ['multiline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          comment('multi\nwithout line number', 0),
          noop(10),
          comment('Comment // whatever /* Whatever */', 10),
          comment('multi\n  line', 10),
          noop(11),
          comment('Whatever //', 11),
          comment('Whatever*', 11),
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

