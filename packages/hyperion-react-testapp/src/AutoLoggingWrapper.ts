/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

import * as Visualizer from "hyperion-autologging-visualizer/src/Visualizer";
import { ALElementText } from "hyperion-autologging/src/ALInteractableDOMElement";
import * as AutoLogging from "hyperion-autologging/src/AutoLogging";
import * as IReact from "hyperion-react/src/IReact";
import * as IReactDOM from "hyperion-react/src/IReactDOM";
import { ClientSessionID, getDomainSessionID } from "hyperion-util/src/ClientSessionID";
import React from 'react';
import * as ReactDOM from "react-dom";
import ReactDev from "react/jsx-dev-runtime";
import { SyncChannel } from "./Channel";
import { FlowletManager } from "./FlowletManager";
import { ALExtensibleEvent } from "hyperion-autologging/src/ALType";
import { getEventExtension } from "hyperion-autologging/src/ALEventExtension";
import * as Flags from "hyperion-globals/src/Flags";
import "hyperion-autologging/src/reference";
import * as PluginEventHash from "hyperion-autologging-plugin-eventhash/src/index";
import { getSessionFlowID } from "hyperion-autologging/src/ALSessionFlowID";

export let interceptionStatus = "disabled";

globalThis.__DEV__ = true;

export function init() {
  Flags.setFlags({
    preciseTriggerFlowlet: true,
    optimizeInteractibiltyCheck: true,
    enableDynamicChildTracking: true,
  });

  interceptionStatus = "enabled";
  const flowletManager = FlowletManager;

  const IReactModule = IReact.intercept("react", React, [])
  const IJsxRuntimeModule = IReact.interceptRuntime("react/jsx-dev-runtime", ReactDev as any, []);
  const IReactDOMModule = IReactDOM.intercept("react-dom", ReactDOM, []);

  const channel = SyncChannel;

  Visualizer.init({
    flowletManager,
    channel,
  });

  channel.on("test").add((i, s) => { // Showing channel can be extend beyond expected types

  });


  const testCompValidator = (name: string) => !name.match(/(^Surface(Proxy)?)/);

  console.log('csid:', ClientSessionID);
  console.log('dsid', getDomainSessionID('localhost'));
  console.log('dsid', getDomainSessionID());

  // Better to first setup listeners before initializing AutoLogging so we don't miss any events (e.g. Heartbeat(START))



  interface ExtendedElementText extends ALElementText {
    isExtended?: boolean;
  }

  AutoLogging.init({
    flowletManager,
    channel,
    plugins: [
      PluginEventHash.init
    ],
    componentNameValidator: testCompValidator,
    flowletPublisher: {
      channel
    },
    triggerFlowlet: {
      enableReactMethodFlowlet: false,
      enableFlowletConstructorTracking: false,
    },
    react: {
      ReactModule: React as any,
      IReactDOMModule,
      IReactModule,
      IJsxRuntimeModule,
    },
    surface: {
      enableReactDomPropsExtension: false,
    },
    sessionFlowID: {
      domain: 'localhost',
      cookieName: 'axaxax',
    },
    elementText: {
      updateText(elementText: ExtendedElementText, domSource) {
        elementText.isExtended = true;
        // console.log("Element Text ", elementText, domSource);
      },
    },
    uiEventPublisher: {
      uiEvents: [
        {
          eventName: 'click',
          cacheElementReactInfo: true,
          enableElementTextExtraction: true,
          eventFilter: (domEvent) => domEvent.isTrusted
        },
        {
          eventName: 'mousedown',
          cacheElementReactInfo: true,
          enableElementTextExtraction: false,
          eventFilter: (domEvent) => domEvent.isTrusted
        },
        {
          eventName: 'keydown',
          cacheElementReactInfo: true,
          interactableElementsOnly: false,
          enableElementTextExtraction: false,
          eventFilter: (domEvent) => domEvent.code === 'Enter',
        },
        {
          eventName: 'keyup',
          cacheElementReactInfo: true,
          interactableElementsOnly: false,
          enableElementTextExtraction: false,
          eventFilter: (domEvent) => domEvent.code === 'Enter',
        },
        {
          eventName: 'change',
          cacheElementReactInfo: true,
          enableElementTextExtraction: true,
          interactableElementsOnly: false,
        },
        // {
        //   eventName: 'mouseover',
        //   cacheElementReactInfo: true,
        //   interactableElementsOnly: false,
        //   enableElementTextExtraction: true,
        //   durationThresholdToEmitHoverEvent: 1000,
        // },
      ]
    },
    heartbeat: {
      heartbeatInterval: 30 * 1000
    },
    surfaceMutationPublisher: {
      cacheElementReactInfo: true,
      enableElementTextExtraction: false,
    },
    surfaceVisibilityPublisher: {},
    network: {
      requestFilter: request => !/robots/.test(request.url.toString()),
      requestUrlMarker: (request, params) => {
        const flowlet = FlowletManager.top();
        if (flowlet) {
          params.set('flowlet', flowlet.getFullName());
        }
      }
    },
    domSnapshotPublisher: {
      eventConfig: [
        'al_ui_event',
        'al_surface_visibility_event'
      ]
    }
  });

  console.log('AutoLogging.init options:', AutoLogging.getInitOptions());
  // console.log('dsid', getDomainSessionID('localhost'));
  // console.log('dsid', getDomainSessionID());
  console.log('sfid', getSessionFlowID());

}
