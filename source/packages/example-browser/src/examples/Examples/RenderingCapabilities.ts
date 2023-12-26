import {
  DelegateAnnotation,
  EdgeRenderingMode,
  FontWeights,
  getEnumKeys,
  getEnumName,
  HorizontalAlignment,
  type IRenderContext,
  LineJoin,
  LineStyle,
  MathRenderingExtensions,
  OxyColor,
  OxyColors,
  OxyPen,
  OxyRect,
  OxySize,
  OxySizeExtensions,
  OxyThickness,
  PlotModel,
  RenderingExtensions,
  ScreenPoint,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Shows color capabilities for the DrawText method.
 */
function drawTextColors(): PlotModel {
  const model = new PlotModel()
  const Font = 'Arial'
  const FontSize = 32
  const FontWeight = FontWeights.Bold
  const D = FontSize * 1.6
  const X = 20
  let y = 20 - D

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Black', OxyColors.Black, Font, FontSize, FontWeight)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Red', OxyColors.Red, Font, FontSize, FontWeight)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Green', OxyColors.Green, Font, FontSize, FontWeight)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Blue', OxyColors.Blue, Font, FontSize, FontWeight)

      await RenderingExtensions.fillRectangle(
        rc,
        new OxyRect(X, y + D + 15, 200, 10),
        OxyColors.Black,
        EdgeRenderingMode.Adaptive,
      )
      await rc.drawText(
        new ScreenPoint(X, y + D),
        'Yellow 50%',
        OxyColor.fromAColor(128, OxyColors.Yellow),
        Font,
        FontSize,
        FontWeight,
      )
    }),
  )

  return model
}

/**
 * Shows font capabilities for the DrawText method.
 * @returns A plot model.
 */
function drawTextFonts(): PlotModel {
  const model = new PlotModel()
  const FontSize = 20
  const D = FontSize * 1.6
  const X = 20
  let y = 20 - D

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Default font', OxyColors.Black, undefined, FontSize)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Helvetica', OxyColors.Black, 'Helvetica', FontSize)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Arial', OxyColors.Black, 'Arial', FontSize)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Courier', OxyColors.Black, 'Courier', FontSize)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Courier New', OxyColors.Black, 'Courier New', FontSize)
      await rc.drawText(new ScreenPoint(X, (y += D)), 'Times', OxyColors.Black, 'Times', FontSize)
      await rc.drawText(new ScreenPoint(X, y + D), 'Times New Roman', OxyColors.Black, 'Times New Roman', FontSize)
    }),
  )

  return model
}

/**
 * Shows font size capabilities for the DrawText method.
 * @returns A plot model.
 */
function drawTextFontSizes(): PlotModel {
  const model = new PlotModel()
  const X = 20
  let y = 20

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      // Font sizes
      for (const size of [10, 16, 24, 36, 48]) {
        await rc.drawText(new ScreenPoint(X, y), `${size}pt`, OxyColors.Black, 'Arial', size)
        await rc.drawText(new ScreenPoint(X + 200, y), `${size}pt`, OxyColors.Black, 'Arial', size, FontWeights.Bold)
        y += size * 1.6
      }
    }),
  )

  return model
}

/**
 * Shows rotation capabilities for the DrawText method.
 */
function drawTextRotation(): PlotModel {
  const model = new PlotModel()

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      const origin = new ScreenPoint(200, 200)
      await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)

      for (let rotation = 0; rotation < 360; rotation += 45) {
        await rc.drawText(origin, `Rotation ${rotation}`, OxyColors.Black, undefined, 20, undefined, rotation)
      }
    }),
  )

  return model
}

/**
 * Shows alignment capabilities for the DrawText method.
 */
