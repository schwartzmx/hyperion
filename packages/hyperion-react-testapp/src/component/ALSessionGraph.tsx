/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
import * as React from "react";
import * as AutoLogging from "@hyperion/hyperion-autologging/src/AutoLogging";
import { ALSurfaceMutationEventData } from "@hyperion/hyperion-autologging/src/ALSurfaceMutationPublisher";
import { ALNetworkRequestEvent, ALNetworkResponseEvent } from "@hyperion/hyperion-autologging/src/ALNetworkPublisher";
import { ALUIEventBubbleData, ALUIEventCaptureData, ALUIEventData } from "@hyperion/hyperion-autologging/src/ALUIEventPublisher";
import { ALFlowletEventData } from "@hyperion/hyperion-autologging/src/ALFlowletPublisher";
import { AdsALHeartbeatEventData } from "@hyperion/hyperion-autologging/src/ALHeartbeat";


type EventBody = {event: string} & ALFlowletEventData |
  ALUIEventData |
  ALSurfaceMutationEventData |
  ALNetworkRequestEvent |
  ALNetworkResponseEvent |
  AdsALHeartbeatEventData |
  ALUIEventCaptureData |
  ALUIEventBubbleData;


export default function ALSessionGraph() {
  const [eventBuffer, setEventBuffer] = React.useState<Array<EventBody>>([]);

  const addEvent = React.useCallback((event: EventBody): void => {
    setEventBuffer(eventBuffer => [...eventBuffer, event])
  }, []);

  React.useEffect(() => {
    // Set up listeners
    const removeListeners: Array<() => void> = [];
    const options = AutoLogging.getInitOptions();
    const uiChannel = options.uiEventPublisher?.channel;
    const uiEvents: Array<'al_ui_event' | 'al_ui_event_capture' | 'al_ui_event_bubble'> = [
      'al_ui_event',
      'al_ui_event_capture',
      'al_ui_event_bubble',
    ];
    uiEvents.forEach(eventName => {
      const listener = uiChannel?.on(eventName).add(addEvent);
      if (listener) {
        removeListeners.push(
          () => uiChannel?.removeListener(eventName, listener)
        );
      }
    });
    const surfaceChannel = options.surfaceMutationPublisher?.channel;
    const surfaceListener = surfaceChannel?.on('al_surface_mutation_event').add(addEvent);
    if (surfaceListener) {
      removeListeners.push(
        () => surfaceChannel?.removeListener('al_surface_mutation_event', surfaceListener)
      );
    }
    const heartbeatChannel = options.heartbeat?.channel;
    const heartbeatListener = heartbeatChannel?.on('al_heartbeat_event').add(addEvent);
    if (heartbeatListener) {
      removeListeners.push(
        () => heartbeatChannel?.removeListener('al_heartbeat_event', heartbeatListener)
      );
    }
    // With this enabled,  there's like an infinite loop of interception and emitting events /then/then/then/then/then/then/then/then/then/then/....
    // const flowletChannel = options.flowletPublisher?.channel;
    // const flowletListener = flowletChannel?.on('al_flowlet_event').add(e => addEvent({event: "flowlet_init", ...e}));
    // if (flowletListener) {
    //   removeListeners.push(
    //     () => flowletChannel?.removeListener('al_flowlet_event', flowletListener)
    //   );
    // }
    const networkChannel = options.network?.channel;
    const networkEvents: Array<'al_network_request' | 'al_network_response'> = [
      'al_network_request',
      'al_network_response',
    ];
    networkEvents.forEach(eventName => {
      const listener = networkChannel?.on(eventName).add(addEvent);
      if (listener) {
        removeListeners.push(
          () => networkChannel?.removeListener(eventName, listener)
        );
      }
    })

    // Remove registered listeners
    return () => removeListeners.forEach(rm => rm());
  }, [addEvent]);

  return (
    <>
      <div style={{textAlign:"left"}}>
        <pre>{JSON.stringify(eventBuffer.map((e, i) => {return {id: i, ev: e.event};}), undefined, 2)}</pre>
      </div>
    </>
  );
}
