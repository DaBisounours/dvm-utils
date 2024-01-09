import { Program } from "../types/program";
import { Mapping, generateCode, minifyProgram } from "./generate";
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

/**
 * Generate DVM-BASIC code from a Program.
 *
 * ### Example
 * ```js
 * import { generate } from 'dvm-utils'
 * const { code, mapping } = generate(program, { minify: true }
 * console.log(code, mapping)
 * ```
 *
 * @param program - program.
 * @param options - options such as minification, ignore comments.
 * @returns Generated program code and mapping if `minify` option is `true`.
 */
export function generate(
  program: Program,
  options?: { minify?: boolean; comments?: boolean; optimizeSpace?: boolean }
): { code: string; mapping: Mapping | null } {
  let mapping = null;
  if (options?.minify) {
    // Get context (names and their types)
    const context = getContext(program);

    // Minify
    const minified = minifyProgram(context, program);
    program = minified.program;
    mapping = minified.mapping;
  }
  // Generate code
  return {
    code: generateCode(program, options?.comments, options?.optimizeSpace),
    mapping,
  };
}
