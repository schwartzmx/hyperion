/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

describe('public React Native package entries', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('node:fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('node:path');
  const resolve = (
    require as typeof require & {
      resolve(entry: string): string;
    }
  ).resolve;

  it.each([
    'hyperion-react-native',
    'hyperion-react-native/jsx-runtime',
    'hyperion-react-native/jsx-dev-runtime',
    'hyperion-react-native/channel',
    'hyperion-react-native/plugins',
    'hyperion-react-native/legacy-runtime-installer',
    'hyperion-react-native/babel-plugin-stable-event-props',
  ])('resolves %s', (entry) => {
    expect(resolve(entry)).toBeTruthy();
  });

  it('exposes plugin composition without library-owned policy', () => {
    const declarationPath = resolve('hyperion-react-native').replace(
      /index\.js$/,
      'index.d.ts'
    );
    const declaration = fs.readFileSync(declarationPath, 'utf8');
    expect(declaration).toContain('createAutoLoggingChannel');
    expect(declaration).toContain('reactNativeUIEvents');
    expect(declaration).toContain('reactNativeSurfaces');
    expect(declaration).not.toContain('ALProvider');
    expect(declaration).not.toContain('ALPrivacy');
    expect(declaration).not.toContain('sampleRate');
    expect(declaration).not.toContain('logAppEvent');
  });

  it('keeps the focused plugin entry free of legacy compatibility code', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const root = require('hyperion-react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const plugins = require('hyperion-react-native/plugins');
    const pluginEntry = fs.readFileSync(
      resolve('hyperion-react-native/plugins'),
      'utf8'
    );

    expect(pluginEntry).not.toContain('ALCompatibility');
    expect(pluginEntry).not.toContain('ALLegacyAutoLogging');
    expect(root.AutoLogging.dispose).toBe(plugins.AutoLogging.dispose);
    expect(root.AutoLogging.isInitialized).toBe(
      plugins.AutoLogging.isInitialized
    );
  });

  it('keeps the fixture on public package imports and explicit plugins', () => {
    const fixtureRoot = path.dirname(resolve('../App.tsx'));
    const sources = ['App.tsx', 'AutoLoggingConfig.ts', 'EventStore.ts'].map(
      (file) => fs.readFileSync(path.join(fixtureRoot, file), 'utf8')
    );
    const source = sources.join('\n');

    expect(source).not.toMatch(/hyperion-[^'"\s]+\/src(?:\/|['"])/);
    expect(source).toContain('reactNativeUIEvents');
    expect(source).toContain('reactNativeSurfaces');
    expect(source).toContain('reactNativeHeartbeat');
    expect(source).toContain('AutoLoggingInspector');
    expect(source).toContain('SurfaceTreeInspector');
  });
});
