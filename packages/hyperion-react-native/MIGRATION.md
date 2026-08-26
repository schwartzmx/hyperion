# React Native AutoLogging plugin migration

The canonical runtime is now composed from explicit plugins. Initialize it
before loading application JSX:

```ts
const channel = createAutoLoggingChannel<ALReactNativeEventMap>();

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

Import modern capabilities from `hyperion-react-native/plugins` and the channel
factory from `hyperion-react-native/channel`. The package root remains the
compatibility entry while legacy consumers migrate.

Removing a plugin disables that capability. Keep `reactNativeAppLifecycle()`
before heartbeat and app-state plugins. Surfaces should precede UI and list
plugins when surface context is desired.

Existing `react`, `props`, and `componentProps` initialization remains as a
temporary adapter. It preserves the legacy component-prop and component-mount
channels and does not opt legacy callers into heartbeat or modern publishers.
Migrate subscribers first, then replace flags with explicit plugins. After all
WWW/AMA callsites are migrated, the compatibility adapter and
`legacy-runtime-installer` entry can be removed.

The application must use `createAutoLoggingChannel()` rather than a plain
`Channel` to preserve subscriber isolation. The application remains responsible
for filtering, redaction, sampling, storage, and transport.

For the generated WWW handoff, run:

```sh
npm run build:mobile
npm run report:mobile
```

Copy every `dist-mobile/hyperionMobile*.js` file into the downstream xplat
Hyperion directory. Do not copy source maps or generate upstream Flow stubs.
