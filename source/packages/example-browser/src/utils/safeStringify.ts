function getCircularReplacer() {
  const ancestors: any[] = []
  return function (key: string, value: any) {
    if (typeof value !== 'object' || value === null) {
      return value
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    // @ts-ignore
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
      ancestors.pop()
    }
    if (ancestors.includes(value)) {
      return '[Circular]'
    }
    ancestors.push(value)
    return value
  }
}

export function safeStringify(obj: unknown, space?: string | number) {
  let finalObj = obj
  if (obj instanceof Error) {
    finalObj = {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
    }
  }
  return JSON.stringify(finalObj, getCircularReplacer(), space)
}
