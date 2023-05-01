import { test, expect } from '@jest/globals';


import { evaluate } from '../lib/main';
import { DVMType, Program } from '../types/program';
import { call, comment } from '../lib/build';


test('inline comment', () => {
  const expected: Program = {
    //headers: ['inline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        comments: [
          'inline comment'
        ],
        statements: [
          comment('Comment // whatever /* Whatever */', 10),
          call.statement("EXISTS", [], 11),
          comment('Whatever //', 11),
          comment('Whatever*', 11),
        ],
      },
    ],
  };
  const code = `// inline comment
Function Initialize() Uint64
  10 // Comment // whatever /* Whatever */
  11 /*Whatever // */EXISTS()  /* Whatever**/
End Function
    `;
  expect(evaluate(code)).toMatchObject(expected)
});


test('multiline comment', () => {
  const expected: Program = {

    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        comments: ['multiline comment', 'multi\nwithout line number'],
        statements: [
          comment('Comment // whatever /* Whatever */', 10),
          comment('multi\n  line', 10),
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
  expect(evaluate(code)).toMatchObject(expected)
});

