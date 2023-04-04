
export const HeaderRegExp = /(.*?)\n[\t\f ]*Function.*?End Function/smg;

export const HasFunctionRegExp = /^[\t\f ]*Function/gm;

export const FunctionRegExp =
/^[\t\f ]*Function[\t\f ]*(.*)\((.*)\)[\t\f ]*.*?[\t\f ]*(String|Uint64)[\t\f \n]+([^.$]*?)End Function/gm

export const CommentRegExp = /(\/{2}.*$)|(\/\*.*?\*\/)/gm

export const AnyMultilineCommentRegExp = /(?<!\/\/.*)(\/\*.*?\n(.*?|\n)+?\*\/)/g
export const MultilineCommentRegExp = /(^[\t\f ]*\d+)|(?:\/{2}.*$)|(?:\/\*.*?\*\/)|(\/\*.*?\n.*?\*\/)/gm;

export const ReturnStatementRegExp = /[\f\t ]*RETURN[\f\t ]*(.*)$/

export const PositiveLenghtWhiteSpaceRegExp = /[\t\f ]+/

export const FunctionCallRegExp = /\s*(?<name>.*?)\s*\(\s*(?<args>\s*.*\s*)\s*\)\s*$/gm

