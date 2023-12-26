/**
 * Provides functionality to generate C# code of an object.
 */
export interface ICodeGenerating {
  /**
   * Returns C# code that generates this instance.
   * @returns The C# code.
   */
  toCode(): string
}
