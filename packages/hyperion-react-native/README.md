# Hyperion React Native

`hyperion-react-native` provides plugin-based AutoLogging for React Native. It
observes JSX without replacing application component identities and leaves
sampling, filtering, redaction, persistence, and transport to the application.

## Setup

Create and subscribe to an AutoLogging channel, compose the capabilities the
application needs, and initialize before application JSX is evaluated:

```ts
import React from 'react';
import JsxDevRuntime from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import { AppState } from 'react-native';
import {
  AutoLogging,
  reactNativeAppLifecycle,
  reactNativeAppStateEvents,
  reactNativeDeepLinks,
  reactNativeHeartbeat,
  reactNativeListImpressions,
  reactNativeReactErrors,
  reactNativeScreens,
  reactNativeSurfaces,
  reactNativeUIEvents,
  type ALReactNativeEventMap,
} from 'hyperion-react-native/plugins';
import { createAutoLoggingChannel } from 'hyperion-react-native/channel';

const channel = createAutoLoggingChannel<ALReactNativeEventMap>();
channel.addListener('al_ui_event', (event) => transport(event));

AutoLogging.init({
  channel,
  plugins: [
    reactNativeSurfaces(),
    reactNativeUIEvents({
      ReactModule: React,
      JSXRuntimeModule: JsxRuntime,
      JSXDevRuntimeModule: JsxDevRuntime,
    }),
    reactNativeAppLifecycle({ AppState }),
    reactNativeHeartbeat(),
    reactNativeAppStateEvents(),
    reactNativeScreens(),
    reactNativeListImpressions(),
    reactNativeDeepLinks(),
    reactNativeReactErrors(),
  ],
});
```

Plugin presence is the canonical feature gate. Omitting a plugin installs no
wrappers, subscriptions, timers, or publisher state for that capability.
Plugins install in array order, start only after every installation succeeds,
and dispose in reverse order. Dependencies such as heartbeat after app
lifecycle are validated during initialization.

The application-owned channel isolates subscribers so one throwing listener
does not block later listeners or an instrumented application handler. Ordinary
Hyperion `Hook` and `Channel` instances remain strict for web compatibility.
The modern plugin API and channel factory use focused
`hyperion-react-native/plugins` and `hyperion-react-native/channel` entries so
Metro does not include the temporary legacy compatibility adapter. The package
root continues to expose the full compatibility API.

## JSX runtimes

`reactNativeUIEvents()` can install supplied mutable React, JSX, and JSX-dev
runtime modules. The installer uses direct property access supported by Hermes;
immutable module facades remain non-throwing. Call `AutoLogging.init()` before
evaluating JSX that must be observed.

For automatic JSX transforms, configure Babel with
`runtime: 'automatic'` and `importSource: 'hyperion-react-native'`, or set the
equivalent TypeScript `jsxImportSource`. The package exports
`hyperion-react-native/jsx-runtime` and
`hyperion-react-native/jsx-dev-runtime`.

The optional
`hyperion-react-native/babel-plugin-stable-event-props` transform keeps a known
event prop present when a conditional object spread toggles it. This avoids
switching between observed and unobserved element types. Pass the same
`eventProps` list to the Babel plugin when customizing runtime interception.

## Data and platform policy

UI events publish accepted raw scalar values and explicit labels with source
and potentially-sensitive provenance. Deep links and React error details are
also published raw. Subscribers decide what to sample, filter, redact, retain,
or transmit. Hyperion does not add a provider, privacy policy, transport, or
debug event store.

`ALSurface` uses committed React context and a mounted-node registry. Its
portable hierarchy contracts live in `hyperion-autologging`; mobile nodes have
no DOM element and return a shared frozen empty collection from `getElements()`.
App lifecycle is injected structurally through `reactNativeAppLifecycle({
AppState })`, so the portable runtime has no eager `react-native` dependency.

## Compatibility setup

The deprecated configuration initializer remains available while existing
WWW/AMA consumers migrate. It translates legacy interception and publisher
flags into plugins, preserves `al_react_component_prop` and
`al_react_component_mount`, and enables no heartbeat or modern event family by
default. `IReactModule` and `IJsxRuntimeModule` are intercepted-module adapters;
the non-prefixed runtime fields are raw React exports for modern observation.

## Build and validation

```sh
npm run build --workspace hyperion-react-native
npm test --workspace hyperion-react-native -- --watchman=false --runInBand
npm run benchmark:runtime --workspace hyperion-react-native
npm run build:mobile
npm run report:mobile
```

The normal root `npm run build` remains the web distribution build.
`npm run build:mobile` writes generated handoff artifacts to `dist-mobile/`.
Only native JSX-runtime entries import React JSX runtimes; the portable main,
observation, and legacy-installer artifacts remain dependency-injected. No
source maps or Flow declarations are generated upstream.
