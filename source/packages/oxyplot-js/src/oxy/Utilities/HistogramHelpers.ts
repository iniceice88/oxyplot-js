import {
  BinningExtremeValueMode,
  BinningIntervalType,
  BinningOptions,
  BinningOutlierMode,
  HistogramItem,
} from '@/oxyplot'

/**
 * Provides methods to collect data samples into bins for use with a HistogramSeries.
 */
export class HistogramHelpers {
  /**
   * Generates a list of binCount bin breaks, uniformly distributed between start and end.
   * @param start The inclusive lower-bound of the first bin.
   * @param end The exclusive upper-bound of the last bin, which must be strictly greater than start.
   * @param binCount The number of bins to create.
   * @returns An array containing the breaks between bins of uniform size.
   */
  public static createUniformBins(start: number, end: number, binCount: number): number[] {
    if (binCount < 1) {
      throw new Error('The bin count must be positive.')
    }

    if (isNaN(start) || !isFinite(start)) {
      throw new Error('The start may not be NaN or infinite.')
    }

    if (isNaN(end) || !isFinite(end)) {
      throw new Error('The start may not be NaN or infinite.')
    }

    if (end <= start) {
      throw new Error('The end must be strictly greater than the start.')
    }

    const binBreaks: number[] = []

    binBreaks.push(start)

    for (let i = 1; i < binCount; i++) {
      binBreaks.push(start + ((end - start) * i) / binCount)
    }

    binBreaks.push(end)

    return binBreaks
  }

  /**
   * Collects samples into tightly packed bins (HistogramItem) defined by binBreaks.
   * @param samples The samples to collect into bins.
   * @param binBreaks The start and end values for the bins.
   * @param binningOptions The binning options to use.
   * @returns A list of HistogramItem corresponding to the generated bins with areas computed from the proportion of samples placed within.
   */
  public static collect(samples: number[], binBreaks: number[], binningOptions: BinningOptions): HistogramItem[] {
    if (!samples) {
      throw new Error('Samples cannot be undefined.')
    }

    if (!binBreaks) {
      throw new Error('Bin breaks cannot be undefined.')
    }

    if (!binningOptions) {
      throw new Error('Binning options cannot be undefined.')
    }

    // Order breaks and remove zero-width intervals.
    const orderedBreaks = Array.from(new Set(binBreaks)).sort((a, b) => a - b)

    if (orderedBreaks.length < 2) {
      throw new Error('At least 2 distinct bin breaks must be provided.')
    }

    if (orderedBreaks.some((d) => isNaN(d) || !isFinite(d))) {
      throw new Error('Bin breaks may not be NaN or infinite.')
    }

    // count and assign samples to bins
    const counts: number[] = new Array(orderedBreaks.length - 1).fill(0)
    let total = 0

    function compareNumber(a: number, b: number) {
      return a - b
    }

    for (const sample of samples) {
      if (isNaN(sample) || !isFinite(sample)) {
        throw new Error('Samples may not be NaN or infinite.')
      }

      let idx = HistogramHelpers.binarySearch(orderedBreaks, sample, compareNumber)

      //let idx = orderedBreaks.indexOf(sample)

      // records whether this sample was assigned to a bin
      let placed = false

      if (idx >= 0) {
        // exact match: idx is the index of the bin greater than the interval
        // place according to the binning options
        if (binningOptions.intervalType === BinningIntervalType.InclusiveUpperBound) {
          if (idx > 0) {
            counts[idx - 1] += 1
            placed = true
          } else if (binningOptions.extremeValuesMode === BinningExtremeValueMode.IncludeExtremeValues) {
            counts[idx] += 1
            placed = true
          }
        } else {
          if (idx < counts.length) {
            counts[idx] += 1
            placed = true
          } else if (binningOptions.extremeValuesMode === BinningExtremeValueMode.IncludeExtremeValues) {
            counts[idx - 1] += 1
            placed = true
          }
        }
      } else {
        // inexact match: place in lower bin
        idx = ~idx - 1

        if (idx >= 0 && idx < counts.length) {
          counts[idx] += 1
          placed = true
        }
      }

      if (placed) {
        total++
      } else {
        switch (binningOptions.outlierMode) {
          case BinningOutlierMode.RejectOutliers:
            throw new Error(`Sample with value ${sample} could not be assigned to any bin.`)
          case BinningOutlierMode.IgnoreOutliers:
            break
          case BinningOutlierMode.CountOutliers:
            total++
            break
        }
      }
    }

    // detect the case where there are no elements in the range
    if (total === 0) {
      // in this case, we set total to 1 so that all the areas end up as 0 rather than NaN
      total = 1
    }

    // create actual items
    const items: HistogramItem[] = []

    for (let i = 0; i < orderedBreaks.length - 1; i++) {
      const count = counts[i]
      items.push(new HistogramItem(orderedBreaks[i], orderedBreaks[i + 1], count / total, count))
    }

    return items
  }

  private static binarySearch<T>(arr: T[], el: T, compare_fn: (a: T, b: T) => number): number {
    let m = 0
    let n = arr.length - 1
    while (m <= n) {
      const k = (n + m) >> 1
      const cmp = compare_fn(el, arr[k])
      if (cmp > 0) {
        m = k + 1
      } else if (cmp < 0) {
        n = k - 1
      } else {
        return k
      }
    }
    return -m - 1
  }
}
