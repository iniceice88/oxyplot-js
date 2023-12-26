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
