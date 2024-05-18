/**
 * Defines change types for the AxisChanged event.
 */
export enum AxisChangeTypes {
  /**
   * The axis was zoomed by the user.
   */
  Zoom,

  /**
   * The axis was panned by the user.
   */
  Pan,

  /**
   * The axis zoom/pan was reset by the user.
   */
  Reset,
}
