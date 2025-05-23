/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';

import { assert } from "hyperion-globals";
import { guid } from "hyperion-util/src/guid";
import performanceAbsoluteNow from "hyperion-util/src/performanceAbsoluteNow";
import { CookiePersistentData } from "hyperion-util/src/PersistentData";
import { ALChannelUIEvent } from "./ALUIEventPublisher";
import { Channel } from "hyperion-channel";
import { ALChannelHeartbeatEvent, ALHeartbeatType } from "./ALHeartbeat";
import { ALTimedEvent } from "./ALType";

export interface SessionFlowID {
  id: string;
  timestamp: number;
}

let sessionFlowID: CookiePersistentData<SessionFlowID>;

export type InitOptions = {
  channel: Channel<ALChannelUIEvent & ALChannelHeartbeatEvent>;
  cookieName?: string;
  domain: string;
  maxAge?: number;
  path?: string;
}

export function init(options: InitOptions) {
  const currentHostname = window.location.hostname;
  assert(currentHostname.endsWith(options.domain), "invalid top level domain for this page");

  const maxAge = options.maxAge || 10;

  sessionFlowID = new CookiePersistentData<SessionFlowID>(
    options.cookieName ?? 'alsfid',
    () => ({
      id: guid(),
      timestamp: performanceAbsoluteNow(),
    }),
    v => JSON.stringify(v),
    v => JSON.parse(v),
    `; max-age=${maxAge}; path=${options.path ?? '/'}; domain=${options.domain}`
  );

  // Even if the cookie did not work, we just check the time difference ouselves
  const now = performanceAbsoluteNow();
  const age =  (now - sessionFlowID.getValue().timestamp) / 1000; // msec to sec
  if (age > maxAge) {
    // Too much time has elapsed since last session, so start a new one
    sessionFlowID.setValue({
      id: guid(),
      timestamp: now
    });
  }

  // We use any activity that might be the last before moving to next page to update the value.
  function refershCookie(eventData: ALTimedEvent) {
    sessionFlowID.setValue({
      id: sessionFlowID.getValue().id,
      timestamp: eventData.eventTimestamp
    });
  }
  options.channel.addListener('al_ui_event_capture', refershCookie);
  options.channel.addListener('al_ui_event', refershCookie);

  options.channel.addListener('al_heartbeat_event', eventData => {
    if (eventData.heartbeatType === ALHeartbeatType.STOP) {
      refershCookie(eventData);
    }
  });

}

export function getSessionFlowID(): SessionFlowID | null {
  return sessionFlowID?.getValue();
}
