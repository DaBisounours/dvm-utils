export type Program = {
  headers?: string[];
  name?: string;
  functions: FunctionType[];
};

export type FunctionType = {
  name: string;
  return: DVMType;
  args: Argument[];
  statements: Statement[];
};

export type Argument = {
  name: string;
  type: DVMType;
};

export enum DVMType {
  String = 'string',
  Uint64 = 'number',
}

export function matchDVMType(s: string) {
  if (s in DVMType) {
    return DVMType[s as keyof typeof DVMType];
  } else {
    throw new Error(`Failed to match type "${s}" as DVMType`)
  }
}

export type StatementDefinition =
  | { type: 'no-op' }
  | { type: 'comment'; comment: string }
  | { type: 'return'; expression: Expression<DVMType> }
  | { type: 'function'; function: FunctionCall }
  | { type: 'branch'; branch: Branch }
  | { type: 'dim'; declare: Dim }
  | { type: 'let'; assign: Let }

export type Statement = { line: number } & StatementDefinition

export type Dim = {
  type: DVMType;
  name: string;
}

export type Let = {
  name: string;
  expression: Expression<DVMType>;
}

export type Branch = {
  condition: Expression<DVMType>,
  then: number
} & (
    | { type: 'if-then' }
    | { type: 'if-then-else', else: number }
  )


export type FunctionCall = {
  name: string;
  args: Expression<DVMType>[];
};

export type Expression<T extends DVMType> =
  | {
    type: 'value';
    value: T extends 'string' ? string : number;
  }
  | {
    type: 'operation';
    operands: Expression<T>[];
    operator: Operator<T>;
    operationType: T;
  }
  | { type: 'function'; function: FunctionCall }
  | { type: 'name'; name: string };

export type Operator<T extends DVMType> = T extends 'string'
  ?
  | { type: 'logical'; logical: '==' | '!=' }
  | { type: 'calc'; calc: '+' }
  : // T extends 'number'
  | {
    type: 'logical';
    logical: '==' | '!=' | '>' | '<' | '>=' | '<=';
  }
  | {
    type: 'bitwise';
    bitwise: '&' | '|' | '^' | '!' | '<<' | '>>';
  }
  | { type: 'calc'; calc: '+' | '-' | '*' | '/' | '%' };
