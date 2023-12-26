/**
 * create images frequently will cause canvas flickering
 * So we mush cache the images somewhere
 */
export interface IRenderContextImageCacheService {
  get(key: string): ImageBitmap | HTMLImageElement

  set(key: string, value: ImageBitmap | HTMLImageElement): void

  clear(key?: string): void
}

class RenderContextImageCacheService implements IRenderContextImageCacheService {
  private readonly cache: Map<string, ImageBitmap | HTMLImageElement> = new Map()

  get(key: string): ImageBitmap | HTMLImageElement {
    return this.cache.get(key)!
  }

  set(key: string, value: ImageBitmap | HTMLImageElement): void {
    this.cache.set(key, value)
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

let renderContextImageCacheService: IRenderContextImageCacheService = new RenderContextImageCacheService()

export function getRenderContextImageCacheService(): IRenderContextImageCacheService {
  return renderContextImageCacheService
}

export function setRenderContextImageCacheService(service: IRenderContextImageCacheService): void {
  renderContextImageCacheService = service
}
