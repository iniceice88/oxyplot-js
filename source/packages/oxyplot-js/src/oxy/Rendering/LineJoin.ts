/**
 * Defines how to join line segments.
 */
export enum LineJoin {
  /**
   * Line joins use regular angular vertices.
   */
  Miter,
  /**
   * Line joins use rounded vertices.
   */
  Round,
  /**
   * Line joins use beveled vertices.
   */
  Bevel,
}
