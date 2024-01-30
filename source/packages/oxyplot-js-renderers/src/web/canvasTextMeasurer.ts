import { FontWeights, type ITextMeasurer, LineJoin, OxyColor, OxySize } from 'oxyplot-js'

let cachedContext: CanvasRenderingContext2D | null = null

function getCanvasContext() {
  if (cachedContext) return cachedContext
  const canvas = document.createElement('canvas')
  cachedContext = canvas?.getContext('2d')

  if (!cachedContext) throw new Error('Could not get canvas context')

  return cachedContext!
}

let styleConverter: OxyStyleToCanvasStyleConverter | null = null
const getFont = (fontFamily: string | undefined, fontSize: number, fontWeight?: number) => {
  if (!styleConverter) styleConverter = new OxyStyleToCanvasStyleConverter()
  return styleConverter.convertFont(fontFamily, fontSize, fontWeight || FontWeights.Normal)
}

export function canvasTextMeasurer(context?: CanvasRenderingContext2D): ITextMeasurer {
  context = context || getCanvasContext()

  function measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight?: number) {
    if (!context) throw new Error('Could not get canvas context')

    context.font = getFont(fontFamily, fontSize, fontWeight)
    const metrics = context.measureText(text)
    return new OxySize(metrics.width, fontSize)
  }

  return {
    measureText,
  }
}

export class OxyStyleToCanvasStyleConverter {
  convertLineJoin(lineJoin?: LineJoin) {
    lineJoin = lineJoin || LineJoin.Miter
    switch (lineJoin) {
      case LineJoin.Miter:
        return 'miter'
      case LineJoin.Bevel:
        return 'bevel'
      case LineJoin.Round:
        return 'round'
    }
  }

  convertStrokeOrFillStyle(color: OxyColor) {
    return color.toRgba()
  }

  convertFont(fontFamily: string | undefined, fontSize: number, fontWeight: number) {
    let font = ''
    if ((fontWeight || FontWeights.Normal) > FontWeights.Normal) {
      font += `bold `
    }

    font += `${fontSize || 12}px `
    if (fontFamily) {
      font += `"${fontFamily}" `
    }

    return font.trim()
  }
}
