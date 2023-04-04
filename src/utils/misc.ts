import { PositiveLenghtWhiteSpaceRegExp } from "../lib/regexp";

export const splitLineNumber = (line: string) => true_split(line, PositiveLenghtWhiteSpaceRegExp, 1);

export function true_split(s: string, separator: string | RegExp, limit?: number): string[] {
    const regex = typeof separator === "string" ? new RegExp(separator) : separator;
    let count = 0;
    let match;
    let matches: string[] = [];
    while (match = regex.exec(s)) {
        if (limit && count++ >= limit) break;

        matches.push(s.slice(0, match.index));
        s = s.slice(match.index + match[0].length)
    }
    matches.push(s);

    return matches;

}