function drawTextAlignment(): PlotModel {
  const model = new PlotModel()

  const fontSize = 20

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (let ha = HorizontalAlignment.Left; ha <= HorizontalAlignment.Right; ha++) {
        for (let va = VerticalAlignment.Top; va <= VerticalAlignment.Bottom; va++) {
          const origin = new ScreenPoint((ha + 1) * 200 + 20, (va + 1) * fontSize * 3 + 20)
          await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)
          const haText = getEnumName(HorizontalAlignment, ha)
          const vaText = getEnumName(VerticalAlignment, va)
          await rc.drawText(origin, `${haText}-${vaText}`, OxyColors.Black, undefined, fontSize, undefined, 0, ha, va)
        }
      }
    }),
  )

  return model
}

/**
 * Shows alignment capabilities for the DrawText method with multi-line text.
 * @returns A plot model.
 */
function drawTextMultiLineAlignment(): PlotModel {
  const model = new PlotModel()
  const FontSize = 20

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (let ha = HorizontalAlignment.Left; ha <= HorizontalAlignment.Right; ha++) {
        const haStr = getEnumName(HorizontalAlignment, ha)
        for (let va = VerticalAlignment.Top; va <= VerticalAlignment.Bottom; va++) {
          const vaStr = getEnumName(VerticalAlignment, va)
          const x = (ha + 1) * 200 + 20
          const y = (va + 1) * FontSize * 6 + 20
          const origin = new ScreenPoint(x, y)

          await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)
          await rc.drawText(origin, `${haStr}\n${vaStr}`, OxyColors.Black, undefined, FontSize, undefined, 0, ha, va)
        }
      }
    }),
  )

  return model
}

/**
 * Shows rotation capabilities for the DrawMathText method.
 */
function mathTextRotation(): PlotModel {
  const model = new PlotModel()

  const fontFamily = 'Arial'
  const fontSize = 24
  const fontWeight = FontWeights.Normal

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      const origin = new ScreenPoint(200, 200)
      const origin2 = new ScreenPoint(400, 200)
      await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)

      for (let rotation = 0; rotation < 360; rotation += 45) {
        const text = '     A_{2}^{3}B'
        await MathRenderingExtensions.drawMathText(
          rc,
          origin,
          text,
          OxyColors.Black,
          fontFamily,
          fontSize,
          fontWeight,
          rotation,
          HorizontalAlignment.Left,
          VerticalAlignment.Middle,
        )
        const size = await MathRenderingExtensions.measureMathText(rc, text, fontFamily, fontSize, fontWeight)
        const outline1 = OxySizeExtensions.getPolygon(
          size,
          origin,
          rotation,
          HorizontalAlignment.Left,
          VerticalAlignment.Middle,
        )
        await rc.drawPolygon(outline1, OxyColors.Undefined, OxyColors.Blue, 1, EdgeRenderingMode.Adaptive)

        // Compare with normal text
        const text2 = '     A B'
        await rc.drawText(
          origin2,
          text2,
          OxyColors.Red,
          fontFamily,
          fontSize,
          fontWeight,
          rotation,
          HorizontalAlignment.Left,
          VerticalAlignment.Middle,
        )
        const size2 = rc.measureText(text2, fontFamily, fontSize, fontWeight)
        const outline2 = OxySizeExtensions.getPolygon(
          size2,
          origin2,
          rotation,
          HorizontalAlignment.Left,
          VerticalAlignment.Middle,
        )
        await rc.drawPolygon(outline2, OxyColors.Undefined, OxyColors.Blue, 1, EdgeRenderingMode.Adaptive)
      }
    }),
  )

  return model
}

/**
 * Shows alignment capabilities for the DrawMathText method.
 */
function drawMathTextAlignment() {
  const text = 'A_{2}^{3}B'
  const model = new PlotModel()

  const fontFamily = 'Arial'
  const fontSize = 20
  const fontWeight = FontWeights.Normal
  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (let ha = HorizontalAlignment.Left; ha <= HorizontalAlignment.Right; ha++) {
        for (let va = VerticalAlignment.Top; va <= VerticalAlignment.Bottom; va++) {
          const origin = new ScreenPoint((ha + 1) * 200 + 20, (va + 1) * fontSize * 3 + 20)
          await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)
          await MathRenderingExtensions.drawMathText(
            rc,
            origin,
            text,
            OxyColors.Black,
            fontFamily,
            fontSize,
            fontWeight,
            0,
            ha,
            va,
          )
        }
      }
    }),
  )

  return model
}

