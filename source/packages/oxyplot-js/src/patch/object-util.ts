export function isNull(v?: any): v is null {
  return v === null
}

export function isUndef(v?: any): v is undefined {
  return v === undefined
}

export function isNullOrUndef(v?: any): v is undefined | null {
  return v === null || v === undefined
}

export function removeProperties(obj: any, ...props: string[]) {
  if (!obj) return

  for (const prop of props) {
    delete obj[prop]
  }
}

export function getOrDefault<T>(obj: any, key: string | undefined, defaultVal?: T): T | undefined {
  if (!obj || !key) return defaultVal
  const val = obj[key]
  if (isNullOrUndef(val)) return defaultVal
  return val
}

interface RemoveUndefOpt {
  removeEmptyStr?: boolean
  removeNull?: boolean
  deep?: number
}

export function removeUndef<T>(obj: T, opt?: RemoveUndefOpt): T {
  const anyObj = obj as any

  if (Array.isArray(anyObj)) {
    anyObj.forEach((item) => removeUndef(item, opt))
    return obj
  }

  const finalOpt = Object.assign(
    {
      removeNull: true,
      removeEmptyStr: false,
      deep: 1
    } as RemoveUndefOpt,
    opt
  ) as Required<RemoveUndefOpt>

  Object.keys(anyObj).forEach((key) => {
    const val = anyObj[key]
    if (val === undefined) {
      delete anyObj[key]
      return
    }
    if (val === null && finalOpt.removeNull) {
      delete anyObj[key]
      return
    }
    if (finalOpt.removeEmptyStr && typeof val === 'string' && val.length == 0) {
      delete anyObj[key]
      return
    }
    if (typeof val === 'object' && finalOpt.deep > 1) {
      const subOpt = Object.assign({}, finalOpt, { deep: finalOpt.deep - 1 })
      removeUndef(val, subOpt)
      return
    }
  })

  return obj
}

export function hashCode(s: number[]) {
  let h = 0
  for (let i = 0; i < s.length; i++)
    h = Math.imul(31, h) + s[i]
  return h
}
