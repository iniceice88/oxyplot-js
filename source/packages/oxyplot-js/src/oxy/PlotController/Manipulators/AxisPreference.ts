/**
 * Specifies which axis a manipulator will prefer to operate on.
 */
export enum AxisPreference {
  /**
   * Manipulation will not prefer a particular axis.
   */
  None,

  /**
   * Manipulation will prefer to operate on the X axis.
   */
  X,

  /**
   * Manipulation will prefer to operate on the Y axis.
   */
  Y,
}
