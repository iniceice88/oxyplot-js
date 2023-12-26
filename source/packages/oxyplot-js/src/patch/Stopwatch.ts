import { TimeSpan } from './TimeSpan'

export class Stopwatch {
  private _startTime: number = 0
  private _stopTime: number = 0
  private _isRunning: boolean = false

  static startNew(): Stopwatch {
    const sw = new Stopwatch()
    sw.start()
    return sw
  }

  public get elapsedMilliseconds(): number {
    if (this._isRunning) {
      return Date.now() - this._startTime
    } else {
      return this._stopTime - this._startTime
    }
  }

  public get elapsed(): TimeSpan {
    return TimeSpan.fromMilliseconds(this.elapsedMilliseconds)
  }

  public get isRunning(): boolean {
    return this._isRunning
  }

  public start(): void {
    if (this._isRunning) return
    this._isRunning = true
    this._startTime = Date.now()
  }

  public stop(): void {
    if (!this._isRunning) return
    this._isRunning = false
    this._stopTime = Date.now()
  }

  public reset(): void {
    this._startTime = 0
    this._stopTime = 0
    this._isRunning = false
  }
}
