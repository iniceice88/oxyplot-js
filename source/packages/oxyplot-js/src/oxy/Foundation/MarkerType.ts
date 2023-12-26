/**
 * Defines the marker type.
 */
export enum MarkerType {
  /**
   * Do not render markers.
   */
  None,

  /**
   * Render markers as circles.
   */
  Circle,

  /**
   * Render markers as squares.
   */
  Square,

  /**
   * Render markers as diamonds.
   */
  Diamond,

  /**
   * Render markers as triangles.
   */
  Triangle,

  /**
   * Render markers as crosses.
   * Note: this marker type requires the stroke color to be set.
   */
  Cross,

  /**
   * Renders markers as plus signs.
   * Note: this marker type requires the stroke color to be set.
   */
  Plus,

  /**
   * Renders markers as stars.
   * Note: this marker type requires the stroke color to be set.
   */
  Star,

  /**
   * Render markers by a custom shape (defined by outline).
   */
  Custom,
}
