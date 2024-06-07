/**
 * Enumerates the available edge rendering modes. This gives an indication to the renderer which trade-offs to make between sharpness, speed and geometric accuracy
 * when rendering shapes like lines, polygons, ellipses etc.
 */
export enum EdgeRenderingMode {
  /**
   * Indicates that a rendering mode should be chosen automatically by the PlotElement. The renderer will treat this equivalently to Adaptive.
   */
  Automatic,

  /**
   * The renderer will try to find the best rendering mode depending on the rendered shape.
   */
  Adaptive,

  /**
   * The renderer will try to maximise the sharpness of edges. To that end, it may disable Anti-Aliasing for some lines or snap the position and stroke thickness
   * of rendered elements to device pixels.
   */
  PreferSharpness,

  /**
   * The renderer will try to maximise the rendering speed. To that end, it may disable Anti-Aliasing.
   */
  PreferSpeed,

  /**
   * The renderer will try to maximise geometric accuracy. To that end, it may enable Anti-Aliasing even for straight lines.
   */
  PreferGeometricAccuracy,
}

/**
 * Defines horizontal alignment.
 */
export enum HorizontalAlignment {
  /**
   * Aligned to the left.
   */
  Left = -1,

  /**
   * Aligned in the center.
   */
  Center = 0,

  /**
   * Aligned to the right.
   */
  Right = 1,
}

/**
 * Specifies vertical alignment.
 */
export enum VerticalAlignment {
  /**
   * Aligned at the top.
   */
  Top = -1,

  /**
   * Aligned in the middle.
   */
  Middle = 0,

  /**
   * Aligned at the bottom.
   */
  Bottom = 1,
}

/**
 * Defines standard font weight values.
 */
export const FontWeights = {
  /**
   * Specifies a bold font weight.
   */
  Bold: 700,

  /**
   * Specifies a normal font weight.
   */
  Normal: 400,
}

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

/**
 * Defines the style of a line.
 */
export enum LineStyle {
  /**
   * The solid line style.
   */
  Solid,

  /**
   * The dash line style.
   */
  Dash,

  /**
   * The dot line style.
   */
  Dot,

  /**
   * The dash dot line style.
   */
  DashDot,

  /**
   * The dash-dash dot line style.
   */
  DashDashDot,

  /**
   * The dash dot-dot line style.
   */
  DashDotDot,

  /**
   * The dash-dash-dot-dot line style.
   */
  DashDashDotDot,

  /**
   * The long dash line style.
   */
  LongDash,

  /**
   * The long dash dot line style.
   */
  LongDashDot,

  /**
   * The long dash dot-dot line style.
   */
  LongDashDotDot,

  /**
   * The hidden line style.
   */
  None,

  /**
   * The automatic line style.
   */
  Automatic,
}
