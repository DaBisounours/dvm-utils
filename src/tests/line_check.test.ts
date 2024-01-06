import { test, expect } from "@jest/globals";
import { parse } from "../lib/main";
import { Program, DVMType } from "../types/program";
import {
  call,
  comment,
  if_then,
  name,
  op,
  return_expression,
  return_value,
  store,
  val,
} from "../lib/build";

test.failing("name function check", () => {
  const expected: Program = {
    functions: [
      {
        name: "Initialize",
        return: DVMType.Uint64,
        args: [],
        statements: [
          if_then.else(call("nameExists", [val("owner")]), 20, 100, 10),
          return_value(0, 20),
          return_value(1, 100),
        ],
      },
      {
        name: "nameExists",
        return: DVMType.Uint64,
        args: [{ name: "name", type: DVMType.String }],
        statements: [
          return_expression(call("EXISTS", [name("name")]), 10),
          return_expression(call("EXISTS", [name("name")]), 10),
        ],
      },
    ],
  };

  const code = `Function Initialize() Uint64
  10  IF nameExists("owner") THEN GOTO 20 ELSE GOTO 100
  20  RETURN 0
  100 RETURN 1
End Function

Function nameExists(name String) Uint64
  10  RETURN EXISTS(name)
  10  RETURN EXISTS(name)
End Function
`;

  parse(code);
});
