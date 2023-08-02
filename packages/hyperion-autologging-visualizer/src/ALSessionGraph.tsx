/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
import * as React from "react";
import {getInitOptions} from "@hyperion/hyperion-autologging/src/AutoLogging";

type Props = {};

export default function ALSessionGraph(_props: Props): React.ReactElement  {
 let [eventBuffer, setEventBuffer] = React.useState<Array<object>>([]);

 React.useEffect(() => {
  // Set up listeners
  const removeListeners: Array<() => void> = [];
  const options = getInitOptions();
  const uiChannel = options.uiEventPublisher?.channel;
  ([
    'al_ui_event',
    'al_ui_event_capture',
    'al_ui_event_bubble',
  ] as const).forEach(eventName => {
    const listener = uiChannel?.on(eventName).add(event => {
      setEventBuffer([...eventBuffer, event])
    });
    if (listener) {
      removeListeners.push(
        () => uiChannel?.removeListener(eventName, listener)
      );
    }
  });
  const surfaceChannel = options.surfaceMutationPublisher?.channel;
  const surfaceListener = surfaceChannel?.on('al_surface_mutation_event').add(event => {
    setEventBuffer([...eventBuffer, event])
  });
  if (surfaceListener) {
    removeListeners.push(
      () => surfaceChannel?.removeListener('al_surface_mutation_event', surfaceListener)
    );
  }
  const heartbeatChannel = options.heartbeat?.channel;
  const heartbeatListener = heartbeatChannel?.on('al_heartbeat_event').add(event => {
    setEventBuffer([...eventBuffer, event])
  });
  if (heartbeatListener) {
    removeListeners.push(
      () => heartbeatChannel?.removeListener('al_heartbeat_event', heartbeatListener)
    );
  }
  const flowletChannel = options.flowletPublisher?.channel;
  const flowletListener = flowletChannel?.on('al_flowlet_event').add(event => {
    setEventBuffer([...eventBuffer, event])
  });
  if (flowletListener) {
    removeListeners.push(
      () => flowletChannel?.removeListener('al_flowlet_event', flowletListener)
    );
  }
  const networkChannel = options.network?.channel;
  ([
    'al_network_request',
    'al_network_response',
  ] as const).forEach(eventName => {
    const listener = networkChannel?.on(eventName).add(event => {
      setEventBuffer([...eventBuffer, event])
    });
    if (listener) {
      removeListeners.push(
        () => networkChannel?.removeListener(eventName, listener)
      );
    }
  })

  // Remove registered listeners
  return () => removeListeners.forEach(rm => rm());
 }, []);

  return (
      <div>
        {JSON.stringify(eventBuffer)}
     </div>
   );
}
