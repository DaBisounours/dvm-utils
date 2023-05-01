export type Program = {
  name?: string;
  functions: FunctionType[];
};

export type FunctionHeader = {
  comments?: string[] // TODO make necessary
  name: string;
  return: DVMType;
  args: Argument[];
}
export type FunctionType = FunctionHeader & {
  statements: Statement[];
};

export type Argument = {
  name: string;
  type: DVMType;
};

export enum DVMType {
  String = 'string',
  Uint64 = 'number',
  unknown = 'unknown',
}

export function matchDVMType(s: string) {
  if (s in DVMType) {
    return DVMType[s as keyof typeof DVMType];
  } else {
    throw new Error(`Failed to match type "${s}" as DVMType`)
  }
}

export type StatementDefinition =
  | { type: 'goto', goto: number }
  | { type: 'return'; expression: Expression<DVMType> }
  | { type: 'expression'; expression: Expression<DVMType> }
  | { type: 'branch'; branch: Branch }
  | { type: 'dim'; declare: Dim }
  | { type: 'let'; assign: Let }
  | { type: 'comment'; comment: string }

export type Statement<Option = {}> = { line: number } & StatementDefinition & Option

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

export type BinaryOperator =
  | LogicalOperator
  | CalcOperator
  | BitwiseBinaryOperator;

export type BitwiseOperator =
  | BitwiseBinaryOperator
  | UnaryOperator

export type BitwiseUnaryOperator = '!'

export type BitwiseBinaryOperator =
  | '&' | '&&'
  | '|' | '||'
  | '^'
  | '<<'
  | '>>'

export type UnaryOperator = BitwiseUnaryOperator;

export type LogicalOperator =
  | LogicalCommonOperator
  | LogicalIntOperator

export type LogicalCommonOperator =
  | '=='
  | '!='

export type LogicalIntOperator =
  | '<='
  | '>='
  | '<'
  | '>'

export type CalcCommonOperator = '+'

export type CalcOperator =
  | CalcCommonOperator
  | CalcIntOperator

export type CalcIntOperator =
  | '-'
  | '*'
  | '/'
  | '%'

export type IntOperator =
  | LogicalCommonOperator
  | LogicalIntOperator
  | CalcCommonOperator
  | CalcIntOperator

export type StringOperator =
  | LogicalCommonOperator
  | CalcCommonOperator


export type Expression<T extends DVMType, Option = {}> =
  Option & (
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
    | { type: 'name'; name: string }
  );

export type Operator<T extends DVMType> = T extends 'string'
  ?
  | { type: 'logical'; logical: LogicalCommonOperator }
  | { type: 'calc'; calc: CalcCommonOperator }
  : // T extends 'number'
  | {
    type: 'logical';
    logical: LogicalCommonOperator | LogicalIntOperator;
  }
  | {
    type: 'bitwise';
    bitwise: BitwiseOperator;
  }
  | { type: 'calc'; calc: CalcCommonOperator | CalcIntOperator };
