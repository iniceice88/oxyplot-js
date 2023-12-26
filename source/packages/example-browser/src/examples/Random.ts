import { isNullOrUndef, isUndef } from 'oxyplot-js'

export class Random {
  constructor(seed?: number) {}

  next(min?: number, max?: number) {
    if (isUndef(min) && isUndef(max)) return Math.random()
    min = min || 0
    max = !isNullOrUndef(max) ? max : 1
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
