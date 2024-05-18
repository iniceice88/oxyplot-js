import {
  Axis,
  AxisChangeTypes,
  AxisUtilities,
  type CreateAxisOptions,
  ExtendedDefaultAxisOptions,
  type ScreenPoint,
  type TickValuesType,
} from '@/oxyplot'
import { assignObject, isInfinity, isNaNOrUndef, log, round } from '@/patch'

export interface CreateLogarithmicAxisOptions extends CreateAxisOptions {
  base?: number
  powerPadding?: boolean
}

export const DefaultLogarithmicAxisOptions: CreateLogarithmicAxisOptions = {
  base: 10,
  powerPadding: true,
  filterMinValue: 0,
} as const

export const ExtendedDefaultLogarithmicAxisOptions = {
  ...ExtendedDefaultAxisOptions,
  ...DefaultLogarithmicAxisOptions,
}

/**
 * Represents an axis with logarithmic scale.
 * @see {@link http://en.wikipedia.org/wiki/Logarithmic_scale}
 */
export class LogarithmicAxis extends Axis {
  /**
   * The logarithmic base (normally 10).
   */
  public base: number = DefaultLogarithmicAxisOptions.base!

  /**
   * A value indicating whether the actualMaximum and actualMinimum values should be padded to the nearest power of the Base.
   */
  public powerPadding: boolean = DefaultLogarithmicAxisOptions.powerPadding!

  /**
   * The logarithmic actual maximum value of the axis.
   */
  protected actualLogMaximum: number = 0

  /**
   * The logarithmic actual minimum value of the axis.
   */
  protected actualLogMinimum: number = 0

  /**
   * The logarithmic clip maximum value of the axis.
   */
  protected logClipMaximum: number = 0

  /**
   * The logarithmic clip minimum value of the axis.
   */
  protected logClipMinimum: number = 0

  /**
   * Initializes a new instance of the LogarithmicAxis class.
   */
  constructor(opt?: CreateLogarithmicAxisOptions) {
    super(opt)
    assignObject(this, DefaultLogarithmicAxisOptions, opt)
  }

  getElementName() {
    return 'LogarithmicAxis'
  }

  /**
   * Gets the coordinates used to draw ticks and tick labels (numbers or category names).
   */
  public getTickValues(): TickValuesType {
    let majorTickValues: number[] = []
    let majorLabelValues: number[] = []
    let minorTickValues: number[] = []

    // For easier readability, the nomenclature of this function and all related functions assumes a base of 10, and therefore uses the
    // term "decade". However, the code supports all other bases as well.
    const logBandwidth = Math.abs(this.logClipMaximum - this.logClipMinimum)
    const axisBandwidth = Math.abs(
      this.isVertical() ? this.screenMax.y - this.screenMin.y : this.screenMax.x - this.screenMin.x,
    )

    const desiredNumberOfTicks = axisBandwidth / this.intervalLength
    const ticksPerDecade = desiredNumberOfTicks / logBandwidth
    const logDesiredStepSize = 1.0 / Math.floor(ticksPerDecade)

    const intBase = Math.round(this.base)

    if (ticksPerDecade < 0.75) {
      // Major Ticks every few decades (increase in powers of 2), up to eight minor tick subdivisions
      const decadesPerMajorTick = Math.pow(2, Math.ceil(Math.log(1 / ticksPerDecade) / Math.log(2)))
      majorTickValues = this.decadeTicks(decadesPerMajorTick)
      minorTickValues = this.decadeTicks(Math.ceil(decadesPerMajorTick / 8.0))
    } else if (Math.abs(this.base - intBase) > 1e-10) {
      // fractional Base, best guess: naively subdivide decades
      majorTickValues = this.decadeTicks(logDesiredStepSize)
      minorTickValues = this.decadeTicks(0.5 * logDesiredStepSize)
    } else if (ticksPerDecade < 2) {
      // Major Ticks at every decade, Minor Ticks at fractions (not for fractional base)
      majorTickValues = this.decadeTicks()
      minorTickValues = this.subdividedDecadeTicks()
    } else if (ticksPerDecade > this.base * 1.5) {
      // Fall back to linearly distributed tick values
      return super.getTickValues()
    } else {
      // use subdivided decades as major candidates
      const logMajorCandidates = this.logSubdividedDecadeTicks(false)

      if (logMajorCandidates.length < 2) {
        // this should usually not be the case, but if for some reason we should happen to have too few candidates, fall back to linear ticks
        return super.getTickValues()
      }

      // check for large candidate intervals; if there are any, subdivide with minor ticks
      const logMinorCandidates = this.logCalculateMinorCandidates(logMajorCandidates, logDesiredStepSize)

      // use all minor tick candidates that are in the axis range
      minorTickValues = this.powList(logMinorCandidates, true)

      // find suitable candidates for every desired major step
      majorTickValues = this.alignTicksToCandidates(logMajorCandidates, logDesiredStepSize)
    }

    majorLabelValues = majorTickValues
    minorTickValues = AxisUtilities.filterRedundantMinorTicks(majorTickValues, minorTickValues)

    return {
      majorLabelValues,
      majorTickValues,
      minorTickValues,
    }
  }

