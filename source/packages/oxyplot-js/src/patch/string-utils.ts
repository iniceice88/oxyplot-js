export function trimString(input: string, val: string) {
  if (!input) return input
  return input.replace(new RegExp(`^${val}+|${val}+$`, 'g'), '')
}

export function substring(str: string, startIndex: number, length?: number) {
  if (length === undefined) return str.substring(startIndex)

  return str.substring(startIndex, startIndex + length)
}
