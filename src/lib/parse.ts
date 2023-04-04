import { Argument, DVMType, Expression, FunctionType, Program, Statement, StatementDefinition, matchDVMType } from '../types/program';
import { splitLineNumber } from '../utils/misc';
import { FunctionRegExp, CommentRegExp, MultilineCommentRegExp, HasFunctionRegExp, HeaderRegExp, ReturnStatementRegExp, FunctionCallRegExp, AnyMultilineCommentRegExp } from './regexp';

function getHeaders(s: string): string[] {
  let matches = [];
  let match;
  while (match = HeaderRegExp.exec(s)) {
    matches.push(match[1])
  }
  return matches;
}

function getAllFunctions(s: string): RegExpExecArray[] {
  let matches = [];
  let match;
  while (match = FunctionRegExp.exec(s)) {
    matches.push(match)
  }
  return matches;
}

function getAllInlineComments(s: string): { comments: string[], lineWithoutComments: string } {
  let comments: string[] = [];
  let match;
  while (match = CommentRegExp.exec(s)) {


    const cleanedMatch = (
      match[0].startsWith('/*')
        ? match[0].slice(2, match[0].length - 2)
        : match[0].slice(2)
    ).trim()
    comments.push(cleanedMatch)
  }
  return { comments, lineWithoutComments: s.replace(CommentRegExp, '').trim() };
}

function getAllMultilineComments(s: string[]): { mlComments: Statement[], linesWithoutMultilineComments: string[] } {
  let comments: Statement[] = []
  let match;
  let lastLine = 0;
  while (match = MultilineCommentRegExp.exec(s.join('\n'))) {
    if (match[2]) {
      const cleanedMatch = match[2]
        .slice(2, match[2].length - 2)
        .trim()
      comments.push({ line: lastLine, type: 'comment', comment: cleanedMatch })
    }
    if (match[1]) {
      lastLine = Number(match[1])
    }
  }
  const linesWithoutMultilineComments = s
    .join('\n')
    .replace(AnyMultilineCommentRegExp, '')
    .split('\n')
    .filter(l => l !== '')
    .map(l => l.trim())

  console.log({linesWithoutMultilineComments});
  
  return {
    mlComments: comments,
    linesWithoutMultilineComments
  };
}

function parseArguments(argsStr: string): Argument[] {
  return argsStr
    .trim()
    .split(',')
    .filter(a => a.length > 0)
    .map(argsStr => {
      const argsSplit = argsStr
        .trim()
        .split(/\s+/g)

      return {
        name: argsSplit[0],
        type: matchDVMType(argsSplit[1])
      }
    });
}

type ExpressionParseResult = { matched: true, expression: Expression<DVMType> } | { matched: false, expression: null };

const PARSE_EXPRESSION_FUNCTIONS: { [k: string]: (line: string) => ExpressionParseResult } = {
  function: parseFunctionCall,
  binary: parseBinaryOperation,
  //unary: parseUnaryOperation,
}

function parseBinaryOperation(line: string): ExpressionParseResult {

  return {matched: false, expression: null}
}
function parseUnaryOperation(line: string): ExpressionParseResult {
  return {matched: false, expression: null}
}

function parseFunctionCall(line: string): ExpressionParseResult {
  const match = FunctionCallRegExp.exec(line);
  if (match && match.groups) {
    const [
      name,
      args
    ] = [
        match.groups.name,
        match.groups.args
          .split(',')
          .filter(a => a != '')
        || [],
      ];
    return {
      matched: true,
      expression: {
        type: 'function',
        function: {
          name,
          args: args.map(a => parseExpression(a))
        },
      }
    }
  }
  return { matched: false, expression: null }
}