/**
 * Shows alignment capabilities for the DrawText method.
 * @returns A plot model.
 */
function drawTextAlignmentRotation(): PlotModel {
  const model = new PlotModel()

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (let ha = HorizontalAlignment.Left; ha <= HorizontalAlignment.Right; ha++) {
        for (let va = VerticalAlignment.Top; va <= VerticalAlignment.Bottom; va++) {
          const x = (ha + 2) * 130
          const y = (va + 2) * 130
          const origin = new ScreenPoint(x, y)
          await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)
          for (let rotation = 0; rotation < 360; rotation += 90) {
            await rc.drawText(
              origin,
              `R${rotation.toString().padStart(3, '0')}`,
              OxyColors.Black,
              undefined,
              20,
              undefined,
              rotation,
              ha,
              va,
            )
          }
        }
      }
    }),
  )

  return model
}

/**
 * Shows multi-line alignment capabilities for the DrawText method.
 * @returns A plot model.
 */
function drawMultilineTextAlignmentRotation(): PlotModel {
  const model = new PlotModel()

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (let ha = HorizontalAlignment.Left; ha <= HorizontalAlignment.Right; ha++) {
        const haStr = getEnumName(HorizontalAlignment, ha)
        for (let va = VerticalAlignment.Top; va <= VerticalAlignment.Bottom; va++) {
          const vaStr = getEnumName(VerticalAlignment, va)
          const x = (ha + 2) * 170
          const y = (va + 2) * 170
          const origin = new ScreenPoint(x, y)
          await RenderingExtensions.fillCircle(rc, origin, 3, OxyColors.Blue, EdgeRenderingMode.Adaptive)
          for (let rotation = 0; rotation < 360; rotation += 90) {
            await rc.drawText(
              origin,
              `R${rotation.toString().padStart(3, '0')}\n${haStr}\n${vaStr}`,
              OxyColors.Black,
              undefined,
              20,
              undefined,
              rotation,
              ha,
              va,
            )
          }
        }
      }
    }),
  )

  return model
}

/**
 * Shows color capabilities for the DrawText method.
 * @returns A plot model.
 */
function drawTextMaxSize(): PlotModel {
  const model = new PlotModel()
  const Font = 'Arial'
  const FontSize = 32
  const FontWeight = FontWeights.Bold
  const D = FontSize * 1.6
  const X = 20
  const X2 = 200
  let y = 20
  const testStrings = ['iii', 'jjj', 'OxyPlot', 'Bottom', '100', 'KML']

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      for (const text of testStrings) {
        const maxSize = rc.measureText(text, Font, FontSize, FontWeight)
        const p = new ScreenPoint(X, y)
        await rc.drawText(
          p,
          text,
          OxyColors.Black,
          Font,
          FontSize,
          FontWeight,
          undefined,
          undefined,
          undefined,
          maxSize,
        )
        const rect = new OxyRect(p.x, p.y, maxSize.width, maxSize.height)
        await rc.drawRectangle(rect, OxyColors.Undefined, OxyColors.Black, 1, EdgeRenderingMode.Adaptive)

        const p2 = new ScreenPoint(X2, y)
        const maxSize2 = new OxySize(maxSize.width / 2, maxSize.height / 2)
        await rc.drawText(
          p2,
          text,
          OxyColors.Black,
          Font,
          FontSize,
          FontWeight,
          undefined,
          undefined,
          undefined,
          maxSize2,
        )
        const rect2 = new OxyRect(p2.x, p2.y, maxSize2.width, maxSize2.height)
        await rc.drawRectangle(rect2, OxyColors.Undefined, OxyColors.Black, 1, EdgeRenderingMode.Adaptive)

        y += D
      }
    }),
  )

  return model
}

/**
 * Shows capabilities for the MeasureText method.
 */
