/**
 * Defines the possible key values on a keyboard.
 */
export enum OxyKey {
  // Basic keys
  Space,
  Enter,
  Escape,
  Tab,
  Backspace,
  Insert,
  Delete,
  Home,
  End,
  Up,
  Down,
  Left,
  Right,
  PageUp,
  PageDown,

  // Alphabetical keys
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,

  // Numeric keys
  D0,
  D1,
  D2,
  D3,
  D4,
  D5,
  D6,
  D7,
  D8,
  D9,
  NumPad0,
  NumPad1,
  NumPad2,
  NumPad3,
  NumPad4,
  NumPad5,
  NumPad6,
  NumPad7,
  NumPad8,
  NumPad9,

  // Operator and special keys
  Add,
  Subtract,
  Multiply,
  Divide,
  Decimal,

  // Function keys
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,

  // Unknown key
  Unknown,
}

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

/**
 * Defines values that specify the buttons on a mouse device.
 */
export enum OxyMouseButton {
  /**
   * No mouse button.
   */
  None = 0,

  /**
   * The left mouse button.
   */
  Left = 1,

  /**
   * The middle mouse button.
   */
  Middle = 2,

  /**
   * The right mouse button.
   */
  Right = 3,

  /**
   * The first extended mouse button.
   */
  XButton1 = 4,

  /**
   * The second extended mouse button.
   */
  XButton2 = 5,
}
