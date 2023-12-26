export function getEnumName(e: any, value: number) {
  return e[value]
}

export function getEnumKeys(e: any) {
  return Object.keys(e)
    .filter(k => typeof e[k as any] !== 'number')
    .map(k => Number(k))
}

export function getEnumNames(e: any) {
  return Object.keys(e)
    .filter(k => typeof e[k as any] === 'number')
}
