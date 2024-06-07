
/**
 * Specifies the placement of the legend box.
 */
export enum LegendPlacement {
  /**
   * Place the legends inside the plot area.
   */
  Inside,

  /**
   * Place the legends outside the plot area.
   */
  Outside,
}

/**
 * Specifies the position of the legend box.
 */
export enum LegendPosition {
  /**
   * Place the legend box in the top-left corner.
   */
  TopLeft,

  /**
   * Place the legend box centered at the top.
   */
  TopCenter,

  /**
   * Place the legend box in the top-right corner.
   */
  TopRight,

  /**
   * Place the legend box in the bottom-left corner.
   */
  BottomLeft,

  /**
   * Place the legend box centered at the bottom.
   */
  BottomCenter,

  /**
   * Place the legend box in the bottom-right corner.
   */
  BottomRight,

  /**
   * Place the legend box in the left-top corner.
   */
  LeftTop,

  /**
   * Place the legend box centered at the left.
   */
  LeftMiddle,

  /**
   * Place the legend box in the left-bottom corner.
   */
  LeftBottom,

  /**
   * Place the legend box in the right-top corner.
   */
  RightTop,

  /**
   * Place the legend box centered at the right.
   */
  RightMiddle,

  /**
   * Place the legend box in the right-bottom corner.
   */
  RightBottom,
}


/**
 * Specifies the orientation of the items in the legend box.
 */
export enum LegendOrientation {
  /**
   * Orient the items horizontally.
   */
  Horizontal,

  /**
   * Orient the items vertically.
   */
  Vertical,
}

/**
 * Specifies the item order of the legends.
 */
export enum LegendItemOrder {
  /**
   * Render the items in the normal order.
   */
  Normal,

  /**
   * Render the items in the reverse order.
   */
  Reverse,
}

/**
 * Specifies the placement of the legend symbols.
 */
export enum LegendSymbolPlacement {
  /**
   * Render symbols to the left of the labels.
   */
  Left,

  /**
   * Render symbols to the right of the labels.
   */
  Right,
}
