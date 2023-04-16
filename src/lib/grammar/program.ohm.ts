export default String.raw`
DVMProgram {

  /*
  * Program
  */

  Program
      = Program? FunctionDeclaration --function
      | Program? Comment  --comment
      
  
  
  Comment
      = singleLineComment
      | multilineComment
    
  singleLineComment = "//" (~"\n" any)*
      
  multilineComment = "/*" (~"*/" any)+ "*/"
  
  /*
   * Functions
   */

  FunctionDeclaration
    = FunctionHeader FunctionBody "End" "Function"
  
  FunctionHeader 
    = "Function" FunctionName "(" FunctionArgs ")" type

  FunctionName 
    = ident

  FunctionArgs 
    = ListOf<argumentDefinition, ",">
      
  argumentDefinition 
    = ident spaces type

  FunctionBody
    = (Line|Comment)*
    

  /*
  * Statements
  */

  lineNumber
    = digit+

  Line
    = multilineComment* lineNumber multilineComment* Statement? Comment*

  Statement 
    = ReturnStatement
    | DimStatement
    | LetStatement
    | ConditionStatement
    | ExpStatement

  ExpStatement
    = ~"End" Exp      
  
  ReturnStatement
    = "RETURN" Exp

  DimStatement 
    = "DIM" ListOf<ident, ","> type
    
  LetStatement 
    = "LET" ident "=" Exp

  ConditionStatement
    = "IF" Exp "THEN" Goto Else?
    
  Else 
    = "ELSE" Goto

  Goto 
    = "GOTO" lineNumber


  /*
   * Expressions
   */

  Exp
    = IdentFirstExp
    | FuncFirstExp
    | IntBinXOrExp
    | StrCmpExp 
    | StrCctExp

  
  //! Function on left hand
  FuncFirstExp =
    | FuncExp ("+" | strComparator) FuncExp --unknown
      | FuncExp ("+" | strComparator) ident --unknownIdent
    | FuncExp intComparator IntBinXOrExp --intCmp
    | FuncExp strComparator StrCctExp --strCmp
    | FuncExp "+" StrCctExp --strCct
    
  //! Identifier on left hand
  IdentFirstExp 
    = ident ("+" | strComparator) FuncExp --unknownFunc
    | ident ("+" | strComparator) ident --unknown
    | ident intComparator IntBinXOrExp --intCmp
    | ident strComparator StrCctExp --strCmp
    | ident "+" StrCctExp --strCct


  /* 
   * STRING Expressions
   */
  // String compare returns Int so it is not used in concat precedence but standalone
  //! Compare
  StrCmpExp 
    = StrCctExp strComparator StrCctExp 	-- cmp
    | StrCctExp

  strComparator = "==" | "!="

  //! Concat
  StrCctExp
    = StrCctExp "+" StrPriExp 	-- concat
  | StrPriExp
    
  StrCctStrictExp
    = StrCctExp "+" StrPriExp 	-- concat

  //! Priority 
  StrPriExp
    = FuncExp
    | ident -- name
    | string

  /*
   * INTEGER Expressions
   */
  
  //! Binary XOR
  IntBinXOrExp
    = IntBinXOrExp "^" IntBinOrExp -- xor
    | IntBinOrExp
  
  //! Binary OR
  IntBinOrExp
    = IntBinOrExp "|" IntBinAndExp -- or
    | IntBinAndExp
    
  //! Binary AND
  IntBinAndExp
    = IntBinAndExp "&" IntCmpExp -- and
    | IntCmpExp
    
    
  //! Integer Compare
  IntCmpExp
    = IntCmpExp intComparator IntBinSftExp -- cmp
    | IntBinSftExp

  intComparator = ">=" | "<=" | "<" | ">" | "==" | "!="

  //! Binary Shift
  IntBinSftExp
    = IntBinSftExp "<<" IntAddSubExp 	-- left
    | IntBinSftExp ">>" IntAddSubExp	-- right
    | IntAddSubExp

  
  //! Integer Add / Subtract
  IntAddSubExp
    = IntAddSubExp "+" IntModExp -- add
    | IntAddSubExp "-" IntModExp -- sub
    | IntModExp
  
  IntModExp
    = IntModExp "%" IntMulDivExp -- mod
    | IntMulDivExp
  
  
  //! Integer Multiply / Divide
  IntMulDivExp
    = IntMulDivExp "*" IntPriExp -- mul
    | IntMulDivExp "/" IntPriExp -- div
    | IntPriExp


  //! Priority
  IntPriExp
    = "(" IntBinXOrExp ")"  -- intPparenthesis
    | "(" StrCctStrictExp ")"  -- strParenthesis
    | "!" IntPriExp -- not
    | FuncExp
    | ident -- name
    | number

  /*
   * Function Call Expressions
   */
  //! Function
  FuncExp
    = ident "(" FuncArguments ")"

  FuncArguments
    = ListOf<Exp, ",">



  /*
   * BASE
   */
      
  string
    = "\"" doubleStringCharacter* "\""
  doubleStringCharacter 
    = ~("\"") any

  type
    = "Uint64" | "String"

  
  ident  (an identifier)
    = letter (alnum | "_")*

  number  (a number)
    = digit* "." digit+  -- fract
    | digit+             -- whole
}`