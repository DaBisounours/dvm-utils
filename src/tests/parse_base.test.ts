import { test, expect } from "@jest/globals";

import { evaluate } from "../lib/main";
import { DVMType, Program } from "../types/program";
import { comment } from "../lib/build";

test("empty", () => {
  const expected: Program = {
    functions: [],
  };
  expect(evaluate(``)).toMatchObject(expected);
});

test.failing("no function", () => {
  const expected: Program = {
    functions: [],
    //headers: ['Some random comment without a Function'],
  };
  expect(evaluate(`// Some random comment without a Function`)).toMatchObject(
    expected
  );
});

test("initialize", () => {
  const expected: Program = {
    functions: [
      {
        name: "Initialize",
        return: DVMType.Uint64,
        args: [],
        statements: [],
      },
    ],
  };
  const code = `Function Initialize() Uint64
End Function`;
  expect(evaluate(code)).toMatchObject(expected);
});

test("header", () => {
  const expected: Program = {
    //headers: ['header', 'Singleline', 'Multiline'],
    functions: [
      {
        name: "Initialize",
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
  expect(evaluate(code)).toMatchObject(expected);
});

test("arg", () => {
  const expected: Program = {
    //headers: ['arg'],
    functions: [
      {
        name: "Initialize",
        return: DVMType.Uint64,
        args: [
          { name: "myArg", type: DVMType.Uint64 },
          { name: "mySecondArg", type: DVMType.String },
        ],
        statements: [],
      },
    ],
  };
  const code = `// arg
Function Initialize(myArg Uint64, mySecondArg String) Uint64
End Function`;
  expect(evaluate(code)).toMatchObject(expected);
});

test("comment", () => {
  const expected: Program = {
    //headers: ['comment'],
    functions: [
      {
        name: "Initialize",
        return: DVMType.Uint64,
        comments: ["comment", "Comment", "Comment"],
        args: [],
        statements: [comment("Comment after first line", 10)],
      },
    ],
  };
  const code = `// comment
Function Initialize() Uint64
  // Comment
  /* Comment */
  10 // Comment after first line
End Function
    `;
  expect(evaluate(code)).toMatchObject(expected);
});
