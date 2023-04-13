import { DVMFunctions } from "../types/dvmfunctions";
import { DVMType, Dim, Program } from "../types/program"
import { ProgramGrammar, defaultSemantics } from "./program"


/**
 * Parses DVM-BASIC code
 *
 * ### Example
 * ```js
 * import { parse } from 'dvm-parser'
 * console.log(parse(`
 * Function Initialize() Uint64
 * 10 RETURN 0
 * End Function
 * `))
 * // => 8
 * ```
 *
 * @param code - String containing the SC code.
 * @returns Parsed program.
 */
export const parse = (code: string): Program => {
  const programParser = ProgramGrammar;

  const match = programParser.match(code)

  if (match.failed()) {
    return {
      functions: []
    }
  }

  let evaluated: Program = defaultSemantics(match).eval()
  const context = getContext(evaluated);
  console.log(context);

  // TODO catch matching errors
  // TODO nameCheck
  nameCheck(evaluated, context);
  // TODO typeCheck

  return evaluated;
}

function nameCheck(evaluated: Program, context: Context) {

}


function initContext(): Context {
  let ctx: Context = {
    names: {}
  };
  Object.entries(DVMFunctions).map(([n, f]) => {
    if ('return' in f) {
      const flat: NameInfo = { declaredType: f.return, type: 'dvm-function' }
      ctx.names[n] = flat;
    }
  })
  return ctx;
}

function getContext(evaluated: Program): Context {
  const functionNames: FlatNameInfo[] = evaluated.functions.map(f => ({ name: f.name, declaredType: f.return, type: 'function' }));
  const args: FlatNameInfo[] = evaluated.functions
    .flatMap(f => f.args.map(a => ({ ...a, source: f.name })))
    .map(a => ({ name: a.name, declaredType: a.type, type: 'argument', source: a.source }))
  const dims: FlatNameInfo[] = evaluated.functions
    .flatMap(f => f.statements.map(s => ({ ...s, source: f.name }))
      .filter(s => s.type == 'dim')
      .map(s => s.type === "dim" ? s : null)
      .map(dim => ({ name: dim.declare.name, declaredType: dim.declare.type, type: 'variable', source: dim.source })))
  const namesArray = [...functionNames, ...args, ...dims]
  const names = {}
  namesArray.forEach((n) => {
    names[n.name] =
      n.type == 'variable' || n.type == 'argument'
        ? { type: n.type, declaredType: n.declaredType, source: n.source }
        : { type: n.type, declaredType: n.declaredType }
  })
  const context = initContext();
  context.names = { ...context.names, ...names }
  return context;
}

type FlatNameInfo = NameInfo & { name: string }

type NameInfo = {
  type: 'variable' | 'argument',
  declaredType: DVMType,
  source: string,
} | {
  type: 'function' | 'dvm-function',
  declaredType: DVMType,
}
type Context = {
  names: {
    [name: string]: NameInfo
  };

}