function parseExpression(expressionStr: string): Expression<DVMType> {

  console.log({ expressionStr });
  for (const parseExpressionKey in PARSE_EXPRESSION_FUNCTIONS) {
    const parseExpressionFunction = PARSE_EXPRESSION_FUNCTIONS[parseExpressionKey as keyof typeof PARSE_STATEMENT_FUNCTIONS];

    let { matched, expression } = parseExpressionFunction(expressionStr)
    if (matched && expression) {
      return expression
    }
  }
  

  if (!Number.isNaN(Number(expressionStr))) {
    const exp: Expression<DVMType.Uint64> = { type: 'value', value: Number(expressionStr) }
    return exp;
  }

  if (expressionStr.trim().startsWith('"') && expressionStr.trim().endsWith('"')) {
    const exp: Expression<DVMType.String> = { type: 'value', value: expressionStr.slice(1, expressionStr.length - 1) }
    return exp;
  }
  console.warn(`Unable to parse expression '${expressionStr}'. Assuming name`);
  return { type: 'name', name: expressionStr }

}

type StatementParseResult = { matched: true, statement: StatementDefinition } | { matched: false, statement: null };
function parseReturn(line: string): StatementParseResult {
  const match = ReturnStatementRegExp.exec(line);
  //console.log({line, match});
  if (match) {
    const expressionStr = match[1];
    const expression = parseExpression(expressionStr)

    return {
      matched: true,
      statement: {
        type: 'return',
        expression
      }
    }
  }
  return { matched: false, statement: null }

}


const PARSE_STATEMENT_FUNCTIONS: { [k: string]: (line: string) => StatementParseResult } = {
  _return: parseReturn
}

function parseStatements(statementsStr: string): Statement[] {
  let statements: Statement[] = [];

  let lines = statementsStr
    .split('\n')
    .map(line => line.trim())
    .filter(line => line != '')

  let { mlComments, linesWithoutMultilineComments } = getAllMultilineComments(lines)

  let linesWithoutComments: string[] = []
  statements = [...mlComments, ...linesWithoutMultilineComments.flatMap(lineStr => {

    let [line, statementStr] = splitLineNumber(lineStr)
    //console.log({lineStr, line, statementStr});

    if (Number.isNaN(Number(line))) {
      line = '0';
      statementStr = lineStr;
      console.warn('line does not have a number');
    }

    const { comments, lineWithoutComments } = getAllInlineComments(statementStr)

    linesWithoutComments.push(`${line} ${lineWithoutComments}`);

    let commentStatements: Statement[] = []
    comments.forEach(comment => commentStatements.push({
      line: Number(line),
      type: 'comment', comment,
    }))

    return commentStatements
  })]

  statements = [
    ...statements,
    ...linesWithoutComments
      .map(lineStr => {
        if (lineStr.trim() === '') return null;

        const [lineNumber, line] = splitLineNumber(lineStr);
        //console.log({lineStr, line, lineNumber});

        for (const parseFunctionKey in PARSE_STATEMENT_FUNCTIONS) {
          const parseFunction = PARSE_STATEMENT_FUNCTIONS[parseFunctionKey as keyof typeof PARSE_STATEMENT_FUNCTIONS];

          let { matched, statement } = parseFunction(line)
          if (matched) {
            return { line: Number(lineNumber), ...statement }
          }
        }

        console.warn(`Line ${lineStr} not supported, skipped`);

        return null;
      })
      .filter(statement => statement != null) as Statement[]
  ]

  return statements;
}


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
  console.log('_____________________________________________\n', code);
  const empty = { functions: [] };

  if (code === '' || code.match(HasFunctionRegExp) === null) {
    console.warn('No SC code');

    return empty;
  }

  const headers = getHeaders(code);

  const functionMatches = getAllFunctions(code);



  if (functionMatches.length == 0) {
    console.warn('No matches');
  }

  const functions = functionMatches.map(match => {
    const [_, name, argsStr, returnType, statementsStr] = match;

    const args: Argument[] = parseArguments(argsStr)
    const statements: Statement[] = parseStatements(statementsStr);

    const func: FunctionType = {
      name,
      return: matchDVMType(returnType),
      args,
      statements,
    }

    return func

  })

  const program: Program = {
    headers,
    functions
  }
  console.dir({ program }, { depth: null });
  return program;
};


