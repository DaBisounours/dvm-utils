import { Program } from "../types/program";
import { getContext, lineCheck, nameCheck } from "./parse/check";
import { ProgramGrammar, semantics } from "./parse/evaluate";

/**
 * Parses DVM-BASIC code:
 * Evaluation => Name checking => Type checking => Program
 *
 * ### Example
 * ```js
 * import { parse } from 'dvm-utils'
 * console.log(parse(`
 * Function Initialize() Uint64
 * 10 RETURN 0
 * End Function
 * `))
 * // => {functions:[{name: 'Initialize', arg}]}
 * ```
 *
 * @param code - String containing the SC code.
 * @returns Parsed program.
 */
export function parse(code: string): Program {
  // Evaluate code
  const evaluated = evaluate(code);

  // Get context (names and their types)
  const context = getContext(evaluated);

  // Checks
  lineCheck(evaluated, context);
  nameCheck(evaluated, context);

  // TODO typeCheck

  return evaluated;
}

/**
 * Evaluates DVM-BASIC code only. Part of the parsing process. Useful when you do not need name and type checking.
 *
 * ### Example
 * ```js
 * import { evaluate } from 'dvm-utils'
 * console.log(evaluate(`
 * Function Initialize() Uint64
 * 10 RETURN 0
 * End Function
 * `))
 * // => {functions:[{name: 'Initialize', arg}]}
 * ```
 *
 * @param code - String containing the SC code.
 * @returns Parsed program.
 */
export function evaluate(code: string): Program {
  const programParser = ProgramGrammar;

  const match = programParser.match(code);

  if (match.failed()) {
    throw match.message;
  }

  let evaluated: Program = semantics(match).eval();
  return evaluated;
}
