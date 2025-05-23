/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';

type TimeoutID = number | any /* React expects Timeout?! */;


const SUPPORTS_IDLE_CALLBACK = typeof requestIdleCallback === 'function' && typeof cancelIdleCallback === "function";

type TimedAction = (timerFired: boolean) => void;

/**
 * This class can be used when we want to run a function once either by calling
 * it explicitly, or have it run after a certain time automatically.
 * It also allows cancelling or delaying the function if it has not yet
 * executed.
 * The class also exposes the current state of the function.
 *
 * Generally, this is useful utility for handling state changes that may
 * have a time element as well.
 *
 * The final callback function will know if it was called directly or by the
 * timer.
 */
export class TimedTrigger {
  private _timeoutID: TimeoutID | null = null;
  private _timerFired: boolean = false;
  private _delay: number;
  private _isdone: boolean = false;
  private readonly _action: TimedAction;
  private readonly _useIdleCallback: boolean;


  constructor(action: TimedAction, delay: number, useIdleCallback: boolean = false) {
    this._action = action;
    this._delay = delay;
    this._useIdleCallback = useIdleCallback && SUPPORTS_IDLE_CALLBACK;
    this._setTimer();
  }

  private _clearTimer() {
    if (this._timeoutID != null) {
      if (this._useIdleCallback) {
        cancelIdleCallback(this._timeoutID);
      } else {
        clearTimeout(this._timeoutID);
      }
    }
    this._timeoutID = null;
  }

  private _setTimer() {
    if (!this.isDone()) {
      this._clearTimer();
      if (this._useIdleCallback) {
        this._timeoutID = requestIdleCallback((deadline) => {
          this._timerFired = deadline.didTimeout;
          this.run();
        }, { timeout: this._delay });
      } else {
        this._timeoutID = setTimeout(() => {
          this._timerFired = true;
          this.run();
        }, this._delay);
      }
    }
  }

  isDone(): boolean {
    return this._isdone;
  }

  isCancelled(): boolean {
    return this._timeoutID === null && !this.isDone();
  }

  run() {
    this._clearTimer();
    if (!this.isDone()) {
      // Copy and change before calling so we know this isDone
      const action = this._action;
      this._isdone = true;
      action(this._timerFired);
    }
  }

  getDelay(): number {
    return this._delay;
  }

  delay(delay?: number) {
    this._delay = delay ?? this._delay;
    this._setTimer();
  }

  cancel() {
    this._clearTimer();
  }

  restart(delay?: number) {
    this._clearTimer();
    this._timerFired = false;
    this._isdone = false;
    this.delay(delay);
  }
}
