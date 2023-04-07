
import * as ohm from 'ohm-js';
import { DVMType, Expression, FunctionType, Program } from '../types/program';
import p from './grammar/program.ohm';

export const ProgramGrammar = ohm.grammar(p);


export const defaultSemantics = ProgramGrammar.createSemantics();
defaultSemantics.addOperation('eval', {

    Program(p) {
        const program = p.eval()
        console.warn({ program });

        return program
    },

    Program_function(p, f) {
        const _function = f.eval()
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
        return {
            ...h.eval(),
            statements: b.eval()
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
        let lines = []
        for (let index = 0; index < l.numChildren; index++) {
            lines.push(l.children[0].eval());
        }
        return lines
    },
    argumentDefinition(n, _, t) {
        return {
            name: n.sourceString,
            type: DVMType[t.sourceString as keyof typeof DVMType]
        }
    },
    
    FunctionBody(l) {
        return l.asIteration().children.map(child => l.eval())
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
