import { BinaryOperator, DVMType, Dim, Expression, Statement, StatementDefinition, UnaryOperator } from "../types/program";

/** These functions are useful to build the Program quicker */

export function val(value: string | number): Expression<DVMType> {
    return { type: 'value', value }
}
export function name(n: string): Expression<DVMType> {
    return { type: 'name', name: n }
}

export function call(name: string, args?: Expression<DVMType>[]): Expression<DVMType> {
    return {
        type: 'function', 
        function: {
            name,
            args: args === undefined ? [] : args
        }
    }
}
call.statement = function (name: string, args: Expression<DVMType>[], line): Statement {
    return {
        line,
        type: 'expression', expression: call(name, args)
    }
}




export function declare(_var: string, type: DVMType, line: number): Statement {
    return {
        line,
        type: 'dim',
        declare: {
            type,
            name: _var,
        },
    }
}
declare.multiple = function (vars: string[], type: DVMType, line: number): Statement[] {
    return vars.map(v => declare(v, type, line))
}
export function assign(name: string, value: Expression<DVMType>, line: number): Statement {
    return { line, type: 'let', assign: { name, expression: value } }
}

export function return_value(value: string | number, line: number): Statement {
    return { line, type: 'return', expression: val(value) }
}

export function return_expression(expression: Expression<DVMType>, line: number): Statement {
    return { line, type: 'return', expression }
}


export function store(key: Expression<DVMType>, value: Expression<DVMType>, line: number): Statement {
    return call.statement("STORE", [key, value], line)
}


function _op(o: UnaryOperator, operationType: DVMType): (right: Expression<DVMType>) => Expression<DVMType>;
function _op(o: BinaryOperator, operationType: DVMType): (left: Expression<DVMType>, right: Expression<DVMType>) => Expression<DVMType>;

function _op(
    o: UnaryOperator | BinaryOperator,
    operationType: DVMType
): ((right: Expression<DVMType>) => Expression<DVMType>) | ((left: Expression<DVMType>, right: Expression<DVMType>) => Expression<DVMType>) {
    let operator;
    switch (o) {
        case '==':
        case '!=':
        case '<=':
        case '>=':
        case '<':
        case '>':
            operator = { type: 'logical' as const, logical: o };
            break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
            operator = { type: 'calc' as const, calc: o };
            break;
        case '&':
        case '&&':
        case '|':
        case '||':
        case '^':
        case '!':
        case '<<':
        case '>>':
            operator = { type: 'bitwise' as const, bitwise: o };

    }
    if (o == '!') {
        return (right) => ({
            type: 'operation' as const,
            operator,
            operands: [right],
            operationType,
        })
    } else {
        return (left, right) => ({
            type: 'operation' as const,
            operator,
            operands: [left, right],
            operationType,
        })
    }
}

export const op = {
    str: {
        concat: _op('+', DVMType.String),
        eq: _op('==', DVMType.Uint64),
        ne: _op('!=', DVMType.Uint64),
    },
    int: {
        eq: _op('==', DVMType.Uint64),
        ne: _op('!=', DVMType.Uint64),
        ge: _op('>=', DVMType.Uint64),
        le: _op('<=', DVMType.Uint64),
        lt: _op('<', DVMType.Uint64),
        gt: _op('>', DVMType.Uint64),
        add: _op('+', DVMType.Uint64),
        sub: _op('-', DVMType.Uint64),
        mul: _op('*', DVMType.Uint64),
        div: _op('/', DVMType.Uint64),
        mod: _op('%', DVMType.Uint64),
        xor: _op('^', DVMType.Uint64),
        and: _op('&&', DVMType.Uint64),
        band: _op('&', DVMType.Uint64),
        or: _op('||', DVMType.Uint64),
        bor: _op('|', DVMType.Uint64),
        lsb: _op('<<', DVMType.Uint64),
        rsb: _op('>>', DVMType.Uint64),
        not: _op('!', DVMType.Uint64),
    },
    var: {
        plus: _op('+', DVMType.unknown),
        eq: _op('==', DVMType.Uint64),//! I changed that
        ne: _op('!=', DVMType.Uint64), //! I changed that
    },
}

export function if_then(condition: Expression<DVMType>, then: number, line?: number): Statement {
    return {
        line: line === undefined ? 0 : line,
        type: 'branch',
        branch: {
            type: 'if-then',
            condition,
            then,
        }
    }
}
if_then.else = function (condition: Expression<DVMType>, then: number, _else: number, line?: number): Statement {
    return {
        line: line === undefined ? 0 : line,
        type: 'branch',
        branch: {
            type: 'if-then-else',
            condition,
            then,
            else: _else,
        }
    }
}

export function comment(text: string, line?: number): Statement {
    return { line: line === undefined ? 0 : line, type: 'comment', comment: text }
}
/*
export function noop(line: number): Statement {
    return { line, type: 'no-op' }
}*/