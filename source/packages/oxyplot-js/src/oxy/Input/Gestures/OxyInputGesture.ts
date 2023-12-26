/** Provides an abstract base class for input device gestures. */
export interface OxyInputGesture {
  /** Indicates whether the current object is equal to another object of the same type. */
  equals(other: OxyInputGesture): boolean
}