function measureText(): PlotModel {
  const model = new PlotModel()

  const font = 'Arial'
  const strings = ['OxyPlot', 'MMM', 'III', 'jikq', 'gh', '123', '!#$&']
  const fontSizes = [10, 20, 40, 60]

  model.annotations.push(
    new DelegateAnnotation(async (rc) => {
      let x = 5

      for (const fontSize of fontSizes) {
        let y = 5
        let maxWidth = 0

        for (const s of strings) {
          const size = rc.measureText(s, font, fontSize, FontWeights.Normal)
          maxWidth = Math.max(maxWidth, size.width)
          await rc.drawRectangle(
            new OxyRect(x, y, size.width, size.height),
            OxyColors.LightYellow,
            OxyColors.Black,
            1,
            EdgeRenderingMode.Adaptive,
          )
          await rc.drawText(new ScreenPoint(x, y), s, OxyColors.Black, font, fontSize)
          y += size.height + 20
        }

        x += maxWidth + 20
      }
    }),
  )

  return model
}

/** Clipping */
const clipping = (): PlotModel => {
  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      const DrawClipRect = async (clipRect: OxyRect) => {
        const pen = new OxyPen(OxyColors.Black, 2, LineStyle.Dash)
        await RenderingExtensions.drawLine(
          rc,
          clipRect.left,
          clipRect.top,
          clipRect.right,
          clipRect.top,
          pen,
          EdgeRenderingMode.Automatic,
        )
        await RenderingExtensions.drawLine(
          rc,
          clipRect.right,
          clipRect.top,
          clipRect.right,
          clipRect.bottom,
          pen,
          EdgeRenderingMode.Automatic,
        )
        await RenderingExtensions.drawLine(
          rc,
          clipRect.right,
          clipRect.bottom,
          clipRect.left,
          clipRect.bottom,
          pen,
          EdgeRenderingMode.Automatic,
        )
        await RenderingExtensions.drawLine(
          rc,
          clipRect.left,
          clipRect.bottom,
          clipRect.left,
          clipRect.top,
          pen,
          EdgeRenderingMode.Automatic,
        )
      }

      let currentLine = 20
      const lineHeight = 60
      const clipRectSize = 40
      const clipRectMargin = 20
      const testCaseMargin = 20
      const descriptionMargin = 200
      let rect = OxyRect.Empty

      const DrawCircle = async (center: ScreenPoint) => {
        await RenderingExtensions.drawCircle2(
          rc,
          center,
          clipRectSize * 0.58,
          OxyColors.CornflowerBlue,
          OxyColors.Undefined,
          0,
          EdgeRenderingMode.Automatic,
        )
      }

      const DrawDescription = async (text: string) => {
        const p = new ScreenPoint(clipRectMargin + clipRectSize + testCaseMargin + descriptionMargin, currentLine)
        await rc.drawText(
          p,
          text,
          OxyColors.Black,
          undefined,
          12,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
      }

      const DrawTestCase = async (text: string) => {
        const p = new ScreenPoint(clipRectMargin + clipRectSize + testCaseMargin, currentLine)
        await rc.drawText(
          p,
          text,
          OxyColors.Black,
          undefined,
          12,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
      }

      const DrawHeader = async (text: string, offset: number) => {
        await rc.drawText(new ScreenPoint(offset, 15), text, OxyColors.Black, undefined, 12, 700)
      }

      const NextLine = () => {
        currentLine += lineHeight
        rect = new OxyRect(clipRectMargin, currentLine - clipRectSize / 2, clipRectSize, clipRectSize)
      }

      await DrawHeader('Actual', clipRectMargin)
      await DrawHeader('Test Case', clipRectMargin + clipRectSize + testCaseMargin)
      await DrawHeader('Expected', clipRectMargin + clipRectSize + testCaseMargin + descriptionMargin)

      //-------------
      NextLine()
      rc.pushClip(rect)
      rc.popClip()
      await DrawCircle(rect.center)

      await DrawTestCase('1. Push clipping rectangle\n2. Pop clipping rectangle\n3. Draw circle')
      await DrawDescription('The circle should be fully drawn.')

      //-------------
      NextLine()
      rc.pushClip(rect)
      await DrawCircle(rect.center)

      rc.popClip()

      await DrawClipRect(rect)
      await DrawTestCase('1. Push clipping rectangle\n2. Draw Circle')
      await DrawDescription('The circle should be clipped.')

      //-------------
      NextLine()
      let rect2 = rect.deflate(new OxyThickness(rect.height * 0.25))
      rc.pushClip(rect)
      rc.pushClip(rect2)

      await DrawCircle(rect.center)

      rc.popClip()
      rc.popClip()

      await DrawClipRect(rect)
      await DrawClipRect(rect2)
      await DrawTestCase('1. Push large clipping rectangle\n2. Push small clipping rectangle\n3. Draw Circle')
      await DrawDescription('The circle should be clipped to the small clipping rectangle.')

      //-------------
      NextLine()
      rect2 = rect.deflate(new OxyThickness(rect.height * 0.25))
      rc.pushClip(rect2)
      rc.pushClip(rect)

      await DrawCircle(rect.center)

      rc.popClip()
      rc.popClip()

      await DrawClipRect(rect)
      await DrawClipRect(rect2)
      await DrawTestCase('1. Push small clipping rectangle\n2. Push large clipping rectangle\n3. Draw Circle')
      await DrawDescription('The circle should be clipped to the small clipping rectangle.')

      //-------------
      NextLine()
      rect2 = rect.offset(rect.width / 2, rect.height / 2).deflate(new OxyThickness(rect.height * 0.25))
      rc.pushClip(rect)
      rc.pushClip(rect2)

      await DrawCircle(rect.center)

      rc.popClip()
      rc.popClip()

      await DrawClipRect(rect)
      await DrawClipRect(rect2)
      await DrawTestCase('1. Push large clipping rectangle\n2. Push small clipping rectangle\n3. Draw Circle')
      await DrawDescription('The circle should be clipped to the intersection of the clipping rectangles.')

      //-------------
      NextLine()
      rect2 = rect.offset(rect.width / 2, rect.height / 2).deflate(new OxyThickness(rect.height * 0.25))
      rc.pushClip(rect)
      rc.pushClip(rect2)

      rc.popClip()

      await DrawCircle(rect.center)

      rc.popClip()

      await DrawClipRect(rect)
      await DrawClipRect(rect2)
      await DrawTestCase(
        '1. Push large clipping rectangle\n2. Push small clipping rectangle\n3. Pop small clipping rectangle\n4. Draw Circle',
      )
      await DrawDescription('The circle should be clipped to the large clipping rectangle.')

      //-------------
      NextLine()
      const rect3 = rect.offset(rect.width / 3, rect.height / 3).deflate(new OxyThickness(rect.height * 0.25))
      const rect4 = rect.offset(-rect.width / 3, -rect.height / 3).deflate(new OxyThickness(rect.height * 0.25))
      rc.pushClip(rect3)
      rc.pushClip(rect4)

      await DrawCircle(rect.center)

      rc.popClip()
      rc.popClip()

      await DrawClipRect(rect3)
      await DrawClipRect(rect4)
      await DrawTestCase('1. Push clipping rectangle\n2. Push second clipping rectangle\n3. Draw Circle')
      await DrawDescription('The circle should not be drawn at all.')

      //-------------
      NextLine()
      const autoResetClipDisp = RenderingExtensions.autoResetClip(rc, rect)
      await rc.drawText(
        rect.center,
        'OxyPlot',
        OxyColors.CornflowerBlue,
        undefined,
        15,
        undefined,
        undefined,
        HorizontalAlignment.Center,
        VerticalAlignment.Middle,
      )
      autoResetClipDisp.dispose()

      await DrawClipRect(rect)
      await DrawTestCase('1. Push clipping rectangle\n2. Draw Text')
      await DrawDescription('The text should be clipped.')
    }),
  )

  return model
}

