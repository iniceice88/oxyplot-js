import {
  type CreateLegendBaseOptions,
  EdgeRenderingMode,
  FontWeights,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  LegendBase,
  LegendItemOrder,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LegendSymbolPlacement,
  MathRenderingExtensions, newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  OxySize,
  RenderingExtensions,
  ScreenPoint,
  SelectionMode,
  Series,
  VerticalAlignment,
} from '@/oxyplot'
import { getReversedCopy, removeUndef } from '@/patch'

export interface CreateLegendOptions extends CreateLegendBaseOptions {
  groupNameFont?: string
  groupNameFontSize?: number
  groupNameFontWeight?: number
  seriesInvisibleTextColor?: OxyColor
}

/**
 * Represents a Legend.
 */
export class Legend extends LegendBase {
  private legendBox: OxyRect
  private readonly seriesPosMap: Map<Series, OxyRect> = new Map()
  public groupNameFont?: string
  public groupNameFontSize: number
  public groupNameFontWeight: number
  public seriesInvisibleTextColor: OxyColor

  /**
   * Initializes a new instance of the Legend class.
   */
  constructor(opt?: CreateLegendOptions) {
    super(opt)
    this.isLegendVisible = true
    this.legendBox = OxyRect.Empty
    this.key = undefined
    this.groupNameFont = undefined
    this.groupNameFontWeight = FontWeights.Normal
    this.groupNameFontSize = NaN

    this.legendTitleFont = undefined
    this.legendTitleFontSize = NaN
    this.legendTitleFontWeight = FontWeights.Bold
    this.legendFont = undefined
    this.legendFontSize = NaN
    this.legendFontWeight = FontWeights.Normal
    this.legendSymbolLength = 16
    this.legendSymbolMargin = 4
    this.legendPadding = 8
    this.legendColumnSpacing = 8
    this.legendItemSpacing = 24
    this.legendLineSpacing = 0
    this.legendMargin = 8

    this.legendBackground = OxyColors.Undefined
    this.legendBorder = OxyColors.Undefined
    this.legendBorderThickness = 1

    this.legendTextColor = OxyColors.Automatic
    this.legendTitleColor = OxyColors.Automatic

    this.legendMaxWidth = NaN
    this.legendMaxHeight = NaN
    this.legendPlacement = LegendPlacement.Inside
    this.legendPosition = LegendPosition.RightTop
    this.legendOrientation = LegendOrientation.Vertical
    this.legendItemOrder = LegendItemOrder.Normal
    this.legendItemAlignment = HorizontalAlignment.Left
    this.legendSymbolPlacement = LegendSymbolPlacement.Left

    this.showInvisibleSeries = true

    this.seriesInvisibleTextColor = OxyColor.fromAColor(64, this.legendTextColor)

    this.selectable = true
    this.selectionMode = SelectionMode.Single

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Override for legend hit test.
   * @param args Arguments passed to the hit test
   * @returns The hit test results.
   */
  protected legendHitTest(args: HitTestArguments): HitTestResult | undefined {
    if (!this.isLegendVisible || !this.plotModel.isLegendVisible) {
      return undefined
    }

    const point: ScreenPoint = args.point
    if (!this.isPointInLegend(point)) {
      return undefined
    }

    if (!(this.seriesPosMap && this.seriesPosMap.size > 0)) {
      return undefined
    }

    for (const [series, rect] of this.seriesPosMap) {
      if (rect.containsPoint(point)) {
        if (this.showInvisibleSeries) {
          series.isVisible = !series.isVisible
          this.plotModel.invalidatePlot(false)
          break
        }
      }
    }

    return undefined
  }

  /**
   * Checks if a screen point is within the legend boundaries.
   * @param point A screen point.
   * @returns A value indicating whether the point is inside legend boundaries or not.
   */
  public isPointInLegend(point: ScreenPoint): boolean {
    return this.legendBox.containsPoint(point)
  }

  // ===========Legend.Rendering==================
  /**
   * Makes the LegendOrientation property safe.
   * If Legend is positioned left or right, force it to vertical orientation
   */
  public ensureLegendProperties(): void {
    switch (this.legendPosition) {
      case LegendPosition.LeftTop:
      case LegendPosition.LeftMiddle:
      case LegendPosition.LeftBottom:
      case LegendPosition.RightTop:
      case LegendPosition.RightMiddle:
      case LegendPosition.RightBottom:
        if (this.legendOrientation === LegendOrientation.Horizontal) {
          this.legendOrientation = LegendOrientation.Vertical
        }
        break
    }
  }

  /**
   * Renders or measures the legends.
   * @param rc The render context.
   */
  public async renderLegends(rc: IRenderContext): Promise<void> {
    await this.renderOrMeasureLegends(rc, this.legendArea)
  }

  /**
   * Measures the legend area and gets the legend size.
   * @param rc The rendering context.
   * @param availableLegendArea The area available to legend.
   */
  public async getLegendSize(rc: IRenderContext, availableLegendArea: OxySize): Promise<OxySize> {
    const availableLegendWidth = availableLegendArea.width
    const availableLegendHeight = availableLegendArea.height

    // Calculate the size of the legend box
    let legendSize = await this.measureLegends(
      rc,
      new OxySize(Math.max(0, availableLegendWidth), Math.max(0, availableLegendHeight)),
    )

    // Ensure legend size is valid
    legendSize = new OxySize(Math.max(0, legendSize.width), Math.max(0, legendSize.height))

    return legendSize
  }

  /**
   * Gets the rectangle of the legend box.
   * @param legendSize Size of the legend box.
   * @returns A rectangle.
   */
  public getLegendRectangle(legendSize: OxySize): OxyRect {
    let top = 0
    let left = 0
    if (this.legendPlacement === LegendPlacement.Outside) {
      switch (this.legendPosition) {
        case LegendPosition.LeftTop:
        case LegendPosition.LeftMiddle:
        case LegendPosition.LeftBottom:
          left = this.plotModel.plotAndAxisArea.left - legendSize.width - this.legendMargin
          break
        case LegendPosition.RightTop:
        case LegendPosition.RightMiddle:
        case LegendPosition.RightBottom:
          left = this.plotModel.plotAndAxisArea.right + this.legendMargin
          break
        case LegendPosition.TopLeft:
        case LegendPosition.TopCenter:
        case LegendPosition.TopRight:
          top = this.plotModel.plotAndAxisArea.top - legendSize.height - this.legendMargin
          break
        case LegendPosition.BottomLeft:
        case LegendPosition.BottomCenter:
        case LegendPosition.BottomRight:
          top = this.plotModel.plotAndAxisArea.bottom + this.legendMargin
          break
      }

      const bounds = this.allowUseFullExtent ? this.plotModel.plotAndAxisArea : this.plotModel.plotArea

      switch (this.legendPosition) {
        case LegendPosition.TopLeft:
        case LegendPosition.BottomLeft:
          left = bounds.left
          break
        case LegendPosition.TopRight:
        case LegendPosition.BottomRight:
          left = bounds.right - legendSize.width
          break
        case LegendPosition.LeftTop:
        case LegendPosition.RightTop:
          top = bounds.top
          break
        case LegendPosition.LeftBottom:
        case LegendPosition.RightBottom:
          top = bounds.bottom - legendSize.height
          break
        case LegendPosition.LeftMiddle:
        case LegendPosition.RightMiddle:
          top = (bounds.top + bounds.bottom - legendSize.height) * 0.5
          break
        case LegendPosition.TopCenter:
        case LegendPosition.BottomCenter:
          left = (bounds.left + bounds.right - legendSize.width) * 0.5
          break
      }
    } else {
      switch (this.legendPosition) {
        case LegendPosition.LeftTop:
        case LegendPosition.LeftMiddle:
        case LegendPosition.LeftBottom:
          left = this.plotModel.plotArea.left + this.legendMargin
          break
        case LegendPosition.RightTop:
        case LegendPosition.RightMiddle:
        case LegendPosition.RightBottom:
          left = this.plotModel.plotArea.right - legendSize.width - this.legendMargin
          break
        case LegendPosition.TopLeft:
        case LegendPosition.TopCenter:
        case LegendPosition.TopRight:
          top = this.plotModel.plotArea.top + this.legendMargin
          break
        case LegendPosition.BottomLeft:
        case LegendPosition.BottomCenter:
        case LegendPosition.BottomRight:
          top = this.plotModel.plotArea.bottom - legendSize.height - this.legendMargin
          break
      }

      switch (this.legendPosition) {
        case LegendPosition.TopLeft:
        case LegendPosition.BottomLeft:
          left = this.plotModel.plotArea.left + this.legendMargin
          break
        case LegendPosition.TopRight:
        case LegendPosition.BottomRight:
          left = this.plotModel.plotArea.right - legendSize.width - this.legendMargin
          break
        case LegendPosition.LeftTop:
        case LegendPosition.RightTop:
          top = this.plotModel.plotArea.top + this.legendMargin
          break
        case LegendPosition.LeftBottom:
        case LegendPosition.RightBottom:
          top = this.plotModel.plotArea.bottom - legendSize.height - this.legendMargin
          break
        case LegendPosition.LeftMiddle:
        case LegendPosition.RightMiddle:
          top = (this.plotModel.plotArea.top + this.plotModel.plotArea.bottom - legendSize.height) * 0.5
          break
        case LegendPosition.TopCenter:
        case LegendPosition.BottomCenter:
          left = (this.plotModel.plotArea.left + this.plotModel.plotArea.right - legendSize.width) * 0.5
          break
      }
    }

    return new OxyRect(left, top, legendSize.width, legendSize.height)
  }

  /**
   * Renders the legend for the specified series.
   * @param rc The render context.
   * @param s The series.
   * @param rect The position and size of the legend.
   */
  private async renderLegend(rc: IRenderContext, s: Series, rect: OxyRect): Promise<void> {
    let actualItemAlignment = this.legendItemAlignment
    if (this.legendOrientation === LegendOrientation.Horizontal) {
      // center/right alignment is not supported for horizontal orientation
      actualItemAlignment = HorizontalAlignment.Left
    }

    let x = rect.left
    switch (actualItemAlignment) {
      case HorizontalAlignment.Center:
        x = (rect.left + rect.right) / 2
        if (this.legendSymbolPlacement === LegendSymbolPlacement.Left) {
          x -= (this.legendSymbolLength + this.legendSymbolMargin) / 2
        } else {
          x -= (this.legendSymbolLength + this.legendSymbolMargin) / 2
        }
        break
      case HorizontalAlignment.Right:
        x = rect.right
        if (this.legendSymbolPlacement === LegendSymbolPlacement.Right) {
          x -= this.legendSymbolLength + this.legendSymbolMargin
        }
        break
    }

    if (this.legendSymbolPlacement === LegendSymbolPlacement.Left) {
      x += this.legendSymbolLength + this.legendSymbolMargin
    }

    const y = rect.top
    const maxsize = new OxySize(
      Math.max(rect.width - this.legendSymbolLength - this.legendSymbolMargin, 0),
      rect.height,
    )
    const actualLegendFontSize = isNaN(this.legendFontSize) ? this.plotModel.defaultFontSize : this.legendFontSize

    let legendTextColor = s.isVisible ? this.legendTextColor : this.seriesInvisibleTextColor
    legendTextColor = legendTextColor || OxyColors.Black

    rc.setToolTip(s.toolTip)
    const textSize = await MathRenderingExtensions.drawMathText(
      rc,
      newScreenPoint(x, y),
      s.title || '',
      legendTextColor.getActualColor(this.plotModel.textColor),
      this.legendFont ?? this.plotModel.defaultFont,
      actualLegendFontSize,
      this.legendFontWeight,
      0,
      actualItemAlignment,
      VerticalAlignment.Top,
      maxsize,
      true,
    )

    this.seriesPosMap.set(s, OxyRect.fromScreenPointAndSize(newScreenPoint(x, y), textSize))
    let x0 = x
    switch (actualItemAlignment) {
      case HorizontalAlignment.Center:
        x0 = x - textSize.width * 0.5
        break
      case HorizontalAlignment.Right:
        x0 = x - textSize.width
        break
    }

    if (s.isVisible) {
      const symbolRect = new OxyRect(
        this.legendSymbolPlacement === LegendSymbolPlacement.Right
          ? x0 + textSize.width + this.legendSymbolMargin
          : x0 - this.legendSymbolMargin - this.legendSymbolLength,
        rect.top,
        this.legendSymbolLength,
        textSize.height,
      )

      await s.renderLegend(rc, symbolRect)
    }
    rc.setToolTip(undefined)
  }

  /**
   * Measures the legends.
   * @param rc The render context.
   * @param availableSize The available size for the legend box.
   * @returns The size of the legend box.
   */
  private measureLegends(rc: IRenderContext, availableSize: OxySize): Promise<OxySize> {
    return this.renderOrMeasureLegends(rc, new OxyRect(0, 0, availableSize.width, availableSize.height), true)
  }

  /**
   * Renders or measures the legends.
   * @param rc The render context.
   * @param rect Provides the available size if measuring, otherwise it provides the position and size of the legend.
   * @param measureOnly Specify if the size of the legend box should be measured only (not rendered).
   * @returns The size of the legend box.
   */
  private async renderOrMeasureLegends(rc: IRenderContext, rect: OxyRect, measureOnly = false): Promise<OxySize> {
    // Render background and border around legend
    if (!measureOnly && rect.width > 0 && rect.height > 0) {
      this.legendBox = rect
      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )
      await rc.drawRectangle(
        rect,
        this.legendBackground,
        this.legendBorder,
        this.legendBorderThickness,
        actualEdgeRenderingMode,
      )
    }

    const availableWidth = rect.width
    const availableHeight = rect.height

    let x = this.legendPadding
    let top = this.legendPadding

    let size = OxySize.Empty

    const actualLegendFontSize = isNaN(this.legendFontSize) ? this.plotModel.defaultFontSize : this.legendFontSize
    const actualLegendTitleFontSize = isNaN(this.legendTitleFontSize) ? actualLegendFontSize : this.legendTitleFontSize
    const actualGroupNameFontSize = isNaN(this.groupNameFontSize) ? actualLegendFontSize : this.groupNameFontSize

    // Render/measure the legend title
    if (this.legendTitle) {
      let titleSize: OxySize
      if (measureOnly) {
        titleSize = await MathRenderingExtensions.measureMathText(
          rc,
          this.legendTitle,
          this.legendTitleFont ?? this.plotModel.defaultFont,
          actualLegendTitleFontSize,
          this.legendTitleFontWeight,
        )
      } else {
        titleSize = await MathRenderingExtensions.drawMathText(
          rc,
          newScreenPoint(rect.left + x, rect.top + top),
          this.legendTitle,
          this.legendTitleColor.getActualColor(this.plotModel.textColor),
          this.legendTitleFont ?? this.plotModel.defaultFont,
          actualLegendTitleFontSize,
          this.legendTitleFontWeight,
          0,
          HorizontalAlignment.Left,
          VerticalAlignment.Top,
          undefined,
          true,
        )
      }

      top += titleSize.height
      size = new OxySize(x + titleSize.width + this.legendPadding, top + titleSize.height)
    }

    let y = top

    let lineHeight = 0

    // tolerance for floating-point number comparisons
    const epsilon = 1e-3

    // the maximum item with in the column being rendered (only used for vertical orientation)
    let maxItemWidth = 0

    const reversedSeries = getReversedCopy(this.plotModel.series)
    const items =
      this.legendItemOrder === LegendItemOrder.Reverse
        ? reversedSeries.filter((s) => s.renderInLegend && s.legendKey === this.key)
        : this.plotModel.series.filter((s) => s.renderInLegend && s.legendKey === this.key)

    const itemGroupNames: string[] = []
    for (const s of items) {
      if (!itemGroupNames.includes(s.seriesGroupName || '')) {
        itemGroupNames.push(s.seriesGroupName || '')
      }
    }

    // Clear the series position map.
    this.seriesPosMap.clear()

    const seriesToRender = new Map<Series, OxyRect>()
    const renderItems = async () => {
      const usedGroupNames: string[] = []
      for (const [series, itemRect] of seriesToRender) {
        if (series.seriesGroupName && !usedGroupNames.includes(series.seriesGroupName)) {
          usedGroupNames.push(series.seriesGroupName)
          const groupNameTextSize = await MathRenderingExtensions.measureMathText(
            rc,
            series.seriesGroupName,
            this.groupNameFont ?? this.plotModel.defaultFont,
            actualGroupNameFontSize,
            this.groupNameFontWeight,
          )
          let ypos = itemRect.top
          let xpos = itemRect.left
          if (this.legendOrientation === LegendOrientation.Vertical)
            ypos -= groupNameTextSize.height + this.legendLineSpacing / 2
          else xpos -= groupNameTextSize.width + this.legendItemSpacing / 2
          await MathRenderingExtensions.drawMathText(
            rc,
            newScreenPoint(xpos, ypos),
            series.seriesGroupName,
            this.legendTitleColor.getActualColor(this.plotModel.textColor),
            this.groupNameFont ?? this.plotModel.defaultFont,
            actualGroupNameFontSize,
            this.groupNameFontWeight,
            0,
            HorizontalAlignment.Left,
            VerticalAlignment.Top,
            undefined,
            true,
          )
        }

        let rwidth = availableWidth
        if (itemRect.left + rwidth + this.legendPadding > rect.left + availableWidth)
          rwidth = rect.left + availableWidth - itemRect.left - this.legendPadding

        let rheight = itemRect.height
        if (rect.top + rheight + this.legendPadding > rect.top + availableHeight)
          rheight = rect.top + availableHeight - rect.top - this.legendPadding

        const r = new OxyRect(itemRect.left, itemRect.top, Math.max(rwidth, 0), Math.max(rheight, 0))

        await this.renderLegend(rc, series, r)
      }

      usedGroupNames.length = 0
      seriesToRender.clear()
    }

    if (!measureOnly) rc.pushClip(rect)

    for (const g of itemGroupNames) {
      const itemGroup = items.filter((i) => (i.seriesGroupName || '') === g)
      let groupNameTextSize = OxySize.Empty

      if (itemGroup.length > 0 && g) {
        groupNameTextSize = await MathRenderingExtensions.measureMathText(
          rc,
          g,
          this.groupNameFont ?? this.plotModel.defaultFont,
          actualGroupNameFontSize,
          this.groupNameFontWeight,
        )

        if (this.legendOrientation === LegendOrientation.Vertical) {
          y += groupNameTextSize.height
        } else {
          x += groupNameTextSize.width
        }
      }

      let count = 0

      // Skip series with empty title
      for (const s of itemGroup) {
        if (!s.title || !s.renderInLegend) {
          continue
        }

        // Skip invisible series if we are not configured to show them
        if (!s.isVisible && !this.showInvisibleSeries) {
          continue
        }

        const textSize = await MathRenderingExtensions.measureMathText(
          rc,
          s.title,
          this.legendFont ?? this.plotModel.defaultFont,
          actualLegendFontSize,
          this.legendFontWeight,
        )
        const itemWidth = this.legendSymbolLength + this.legendSymbolMargin + textSize.width
        const itemHeight = textSize.height

        if (this.legendOrientation === LegendOrientation.Horizontal) {
          if (x > this.legendPadding) {
            x += this.legendItemSpacing
          }

          if (x + itemWidth > availableWidth - this.legendPadding + epsilon) {
            x = this.legendPadding

            if (count === 0 && groupNameTextSize.width > 0) {
              x += groupNameTextSize.width + this.legendItemSpacing
            }

            y += lineHeight + this.legendLineSpacing
            lineHeight = 0
          }

          lineHeight = Math.max(lineHeight, textSize.height)

          if (!measureOnly) {
            seriesToRender.set(s, new OxyRect(rect.left + x, rect.top + y, itemWidth, itemHeight))
          }

          x += itemWidth
          x = Math.max(groupNameTextSize.width, x)
          size = new OxySize(Math.max(size.width, x), Math.max(size.height, y + textSize.height))
        } else {
          if (y + itemHeight > availableHeight - this.legendPadding + epsilon) {
            await renderItems()

            y = top + groupNameTextSize.height
            x += maxItemWidth + this.legendColumnSpacing
            maxItemWidth = 0
          }

          if (!measureOnly) {
            seriesToRender.set(s, new OxyRect(rect.left + x, rect.top + y, itemWidth, itemHeight))
          }

          y += itemHeight + this.legendLineSpacing
          maxItemWidth = Math.max(maxItemWidth, itemWidth)
          size = new OxySize(Math.max(size.width, x + itemWidth), Math.max(size.height, y))
        }

        count++
      }

      await renderItems()
    }

    if (!measureOnly) {
      rc.popClip()
    }

    if (size.width > 0) {
      size = new OxySize(size.width + this.legendPadding, size.height)
    }

    if (size.height > 0) {
      size = new OxySize(size.width, size.height + this.legendPadding)
    }

    if (size.width > availableWidth) {
      size = new OxySize(availableWidth, size.height)
    }

    if (size.height > availableHeight) {
      size = new OxySize(size.width, availableHeight)
    }

    if (!isNaN(this.legendMaxWidth) && size.width > this.legendMaxWidth) {
      size = new OxySize(this.legendMaxWidth, size.height)
    }

    if (!isNaN(this.legendMaxHeight) && size.height > this.legendMaxHeight) {
      size = new OxySize(size.width, this.legendMaxHeight)
    }

    return size
  }
}
