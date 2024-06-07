/**
 * Defines the cursor type.
 */
export enum CursorType {
  /**
   * The default cursor
   */
  Default = 0,

  /**
   * The pan cursor
   */
  Pan,

  /**
   * The zoom rectangle cursor
   */
  ZoomRectangle,

  /**
   * The horizontal zoom cursor
   */
  ZoomHorizontal,

  /**
   * The vertical zoom cursor
   */
  ZoomVertical,
}

/**
 * Defines the mode of selection used by Element.SelectionMode.
 */
export enum SelectionMode {
  /**
   * All the elements will be selected
   */
  All,

  /**
   * A single element will be selected
   */
  Single,

  /**
   * Multiple elements can be selected
   */
  Multiple,
}