const GRID_SIZE = 40
const TILE_SIZE = 30
const THICKNESS_STEPS = 10
const THICKNESS_STEP = 0.5
const OFFSET_LEFT = 200
const OFFSET_TOP = 20
const FILL_COLOR = OxyColors.LightBlue
/** Rectangles - EdgeRenderingMode */
const rectangles = (): PlotModel => {
  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      for (let i = 0; i < THICKNESS_STEPS; i++) {
        const left = OFFSET_LEFT + i * GRID_SIZE + TILE_SIZE / 2
        const strokeThickness = i * THICKNESS_STEP
        await rc.drawText(
          new ScreenPoint(left, OFFSET_TOP / 2),
          strokeThickness.toString(),
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      const edgeRenderingModes = getEnumKeys(EdgeRenderingMode)
      for (const edgeRenderingMode of edgeRenderingModes) {
        const top = OFFSET_TOP + edgeRenderingMode * GRID_SIZE
        await rc.drawText(
          new ScreenPoint(10, top + 10),
          EdgeRenderingMode[edgeRenderingMode],
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
        for (let i = 0; i < THICKNESS_STEPS; i++) {
          const left = OFFSET_LEFT + i * GRID_SIZE
          const rect = new OxyRect(left, top, TILE_SIZE, TILE_SIZE)
          const strokeThickness = i * THICKNESS_STEP
          await rc.drawRectangle(rect, FILL_COLOR, OxyColors.Black, strokeThickness, edgeRenderingMode)
        }
      }
    }),
  )

  return model
}

