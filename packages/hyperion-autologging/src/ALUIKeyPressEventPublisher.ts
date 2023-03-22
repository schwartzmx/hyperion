/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';
import { Channel } from "@hyperion/hook/src/Channel";
import performanceAbsoluteNow from "@hyperion/hyperion-util/src/performanceAbsoluteNow";
import * as Types from "@hyperion/hyperion-util/src/Types";
import ALElementInfo from './ALElementInfo';
import { ALFlowlet } from "./ALFlowletManager";
import { ALID, getOrSetAutoLoggingID } from "./ALID";
import { getElementName, getInteractable, trackInteractable } from "./ALInteractableDOMElement";
import { ReactComponentData } from "./ALReactUtils";
import { getSurfacePath } from "./ALSurfaceUtils";
import { ALFlowletEvent, ALReactElementEvent, ALSharedInitOptions, ALTimedEvent } from "./ALType";

export type ALUIKeyEvent = Readonly<{
  event: string,
  element?: Element | null,
  elementName?: string | null,
  isTrusted: boolean,
}>;

export type ALUIKeyCaptureEventData = Readonly<
  ALUIKeyEvent &
  ALFlowletEvent &
  ALReactElementEvent &
  {
    captureTimestamp: number,
    surface: string | null,
    autoLoggingID?: ALID | null,
    keyboardEvent: KeyboardEvent,
  }
>;

export type ALUIEventBubbleData = Readonly<
  ALUIKeyEvent &
  {
    bubbleTimestamp: number,
    keyboardEvent: KeyboardEvent,
    currentlyActiveKeys: Array<string>,
  }
>;


export type ALKeyLoggableUIEvent = Readonly<
  ALTimedEvent &
  ALUIKeyEvent &
  ALFlowletEvent &
  ALReactElementEvent &
  {
    autoLoggingID: ALID,
    surface?: string | null,
  }
>;

export type ALUIKeyEventData = Readonly<
  ALKeyLoggableUIEvent
>;

export type ALChannelUIEvent = Readonly<{
  al_ui_key_event_capture: [ALUIKeyCaptureEventData],
  al_ui_key_event_bubble: [ALUIEventBubbleData],
  al_ui_key_event: [ALUIKeyEventData],
}>;

type ALChannel = Channel<ALChannelUIEvent>;

const activeKeyMap = new Map<string, ALUIKeyCaptureEventData>();

export type InitOptions = Types.Options<
  ALSharedInitOptions &
  {
    keyEvents: Array<'keydown' | 'keyup'>;
    channel: ALChannel;
    cacheElementReactInfo: boolean;
  }
>;

export function publish(options: InitOptions): void {
  const { keyEvents, flowletManager, channel, domSurfaceAttributeName, cacheElementReactInfo } = options;

  trackInteractable(keyEvents);

  let flowlet: ALFlowlet;

  keyEvents.forEach(eventName => {
    // Track event in the capturing phase
    window.document.addEventListener(eventName, (event: KeyboardEvent) => {
      const element = getInteractable(event.target, eventName);
      if (element == null) {
        return;
      }

      const captureTimestamp = performanceAbsoluteNow();

      if (event.isTrusted && event.bubbles) {
        const ALFlowlet = flowletManager.flowletCtor;
        flowlet = new ALFlowlet(eventName, flowletManager.top());
        flowlet = new ALFlowlet(`ts${captureTimestamp}`, flowlet);
        flowlet = flowletManager.push(flowlet);
      }
      let autoLoggingID = null;
      let elementName = null;
      let reactComponentData: ReactComponentData | null = null;
      if (element) {
        autoLoggingID = getOrSetAutoLoggingID(element);
        elementName = getElementName(element)
        if (cacheElementReactInfo) {
          const elementInfo = ALElementInfo.getOrCreate(element);
          reactComponentData = elementInfo.getReactComponentData();
        }
      }
      const eventData: ALUIKeyCaptureEventData = {
        event: eventName,
        element,
        captureTimestamp,
        flowlet,
        isTrusted: event.isTrusted,
        surface: getSurfacePath(element, domSurfaceAttributeName),
        elementName,
        reactComponentName: reactComponentData?.name,
        reactComponentStack: reactComponentData?.stack,
        autoLoggingID,
        keyboardEvent: event,
      };

      channel.emit('al_ui_key_event_capture', eventData);

      if (eventName === 'keydown') {
        activeKeyMap.set(event.code, eventData);
      }
    },
      true, // useCapture
    );

    // Track event in the bubbling phase
    window.document.addEventListener(
      eventName,
      (event: KeyboardEvent) => {
        const element = getInteractable(event.target, eventName);
        if (element == null) {
          return;
        }
        channel.emit('al_ui_key_event_bubble', {
          event: eventName,
          element,
          bubbleTimestamp: performanceAbsoluteNow(),
          isTrusted: event.isTrusted,
          keyboardEvent: event,
          currentlyActiveKeys: Array.from(activeKeyMap.keys()),
        });

        if (eventName === 'keyup') {
          activeKeyMap.delete(event.code);
        }

        if (event.isTrusted) {
          flowletManager.pop(flowlet);
        }
      },
      false, // useCapture
    );
  });
}