  /**
   * Determines whether the axis is used for X/Y values.
   * @returns true if it is an XY axis; otherwise, false.
   */
  public isXyAxis(): boolean {
    return true
  }

  /**
   * Determines whether the axis is logarithmic.
   * @returns true if it is a logarithmic axis; otherwise, false.
   */
  public isLogarithmic(): boolean {
    return true
  }

  /**
   * Pans the specified axis.
   * @param ppt The previous point (screen coordinates).
   * @param cpt The current point (screen coordinates).
   */
  public pan(ppt: ScreenPoint, cpt: ScreenPoint): void {
    if (!this.isPanEnabled) {
      return
    }

    const isHorizontal = this.isHorizontal()

    const x0 = this.inverseTransform(isHorizontal ? ppt.x : ppt.y)
    const x1 = this.inverseTransform(isHorizontal ? cpt.x : cpt.y)

    if (Math.abs(x1) <= 0) {
      return
    }

    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const dx = x0 / x1

    let newMinimum = this.actualMinimum * dx
    let newMaximum = this.actualMaximum * dx
    if (newMinimum < this.absoluteMinimum) {
      newMinimum = this.absoluteMinimum
      newMaximum = (newMinimum * this.actualMaximum) / this.actualMinimum
    }

    if (newMaximum > this.absoluteMaximum) {
      newMaximum = this.absoluteMaximum
      newMinimum = (newMaximum * this.actualMinimum) / this.actualMaximum
    }

    this.viewMinimum = newMinimum
    this.viewMaximum = newMaximum

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({ changeType: AxisChangeTypes.Pan, deltaMinimum, deltaMaximum })
  }

  /**
   * Inverse transforms the specified screen coordinate. This method can only be used with non-polar coordinate systems.
   * @param sx The screen coordinate.
   * @returns The value.
   */
  public inverseTransform(sx: number): number {
    // Inline the PostInverseTransform method here.
    return this.postInverseTransform(sx / this.scale + this.offset)
  }

  /**
   * Transforms the specified coordinate to screen coordinates.
   * @param x The value.
   * @returns The transformed value (screen coordinate).
   */
  public transform(x: number): number {
    if (x <= 0) {
      return -1
    }

    // Inline the PreTransform method here.
    return (this.preTransform(x) - this.offset) * this.scale
  }

  /**
   * Zooms the axis at the specified coordinate.
   * @param factor The zoom factor.
   * @param x The coordinate to zoom at.
   */
  public zoomAt(factor: number, x: number): void {
    if (!this.isZoomEnabled) {
      return
    }

    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const px = this.preTransform(x)
    const dx0 = this.preTransform(this.actualMinimum) - px
    const dx1 = this.preTransform(this.actualMaximum) - px
    const newViewMinimum = this.postInverseTransform(dx0 / factor + px)
    const newViewMaximum = this.postInverseTransform(dx1 / factor + px)

    const newMinimum = Math.max(newViewMinimum, this.absoluteMinimum)
    const newMaximum = Math.min(newViewMaximum, this.absoluteMaximum)

    this.viewMinimum = newMinimum
    this.viewMaximum = newMaximum
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({ changeType: AxisChangeTypes.Zoom, deltaMinimum, deltaMaximum })
  }

  /**
   * Raises all elements of a List to the power of this.base.
   * @param logInput The input values.
   * @param clip If true, discards all values that are not in the axis range.
   * @returns A new array containing the resulting values.
   * @internal
   */
  protected powList(logInput: number[], clip = false): number[] {
    return logInput
      .filter((item) => !clip || !(item < this.logClipMinimum))
      .filter((item) => !clip || !(item > this.logClipMaximum))
      .map((item) => Math.pow(this.base, item))
  }

