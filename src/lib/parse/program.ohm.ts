export default String.raw`DVMProgram {
  /*
   * PROGRAM & FUNCTION DECLARATION
   */

  Program
    = FunctionDeclaration*

  FunctionDeclaration
    = comment* "Function" multiLineComment* FunctionHeader comment* FunctionBody? "End" "Function"

  FunctionHeader
    = identifier multiLineComment* "(" FunctionHeaderArguments ")" multiLineComment* type

  FunctionHeaderArguments
    = ListOf<FunctionHeaderArgument , ",">

  FunctionHeaderArgument
    = multiLineComment* identifier multiLineComment* type multiLineComment*

  FunctionBody
    = FunctionLine*

  FunctionLine
    = number multiLineComment* ~"End" ~number (Statement comment*) --withStatement
    | number comment* --emptyLine

  Statement
    = DeclarationStatement
    | AssignmentStatement
    | GotoStatement
    | BranchStatement
    | ReturnStatement
    | ExpressionStatement

  DeclarationStatement
    = dim ListOf<identifier, ","> as type

  as
    = caseInsensitive<"AS">

  dim
    = caseInsensitive<"DIM">

  AssignmentStatement
    = let identifier "=" Expression

  let
    = caseInsensitive<"LET">

  GotoStatement
    = Goto

  goto
    = caseInsensitive<"GOTO">
  Goto
    = goto number

  BranchStatement
    = if Expression then Goto Else?

  if
    = caseInsensitive<"IF">
  then
    = caseInsensitive<"THEN">

  Else
    = caseInsensitive<"ELSE"> Goto

  keyword
    = if | then | goto

  ReturnStatement
    = caseInsensitive<"RETURN"> Expression

  ExpressionStatement
    = Expression
  /*
   * EXPRESSION
   */

  Expression
    = BitwiseORExpression

  /*
   * In precedence order
   */

  PrimaryExpression
    = "(" Expression ")" -- parenthesis
    | identifier "(" ListOf<Expression, ","> ")" -- call
    | number -- number
    | string -- string
    | identifier -- name

  UnaryIntExpression
    = "!" PrimaryExpression -- not
    | PrimaryExpression

  MultiplicativeExpression
    = MultiplicativeExpression "*" UnaryIntExpression -- mul
    | MultiplicativeExpression "/" UnaryIntExpression -- div
    | UnaryIntExpression

  AdditiveExpression
    = AdditiveExpression "+" MultiplicativeExpression -- add
    | AdditiveExpression "-" MultiplicativeExpression -- sub
    | AdditiveExpression "%" MultiplicativeExpression -- mod
    | MultiplicativeExpression

  ShiftExpression
    = ShiftExpression "<<" AdditiveExpression -- lsl
    | ShiftExpression ">>" AdditiveExpression -- lsr
    | AdditiveExpression

  RelationalExpression
    = RelationalExpression "<=" ShiftExpression -- le
    | RelationalExpression "<" ShiftExpression -- lt
    | RelationalExpression ">=" ShiftExpression -- ge
    | RelationalExpression ">" ShiftExpression -- gt
    | ShiftExpression

  EqualityExpression
    = EqualityExpression "==" RelationalExpression -- eq
    | EqualityExpression "!=" RelationalExpression -- ne
    | RelationalExpression

  BitwiseAndExpression
    = BitwiseAndExpression ("&&" | "&") EqualityExpression -- and
    | EqualityExpression

  BitwiseXORExpression
    = BitwiseXORExpression "^" BitwiseAndExpression -- xor
    | BitwiseAndExpression

  BitwiseORExpression
    = BitwiseORExpression ("||" | "|") BitwiseXORExpression -- or
    | BitwiseXORExpression

  FunctionCallExpression
    = identifier "(" ListOf<Expression, ","> ")"

  /*
   * BASE
   */

  //space += comment

  comment
    = singleLineComment
    | multiLineComment

  multiLineComment
    = "/*" (~"*/" any)* "*/"

  singleLineComment
    = "//" (~"\n" any)* ("\n"|end)

  string
    = "\"" notDoubleQuoteAny* "\""

  notDoubleQuoteAny
    = ~("\"") any

  type
    = "Uint64" | "String"

  identifier  (an identifier)
    = letter (alnum | "_")*

  number  (a number)
    = digit* "." digit+  -- fract
    | digit+             -- whole

}
`