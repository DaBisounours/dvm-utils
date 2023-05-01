
//@ts-ignore
import * as ohm from 'ohm-js';
import { BitwiseOperator, CalcOperator, DVMType, Expression, FunctionHeader, FunctionType, LogicalOperator, Operator, Program, Statement, StatementDefinition } from '../../types/program';
import p from './program.ohm';

export const ProgramGrammar = ohm.grammar(p);


export const semantics = ProgramGrammar.createSemantics();

semantics.addOperation('eval', {
    Program(fd) {
        const functions: FunctionType[] =
            mapStarRule<FunctionType>(fd, child => child.eval())
        const program: Program = { functions }
        return program as any;// make compiler happy
    },


    FunctionDeclaration(c1, _Function, c2, h, c3, b, _End, __Function): FunctionType {
        const comments = parseComments(c1, c2, c3);

        let header: FunctionHeader = h.eval();
        header.comments = header.comments ? [...header.comments, ...comments] : comments;
        const statements: Statement[] = b.numChildren > 0 ? b.children[0].eval() : [];
        return { ...header, statements }
    },

    FunctionHeader(n, c1, _opParent, a, _clParent, c2, t): FunctionHeader {
        let comments = parseComments(c1, c2);

        const name = n.sourceString;
        const args = a.eval();
        const argsComments = a.comments().map((c, index) => `@arg=${args[index].name}:${c}`)
        comments = [...comments, ...argsComments]
        const returnType = DVMType[t.sourceString as keyof typeof DVMType];

        if (comments.length > 0) {
            return { name, args, comments, return: returnType }
        } else {
            return { name, args, return: returnType }
        }
    },

    FunctionHeaderArguments: l =>
        l.asIteration()
            .children
            .map(arg => arg.eval()),

    FunctionHeaderArgument: (_c1, n, _c2, t, _c3) => ({
        name: n.sourceString,
        type: DVMType[t.sourceString as keyof typeof DVMType]
    }),

    FunctionBody: (l) => mapStarRule<Statement | Statement[]>(l, line => line.eval())
        .filter(x => x != null)
        .flat(), // some lines produces multiple statements such as DIM

    FunctionLine_withStatement(n, c1, s, c2): Statement[] {
        const line = Number(n.sourceString);
        const _statements: StatementDefinition | StatementDefinition[]
            = s.eval();
        const comments = parseComments(c1, c2);

        const commentStatements = comments.map(c => {
            const commentStatementDefinition: StatementDefinition = {
                type: 'comment', comment: c as string,
            }
            return { line, ...commentStatementDefinition };
        })

        if (_statements instanceof Array) {
            return [
                ..._statements.map(statement => ({ // array is flattened afterwards
                    line,
                    ...statement
                })),
                ...commentStatements,
            ]
        } else {
            return [
                { line, ..._statements },
                ...commentStatements,
            ]
        }

    },
    FunctionLine_emptyLine: (n, c): Statement[] | null => {
        const line = Number(n.sourceString);
        if (c.numChildren > 0) {
            const comments = parseComments(c);

            const commentStatements = comments.map(c => {
                const commentStatementDefinition: StatementDefinition = {
                    type: 'comment', comment: c as string,
                }
                return { line, ...commentStatementDefinition };
            })
            return commentStatements
        } else return null;
    }, // filtered

    // Statement Definitions

    DeclarationStatement: (_dim, l, _as, t): StatementDefinition[] => // array is flattened aftewards
        l.asIteration()
            .children
            .map((n => ({
                type: 'dim',
                declare: {
                    name: n.sourceString,
                    type: DVMType[t.sourceString as keyof typeof DVMType]
                }
            }))),

    AssignmentStatement: (_let, n, _eq, e): StatementDefinition => ({
        type: 'let',
        assign: {
            name: n.sourceString,
            expression: e.eval(),
        }
    }),

    ReturnStatement: (_return, e): StatementDefinition => ({
        type: 'return',
        expression: e.eval(),
    }),

    BranchStatement: (_if, e, _then, g, el): StatementDefinition => {
        const _else = el.numChildren == 1 ? el.children[0].eval() : null;
        return {
            type: 'branch',
            branch: _else ? {
                type: 'if-then-else',
                condition: e.eval(),
                then: g.eval(),
                else: _else
            } : {
                type: 'if-then',
                condition: e.eval(),
                then: g.eval(),
            }
        }
    },


    Goto: (_goto, l): number => Number(l.sourceString),

    Else: (_else, g): number => g.eval(),

    GotoStatement: (g): StatementDefinition => ({ type: 'goto', goto: g.eval() }),

    ExpressionStatement: (e): StatementDefinition => ({
        type: 'expression',
        expression: e.eval()
    }),
    // Expression

    EqualityExpression_eq: genericOperation(logicalOperator),
    EqualityExpression_ne: genericOperation(logicalOperator),

    RelationalExpression_ge: genericOperation(logicalOperator),
    RelationalExpression_gt: genericOperation(logicalOperator),
    RelationalExpression_le: genericOperation(logicalOperator),
    RelationalExpression_lt: genericOperation(logicalOperator),

    BitwiseORExpression_or: genericOperation(bitwiseOperator),
    BitwiseXORExpression_xor: genericOperation(bitwiseOperator),
    BitwiseAndExpression_and: genericOperation(bitwiseOperator),

    ShiftExpression_lsl: genericOperation(bitwiseOperator),
    ShiftExpression_lsr: genericOperation(bitwiseOperator),

    AdditiveExpression_add: genericOperation(calcOperator),
    AdditiveExpression_sub: genericOperation(calcOperator),
    AdditiveExpression_mod: genericOperation(calcOperator),

    MultiplicativeExpression_mul: genericOperation(calcOperator),
    MultiplicativeExpression_div: genericOperation(calcOperator),

    UnaryIntExpression_not: (_not, e): Expression<DVMType> => ({
        type: 'operation',
        operands: [e.eval()],
        operationType: DVMType.Uint64,
        operator: {
            type: 'bitwise',
            bitwise: '!',
        }
    }),

    PrimaryExpression_call: (n, _opParent, al, _clParent): Expression<DVMType> => ({
        type: 'function',
        function: {
            name: n.sourceString,
            args: al.asIteration()
                .children
                .map(expression => expression.eval())
        }
    }),

    PrimaryExpression_name: (n): Expression<DVMType> => ({ type: 'name', name: n.sourceString }),
    PrimaryExpression_parenthesis: (_opParent, e, _clParent) => e.eval(),

    // Base
    number: (n): Expression<DVMType.Uint64> => ({
        type: 'value',
        value: Number(n.sourceString)
    }),

    string: (_dq, s, __dq): Expression<DVMType.String> => ({
        type: 'value',
        value: s.sourceString
    }),


})


