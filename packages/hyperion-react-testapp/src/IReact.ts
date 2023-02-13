/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

import { Channel } from "@hyperion/hook/src/Channel";
import * as IReact from "@hyperion/hyperion-react/src/IReact";
import * as IReactDOM from "@hyperion/hyperion-react/src/IReactDOM";
import React from 'react';
import * as ReactDOM from "react-dom";
import ReactDev from "react/jsx-dev-runtime";
import * as Surface from "./component/Surface";
import { FlowletManager } from "./FlowletManager";
import type * as ALSurface from "@hyperion/hyperion-autologging/src/ALSurface";

export let interceptionStatus = "disabled";
export function init() {
  interceptionStatus = "enabled";

  const IReactModule = IReact.intercept("react", React, [])
  const IJsxRuntimeModule = IReact.interceptRuntime("react/jsx-dev-runtime", ReactDev as any, []);
  const IReactDOMModule = IReactDOM.intercept("react-dom", ReactDOM, []);

  const channel = new Channel<ALSurface.ALChannelSurfaceEvent>();

  Surface.init({
    ReactModule: React as any,
    IReactDOMModule,
    IReactModule,
    IJsxRuntimeModule,
    flowletManager: FlowletManager,
    channel
  });

  channel.on('al_surface_mount').add(ev => {
    console.log('mounted', ev, performance.now());
  });
  channel.on('al_surface_unmount').add(ev => {
    console.log('mounted', ev, performance.now());
  });
}
