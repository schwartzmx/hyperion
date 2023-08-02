/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
import * as React from "react";
import { getInitOptions } from "@hyperion/hyperion-autologging/src/AutoLogging";
export default function ALSessionGraph(_props) {
    let [eventBuffer, setEventBuffer] = React.useState([]);
    React.useEffect(() => {
        // Set up listeners
        const removeListeners = [];
        const options = getInitOptions();
        const uiChannel = options.uiEventPublisher?.channel;
        [
            'al_ui_event',
            'al_ui_event_capture',
            'al_ui_event_bubble',
        ].forEach(eventName => {
            const listener = uiChannel?.on(eventName).add(event => {
                setEventBuffer([...eventBuffer, event]);
            });
            if (listener) {
                removeListeners.push(() => uiChannel?.removeListener(eventName, listener));
            }
        });
        const surfaceChannel = options.surfaceMutationPublisher?.channel;
        const surfaceListener = surfaceChannel?.on('al_surface_mutation_event').add(event => {
            setEventBuffer([...eventBuffer, event]);
        });
        if (surfaceListener) {
            removeListeners.push(() => surfaceChannel?.removeListener('al_surface_mutation_event', surfaceListener));
        }
        const heartbeatChannel = options.heartbeat?.channel;
        const heartbeatListener = heartbeatChannel?.on('al_heartbeat_event').add(event => {
            setEventBuffer([...eventBuffer, event]);
        });
        if (heartbeatListener) {
            removeListeners.push(() => heartbeatChannel?.removeListener('al_heartbeat_event', heartbeatListener));
        }
        const flowletChannel = options.flowletPublisher?.channel;
        const flowletListener = flowletChannel?.on('al_flowlet_event').add(event => {
            setEventBuffer([...eventBuffer, event]);
        });
        if (flowletListener) {
            removeListeners.push(() => flowletChannel?.removeListener('al_flowlet_event', flowletListener));
        }
        const networkChannel = options.network?.channel;
        [
            'al_network_request',
            'al_network_response',
        ].forEach(eventName => {
            const listener = networkChannel?.on(eventName).add(event => {
                setEventBuffer([...eventBuffer, event]);
            });
            if (listener) {
                removeListeners.push(() => networkChannel?.removeListener(eventName, listener));
            }
        });
        // Remove registered listeners
        return () => removeListeners.forEach(rm => rm());
    }, []);
    return (<div>
        {JSON.stringify(eventBuffer)}
     </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQUxTZXNzaW9uR3JhcGguanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQUxTZXNzaW9uR3JhcGgudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBQ0gsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdEQUFnRCxDQUFDO0FBSTlFLE1BQU0sQ0FBQyxPQUFPLFVBQVUsY0FBYyxDQUFDLE1BQWE7SUFDbkQsSUFBSSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFnQixFQUFFLENBQUMsQ0FBQztJQUV0RSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNwQixtQkFBbUI7UUFDbkIsTUFBTSxlQUFlLEdBQXNCLEVBQUUsQ0FBQztRQUM5QyxNQUFNLE9BQU8sR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUNqQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO1FBQ25EO1lBQ0MsYUFBYTtZQUNiLHFCQUFxQjtZQUNyQixvQkFBb0I7U0FDWCxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixNQUFNLFFBQVEsR0FBRyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDcEQsY0FBYyxDQUFDLENBQUMsR0FBRyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksUUFBUSxFQUFFO2dCQUNaLGVBQWUsQ0FBQyxJQUFJLENBQ2xCLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUNyRCxDQUFDO2FBQ0g7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0Is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