import { DVMType, Dim, Expression, Statement, StatementDefinition } from "../types/program";


export function val(value: string | number): Expression<DVMType> {
    return { type: 'value', value }
}
export function name(n: string): Expression<DVMType> {
    return { type: 'name', name: n }
}

export function call(name: string, args: Expression<DVMType>[]): Expression<DVMType> {
    return {
        type: 'function', function: {
            name,
            args
        }
    }
}
call.statement = function (name: string, args: Expression<DVMType>[], line): Statement {
    return {
        line,
        type: 'function', function: {
            name,
            args
        }
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


export function store(key: Expression<DVMType>, value: Expression<DVMType>, line: number): Statement {
    return call.statement("STORE", [key, value], line)
}

export const op = {
    str: {
        concat(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'calc', calc: '+' },
                operands: [left, right],
                operationType: DVMType.String
            }
        },
        eq(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "==" },
                operands: [left, right],
                operationType: DVMType.String,
            }
        },
        ne(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "!=" },
                operands: [left, right],
                operationType: DVMType.String,
            }
        },
    },
    int: {
        eq(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "==" },
                operands: [left, right],
                operationType: DVMType.Uint64,
            }
        },
        ne(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "!=" },
                operands: [left, right],
                operationType: DVMType.Uint64,
            }
        },
        ge(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: ">=" },
                operands: [left, right],
                operationType: DVMType.Uint64,
            }
        },
    },
    var: {
        eq(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "==" },
                operands: [left, right],
                operationType: DVMType.unknown,
            }
        },
        ne(left: Expression<DVMType>, right: Expression<DVMType>): Expression<DVMType> {
            return {
                type: 'operation',
                operator: { type: 'logical', logical: "!=" },
                operands: [left, right],
                operationType: DVMType.unknown,
            }
        },
    }
}

export function if_then(condition: Expression<DVMType>, then: number, line?: number): Statement {
    return {
        line,
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
        line,
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
    return { line, type: 'comment', comment: text }
}