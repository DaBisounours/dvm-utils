import {
  Argument,
  DVMType,
  Dim,
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
  // az => [97, 122]

  let currentNameCount = 0;
  function getNewName() {
    let res = [...(currentNameCount++ + 10).toString(36)].reverse();
    if (res[0] == "z") {
      currentNameCount += 10;
    }
    return res.join("");
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
        .map(([oldName, info]) => [getNewName(), { ...info, name: oldName }])
    ),
  };

  console.dir({ mapping }, { depth: null });

  Object.entries(mapping.names).forEach(([newName, info]) => {
    const oldName = info.name;

    program.functions = program.functions.map((f) => {
      if (f.name == oldName) {
        f.name = newName;
      }

      f.args = f.args.map((a) =>
        a.name == oldName ? { ...a, name: newName } : a
      );

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

export function generateCode(
  program: Program,
  keepComments: boolean,
  optimizeSpace: boolean
): string {
  return program.functions
    .map((f) => generateFunction(f, keepComments, optimizeSpace))
    .join(optimizeSpace ? "\n" : "\n\n");
}

function generateFunction(
  f: FunctionType,
  keepComments: boolean,
  optimizeSpace: boolean
): string {
  return `Function ${f.name}(${generateArgs(
    f.args,
    optimizeSpace
  )}) ${toDVMType(f.return)}${generateStatements(
    f.statements,
    keepComments,
    optimizeSpace
  )}\nEnd Function`;
}

function generateArgs(args: Argument[], optimizeSpace: boolean): string {
  return args
    .map((a) => `${a.name} ${toDVMType(a.type)}`)
    .join(optimizeSpace ? "," : ", ");
}

function generateStatements(
  statements: Statement[],
  keepComments: boolean,
  optimizeSpace: boolean
) {
  if (!keepComments) {
    statements = statements.filter((s) => s.type != "comment");
  }

  const grouped = statements.reduce(
    (prevArray: (Statement | Statement[])[], current) => {
      const prev = prevArray.at(-1);
      if (
        current.type === "dim" &&
        prev !== undefined &&
        Array.isArray(prev) &&
        prev.at(-1).line == current.line
      ) {
        return [...prevArray.slice(0, -1), [...prev, current]];
      }
      if (current.type === "dim") {
        return [...prevArray, [current]];
      }
      return [...prevArray, current];
    },
    []
  );

  const groupedDims = Object.values(grouped);

  return groupedDims
    .map((s) =>
      Array.isArray(s)
        ? generateDims(s as DimStatement[], optimizeSpace) //! warning might hanlde other groups later, will fail
        : `${
            s.type == "comment"
              ? optimizeSpace
                ? ""
                : "\t"
              : (optimizeSpace ? "\n" : "\n\t") + s.line + "\t"
          }${generateStatement(s, optimizeSpace)}`
    )
    .join("");
}

type DimStatement = {
  line: number;
} & {
  type: "dim";
  declare: Dim;
};

function generateDims(statements: DimStatement[], optimizeSpace: boolean): any {
  if (statements.length > 0 && statements.every((s) => s.type == "dim")) {
    return `\n${optimizeSpace ? "" : "\t"}${
      statements.at(0).line
    }\tDIM ${statements
      .map((s: DimStatement) => s.declare.name)
      .join(optimizeSpace ? "," : ", ")} AS ${toDVMType(
      statements.at(0).declare.type
    )}`;
  }
  throw "generateDims: wrong usage";
}

function generateStatement(s: Statement, optimizeSpace: boolean) {
  switch (s.type) {
    case "branch":
      const base = `IF ${generateExpression(
        s.branch.condition,
        true,
        optimizeSpace
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
      return generateExpression(s.expression, true, optimizeSpace);
    case "goto":
      return `GOTO ${s.goto}`;
    case "let":
      return `LET ${s.assign.name} = ${generateExpression(
        s.assign.expression,
        true,
        optimizeSpace
      )}`;
    case "return":
      return "RETURN " + generateExpression(s.expression, true, optimizeSpace);
  }
}

function generateExpression(
  expression: Expression<DVMType, {}>,
  topLevel = false,
  optimizeSpace: boolean
) {
  switch (expression.type) {
    case "function":
      return `${expression.function.name}(${expression.function.args
        .map((a) => generateExpression(a, true, optimizeSpace))
        .join(optimizeSpace ? "," : ", ")})`;
    case "name":
      return expression.name;
    case "operation":
      return generateOperation(expression, topLevel, optimizeSpace);
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
  topLevel: boolean,
  optimizeSpace: boolean
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
    const spacer = optimizeSpace ? "" : " ";
    e = `${generateExpression(
      expression.operands[0],
      false,
      optimizeSpace
    )}${spacer}${operator}${spacer}${generateExpression(
      expression.operands[1],
      false,
      optimizeSpace
    )}`;
    return topLevel ? e : `(${e})`;
  }
  throw "generateOperation: wrong usage";
}
