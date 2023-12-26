/**
 * Defines the page size.
 */
export enum PageSize {
  /**
   * ISO A4 size (595pt x 842pt).
   */
  A4,

  /**
   * ISO A3 size (842pt x 1190pt).
   */
  A3,

  /**
   * American letter size (612pt x 792pt).
   */
  Letter,
}

/**
 * Defines the page orientation.
 */
export enum PageOrientation {
  /**
   * Portrait orientation (where the height is greater than the width).
   */
  Portrait,

  /**
   * Landscape orientation (where the width is greater than the height).
   */
  Landscape,
}

/**
 * Defines the line cap type.
 */
export enum LineCap {
  /**
   * Butt cap. The stroke is squared off at the endpoint of the path. There is no projection beyond the end of the path.
   */
  Butt = 0,

  /**
   * Round cap. A semicircular arc with a diameter equal to the line width is drawn around the endpoint and filled in.
   */
  Round = 1,

  /**
   * Projecting square cap. The stroke continues beyond the endpoint of the path for a distance equal to half the line width and is squared off.
   */
  ProjectingSquare = 2,
}

/**
 * Defines the color space.
 */
export enum ColorSpace {
  /**
   * The colors are defined by intensities of red, green and blue light, the three additive primary colors used in displays.
   */
  DeviceRGB,
}

/**
 * Defines the font encoding.
 */
export enum FontEncoding {
  /**
   * Windows Code Page 1252, often called the “Windows ANSI” encoding. This is the standard Windows encoding for Latin text in
   * Western writing systems. PDF has a predefined encoding named WinAnsiEncoding that can be used with both Type 1 and TrueType fonts.
   */
  WinAnsiEncoding,
}

/**
 * Defines the font subtype
 */
export enum FontSubType {
  /**
   * Adobe type 1 font.
   */
  Type1,

  /**
   * TrueType font.
   */
  TrueType,
}
