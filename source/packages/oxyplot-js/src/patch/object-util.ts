import { parseFunction } from './function-util'

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
  if (isUndef(obj)) return obj
  const anyObj = obj as any

  if (Array.isArray(anyObj)) {
    anyObj.forEach((item) => removeUndef(item, opt))
    return obj
  }

  const finalOpt = Object.assign(
    {
      removeNull: false,
      removeEmptyStr: false,
      deep: 1,
    } as RemoveUndefOpt,
    opt,
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
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s[i]
  return h
}

interface CopyPropertiesOptions {
  filter?: (key: string, val: unknown) => boolean
  excludeDefault?: boolean
}

export function copyProperties<T>(obj: T, def?: any, opt?: CopyPropertiesOptions): any {
  const finalOpt: any = {}
  const anyObj = obj as any

  function filter(key: string, val: any) {
    if (!opt) return true
    if (def && opt.excludeDefault === true && isDeepEqual(val, def[key])) return false

    if (opt.filter) {
      return opt.filter(key, val)
    }
    return true
  }

  Object.keys(anyObj).forEach((key) => {
    const val = anyObj[key]
    if (val === undefined) return
    if (!filter(key, val)) return
    if (typeof val === 'function') {
      // only serialize the formatter functions
      if (!key.includes('Formatter')) {
        return
      }
      finalOpt[key] = String(val)
      return
    }
    finalOpt[key] = val
  })

  return finalOpt
}

export interface CopyPlotElementProperties {
  excludeKeys?: string[]
  filter?: (key: string, val: unknown) => boolean
  excludeDefault?: boolean
}

export function copyPlotElementProperties(obj: any, def?: any, opt?: CopyPlotElementProperties) {
  return copyProperties(obj, def, {
    filter: (key, val) => {
      if (opt?.filter) {
        const result = opt.filter(key, val)
        if (result !== undefined) return result
        // keep filter if returns undefined
      }
      if (key.startsWith('__') && key.endsWith('__')) return true
      if (key.startsWith('_')) return false
      if (key.startsWith('actual')) return false
      if (opt?.excludeKeys?.includes(key)) return false
      return true
    },
    excludeDefault: opt?.excludeDefault ?? true,
  })
}

const toString = (v: any) => Object.prototype.toString.call(v)

function getTypeName(v: any) {
  if (v === null) return 'null'
  const type = toString(v).slice(8, -1).toLowerCase()
  return typeof v === 'object' || typeof v === 'function' ? type : typeof v
}

export function isDeepEqual(value1: any, value2: any): boolean {
  if (value1 === value2) return true
  const type1 = getTypeName(value1)
  const type2 = getTypeName(value2)
  if (type1 !== type2) return false

  if (type1 === 'array') {
    if (value1.length !== value2.length) return false

    return value1.every((item: any, i: number) => {
      return isDeepEqual(item, value2[i])
    })
  }
  if (type1 === 'object') {
    const keyArr = Object.keys(value1)
    if (keyArr.length !== Object.keys(value2).length) return false

    return keyArr.every((key: string) => {
      return isDeepEqual(value1[key], value2[key])
    })
  }
  return Object.is(value1, value2)
}

export function assignObject(target: any, template: any, source: any, opt?: { exclude?: string[] }) {
  const sources = (Array.isArray(source) ? source : [source]).filter((s) => s)
  sources.unshift(template)
  sources.reverse()

  const keysToCopy = Object.keys(template)
  for (const key of keysToCopy) {
    if (opt?.exclude?.includes(key)) continue

    const desc = Object.getOwnPropertyDescriptor(target, key)
    if (desc === undefined || !desc.writable) {
      continue
    }

    for (const s of sources) {
      const value = s[key]
      if (value === undefined) continue
      const isTemplate = s === template
      if (!isTemplate) {
        target[key] = value
      } else {
        const valueType = getTypeName(value)
        if (valueType === 'array' || valueType === 'object') {
          target[key] = shallowCopy(value)
        } else {
          target[key] = value
        }
      }
      break
    }
  }

  return target
}

export function assignMethod<T>(target: T, methodName: keyof T, opt: any, removeAfterAssign = false) {
  if (!target || !methodName || !opt) return
  const anyTarget = target as any
  const method = opt[methodName]
  if (!method) return

  if (typeof method === 'function') {
    anyTarget[methodName] = method
    if (removeAfterAssign) delete opt[methodName]
    return
  }
  if (typeof method === 'string') {
    anyTarget[methodName] = parseFunction(method)
    if (removeAfterAssign) delete opt[methodName]
    return
  }
  throw new Error(`Invalid method type: ${method}`)
}

function shallowCopy(obj: any) {
  if (Array.isArray(obj)) return Array.from(obj)
  return Object.assign({}, obj)
}
