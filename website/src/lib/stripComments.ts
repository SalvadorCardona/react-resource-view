/**
 * A source file with its comments taken out.
 *
 * The site shows real files rather than snippets kept in step by hand, and
 * those files are commented for whoever maintains them. A reader looking at a
 * declaration is here to measure how little it takes, not to read the
 * reasoning behind it — so the reasoning is dropped on the way to the screen.
 */
export function stripComments(source: string): string {
  return (
    source
      // Block comments, JSDoc included.
      .replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\n/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Whole-line comments. An inline `//` inside a string would be a false
      // match, and none of these files has one.
      .replace(/^[ \t]*\/\/.*\n/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}
