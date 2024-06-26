﻿/**
 * Represents a selection of items (by index) and features (by enumeration type).
 */
export class Selection {
  /**
   * Static instance representing everything (all items and all features) selected.
   */
  private static readonly EverythingSelection = new Selection()

  /**
   * The selection
   */
  private readonly selection: Map<SelectionItem, boolean> = new Map()

  /**
   * Gets everything selected.
   */
  public static get Everything(): Selection {
    return Selection.EverythingSelection
  }

  /**
   * Determines whether everything is selected.
   */
  public isEverythingSelected(): boolean {
    return this === Selection.EverythingSelection
  }

  /**
   * Gets the indices of the selected items in this selection.
   */
  public getSelectedItems(): number[] {
    return Array.from(this.selection.keys()).map((si) => si.index)
  }

  /**
   * Gets the selected items by the specified feature.
   * @param feature The feature.
   */
  public getSelectedItemsByFeature(feature: any): number[] {
    return Array.from(this.selection.keys())
      .filter((si) => si.feature === feature)
      .map((si) => si.index)
  }

  /**
   * Clears the selected items.
   */
  public clear(): void {
    this.selection.clear()
  }

  /**
   * Determines whether the specified item and feature is selected.
   * @param index The index of the item.
   * @param feature The feature.
   */
  public isItemSelected(index: number, feature: any = null): boolean {
    if (this.isEverythingSelected()) {
      return true
    }

    const si = newSelectionItem(index, feature)
    return this.hasSelection(si)
  }

  /**
   * Selects the specified item/feature.
   * @param index The index.
   * @param feature The feature.
   */
  public select(index: number, feature?: any): void {
    const si = newSelectionItem(index, feature)
    this.setSelection(si, true)
  }

  /**
   * Unselects the specified item.
   * @param index The index of the item.
   * @param feature The feature.
   */
  public unselect(index: number, feature?: any): void {
    const si = newSelectionItem(index, feature)
    if (!this.hasSelection(si)) {
      throw new Error(`Item ${index} and feature ${feature} is not selected. Cannot unselect.`)
    }

    this.deleteSelection(si)
  }

  private getSameKey(item: SelectionItem) {
    for (const si of this.selection.keys()) {
      if (selectionItemEquals(si, item)) return si
    }
    return undefined
  }

  private hasSelection(item: SelectionItem): boolean {
    return !!this.getSameKey(item)
  }

  private deleteSelection(item: SelectionItem): void {
    const key = this.getSameKey(item)
    if (!key) return
    this.selection.delete(key)
  }

  private setSelection(item: SelectionItem, val: boolean): void {
    const key = this.getSameKey(item) || item
    this.selection.set(key, val)
  }
}

/**
 * Represents an item in a Selection.
 */
interface SelectionItem {
  /**
   * The index
   */
  readonly index: number

  /**
   * The feature
   */
  readonly feature?: any
}

function newSelectionItem(index: number, feature?: any): SelectionItem {
  return {
    index,
    feature,
  }
}

/**
 * Indicates whether the current object is equal to another object of the same type.
 * @param si
 * @param other An object to compare with this object.
 */
function selectionItemEquals(si: SelectionItem, other: SelectionItem): boolean {
  return other.index === si.index && other.feature === si.feature
}
