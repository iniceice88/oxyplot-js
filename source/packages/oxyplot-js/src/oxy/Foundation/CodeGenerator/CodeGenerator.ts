import type { PlotModel } from '@/oxyplot'

/**
 * Provides functionality to generate TypeScript code for the specified PlotModel.
 * This is useful for creating examples or unit tests.
 * Usage:
 * let cg = new CodeGenerator(myPlotModel);
 * console.log(cg.toCode());
 */
export class CodeGenerator {
  /**
   * Initializes a new instance of the CodeGenerator class.
   * @param model The model.
   */
  constructor(private model: PlotModel) {}

  /**
   * Returns the TypeScript code for this model.
   * @returns TypeScript code.
   */
  public toCode(): string {
    throw new Error('Not supported')
  }

  /**
   * Formats the code.
   * @param format The format.
   * @param values The values.
   * @returns The format code.
   */
  public static formatCode(format: string, ...values: any[]): string {
    throw new Error('Not supported')
  }

  /**
   * Formats a constructor.
   * @param typeName The type name.
   * @param format The format of the constructor arguments.
   * @param values The argument values.
   * @returns The format constructor.
   */
  public static formatConstructor(typeName: string, format: string, ...values: any[]): string {
    throw new Error('Not supported')
  }
}