/** Lines - EdgeRenderingMode */
const lines = (): PlotModel => {
  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      for (let i = 0; i < THICKNESS_STEPS; i++) {
        const left = OFFSET_LEFT + i * GRID_SIZE + TILE_SIZE / 2
        const strokeThickness = i * THICKNESS_STEP
        await rc.drawText(
          new ScreenPoint(left, OFFSET_TOP / 2),
          strokeThickness.toString(),
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      const edgeRenderingModes = getEnumKeys(EdgeRenderingMode)
      for (const edgeRenderingMode of edgeRenderingModes) {
        const top = OFFSET_TOP + edgeRenderingMode * GRID_SIZE
        await rc.drawText(
          new ScreenPoint(10, top + 10),
          EdgeRenderingMode[edgeRenderingMode],
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
        for (let i = 0; i < THICKNESS_STEPS; i++) {
          const left = OFFSET_LEFT + i * GRID_SIZE
          const topLeft = new ScreenPoint(left, top)
          const bottomLeft = new ScreenPoint(left, top + TILE_SIZE)
          const topRight = new ScreenPoint(left + TILE_SIZE, top)
          const bottomRight = new ScreenPoint(left + TILE_SIZE, top + TILE_SIZE)
          const middleLeft = new ScreenPoint(left, top + TILE_SIZE / 2)
          const strokeThickness = i * THICKNESS_STEP

          await rc.drawLine([bottomLeft, topLeft, topRight], OxyColors.Black, strokeThickness, edgeRenderingMode)
          await rc.drawLine(
            [middleLeft, bottomRight, topLeft],
            OxyColors.Black,
            strokeThickness,
            edgeRenderingMode,
            undefined,
            LineJoin.Bevel,
          )
        }
      }
    }),
  )

  return model
}

/** Polygons - EdgeRenderingMode */
const polygons = (): PlotModel => {
  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      for (let i = 0; i < THICKNESS_STEPS; i++) {
        const left = OFFSET_LEFT + i * GRID_SIZE + TILE_SIZE / 2
        const strokeThickness = i * THICKNESS_STEP
        await rc.drawText(
          new ScreenPoint(left, OFFSET_TOP / 2),
          strokeThickness.toString(),
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      const edgeRenderingModes = getEnumKeys(EdgeRenderingMode)
      for (const edgeRenderingMode of edgeRenderingModes) {
        const top = OFFSET_TOP + edgeRenderingMode * GRID_SIZE
        await rc.drawText(
          new ScreenPoint(10, top + 10),
          EdgeRenderingMode[edgeRenderingMode],
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
        for (let i = 0; i < THICKNESS_STEPS; i++) {
          const left = OFFSET_LEFT + i * GRID_SIZE
          const points = [
            new ScreenPoint(left + TILE_SIZE * 0.4, top),
            new ScreenPoint(left + TILE_SIZE, top + TILE_SIZE * 0.2),
            new ScreenPoint(left + TILE_SIZE * 0.9, top + TILE_SIZE * 0.8),
            new ScreenPoint(left + TILE_SIZE * 0.5, top + TILE_SIZE),
            new ScreenPoint(left, top + TILE_SIZE * 0.6),
          ]

          const strokeThickness = i * THICKNESS_STEP
          await rc.drawPolygon(points, FILL_COLOR, OxyColors.Black, strokeThickness, edgeRenderingMode)
        }
      }
    }),
  )

  return model
}

