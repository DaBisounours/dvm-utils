export type Program = {
  readonly headers?: string[];
  readonly name?: string;
  readonly functions: readonly FunctionType[];
};

export type FunctionType = {
  readonly name: string;
  readonly return: DVMType;
  readonly args: readonly Argument[];
  readonly statements: readonly Statement[];
};

export type Argument = {
  readonly name: string;
  readonly type: DVMType;
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
  | { readonly type: 'comment'; readonly comment: string }
  | { readonly type: 'return'; readonly expression: Expression<DVMType> }
  | { readonly type: 'function'; readonly function: DVMFunction }

export type Statement = { readonly line: number } & StatementDefinition

export type DVMFunction = {
  readonly name: string;
  readonly args: readonly Expression<DVMType>[];
};

export type Expression<T extends DVMType> =
  | {
      readonly type: 'value';
      readonly value: T extends 'string' ? string : number;
    }
  | {
      readonly type: 'operation';
      readonly operands: readonly Expression<T>[];
      readonly operator: Operator<T>;
      readonly operationType: T;
    }
  | { readonly type: 'function'; readonly function: DVMFunction }
  | { readonly type: 'name'; readonly name: string };

export type Operator<T extends DVMType> = T extends 'string'
  ?
      | { readonly type: 'logical'; readonly logical: '==' | '!=' }
      | { readonly type: 'calc'; readonly calc: '+' }
  : // T extends 'number'
    | {
          readonly type: 'logical';
          readonly logical: '==' | '!=' | '>' | '<' | '>=' | '<=';
        }
      | {
          readonly type: 'bitwise';
          readonly bitwise: '&' | '|' | '^' | '!' | '<<' | '>>';
        }
      | { readonly type: 'calc'; readonly calc: '+' | '-' | '*' | '/' };
