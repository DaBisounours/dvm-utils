import { Program } from "../types/program"
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

  return defaultSemantics(match).eval()

}