/** Ellipses - EdgeRenderingMode */
const ellipses = (): PlotModel => {
  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      for (let i = 0; i < THICKNESS_STEPS; i++) {
        const left = OFFSET_LEFT + i * GRID_SIZE + TILE_SIZE / 2
        const strokeThickness = i * THICKNESS_STEP
        await rc.drawText(
          new ScreenPoint(left, OFFSET_TOP / 2),
          strokeThickness.toString(),
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      const edgeRenderingModes = getEnumKeys(EdgeRenderingMode)
      for (const edgeRenderingMode of edgeRenderingModes) {
        const top = OFFSET_TOP + edgeRenderingMode * GRID_SIZE
        await rc.drawText(
          new ScreenPoint(10, top + 10),
          EdgeRenderingMode[edgeRenderingMode],
          OxyColors.Black,
          undefined,
          10,
          undefined,
          undefined,
          undefined,
          VerticalAlignment.Middle,
        )
        for (let i = 0; i < THICKNESS_STEPS; i++) {
          const left = OFFSET_LEFT + i * GRID_SIZE
          const rect = new OxyRect(left, top + TILE_SIZE * 0.1, TILE_SIZE, TILE_SIZE * 0.8)
          const strokeThickness = i * THICKNESS_STEP
          await rc.drawEllipse(rect, FILL_COLOR, OxyColors.Black, strokeThickness, edgeRenderingMode)
        }
      }
    }),
  )

  return model
}

/** LineJoin */
const lineJoins = (): PlotModel => {
  const STROKE_THICKNESS = 15
  const LINE_LENGTH = 60
  const ANGLES = [135, 90, 45, 22.5]
  const COL_WIDTH = 140
  const ROW_HEIGHT = 90
  const ROW_HEADER_WIDTH = 50
  const COL_HEADER_HEIGHT = 50

  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      let colCounter = 0
      let rowCounter = 0
      const lineJoins = getEnumKeys(LineJoin)
      for (const lineJoin of lineJoins) {
        const p = new ScreenPoint(COL_WIDTH * (colCounter + 0.5) + ROW_HEADER_WIDTH, COL_HEADER_HEIGHT / 2)
        await rc.drawText(
          p,
          LineJoin[lineJoin],
          OxyColors.Black,
          undefined,
          12,
          undefined,
          undefined,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
        colCounter++
      }

      for (const angle of ANGLES) {
        colCounter = 0
        const y = ROW_HEIGHT * rowCounter + COL_HEADER_HEIGHT
        const halfAngle = (angle / 2 / 360) * 2 * Math.PI
        const dx = Math.sin(halfAngle) * LINE_LENGTH
        const dy = Math.cos(halfAngle) * LINE_LENGTH

        const textP = new ScreenPoint(15, y)
        await rc.drawText(textP, angle.toString() + '°', OxyColors.Black, undefined, 12)

        for (const lineJoin of lineJoins) {
          const x = COL_WIDTH * (colCounter + 0.5) + ROW_HEADER_WIDTH

          const pMid = new ScreenPoint(x, y)
          const p1 = new ScreenPoint(x - dx, y + dy)
          const p2 = new ScreenPoint(x + dx, y + dy)

          await rc.drawLine(
            [p1, pMid, p2],
            OxyColors.CornflowerBlue,
            STROKE_THICKNESS,
            EdgeRenderingMode.PreferGeometricAccuracy,
            undefined,
            lineJoin,
          )

          colCounter++
        }

        rowCounter++
      }
    }),
  )

  return model
}

