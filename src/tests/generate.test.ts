import { test, expect } from "@jest/globals";
import {
  DVMType,
  FunctionHeader,
  FunctionType,
  Program,
} from "../types/program";
import { generate } from "../lib/main";
import {
  call,
  comment,
  declare,
  if_then,
  op,
  return_value,
  store,
  val,
  name,
  assign,
  return_expression,
} from "../lib/build";

test("empty program", () => {
  const program: Program = {
    functions: [],
  };
  const { code } = generate(program);
  expect(code).toBe("");
});

test("initialize", () => {
  const initializeFunction: FunctionType = {
    name: "Initialize",
    return: DVMType.Uint64,
    args: [],
    statements: [return_value(0, 10)],
  };
  const program: Program = {
    functions: [initializeFunction],
  };
  const { code } = generate(program);

  expect(code).toBe(
    `Function Initialize() Uint64\n\t10\tRETURN 0\nEnd Function`
  );
});

test("nameservice", () => {
  const program: Program = {
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
        name: "Initialize",
        return: DVMType.Uint64,
        args: [],
        statements: [
          declare("test", DVMType.String, 5),
          declare("testInt", DVMType.Uint64, 6),
          return_value(0, 10),
        ],
      },

      // Register
      {
        name: "Register",
        return: DVMType.Uint64,
        args: [{ name: "name", type: DVMType.String }],
        statements: [
          if_then(op.str.eq(name("name"), val("C")), 50, 5),
          comment("avoid surprise failure in future now", 5),
          if_then(call("EXISTS", [name("name")]), 50, 10),
          comment("if name is already used, it cannot reregistered", 10),
          if_then(op.int.ge(call("STRLEN", [name("name")]), val(64)), 50, 15),
          comment("skip names misuse", 15),
          if_then(op.int.ge(call("STRLEN", [name("name")]), val(6)), 40, 20),
          if_then(
            op.var.ne(
              call("SIGNER", []),
              call("address_raw", [
                val(
                  "dero1qykyta6ntpd27nl0yq4xtzaf4ls6p5e9pqu0k2x4x3pqq5xavjsdxqgny8270"
                ),
              ])
            ),
            50,
            35
          ),
          store(name("name"), call("SIGNER", []), 40),
          return_value(0, 50),
        ],
      },

      // TransferOwnership
      {
        name: "TransferOwnership",
        return: DVMType.Uint64,
        args: [
          { name: "name", type: DVMType.String },
          { name: "newowner", type: DVMType.String },
        ],
        statements: [
          if_then(
            op.var.ne(call("LOAD", [name("name")]), call("SIGNER")),
            30,
            10
          ),
          store(name("name"), call("ADDRESS_RAW", [name("newowner")]), 20),
          return_value(0, 30),
        ],
      },

      // TransferSCOwnership
      {
        name: "TransferSCOwnership",
        args: [{ name: "newowner", type: DVMType.String }],
        return: DVMType.Uint64,
        statements: [
          // 10  IF LOAD("owner") == SIGNER() THEN GOTO 30
          if_then(
            op.var.eq(call("LOAD", [val("owner")]), call("SIGNER")),
            30,
            10
          ),
          // 20  RETURN 1
          return_value(1, 20),
          // 30  STORE("own1", ADDRESS_RAW(newowner))
          store(val("own1"), call("ADDRESS_RAW", [name("newowner")]), 30),
          // 40  RETURN 0
          return_value(0, 40),
        ],
      },

      // ClaimSCOwnership
      {
        name: "ClaimSCOwnership",
        return: DVMType.Uint64,
        args: [],
        statements: [
          //10  IF LOAD("own1") == SIGNER() THEN GOTO 30
          if_then(
            op.var.eq(call("LOAD", [val("own1")]), call("SIGNER")),
            30,
            10
          ),
          //20  RETURN 1
          return_value(1, 20),
          //30  STORE("owner",SIGNER()) // ownership claim successful
          store(val("owner"), call("SIGNER"), 30),
          comment("ownership claim successful", 30),
          //40  RETURN 0
          return_value(0, 40),
        ],
      },

      // UpdateCode
      {
        name: "UpdateCode",
        return: DVMType.Uint64,
        args: [{ name: "SC_CODE", type: DVMType.String }],
        statements: [
          // 10  IF LOAD("owner") == SIGNER() THEN GOTO 30
          if_then(
            op.var.eq(call("LOAD", [val("owner")]), call("SIGNER")),
            30,
            10
          ),
          // 20  RETURN 1
          return_value(1, 20),
          // 30  UPDATE_SC_CODE(SC_CODE)
          call.statement("UPDATE_SC_CODE", [name("SC_CODE")], 30),
          // 40  RETURN 0
          return_value(0, 40),
        ],
      },
    ],
  };
  const expected = `Function Initialize() Uint64
\t5\tDIM test AS String
\t6\tDIM testInt AS Uint64
\t10\tRETURN 0
End Function

Function Register(name String) Uint64
\t5\tIF name == "C" THEN GOTO 50\t// avoid surprise failure in future now
\t10\tIF EXISTS(name) THEN GOTO 50\t// if name is already used, it cannot reregistered
\t15\tIF STRLEN(name) >= 64 THEN GOTO 50\t// skip names misuse
\t20\tIF STRLEN(name) >= 6 THEN GOTO 40
\t35\tIF SIGNER() != address_raw("dero1qykyta6ntpd27nl0yq4xtzaf4ls6p5e9pqu0k2x4x3pqq5xavjsdxqgny8270") THEN GOTO 50
\t40\tSTORE(name, SIGNER())
\t50\tRETURN 0
End Function

Function TransferOwnership(name String, newowner String) Uint64
\t10\tIF LOAD(name) != SIGNER() THEN GOTO 30
\t20\tSTORE(name, ADDRESS_RAW(newowner))
\t30\tRETURN 0
End Function

Function TransferSCOwnership(newowner String) Uint64
\t10\tIF LOAD("owner") == SIGNER() THEN GOTO 30
\t20\tRETURN 1
\t30\tSTORE("own1", ADDRESS_RAW(newowner))
\t40\tRETURN 0
End Function

Function ClaimSCOwnership() Uint64
\t10\tIF LOAD("own1") == SIGNER() THEN GOTO 30
\t20\tRETURN 1
\t30\tSTORE("owner", SIGNER())\t// ownership claim successful
\t40\tRETURN 0
End Function

Function UpdateCode(SC_CODE String) Uint64
\t10\tIF LOAD("owner") == SIGNER() THEN GOTO 30
\t20\tRETURN 1
\t30\tUPDATE_SC_CODE(SC_CODE)
\t40\tRETURN 0
End Function`;

  const { code } = generate(program, { comments: true });
  expect(code).toBe(expected);
});

test("minification", () => {
  const initializeFunction: FunctionType = {
    name: "Initialize",
    return: DVMType.Uint64,
    args: [],
    statements: [return_expression(call("privateFunction"), 10)],
  };

  const privateFunction: FunctionType = {
    name: "privateFunction",
    return: DVMType.Uint64,
    args: [],
    statements: [
      declare("mylongassnamevariable", DVMType.Uint64, 10),
      assign("mylongassnamevariable", val(1), 20),
      comment("test comment", 20),
      return_expression(name("mylongassnamevariable"), 100),
    ],
  };
  const program: Program = {
    functions: [initializeFunction, privateFunction],
  };
  const { code } = generate(program, { minify: true, comments: false });
  console.log({ code });

  expect(code).toBe(
    `Function Initialize() Uint64
\t10\tRETURN f0()
End Function

Function f0() Uint64
\t10\tDIM v0 AS Uint64
\t20\tLET v0 = 1
\t100\tRETURN v0
End Function`
  );
});
