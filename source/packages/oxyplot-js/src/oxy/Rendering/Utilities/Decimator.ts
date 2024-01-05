import { newScreenPoint, ScreenPoint } from '@/oxyplot'

/**
 * Provides functionality to decimate lines.
 */
export class Decimator {
  /**
   * Decimates lines by reducing all points that have the same integer x value to a maximum of 4 points (first, min, max, last).
   * @param input The input points.
   * @param output The decimated points.
   */
  public static decimate(input: ScreenPoint[], output: ScreenPoint[]): void {
    if (input === undefined || input.length === 0) {
      return
    }

    let point = input[0]
    let currentX = Math.round(point.x)
    let currentMinY = Math.round(point.y)
    let currentMaxY = currentMinY
    let currentFirstY = currentMinY
    let currentLastY = currentMinY
    for (let i = 1; i < input.length; ++i) {
      point = input[i]
      const newX = Math.round(point.x)
      const newY = Math.round(point.y)
      if (newX !== currentX) {
        Decimator.addVerticalPoints(output, currentX, currentFirstY, currentLastY, currentMinY, currentMaxY)
        currentFirstY = currentLastY = currentMinY = currentMaxY = newY
        currentX = newX
        continue
      }

      if (newY < currentMinY) {
        currentMinY = newY
      }

      if (newY > currentMaxY) {
        currentMaxY = newY
      }

      currentLastY = newY
    }

    // Keep from adding an extra point for last
    currentLastY = currentFirstY === currentMinY ? currentMaxY : currentMinY
    Decimator.addVerticalPoints(output, currentX, currentFirstY, currentLastY, currentMinY, currentMaxY)
  }

  /**
   * Adds vertical points to the result list.
   * @param result The result.
   * @param x The x coordinate.
   * @param firstY The first y.
   * @param lastY The last y.
   * @param minY The minimum y.
   * @param maxY The maximum y.
   */
  private static addVerticalPoints(
    result: ScreenPoint[],
    x: number,
    firstY: number,
    lastY: number,
    minY: number,
    maxY: number,
  ): void {
    result.push(newScreenPoint(x, firstY))
    if (firstY === minY) {
      if (minY !== maxY) {
        result.push(newScreenPoint(x, maxY))
      }

      if (maxY !== lastY) {
        result.push(newScreenPoint(x, lastY))
      }

      return
    }

    if (firstY === maxY) {
      if (maxY !== minY) {
        result.push(newScreenPoint(x, minY))
      }

      if (minY !== lastY) {
        result.push(newScreenPoint(x, lastY))
      }

      return
    }

    if (lastY === minY) {
      if (minY !== maxY) {
        result.push(newScreenPoint(x, maxY))
      }
    } else if (lastY === maxY) {
      if (maxY !== minY) {
        result.push(newScreenPoint(x, minY))
      }
    } else {
      result.push(newScreenPoint(x, minY))
      result.push(newScreenPoint(x, maxY))
    }
    result.push(newScreenPoint(x, lastY))
  }
}
