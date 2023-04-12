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
  // TODO catch matching errors
  // TODO nameCheck
  nameCheck(evaluated, context);
  // TODO typeCheck

  return evaluated;
}

function nameCheck(evaluated: Program, context: Context) {

}


function initContext(): Context {
  return {
    names: {

    }
  } // TODO add dvm-functions
}

function getContext(evaluated: Program): Context {
  const functionNames = evaluated.functions.map(f => ({ name: f.name, type: f.return }));
  const args = evaluated.functions.flatMap(f => f.args)
  const dims = evaluated.functions.flatMap(f => f.statements.filter(s => s.type == 'dim').map(dim => dim.type == 'dim' ? { name: dim.declare.name, type: dim.declare.type } : {} as Dim))
  const namesArray = [...functionNames, ...args, ...dims]
  const names = {}
  namesArray.forEach(name => {
    names[name.name] = name.type
  })
  const context = initContext();
  context.names = { ...context.names, ...names }
  return context;
}


type Context = {
  names: {
    [name: string]: {
      type: 'variable' | 'argument' | 'function' | 'dvm-function',
      declaredType: DVMType,
      line?: number,
    }
  };

}