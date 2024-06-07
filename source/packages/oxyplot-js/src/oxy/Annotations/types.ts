/**
 * Specifies the layer for an Annotation.
 */
export enum AnnotationLayer {
  /**
   * Render the annotation below the gridlines of the axes.
   */
  BelowAxes,

  /**
   * Render the annotation below the series.
   */
  BelowSeries,

  /**
   * Render the annotation above the series.
   */
  AboveSeries,
}

/**
 * Specifies the orientation of the text in an annotation.
 */
export enum AnnotationTextOrientation {
  /**
   * Horizontal text.
   */
  Horizontal,

  /**
   * Vertical text.
   */
  Vertical,

  /**
   * Oriented along the line.
   */
  AlongLine,
}

/**
 * Defines the definition of function in a FunctionAnnotation.
 */
export enum FunctionAnnotationType {
  /**
   * Curve equation x=f(y) given by the Equation property
   */
  EquationX,
  /**
   * Curve equation y=f(x) given by the Equation property
   */
  EquationY,
}

/**
 * Specifies the definition of the line in a LineAnnotation.
 */
export enum LineAnnotationType {
  /**
   * Horizontal line given by the Y property
   */
  Horizontal,

  /**
   * Vertical line given by the X property
   */
  Vertical,

  /**
   * Linear equation y=mx+b given by the Slope and Intercept properties
   */
  LinearEquation,
}
