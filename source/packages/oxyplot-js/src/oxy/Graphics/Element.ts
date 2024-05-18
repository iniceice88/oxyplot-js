import {
  type HitTestArguments,
  type HitTestResult,
  type KeyDownEventType,
  Model,
  type MouseDownEventType,
  type MouseMoveEventType,
  type MouseUpEventType,
  type OxyColor,
  OxyColorEx,
  OxyColorHelper,
  OxyColors,
  type OxyKeyEventArgs,
  type OxyMouseDownEventArgs,
  type OxyMouseEventArgs,
  type OxyTouchEventArgs,
  type PlotModelSerializeOptions,
  Selection,
  SelectionMode,
  type TouchCompletedEventType,
  type TouchDeltaEventType,
  type TouchStartedEventType,
} from '@/oxyplot'
import { assignObject, copyPlotElementProperties } from '@/patch'

export interface CreateElementOptions {
  selectable?: boolean
  selectionMode?: SelectionMode
}

export const DefaultElementOptions: CreateElementOptions = {
  selectable: true,
  selectionMode: SelectionMode.All,
}

export const ExtendedDefaultElementOptions = DefaultElementOptions

/**
 * Provides an abstract base class for graphical elements.
 */
export abstract class Element {
  protected constructor(opt?: CreateElementOptions) {
    assignObject(this, DefaultElementOptions, opt)
    if (this.getElementName) {
      this.__oxy_element_name__ = this.getElementName()
    }
    if (!this.__oxy_element_name__) {
      console.warn('The element name is not set. Please implement the getElementName method.')
    }
  }

  // for deserialization
  abstract getElementName(): string

  protected __oxy_element_name__?: string

  /**
   * Gets the parent model of the element.
   * @internal
   */
  private _parent?: Model

  set parent(value: Model | undefined) {
    this._parent = value
  }

  get parent(): Model | undefined {
    return this._parent
  }

  /**
   * Tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   * @returns A hit test result, or undefined if no hit is detected.
   */
  public hitTest(args: HitTestArguments): HitTestResult | undefined {
    return this.hitTestOverride(args)
  }

  /**
   * When overridden in a derived class, tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   * @returns The result of the hit test, or undefined if no hit is detected.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    return undefined
  }

  // ============================ObsoleteMembers================================

  /**
   * Occurs when a key is pressed down when the plot view is in focus.
   * @deprecated Will be removed in v4.0 (#111)
   */
  keyDown?: KeyDownEventType

  /**
   * Occurs when a mouse button is pressed down on the model.
   * @deprecated Will be removed in v4.0 (#111)
   */
  mouseDown?: MouseDownEventType

  /**
   * Occurs when the mouse is moved on the plot element (only occurs after MouseDown).
   * @deprecated Will be removed in v4.0 (#111)
   */
  mouseMove?: MouseMoveEventType

  /**
   * Occurs when the mouse button is released on the plot element.
   * @deprecated Will be removed in v4.0 (#111)
   */
  mouseUp?: MouseUpEventType

  /**
   * Occurs when a touch gesture starts.
   * @deprecated Will be removed in v4.0 (#111)
   */
  touchStarted?: TouchStartedEventType

  /**
   * Occurs when a touch gesture is changed.
   * @deprecated Will be removed in v4.0 (#111)
   */
  touchDelta?: TouchDeltaEventType

  /**
   * Occurs when the touch gesture is completed.
   * @deprecated Will be removed in v4.0 (#111)
   */
  touchCompleted?: TouchCompletedEventType

  /**
   * Raises the `MouseDown` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onMouseDown(e: OxyMouseDownEventArgs): void {
    this.mouseDown && this.mouseDown(this, e)
  }

  /**
   * Raises the `MouseMove` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onMouseMove(e: OxyMouseEventArgs): void {
    this.mouseMove && this.mouseMove(this, e)
  }

  /**
   * Raises the `KeyDown` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onKeyDown(e: OxyKeyEventArgs): void {
    this.keyDown && this.keyDown(this, e)
  }

  /**
   * Raises the `MouseUp` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onMouseUp(e: OxyMouseEventArgs): void {
    this.mouseUp && this.mouseUp(this, e)
  }

  /**
   * Raises the `TouchStarted` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onTouchStarted(e: OxyTouchEventArgs): void {
    this.touchStarted && this.touchStarted(this, e)
  }

  /**
   * Raises the `TouchDelta` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onTouchDelta(e: OxyTouchEventArgs): void {
    this.touchDelta && this.touchDelta(this, e)
  }

  /**
   * Raises the `TouchCompleted` event.
   * @deprecated Will be removed in v4.0 (#111)
   * @internal
   */
  onTouchCompleted(e: OxyTouchEventArgs): void {
    this.touchCompleted && this.touchCompleted(this, e)
  }

