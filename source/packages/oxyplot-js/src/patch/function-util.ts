export function parseFunction(funStr: string): any {
  if (!funStr) return undefined
  if (funStr.includes('=>')) return new Function('return ' + funStr)()
  if (funStr.includes('function')) return new Function('return ' + funStr)()

  return undefined
}