  /**
   * Applies the logarithm with this.base to all elements of a List.
   * @param input The input values.
   * @param clip If true, discards all values that are not in the axis range.
   * @returns A new array containing the resulting values.
   * @internal
   */
  protected logList(input: number[], clip = false): number[] {
    return input
      .filter((item) => !clip || !(item < this.clipMinimum))
      .filter((item) => !clip || !(item > this.clipMaximum))
      .map((item) => Math.log(item) / Math.log(this.base))
  }

  /**
   * Calculates ticks of the decades in the axis range with a specified step size.
   * @param step The step size.
   * @returns A new array containing the decade ticks.
   * @internal
   */
  protected decadeTicks(step = 1): number[] {
    return this.powList(this.logDecadeTicks(step))
  }

  /**
   * Calculates logarithmic ticks of the decades in the axis range with a specified step size.
   * @param step The step size.
   * @returns A new array containing the logarithmic decade ticks.
   * @internal
   */
  protected logDecadeTicks(step: number = 1): number[] {
    const ret: number[] = []
    if (step <= 0) {
      return ret
    }

    let last = Number.NaN
    for (let exponent = Math.ceil(this.logClipMinimum); exponent <= this.logClipMaximum; exponent += step) {
      if (exponent <= last) {
        break
      }

      last = exponent
      if (exponent >= this.logClipMinimum) {
        ret.push(exponent)
      }
    }

    return ret
  }

  /**
   * Calculates logarithmic ticks of all decades in the axis range and their subdivisions.
   * @param clip If true (default), the lowest and highest decade are clipped to the axis range.
   * @returns A new array containing the logarithmic decade ticks.
   * @internal
   */
  protected logSubdividedDecadeTicks(clip: boolean = true): number[] {
    return this.logList(this.subdividedDecadeTicks(clip))
  }

  /**
   * Calculates ticks of all decades in the axis range and their subdivisions.
   * @param clip If true (default), the lowest and highest decade are clipped to the axis range.
   * @returns A new array containing the decade ticks.
   * @internal
   */
  protected subdividedDecadeTicks(clip: boolean = true): number[] {
    const ret: number[] = []
    for (let exponent = Math.floor(this.logClipMinimum); ; exponent++) {
      if (exponent > this.logClipMaximum) {
        break
      }

      const currentDecade = Math.pow(this.base, exponent)
      for (let mantissa = 1; mantissa < this.base; mantissa++) {
        const currentValue = currentDecade * mantissa
        if (clip && currentValue < this.clipMinimum) {
          continue
        }

        if (clip && currentValue > this.clipMaximum) {
          break
        }

        ret.push(currentDecade * mantissa)
      }
    }

    return ret
  }

  /**
   * Chooses from a list of candidates so that the resulting array matches the logDesiredStepSize as far as possible.
   * @param logCandidates The candidates.
   * @param logDesiredStepSize The desired logarithmic step size.
   * @returns A new array containing the chosen candidates.
   * @internal
   */
  protected alignTicksToCandidates(logCandidates: number[], logDesiredStepSize: number): number[] {
    return this.powList(this.logAlignTicksToCandidates(logCandidates, logDesiredStepSize))
  }

  /**
   * Chooses from a list of candidates so that the resulting array matches the logDesiredStepSize as far as possible.
   * @param logCandidates The candidates.
   * @param logDesiredStepSize The desired logarithmic step size.
   * @returns A new array containing the chosen logarithmic candidates.
   * @internal
   */
  protected logAlignTicksToCandidates(logCandidates: number[], logDesiredStepSize: number): number[] {
    const ret: number[] = []

    let candidateOffset = 1
    let logPreviousMajorTick = Number.NaN

    // loop through all desired steps and find a suitable candidate for each of them
    for (let d = Math.floor(this.logClipMinimum); ; d += logDesiredStepSize) {
      if (d < this.logClipMinimum - logDesiredStepSize) {
        continue
      }

      if (d > this.logClipMaximum + logDesiredStepSize) {
        break
      }

      // find closest candidate
      while (candidateOffset < logCandidates.length - 1 && logCandidates[candidateOffset] < d) {
        candidateOffset++
      }

      const logNewMajorTick =
        Math.abs(logCandidates[candidateOffset] - d) < Math.abs(logCandidates[candidateOffset - 1] - d)
          ? logCandidates[candidateOffset]
          : logCandidates[candidateOffset - 1]

      // don't add duplicates
      if (
        logNewMajorTick != logPreviousMajorTick &&
        logNewMajorTick >= this.logClipMinimum &&
        logNewMajorTick <= this.logClipMaximum
      ) {
        ret.push(logNewMajorTick)
      }

      logPreviousMajorTick = logNewMajorTick
    }

    return ret
  }

