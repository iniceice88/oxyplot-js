/**
 * Provides extended string formatting functionality.
 */
export class StringHelper {
  /**
   * Splits the given text into separate lines.
   * @param text The text to split.
   * @returns An array of the individual lines.
   */
  public static splitLines(text: string): string[] {
    return text.split(/\r?\n/)
  }
}
