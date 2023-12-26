/** Specifies the behaviour for handling elements which cannot be assigned to any bin. */
export enum BinningOutlierMode {
  /** Throws an error if any element cannot be assigned to any bin. */
  RejectOutliers,

  /** Counts outliers when computing statistics. */
  IgnoreOutliers,

  /** Ignores outliers when computing statistics. */
  CountOutliers,
}

/** Specifies the type of bounds used for binning. */
export enum BinningIntervalType {
  /** Bins have an incusive lower bound. */
  InclusiveLowerBound,

  /** Bins have an incusive upper bound. */
  InclusiveUpperBound,
}

/** Specifies the behaviour for handing extreme values which would be excluded by an exclusive bound. */
export enum BinningExtremeValueMode {
  /** Extreme values should be excluded if they do not fall on an inclusive bound. */
  ExcludeExtremeValues,

  /** Extreme values should always be included. */
  IncludeExtremeValues,
}

/** Represents options for methods that perform binning. */
export class BinningOptions {
  /** Initializes a new instance of the BinningOptions class. */
  constructor(
    public readonly outlierMode: BinningOutlierMode,
    public readonly intervalType: BinningIntervalType,
    public readonly extremeValuesMode: BinningExtremeValueMode,
  ) {
    if (
      outlierMode !== BinningOutlierMode.RejectOutliers &&
      outlierMode !== BinningOutlierMode.CountOutliers &&
      outlierMode !== BinningOutlierMode.IgnoreOutliers
    ) {
      throw new Error('Unsupported binning outlier mode')
    }

    if (
      intervalType !== BinningIntervalType.InclusiveLowerBound &&
      intervalType !== BinningIntervalType.InclusiveUpperBound
    ) {
      throw new Error('Unsupported bin interval type')
    }

    if (
      extremeValuesMode !== BinningExtremeValueMode.ExcludeExtremeValues &&
      extremeValuesMode !== BinningExtremeValueMode.IncludeExtremeValues
    ) {
      throw new Error('Unsupported bin interval type')
    }
  }
}
