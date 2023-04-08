import { test, expect } from '@jest/globals';


import { parse } from '../lib/parse';
import { DVMType, Program } from '../types/program';


test('inline comment', () => {
  const expected: Program = {
    headers: ['inline comment'],
    functions: [
      {
        name: 'Initialize',
        return: DVMType.Uint64,
        args: [],
        statements: [
          { line: 10, type: 'no-op' },
          { line: 10, type: 'comment', comment: 'Comment // whatever /* Whatever */' },
          { line: 11, type: 'function', function: {
            name: 'someCodeHere', args: []
          } },
          { line: 11, type: 'comment', comment: 'Whatever //' },
          { line: 11, type: 'comment', comment: 'Whatever*' },
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
          { line: 0, type: 'comment', comment: 'multi\nwithout line number' },
          { line: 10, type: 'no-op' },
          { line: 10, type: 'comment', comment: 'Comment // whatever /* Whatever */' },
          { line: 10, type: 'comment', comment: 'multi\n  line' },
          { line: 11, type: 'no-op' },
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