semantics.addOperation('comments', {
    FunctionHeaderArguments: l =>
        l.asIteration()
            .children
            .map(arg => arg.comments())
            .filter(x => x.length > 0),
    FunctionHeaderArgument: (c1, _n, c2, _t, c3) => parseComments(c1, c2, c3),

})

function parseComments(...args: any[]) {
    return args.flatMap(cArg => cArg.children.map(c => cleanComment(c.sourceString))).filter(x => x.length > 0)
}

function cleanComment(c: string) {
    return c.startsWith('/*')
        ? c.slice(2, c.length - 2).trim()
        : c.slice(2).trim()
}

function mapStarRule<T = any>(rule, callback: (child: ohm.Node, index: number) => T): T[] {
    let result = []
    for (let index = 0; index < rule.numChildren; index++) {
        const element = rule.children[index];
        result.push(callback(element, index))
    }
    return result
}

function strCalc(e, o, p) {
    const strExp: Expression<DVMType> = {
        type: 'operation',
        operands: [e.eval(), p.eval()],
        operator: {
            type: 'calc',
            calc: o.sourceString as '+'
        },
        operationType: DVMType.String
    }
    return strExp;
}


function logicalOperator(o): Operator<DVMType> {
    return {
        type: 'logical',
        logical: o.sourceString as LogicalOperator
    }
}

function calcOperator<T extends CalcOperator>(o): Operator<DVMType> {
    return {
        type: 'calc',
        calc: o.sourceString as T
    }
}

function bitwiseOperator(o): Operator<DVMType> {
    return {
        type: 'bitwise',
        bitwise: o.sourceString as BitwiseOperator
    }
}

function genericOperation(_operator: (_) => Operator<DVMType>) {
    return (l, o, r): Expression<DVMType> => {
        const operator = _operator(o)
        const guessedOperationType =
            operator.type == 'bitwise'
                ? DVMType.Uint64
                : operator.type == 'logical'// && !['==', '!='].includes(operator.logical)
                    ? DVMType.Uint64
                    : operator.type == 'calc' && operator.calc != '+'
                        ? DVMType.Uint64
                        : DVMType.unknown

        const left: Expression<DVMType> = l.eval();
        const right: Expression<DVMType> = r.eval();
        const operands = [left, right];
        let finalOperationType = guessedOperationType;
        if (guessedOperationType == DVMType.unknown) {
            //console.log({ left, right });
            //! // TODO Check if the use case is actually simpler to solve
            // direct guess by operand value or operation type
            operands.forEach(operand => {
                if (operand.type == 'value') {
                    finalOperationType = typeof operand.value == 'number'
                        ? DVMType.Uint64
                        : DVMType.String;
                } else if (operand.type == 'operation' && operand.operationType != DVMType.unknown) {
                    // Logical operation (especially ==) always return Uint64, wether the args are string or not
                    if (operand.operator.type == 'logical') {
                        finalOperationType = DVMType.Uint64;
                    } else { // Calc operations will return the type of their arguments
                        finalOperationType = operand.operationType;
                    }
                }
            })

            // TODO guess recursively from left and right ?
        }

        const operation: Expression<DVMType> = {
            type: 'operation',
            operationType: finalOperationType,
            operands,
            operator
        }
        return operation
    }
}



function intCalc(e, o, n) {

    const intExp: Expression<DVMType> = {
        type: 'operation',
        operands: [e.eval(), n.eval()],
        operator
            : ['&', '|', '^', '!', '<<', '>>'].includes(o.sourceString) ? {
                type: 'bitwise',
                bitwise: o.sourceString as '&' | '|' | '^' | '!' | '<<' | '>>',
            } : {
                type: 'calc',
                calc: o.sourceString as '+' | '-' | '*' | '/',
            },
        operationType: DVMType.Uint64
    }
    return intExp;
}

function parenthesisCalc(_, e, __) {
    return e.eval()
}