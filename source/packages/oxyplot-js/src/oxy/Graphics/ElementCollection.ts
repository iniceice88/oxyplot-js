import type { Model } from '@/oxyplot'
import { Element } from '@/oxyplot'

export function newElementCollection<T extends Element>(parent: Model) {
  const array = [] as T[]
  return new Proxy(array, {
    deleteProperty: function (target, property) {
      const oldVal = target[property as any]
      if (oldVal && oldVal instanceof Element) {
        oldVal.parent = undefined
      }
      delete target[property as any]
      return true
    },
    set: function (target, property, value, receiver) {
      target[property as any] = value

      if (property === 'length') return true
      if (value && value instanceof Element) {
        value.parent = parent
      }
      return true
    },
  })
}
