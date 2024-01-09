import { DVMFunctions } from "../../types/dvmfunctions";
import { Expression, DVMType, Program } from "../../types/program";

type Action = {
  target: "function" | "name" | "value" | "operation";
  callback: (expression: Expression<DVMType>) => Expression<DVMType>;
};

function check_expression_rec(
  e: Expression<DVMType>,
  actions: Action[]
): Expression<DVMType> {
  switch (e.type) {
    case "function":
      e.function.args = e.function.args.map((arg) =>
        check_expression_rec(arg, actions)
      );
      break;
    case "operation":
      e.operands = e.operands.map((arg) => check_expression_rec(arg, actions));
      break;
    default:
      break;
  }

  for (let index = 0; index < actions.length; index++) {
    const action = actions[index];
    if (e.type == action.target) {
      e = action.callback(e);
    }
  }

  return e;
}

function check_rec(p: Program, actions: Action[]): Program {
  p.functions = p.functions.map((f) => {
    f.statements = f.statements.map((s) => {
      switch (s.type) {
        case "expression":
        case "return":
          s.expression = check_expression_rec(s.expression, actions);
          break;
        case "branch":
          s.branch.condition = check_expression_rec(
            s.branch.condition,
            actions
          );
          break;
        case "let":
          s.assign.expression = check_expression_rec(
            s.assign.expression,
            actions
          );
          break;
        default:
          break;
      }
      return s;
    });
    return f;
  });
  return p;
}

export function nameCheck(evaluated: Program, context: Context) {
  const actions = [
    // function
    {
      target: "function" as const,
      callback: (e: Expression<DVMType>) => {
        if (e.type === "function") {
          const fname = e.function.name;
          const inContextName =
            context.names[fname] || context.names[fname.toUpperCase()];
          if (inContextName) {
            // if is NOT a function
            if (!inContextName.type.endsWith("function")) {
              throw new Error(
                `${inContextName.type} "${fname}" exists but is used as a function`
              );
            }
          } else {
            throw new Error(`function "${fname}" not found`);
          }
        }
        return e;
      },
    },
    // name
    {
      target: "name" as const,
      callback: (e: Expression<DVMType>) => {
        if (e.type === "name") {
          const name = e.name;
          const inContextName = context.names[name];
          if (inContextName) {
            // if is a function
            if (inContextName.type.endsWith("function")) {
              throw new Error(
                `${inContextName.type} "${name}" exists but is used as a value`
              );
            }
          } else {
            throw new Error(`function "${name}" not found`);
          }
        }
        return e;
      },
    },
  ];

  return check_rec(evaluated, actions);
}

function initContext(): Context {
  let ctx: Context = {
    names: {},
  };
  Object.entries(DVMFunctions).map(([n, f]) => {
    if ("return" in f) {
      const flat: NameInfo = { declaredType: f.return, type: "dvm-function" };
      ctx.names[n] = flat;
    }
  });
  return ctx;
}

export function getContext(evaluated: Program): Context {
  const functionNames: FlatNameInfo[] = evaluated.functions.map((f) => ({
    name: f.name,
    declaredType: f.return,
    type: "function",
  }));
  const args: FlatNameInfo[] = evaluated.functions
    .flatMap((f) => f.args.map((a) => ({ ...a, source: f.name })))
    .map((a) => ({
      name: a.name,
      declaredType: a.type,
      type: "argument",
      source: a.source,
    }));
  const dims: FlatNameInfo[] = evaluated.functions.flatMap((f) =>
    f.statements
      .map((s) => ({ ...s, source: f.name }))
      .filter((s) => s.type == "dim")
      .map((s) => (s.type === "dim" ? s : null))
      .map((dim) => ({
        name: dim.declare.name,
        declaredType: dim.declare.type,
        type: "variable",
        source: dim.source,
      }))
  );
  const namesArray = [...functionNames, ...args, ...dims];
  const names = {};
  namesArray.forEach((n) => {
    names[n.name] =
      n.type == "variable" || n.type == "argument"
        ? { type: n.type, declaredType: n.declaredType, source: n.source }
        : { type: n.type, declaredType: n.declaredType };
  });
  const context = initContext();
  context.names = { ...context.names, ...names };
  return context;
}

export type FlatNameInfo = NameInfo & { name: string };

export type NameInfo =
  | {
      type: "variable" | "argument";
      declaredType: DVMType;
      source: string;
    }
  | {
      type: "function" | "dvm-function";
      declaredType: DVMType;
    };
export type Context = {
  names: {
    [name: string]: NameInfo;
  };
};

export function lineCheck(evaluated: Program, context: Context) {
  evaluated.functions.forEach((f) => {
    const lines = f.statements
      .filter((s) => s.type != "comment")
      .map((s) => s.line);
    const hasDuplicates = new Set(lines).size !== lines.length;
    if (hasDuplicates) {
      const duplicates = lines.filter(
        (li) => lines.filter((lj) => li == lj).length > 1
      );
      console.log({ duplicates });

      throw new Error(
        `Found duplicate lines in function "${f.name}" (lines ${duplicates})`
      );
    }
  });
}