  /**
   * Calculates minor tick candidates for a given set of major candidates.
   * @param logMajorCandidates The major candidates.
   * @param logDesiredMajorStepSize The desired major step size.
   * @returns A new array containing the minor candidates.
   * @internal
   */
  protected logCalculateMinorCandidates(logMajorCandidates: number[], logDesiredMajorStepSize: number): number[] {
    const ret: number[] = []

    for (let c = 1; c < logMajorCandidates.length; c++) {
      const previous = logMajorCandidates[c - 1]
      const current = logMajorCandidates[c]

      if (current < this.logClipMinimum) {
        continue
      }

      if (previous > this.logClipMaximum) {
        break
      }

      const stepSizeRatio = (current - previous) / logDesiredMajorStepSize
      if (stepSizeRatio > 2) {
        // Step size is too large... subdivide with minor ticks
        this.logSubdivideInterval(ret, this.base, previous, current)
      }

      ret.push(current)
    }

    return ret
  }

  /**
   * Subdivides a logarithmic range into multiple, evenly-spaced (in linear scale!) ticks. The number of ticks and the tick intervals are adapted so
   * that the resulting steps are "nice" numbers.
   * @param logTicks The array the computed steps will be added to.
   * @param steps The minimum number of steps.
   * @param logFrom The start of the range.
   * @param logTo The end of the range.
   * @internal
   */
  protected logSubdivideInterval(logTicks: number[], steps: number, logFrom: number, logTo: number): void {
    let actualNumberOfSteps = 1
    const intBase = Math.round(this.base)

    // first, determine actual number of steps that gives a "nice" step size
    if (steps < 2) {
      // No Subdivision
      return
    }

    if (Math.abs(this.base - intBase) > this.base * 1e-10) {
      // fractional Base; just make a linear subdivision
      actualNumberOfSteps = Math.round(steps)
    } else if ((intBase & (intBase - 1)) == 0) {
      // base is a power of 2; use a power of 2 for the stepsize
      while (actualNumberOfSteps < steps) {
        actualNumberOfSteps *= 2
      }
    } else {
      // integer base, no power of two

      // for bases != 10, first subdivide by the base
      if (intBase != 10) {
        actualNumberOfSteps = intBase
      }

      // follow 1-2-5-10 pattern
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (actualNumberOfSteps >= steps) {
          break
        }

        actualNumberOfSteps *= 2

        if (actualNumberOfSteps >= steps) {
          break
        }

        actualNumberOfSteps = Math.round(actualNumberOfSteps * 2.5)

        if (actualNumberOfSteps >= steps) {
          break
        }

        actualNumberOfSteps *= 2
      }
    }

    const from = Math.pow(this.base, logFrom)
    const to = Math.pow(this.base, logTo)

