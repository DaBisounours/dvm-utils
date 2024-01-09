import {
  DVMType,
  Expression,
  FunctionType,
  Program,
  Statement,
} from "../types/program";
import { Context, FlatNameInfo } from "./parse/check";

export type Mapping = {
  names: {
    [newName: string]: FlatNameInfo;
  };
};

type NameType = "function" | "variable" | "argument" | "dvm-function";

/** These functions are useful to generate code from a structured Program */
export function minifyProgram(context: Context, program: Program) {
  let currentNameCount = {
    function: 0,
    variable: 0,
    argument: 0,
  };
  function getNewName(nameType: NameType) {
    return (
      (nameType == "variable" ? "v" : nameType == "argument" ? "a" : "f") +
      currentNameCount[nameType]++
    );
  }
  const mapping: Mapping = {
    names: Object.fromEntries(
      Object.entries(context.names)
        // ignore Public functions and DVM native functions
        .filter(
          ([name, { type: t }]) =>
            t != "dvm-function" && !(t == "function" && /[A-Z]/.test(name[0]))
        )
        // create new names
        .map(([oldName, info]) => [
          getNewName(info.type),
          { ...info, name: oldName },
        ])
    ),
  };

  console.dir({ mapping }, { depth: null });

  Object.entries(mapping.names).forEach(([newName, info]) => {
    const oldName = info.name;

    program.functions = program.functions.map((f) => {
      if (f.name == oldName) {
        f.name = newName;
      }

      console.dir({ when: "before", f, program }, { depth: null });
      f.statements = f.statements.map((s) => {
        switch (s.type) {
          case "branch":
            s.branch.condition = findAndReplaceInExpression(
              s.branch.condition,
              oldName,
              newName,
              info
            );
            break;
          case "expression":
            s.expression = findAndReplaceInExpression(
              s.expression,
              oldName,
              newName,
              info
            );
            break;
          case "let":
            s.assign.expression = findAndReplaceInExpression(
              s.assign.expression,
              oldName,
              newName,
              info
            );
            if (s.assign.name == oldName) {
              s.assign.name = newName;
            }
            break;
          case "dim":
            if (s.declare.name == oldName) {
              s.declare.name = newName;
            }

            break;
          case "return":
            s.expression = findAndReplaceInExpression(
              s.expression,
              oldName,
              newName,
              info
            );
          default:
            break;
        }
        return s;
      });
      console.dir({ when: "after", f, program }, { depth: null });
      return f;
    });
  });

  return { program, mapping };
}

function findAndReplaceInExpression(
  expression: Expression<DVMType, {}>,
  oldName: string,
  newName: string,
  info: FlatNameInfo
): Expression<DVMType, {}> {
  switch (expression.type) {
    case "function":
      if (expression.function.name == oldName) {
        expression.function.name = newName;
      }
      expression.function.args = expression.function.args.map((a) =>
        findAndReplaceInExpression(a, oldName, newName, info)
      );
      break;
    case "name":
      if (expression.name == oldName) {
        expression.name = newName;
      }
      break;
    case "operation":
      expression.operands = expression.operands.map((operand) =>
        findAndReplaceInExpression(operand, oldName, newName, info)
      );
      break;

    default:
      break;
  }
  return expression;
}

export function generateCode(program: Program, keepComments: boolean): string {
  return program.functions
    .map((f) => generateFunction(f, keepComments))
    .join("\n\n");
}

function generateFunction(f: FunctionType, keepComments: boolean): string {
  return `Function ${f.name}(${generateArgs(f.args)}) ${toDVMType(
    f.return
  )}${generateStatements(f.statements, keepComments)}\nEnd Function`;
}

function generateArgs(args: import("../types/program").Argument[]): string {
  return args.map((a) => `${a.name} ${toDVMType(a.type)}`).join(", ");
}

function generateStatements(statements: Statement[], keepComments: boolean) {
  if (!keepComments) {
    statements = statements.filter((s) => s.type != "comment");
  }
  return statements
    .map(
      (s) =>
        `${
          s.type == "comment" ? "\t" : "\n\t" + s.line + "\t"
        }${generateStatement(s)}`
    )
    .join("");
}

function generateStatement(s: Statement) {
  switch (s.type) {
    case "branch":
      const base = `IF ${generateExpression(
        s.branch.condition,
        true
      )} THEN GOTO ${s.branch.then}`;
      if (s.branch.type === "if-then-else") {
        return base + ` ELSE GOTO ${s.branch.else}`;
      }
      return base;
    case "comment":
      return s.comment.includes("\n")
        ? "/* " + s.comment + "*/"
        : "// " + s.comment;
    case "dim":
      return `DIM ${s.declare.name} AS ${toDVMType(s.declare.type)}`;
    case "expression":
      return generateExpression(s.expression, true);
    case "goto":
      return `GOTO ${s.goto}`;
    case "let":
      return `LET ${s.assign.name} = ${generateExpression(
        s.assign.expression,
        true
      )}`;
    case "return":
      return "RETURN " + generateExpression(s.expression, true);
  }
}

function generateExpression(
  expression: Expression<DVMType, {}>,
  topLevel = false
) {
  switch (expression.type) {
    case "function":
      return `${expression.function.name}(${expression.function.args
        .map((a) => generateExpression(a, true))
        .join(", ")})`;
    case "name":
      return expression.name;
    case "operation":
      return generateOperation(expression, topLevel);
    case "value":
      return typeof expression.value == "string"
        ? `"${expression.value}"`
        : expression.value;
    default:
      break;
  }
}

function toDVMType(t: DVMType) {
  return t == "number" ? "Uint64" : "String";
}
function generateOperation(
  expression: Expression<DVMType, {}>,
  topLevel = false
) {
  if (expression.type === "operation") {
    let e = "";
    const operator =
      expression.operator.type == "bitwise"
        ? expression.operator.bitwise
        : expression.operator.type == "calc"
        ? expression.operator.calc
        : expression.operator.logical;
    if (expression.operands.length == 1) {
      e = `${operator} ${expression.operands[0]}`;
      return topLevel ? e : `(${e})`;
    }
    e = `${generateExpression(
      expression.operands[0]
    )} ${operator} ${generateExpression(expression.operands[1])}`;
    return topLevel ? e : `(${e})`;
  }
  throw "generateOperation: wrong usage";
}
