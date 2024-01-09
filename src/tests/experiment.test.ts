import { test, expect } from "@jest/globals";
import { evaluate } from "../lib/main";
import { Program, DVMType } from "../types/program";
import {
  call,
  if_then,
  name,
  op,
  return_value,
  store,
  val,
} from "../lib/build";

test("experiment #1", () => {
  const expected: Program = {
    functions: [],
  };
  //console.dir({expected}, {depth: null});

  const code = ``;
  expect(evaluate(code)).toMatchObject(expected);
});
