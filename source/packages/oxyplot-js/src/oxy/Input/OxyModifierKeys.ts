/**
 * Defines the set of modifier keys.
 */
export enum OxyModifierKeys {
  /**
   * No modifiers are pressed.
   */
  None = 0,

  /**
   * The Control key.
   */
  Control = 1 << 0,

  /**
   * The Alt/Menu key.
   */
  Alt = 1 << 1,

  /**
   * The Shift key.
   */
  Shift = 1 << 2,

  /**
   * The Windows key.
   */
  Windows = 1 << 3,
}
