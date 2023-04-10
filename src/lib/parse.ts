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
  return { names: {} } // TODO add dvm-functions
}

function getContext(evaluated: Program): Context {
  const functionNames = evaluated.functions.map(f => ({ name: f.name, type: f.return }));
  const args = evaluated.functions.flatMap(f => f.args)
  const dims = evaluated.functions.flatMap(f => f.statements.filter(s => s.type == 'dim').map(dim => dim.type == 'dim' ? dim : {} as Dim))

  console.warn({functionNames, args, dims});
  return { names: {} } // TODO
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