  // ===============Selectable===============

  /**
   * The selection
   */
  private _selection?: Selection
  /**
   * Occurs when the selected items is changed.
   * @deprecated May be removed in v4.0 (#111)
   */
  selectionChanged?: (sender: any, e: any) => void

  /**
   * A value indicating whether this element can be selected. The default is true.
   */
  public selectable: boolean = DefaultElementOptions.selectable!

  /**
   * The selection mode of items in this element. The default is SelectionMode.All.
   * This is only used by the select/unselect functionality, not by the rendering.
   */
  public selectionMode: SelectionMode = DefaultElementOptions.selectionMode!

  /**
   * Gets the actual selection color.
   */
  protected get actualSelectedColor(): OxyColor {
    if (this.parent) {
      return OxyColorHelper.getActualColor(this.parent.selectionColor, Model.DefaultSelectionColor)
    }

    return Model.DefaultSelectionColor
  }

  /**
   * Determines whether any part of this element is selected.
   */
  public isSelected(): boolean {
    return !!this._selection
  }

  /**
   * Gets the indices of the selected items in this element.
   */
  public getSelectedItems(): number[] {
    this.ensureSelection()
    return this._selection!.getSelectedItems()
  }

  /**
   * Clears the selection.
   */
  public clearSelection(): void {
    this._selection = undefined
    this.onSelectionChanged()
  }

  /**
   * Unselects all items in this element.
   */
  public unselect(): void {
    this._selection = undefined
    this.onSelectionChanged()
  }

  /**
   * Determines whether the specified item is selected.
   * @param index The index of the item.
   */
  public isItemSelected(index: number): boolean {
    if (!this._selection) {
      return false
    }

    if (index === -1) {
      return this._selection.isEverythingSelected()
    }

    return this._selection.isItemSelected(index)
  }

  /**
   * Selects all items in this element.
   */
  public select(): void {
    this._selection = Selection.Everything
    this.onSelectionChanged()
  }

  /**
   * Selects the specified item.
   * @param index The index.
   */
  public selectItem(index: number): void {
    if (this.selectionMode === SelectionMode.All) {
      throw new Error('Use the select() method when using SelectionMode.All')
    }

    this.ensureSelection()
    if (this.selectionMode === SelectionMode.Single) {
      this._selection!.clear()
    }

    this._selection!.select(index)
    this.onSelectionChanged()
  }

  /**
   * Unselects the specified item.
   * @param index The index.
   */
  public unselectItem(index: number): void {
    if (this.selectionMode === SelectionMode.All) {
      throw new Error('Use the unselect() method when using SelectionMode.All')
    }

    this.ensureSelection()
    this._selection!.unselect(index)
    this.onSelectionChanged()
  }

  /**
   * Gets the selection color if the item is selected, or the specified color if it is not.
   * @param originalColor The unselected color of the element.
   * @param index The index of the item to check (use -1 for all items).
   */
  protected getSelectableColor(originalColor: OxyColor | OxyColorEx, index: number = -1): OxyColor {
    if (OxyColorHelper.isUndefined(originalColor)) {
      return OxyColors.Undefined
    }

    if (this.isItemSelected(index)) {
      return this.actualSelectedColor
    }

    return OxyColorEx.fromOxyColor(originalColor).hex
  }

  /**
   * Gets the selection fill color if the element is selected, or the specified fill color if it is not.
   * @param originalColor The unselected fill color of the element.
   * @param index The index of the item to check (use -1 for all items).
   * @returns A fill color.
   */
  protected getSelectableFillColor(originalColor: OxyColor, index: number = -1): OxyColor {
    return this.getSelectableColor(originalColor, index)
  }

  /**
   * Ensures that the selection field is not undefined.
   */
  private ensureSelection(): void {
    this._selection = this._selection || new Selection()
  }

  /**
   * Raises the SelectionChanged event.
   */
  private onSelectionChanged(args?: any): void {
    this.selectionChanged && this.selectionChanged(this, args)
  }

  protected getJsonIgnoreProperties(): string[] {
    return []
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultElementOptions
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const excludeKeys = this.getJsonIgnoreProperties()
    const defVal = this.getElementDefaultValues()
    return copyPlotElementProperties(this, defVal, {
      excludeKeys,
      excludeDefault: opt?.excludeDefault,
    })
  }
}
