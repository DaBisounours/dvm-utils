
//@ts-ignore
import * as ohm from 'ohm-js';
import { DVMType, Expression, FunctionCall, Statement, StatementDefinition } from '../types/program';
import p from './grammar/program.ohm';
import { call, if_then, name, op } from './utils';

export const ProgramGrammar = ohm.grammar(p);


export const defaultSemantics = ProgramGrammar.createSemantics();
defaultSemantics.addOperation('eval', {

    Program(p) {
        const program = p.eval()
        //console.warn({ program });

        return program
    },

    Program_function(p, f) {
        const _function = f.eval()
        //console.warn({ _function });

        for (let childIndex = 0; childIndex < p.numChildren; childIndex++) {
            const child = p.children[childIndex];
            let program = child.eval();


            if (program) {
                program.functions.push(_function);
            } else {
                program = { headers: [], functions: [_function] }
            }
            return program;
        }
        return { headers: [], functions: [_function] }
    },

    Program_comment(p, c) {
        const comment = c.eval().comment
        for (let childIndex = 0; childIndex < p.numChildren; childIndex++) {
            const child = p.children[childIndex];
            let program = child.eval();


            if (program) {
                program.headers.push(comment);
            } else {
                program = { headers: [comment], functions: [] }
            }
            return program;
        }
        return { headers: [comment], functions: [] }
    },
    singleLineComment(_, c) {

        return { type: 'comment', comment: c.sourceString.trim() }
    }, // TODO? Ignored for now

    multilineComment(_, c, ___) {

        return { type: 'comment', comment: c.sourceString.trim() }
    }, // TODO? Ignored for now


    FunctionDeclaration(h, b, _, __) {
        const statements = b.eval()
        //console.warn({ statements });

        return {
            ...h.eval(),
            statements
        }
    },

    FunctionHeader(_, n, __, a, ___, t) {
        return {
            name: n.eval(),
            args: a.eval(),
            return: DVMType[t.sourceString as keyof typeof DVMType]
        }
    },

    FunctionName(ident) {
        return ident.sourceString;
    },

    FunctionArgs(l) {
        return l.asIteration().children.map(child => child.eval())
    },
    argumentDefinition(n, _, t) {
        return {
            name: n.sourceString,
            type: DVMType[t.sourceString as keyof typeof DVMType]
        }
    },

    FunctionBody(l_c) {
        let lastLine = 0;
        const body = l_c.children.flatMap(child => {

            let bodyElement = child.eval()
            //console.warn({ bodyElement });

            if (bodyElement.length) {
                bodyElement = bodyElement.map(e => {
                    if (e.line === undefined) {
                        return { ...e, line: lastLine }
                    } else {
                        lastLine = e.line
                        return e;
                    }
                });
            }
            if (bodyElement.line !== undefined) {
                lastLine = bodyElement.line;
            }

            if (bodyElement.type !== undefined) {

                return { line: lastLine, ...bodyElement };
            }

            // last line by default, else 0 if no line has been declared
            return bodyElement.map(e => ({ line: lastLine, ...e }))
        })
        return body
    },


    Line(c1, n, c2, s, c3) {
        const line = Number(n.sourceString);

        const commentStatements1 = [c1].flatMap(evalComment).filter(c => c);
        const commentStatements23 = [c2, c3].flatMap(evalComment).filter(c => c);
        
        let statementDefinition: StatementDefinition[]; 
        if (s.numChildren) {
            const evaluated = s.children[0].eval();
            statementDefinition = 'length' in evaluated ? evaluated : [evaluated];
            
        } else {
            statementDefinition = [{ type: 'no-op' }]
        }

        const statements = statementDefinition.map(s => ({ line, ...s}))

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

    ReturnStatement(_, e) {
        const statementDefinition: StatementDefinition
            = {
            type: 'return',
            expression: e.eval()

        }
        return statementDefinition;
    },

    ConditionStatement(_, ce, __, g, e) {
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

    Else(_, g) {
        return g.eval();
    },

    Goto(_, n) {
        return Number(n.sourceString)
    },

    DimStatement(_, l, t) {
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


    LetStatement(_, n, __, e) {
        const statementDefinition: StatementDefinition = {
            type: 'let',
            assign: {
                name: n.sourceString,
                expression: e.eval(),
            },
        }
        return statementDefinition;
    },



    FuncExp(n, _, a, __) {
        const funcCall: StatementDefinition =
            call(n.sourceString, a.eval()) as StatementDefinition
        return funcCall
    },

    FuncArguments(l) {
        return l.asIteration().children.map(a => (a.eval()));
    },


    // case when identifier comes first
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

    IdentFirstExp_strCct(n, c, e) {
        const expression: Expression<DVMType> = op.str.concat(
            name(n.sourceString),
            e.eval()
        );
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



    number(n) {
        const value: Expression<DVMType.Uint64> = {
            type: 'value',
            value: Number(n.sourceString)
        };
        return value
    },
    string(_, s, __) {
        const value: Expression<DVMType.String> = {
            type: 'value',
            value: s.sourceString
        };
        return value
    },

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