
//@ts-ignore
import * as ohm from 'ohm-js';
import { Argument, DVMType, Expression, FunctionHeader, FunctionType, Statement, StatementDefinition } from '../types/program';
import p from './grammar/program.ohm';
import { call, if_then, name, op } from './build';

export const ProgramGrammar = ohm.grammar(p);


export const defaultSemantics = ProgramGrammar.createSemantics();
defaultSemantics.addOperation('eval', {

    Program(p) {
        // Evaluate program and return

        const program = p.eval()
        //console.warn({ program });
        //console.dir({ program }, { depth: null });
        return program
    },

    Program_function(p, f) {
        // Evaluate parsed function declaration f
        const _function = f.eval()

        // Evaluate program if any created yet
        if (p.numChildren > 0) {
            const child = p.children[0];
            let program = child.eval();
            program.functions.push(_function);
            return program;
        }

        // or return initial one
        return { headers: [], functions: [_function] }
    },

    Program_comment(p, c) {
        // Evaluate parsed comment c
        const comment = c.eval().comment

        // Evaluate program if any created yet
        if (p.numChildren > 0) {
            const child = p.children[0];
            let program = child.eval();
            program.headers.push(comment);
            return program;
        }

        // or return initial one
        return { headers: [comment], functions: [] }
    },

    singleLineComment: (_, c): StatementDefinition => (
        { type: 'comment', comment: c.sourceString.trim() }
    ),

    multilineComment: (_, c, ___): StatementDefinition => (
        { type: 'comment', comment: c.sourceString.trim() }
    ),

    FunctionDeclaration(h, b, _, __): FunctionType {
        const statements = b.eval()
        return {
            ...h.eval(),
            statements
        }
    },

    FunctionHeader: (_, n, __, a, ___, t): FunctionHeader => ({
        name: n.eval(),
        args: a.eval(),
        return: DVMType[t.sourceString as keyof typeof DVMType]
    }),

    FunctionName: (ident) => ident.sourceString,

    FunctionArgs: (l): Argument[] => l
        .asIteration()
        .children
        .map(child => child.eval()),

    argumentDefinition: (n, _, t): Argument => ({
        name: n.sourceString,
        type: DVMType[t.sourceString as keyof typeof DVMType]
    }),

    FunctionBody(l_c): Statement[] {
        let lastLine = 0;
        const body: Statement[] = l_c.children.flatMap(child => {

            let bodyElement = child.eval()

            // Evaluated element might produce multiple statements
            if (bodyElement.length) {
                bodyElement = bodyElement.map(e => {
                    if (e.line === undefined) {
                        return { ...e, line: lastLine }
                    } else {
                        // Update last line
                        lastLine = e.line
                        return e;
                    }
                });
            }

            // Evaluated element already is already a statement
            if (bodyElement.line !== undefined) {
                // Update last line
                lastLine = bodyElement.line;
            }

            // Evaluated element is a statement definition / expression only
            if (bodyElement.type !== undefined) {
                return { line: lastLine, ...bodyElement };
            }

            // last line by default, else 0 if no line has been declared
            return bodyElement.map(e => ({ line: lastLine, ...e }));
        })
        return body
    },


    Line(c1, n, c2, s, c3): StatementDefinition[] {
        const line = Number(n.sourceString);

        // Line might have comments in between line elements // TODO redefine "spaces" to embed comments ? Will make parsing a line simpler
        const commentStatements1 = [c1].flatMap(evalComment).filter(c => c);
        const commentStatements23 = [c2, c3].flatMap(evalComment).filter(c => c);

        let statementDefinitions: StatementDefinition[];
        if (s.numChildren) {
            const evaluated = s.children[0].eval();
            statementDefinitions = 'length' in evaluated ? evaluated : [evaluated];
        } else {
            // Comments only
            statementDefinitions = [{ type: 'no-op' }]
        }

        // Build statement list
        const statements = statementDefinitions.map(s => ({ line, ...s }))
        // Return list with comments in order
        return [...commentStatements1, ...statements, ...commentStatements23];

        function evalComment(c) {

            if (c.numChildren) {
                let subChildren = []

                for (let cIndex = 0; cIndex < c.numChildren; cIndex++) {
                    const subChild = c.children[cIndex];
                    subChildren.push(subChild.eval())
                }
                return subChildren
            }
            return null;
        }
    },

    ReturnStatement: (_, e): StatementDefinition => ({
        type: 'return',
        expression: e.eval()
    }),

    ConditionStatement(_, ce, __, g, e): StatementDefinition {
        const condition = ce.eval()

        const then = { then: g.eval() }
        const hasElse = e.numChildren


        let statementDefinition//: StatementDefinition;
        if (hasElse) {
            const _else = { else: e.children[0].eval() }
            statementDefinition = if_then.else(condition, then.then, _else.else)
        } else {
            statementDefinition = if_then(condition, then.then)
        }
        delete statementDefinition.line;

        return statementDefinition;
    },

    ExpStatement: (e): StatementDefinition => ({
        type: 'expression',
        expression: e.eval(),
    }),

    Else: (_, g) => g.eval(),

    Goto: (_, n) => Number(n.sourceString),

    DimStatement(_, l, t): StatementDefinition[] {
        const names = l.asIteration().children.map(c => c.sourceString);

        const statements = names.map(name => {
            const statementDefinition: StatementDefinition = {
                type: 'dim',
                declare: {
                    name,
                    type: DVMType[t.sourceString as keyof typeof DVMType],
                }
            }
            return statementDefinition;
        })
        return statements;
    },


    LetStatement: (_, n, __, e): StatementDefinition => ({
        type: 'let',
        assign: {
            name: n.sourceString,
            expression: e.eval(),
        },
    }),

    FuncExp: (n, _, a, __) => call(n.sourceString, a.eval()),

    FuncArguments: (l) => l
        .asIteration()
        .children
        .map(a => (a.eval())),

    // cases when identifier comes first

    IdentFirstExp_unknown(n, c, e) {
        const operator = c.sourceString == '+' ? {
            type: 'calc' as const,
            calc: '+' as const,
        } : {
            type: 'logical' as const,
            logical: c.sourceString as "==" | "!=" | ">" | "<" | ">=" | "<="
        }
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator,
            operands: [
                { type: 'name', name: n.sourceString },
                { type: 'name', name: e.sourceString },
            ],
            operationType: DVMType.unknown
        }
        return expression
    },


    IdentFirstExp_intCmp(n, c, e) {
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator: {
                type: 'logical',
                logical: c.sourceString as "==" | "!=" | ">" | "<" | ">=" | "<="
            },
            operands: [
                { type: 'name', name: n.sourceString },
                e.eval(),
            ],
            operationType: DVMType.Uint64
        }
        return expression
    },

    IdentFirstExp_strCmp(n, c, e) {
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator: {
                type: 'logical',
                logical: c.sourceString as "==" | "!="
            },
            operands: [
                { type: 'name', name: n.sourceString },
                e.eval(),
            ],
            operationType: DVMType.String
        }
        return expression
    },

    IdentFirstExp_strCct: (n, c, e) => op.str.concat(
        name(n.sourceString),
        e.eval()
    ),

    IdentFirstExp_unknownFunc(n, o, f) {
        const operator = o.sourceString == '+' ? {
            type: 'calc' as const,
            calc: '+' as const,
        } : {
            type: 'logical' as const,
            logical: o.sourceString as "==" | "!="
        }
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator,
            operands: [{ type: 'name', name: n.sourceString }, f.eval()],
            operationType: DVMType.unknown
        }
        return expression
    },

    FuncFirstExp_unknown(f1, o, f2) {
        const operator = o.sourceString == '+' ? {
            type: 'calc' as const,
            calc: '+' as const,
        } : {
            type: 'logical' as const,
            logical: o.sourceString as "==" | "!="
        }
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator,
            operands: [f1.eval(), f2.eval()],
            operationType: DVMType.unknown
        }
        return expression
    },

    FuncFirstExp_unknownIdent(f, o, n) {
        const operator = o.sourceString == '+' ? {
            type: 'calc' as const,
            calc: '+' as const,
        } : {
            type: 'logical' as const,
            logical: o.sourceString as "==" | "!="
        }
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator,
            operands: [f.eval(), { type: 'name', name: n.sourceString }],
            operationType: DVMType.unknown
        }
        return expression
    },

    FuncFirstExp_strCmp(f, c, e) {
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator: {
                type: 'logical',
                logical: c.sourceString as "==" | "!="
            },
            operands: [
                f.eval(),
                e.eval(),
            ],
            operationType: DVMType.String
        }
        return expression
    },

    FuncFirstExp_intCmp(f, c, e) {
        const expression: Expression<DVMType> = {
            type: 'operation',
            operator: {
                type: 'logical',
                logical: c.sourceString as "==" | "!=" | ">" | "<" | ">=" | "<="
            },
            operands: [
                f.eval(),
                e.eval(),
            ],
            operationType: DVMType.Uint64
        }
        return expression
    },

    StrCmpExp_cmp(e, c, cct) {
        const strComp: Expression<DVMType> = {
            type: 'operation',
            operands: [e.eval(), cct.eval()],
            operator: {
                type: 'logical',
                logical: c.sourceString as '==' | '!='
            },
            operationType: DVMType.String
        }
        return strComp;
    },

    StrCctExp_concat: strCalc,
    StrCctStrictExp_concat: strCalc,

    StrPriExp_name: (n): Expression<DVMType> => ({
        type: 'name', name: n.sourceString
    }),


    IntCmpExp_cmp(e, c, bs) {
        const intComp: Expression<DVMType> = {
            type: 'operation',
            operands: [e.eval(), bs.eval()],
            operator: {
                type: 'logical',
                logical: c.sourceString as '==' | '!=' | '>' | '<' | '>=' | '<='
            },
            operationType: DVMType.Uint64
        }
        return intComp;
    },


    IntBinXOrExp_xor: intCalc,
    IntBinOrExp_or: intCalc,
    IntBinAndExp_and: intCalc,
    IntBinSftExp_left: intCalc,
    IntBinSftExp_right: intCalc,

    IntModExp_mod: intCalc,

    IntAddSubExp_add: intCalc,
    IntAddSubExp_sub: intCalc,
    IntMulDivExp_mul: intCalc,
    IntMulDivExp_div: intCalc,

    IntPriExp_not(_, p) {
        const not: Expression<DVMType> = {
            type: 'operation',
            operands: [p.eval()],
            operator: {
                type: 'bitwise',
                bitwise: '!'
            },
            operationType: DVMType.Uint64,
        }
        return not
    },


    IntPriExp_intPparenthesis: parenthesisCalc,
    IntPriExp_strParenthesis: parenthesisCalc,
    IntPriExp_name(n) {
        return { type: 'name', name: n.sourceString }
    },



    number: (n): Expression<DVMType.Uint64> => ({
        type: 'value',
        value: Number(n.sourceString)
    }),

    string: (_, s, __): Expression<DVMType.String> => ({
        type: 'value',
        value: s.sourceString
    }),

})

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