/** Ellipse Drawing */
const ellipseDrawing = (): PlotModel => {
  const RADIUS_X = 300
  const RADIUS_Y = 100
  const CENTER_X = RADIUS_X * 1.2
  const CENTER_Y = RADIUS_Y * 1.2

  const n = 200

  const model = new PlotModel()
  model.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      const rect = new OxyRect(CENTER_X - RADIUS_X, CENTER_Y - RADIUS_Y, RADIUS_X * 2, RADIUS_Y * 2)

      const points = new Array<ScreenPoint>(n)
      const cx = (rect.left + rect.right) / 2
      const cy = (rect.top + rect.bottom) / 2
      const rx = (rect.right - rect.left) / 2
      const ry = (rect.bottom - rect.top) / 2
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / (n - 1)
        points[i] = new ScreenPoint(cx + rx * Math.cos(a), cy + ry * Math.sin(a))
      }

      await rc.drawPolygon(points, OxyColors.Undefined, OxyColors.Black, 4, EdgeRenderingMode.PreferGeometricAccuracy)
      await rc.drawEllipse(rect, OxyColors.Undefined, OxyColors.White, 2, EdgeRenderingMode.PreferGeometricAccuracy)
      await rc.drawText(
        new ScreenPoint(CENTER_X, CENTER_Y),
        'The white ellipse (drawn by Renderer) should match the black ellipse (drawn as Path).',
        OxyColors.Black,
        undefined,
        12,
        undefined,
        undefined,
        HorizontalAlignment.Center,
        VerticalAlignment.Middle,
      )
    }),
  )

  return model
}

const category = '9 Rendering capabilities'

export default {
  category,
  examples: [
    {
      title: 'DrawText - Colors',
      example: {
        model: drawTextColors,
      },
    },
    {
      title: 'DrawText - Fonts',
      example: {
        model: drawTextFonts,
      },
    },
    {
      title: 'DrawText - Font sizes',
      example: {
        model: drawTextFontSizes,
      },
    },
    {
      title: 'DrawText - Rotation',
      example: {
        model: drawTextRotation,
      },
    },
    {
      title: 'DrawText - Alignment',
      example: {
        model: drawTextAlignment,
      },
    },
    {
      title: 'DrawText - Multi-line Alignment',
      example: {
        model: drawTextMultiLineAlignment,
      },
    },
    {
      title: 'DrawMathText - Rotation',
      example: {
        model: mathTextRotation,
      },
    },
    {
      title: 'DrawMathText - Alignment',
      example: {
        model: drawMathTextAlignment,
      },
    },
    {
      title: 'DrawText - Alignment/Rotation',
      example: {
        model: drawTextAlignmentRotation,
      },
    },
    {
      title: 'DrawText - Multi-line Alignment/Rotation',
      example: {
        model: drawMultilineTextAlignmentRotation,
      },
    },
    {
      title: 'DrawText - MaxSize',
      example: {
        model: drawTextMaxSize,
      },
    },
    {
      title: 'MeasureText',
      example: {
        model: measureText,
      },
    },
    {
      title: 'Clipping',
      example: {
        model: clipping,
      },
    },
    {
      title: 'Rectangles - EdgeRenderingMode',
      example: {
        model: rectangles,
      },
    },
    {
      title: 'Lines - EdgeRenderingMode',
      example: {
        model: lines,
      },
    },
    {
      title: 'Polygons - EdgeRenderingMode',
      example: {
        model: polygons,
      },
    },
    {
      title: 'Ellipses - EdgeRenderingMode',
      example: {
        model: ellipses,
      },
    },
    {
      title: 'LineJoin',
      example: {
        model: lineJoins,
      },
    },
    {
      title: 'Ellipse Drawing',
      example: {
        model: ellipseDrawing,
      },
    },
  ],
} as ExampleCategory