    // subdivide with the actual number of steps
    for (let c = 1; c < actualNumberOfSteps; c++) {
      const newTick = c / actualNumberOfSteps
      const logNewTick = Math.log(from + (to - from) * newTick) / Math.log(this.base)

      logTicks.push(logNewTick)
    }
  }

  /**
   * Updates the actualMaximum and actualMinimum values.
   * If the user has zoomed/panned the axis, the internal viewMaximum/viewMinimum
   * values will be used. If maximum or minimum have been set, these values will be used. Otherwise the maximum and minimum values
   * of the series will be used, including the 'padding'.
   * @internal
   */
  updateActualMaxMin(): void {
    if (this.powerPadding) {
      const logBase = Math.log(this.base)
      const e0 = Math.floor(Math.log(this.actualMinimum) / logBase)
      const e1 = Math.ceil(Math.log(this.actualMaximum) / logBase)
      if (!isNaN(this.actualMinimum)) {
        this.actualMinimum = round(Math.exp(e0 * logBase), 14)
      }

      if (!isNaN(this.actualMaximum)) {
        this.actualMaximum = round(Math.exp(e1 * logBase), 14)
      }
    }

    super.updateActualMaxMin()

    if (this.actualMinimum <= 0) {
      this.actualMinimum = 0.1
    }
  }

  /**
   * Invoked when actualMinimum, actualMaximum, clipMinimum, and clipMaximum are changed.
   */
  protected actualMaximumAndMinimumChangedOverride(): void {
    this.actualLogMinimum = this.preTransform(this.actualMinimum)
    this.actualLogMaximum = this.preTransform(this.actualMaximum)
    this.logClipMinimum = this.preTransform(this.clipMinimum)
    this.logClipMaximum = this.preTransform(this.clipMaximum)
  }

  /**
   * Applies a transformation after the inverse transform of the value. This is used in logarithmic axis.
   * @param x The value to transform.
   * @returns The transformed value.
   */
  protected postInverseTransform(x: number): number {
    return Math.pow(this.base, x)
  }

  /**
   * Applies a transformation before the transform the value. This is used in logarithmic axis.
   * @param x The value to transform.
   * @returns The transformed value.
   */
  protected preTransform(x: number): number {
    if (x <= 0) {
      throw new Error('Value should be positive.')
    }

    return x <= 0 ? 0 : log(x, this.base)
  }

  /**
   * Coerces the actual maximum and minimum values.
   */
  protected coerceActualMaxMin(): void {
    if (isNaN(this.actualMinimum) || isInfinity(this.actualMinimum)) {
      this.actualMinimum = 1
    }

    if (this.actualMinimum <= 0) {
      this.actualMinimum = 1
    }

    if (this.actualMaximum <= this.actualMinimum) {
      this.actualMaximum = this.actualMinimum * 100
    }

    super.coerceActualMaxMin()
  }

  /**
   * Calculates the actual maximum value of the axis, including the maximumPadding.
   * @returns The new actual maximum value of the axis.
   * Must be called before calculateActualMinimum
   */
  protected calculateActualMaximum(): number {
    let actualMaximum = this.dataMaximum
    const range = this.dataMaximum - this.dataMinimum

    if (range < Number.EPSILON) {
      const zeroRange = this.dataMaximum > 0 ? this.dataMaximum : 1
      actualMaximum += zeroRange * 0.5
    }

    if (!isNaNOrUndef(this.dataMinimum) && !isNaNOrUndef(actualMaximum)) {
      const x1 = actualMaximum
      const x0 = this.dataMinimum
      return Math.pow(x1, this.maximumPadding + 1) * (x0 > Number.EPSILON ? Math.pow(x0, -this.maximumPadding) : 1)
    }

    return actualMaximum
  }

  /**
   * Calculates the actual minimum value of the axis, including the minimumPadding.
   * @returns The new actual minimum value of the axis.
   * Must be called after calculateActualMaximum
   */
  protected calculateActualMinimum(): number {
    let actualMinimum = this.dataMinimum
    const range = this.dataMaximum - this.dataMinimum

    if (range < Number.EPSILON) {
      const zeroRange = this.dataMaximum > 0 ? this.dataMaximum : 1
      actualMinimum -= zeroRange * 0.5
    }

    if (!isNaN(this.actualMaximum)) {
      // For the padding on the min value it is very similar to the calculation mentioned in
      // calculateActualMaximum. However, since this is called after calculateActualMaximum,
      // we no longer know x_1.
      //  x_3       x_0          x_1      x_2
      //   |---------|------------|--------|
      // log(x_3) log(x_0)       log(x_1) log(x_2)
      // where actualMinimum = x_3
      // log(x_0) - log(x_3) = padding * [log(x_1) - log(x_0)]
      // from calculateActualMaximum we can use
      // log(x_1) = [log(x_2) + max_padding * log(x_0)] / (1 + max_padding)
      // x_3 = x_0^[1 + padding - padding * max_padding / (1 + max_padding)] * x_2^[-padding / (1 + max_padding)]

      const x1 = this.actualMaximum
      const x0 = actualMinimum
      const existingPadding = this.maximumPadding
      return (
        Math.pow(x0, 1 + this.minimumPadding - (this.minimumPadding * existingPadding) / (1 + existingPadding)) *
        Math.pow(x1, -this.minimumPadding / (1 + existingPadding))
      )
    }

    return actualMinimum
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLogarithmicAxisOptions
  }
}
