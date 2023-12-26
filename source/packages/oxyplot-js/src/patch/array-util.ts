export function groupBy<T, K extends keyof T>(items: Array<T>, key: K): Map<T[K], Array<T>> {
  return groupBy2(items, (item) => item[key])
}

export function groupBy2<T, K>(items: Array<T>, getKey: (item: T) => K): Map<K, Array<T>> {
  return items.reduce((map, item) => {
    const propValue = getKey(item)
    let itemsByKey = map.get(propValue)
    if (!itemsByKey) {
      itemsByKey = [item]
      map.set(propValue, itemsByKey)
    } else {
      itemsByKey.push(item)
    }
    return map
  }, new Map<K, Array<T>>())
}

export function indexOfAny<T>(array: T[], anyOf: T[], startIndex: number = 0): number {
  for (let i = startIndex; i < array.length; i++) {
    if (anyOf.includes(array[i])) {
      return i
    }
  }
  return -1
}

export function sortArray<T, K extends keyof T>(ary: T[], orders: [K, 'ASC' | 'DESC'][]) {
  const compare = (a: T, b: T, key: K, order: 'ASC' | 'DESC') => {
    if (a[key] > b[key]) {
      return order.toUpperCase() == 'DESC' ? -1 : 1
    }
    if (a[key] < b[key]) {
      return order.toUpperCase() == 'DESC' ? 1 : -1
    }
    return 0
  }
  return [...ary].sort((a, b) => {
    for (const k of orders) {
      const res = compare(a, b, k[0], k[1])
      if (res !== 0) return res
    }

    return 0
  })
}

export function sortDesc<T, K extends keyof T>(ary: T[], key: K): T[] {
  return sortArray(ary, [[key, 'DESC']])
}

export function create2DArray<T>(h: number, w: number, def?: T) {
  const array = Array(h)
  for (let i = 0; i < h; i++) {
    array[i] = new Array(w)

    if (def !== undefined) array[i].fill(def)
  }
  return array
}

export function arrayRemoveFirst<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item)
  if (index > -1) {
    array.splice(index, 1)
    return true
  }
  return false
}

export function arrayRemoveIf<T>(array: T[], filter: (item: T) => boolean): number {
  let removed = 0
  for (let i = array.length - 1; i >= 0; i--) {
    if (filter(array[i])) {
      array.splice(i, 1)
      removed++
    }
  }
  return removed
}

export function pushMany<T>(target: T[], source: T[]) {
  for (let i = 0; i < source.length; i++) {
    target.push(source[i])
  }
}

export function getReversedCopy<T>(array: T[]) {
  if (!array || array.length === 0) return []

  const arrayToReverse: T[] = []
  pushMany(arrayToReverse, array)
  return arrayToReverse.reverse()
}

/**
 * avoid `Maximum call stack size exceeded` error
 */
export function maxValueOfArray(numbers: number[], ...otherNumbers: number[]) {
  let max1 = 0
  if (numbers.length >= 100_000) {
    max1 = numbers.reduce(function (a, b) {
      return Math.max(a, b)
    })
  } else {
    max1 = Math.max.apply(null, numbers)
  }

  if (!otherNumbers || otherNumbers.length === 0) {
    return max1
  }
  return Math.max(max1, ...otherNumbers)
}

/**
 * avoid `Maximum call stack size exceeded` error
 */
export function minValueOfArray(numbers: number[], ...otherNumbers: number[]) {
  let min1 = 0
  if (numbers.length >= 100_000) {
    min1 = numbers.reduce(function (a, b) {
      return Math.min(a, b)
    })
  } else {
    min1 = Math.min.apply(null, numbers)
  }

  if (!otherNumbers || otherNumbers.length === 0) {
    return min1
  }
  return Math.min(min1, ...otherNumbers)
}
