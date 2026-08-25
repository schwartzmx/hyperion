/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 *
 * @jest-environment node
 */

'use strict';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createALEventFactory } from 'hyperion-autologging/src/ALEventFactory';
import { ALHeartbeatType } from 'hyperion-autologging/src/ALHeartbeatType';
import { ALSurfaceHierarchyNode } from 'hyperion-autologging/src/ALSurfaceHierarchy';

class TestNode extends ALSurfaceHierarchyNode<TestNode> {
  constructor(
    public readonly surfaceName: string,
    parent: TestNode | null = null
  ) {
    super(surfaceName, parent);
  }
}

describe('React Native shared AutoLogging package boundary', () => {
  test('loads neutral runtime contracts without a browser or React Native', () => {
    const eventFactory = createALEventFactory({
      now: () => 100,
      nextEventIndex: () => 3,
      getBaseMetadata: () => ({ platform: 'mobile' }),
    });
    const root = new TestNode('root');

    expect(eventFactory.createEvent()).toEqual({
      eventTimestamp: 100,
      eventIndex: 3,
      metadata: { platform: 'mobile' },
    });
    expect(ALHeartbeatType.START).toBe('START');
    expect(root.surface).toBe('root');
    expect(globalThis).not.toHaveProperty('document');
  });

  test('declares the dependency and compatible React type peers', () => {
    const repositoryRoot = resolve(__dirname, '../../..');
    const reactNativePackage = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, 'packages/hyperion-react-native/package.json'),
        'utf8'
      )
    ) as {
      dependencies: Record<string, string>;
    };
    const autoLoggingPackage = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, 'packages/hyperion-autologging/package.json'),
        'utf8'
      )
    ) as {
      peerDependencies: Record<string, string>;
    };
    const rootPackage = JSON.parse(
      readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')
    ) as {
      workspaces: string[];
    };

    expect(reactNativePackage.dependencies['hyperion-autologging']).toBe('*');
    expect(autoLoggingPackage.peerDependencies['@types/react']).toContain(
      '^19.0.0'
    );
    expect(autoLoggingPackage.peerDependencies['@types/react-dom']).toContain(
      '^19.0.0'
    );
    expect(
      rootPackage.workspaces.indexOf('./packages/hyperion-autologging')
    ).toBeLessThan(
      rootPackage.workspaces.indexOf('./packages/hyperion-react-native')
    );
  });
});
