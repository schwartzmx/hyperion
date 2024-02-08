/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';

import { getReactComponentData_THIS_CAN_BREAK } from './ALReactUtils';
import type { ReactComponentData } from './ALReactUtils';
import { getVirtualPropertyValue, intercept, setVirtualPropertyValue } from '@hyperion/hyperion-core/src/intercept';
import * as IElement from "@hyperion/hyperion-dom/src/IElement";
import { BailReactFiberTraversal } from './ALUIEventPublisher';

const AL_ELEMENT_INFO_PROPNAME = '__alInfo';
const AUTO_LOGGING_COMPONENT_TYPE = 'data-auto-logging-component-type';


export default class ALElementInfo {
  element: Element;
  private reactComponentData: ReactComponentData | null = null;
  private reactComponentType: string | null = null;

  constructor(
    element: Element,
    // Can't really do this,  because the react data gets cached it will affect other events such as click on the same element.
    bailTraversalFn?: BailReactFiberTraversal
  ) {
    this.element = element;
    intercept(element, IElement.IElementtPrototype); // This also ensures that proper interception is setup.
    setVirtualPropertyValue(
      element,
      AL_ELEMENT_INFO_PROPNAME,
      this,
    );
    this.cacheInfo(bailTraversalFn);
  }

  private cacheInfo(bailTraversalFn?: BailReactFiberTraversal) {
    this.getReactComponentData(bailTraversalFn);
    this.getReactComponentType();
  }

  static get(element: Element): ALElementInfo | undefined {
    return getVirtualPropertyValue<ALElementInfo>(
      element,
      AL_ELEMENT_INFO_PROPNAME,
    );
  }

  static getOrCreate(element: Element, bailTraversalFn?: BailReactFiberTraversal): ALElementInfo {
    return ALElementInfo.get(element) ?? new ALElementInfo(element, bailTraversalFn);
  }

  getReactComponentData(bailTraversalFn?: BailReactFiberTraversal): ReactComponentData | null {
    if (!this.reactComponentData) {
      this.reactComponentData = getReactComponentData_THIS_CAN_BREAK(
        this.element,
        bailTraversalFn
      );
    }
    return this.reactComponentData;
  }

  getReactComponentName(): string | null | undefined {
    return this.getReactComponentData()?.name;
  }

  getReactComponentType(): string | null {
    if (!this.reactComponentType) {
      this.reactComponentType = this.element.getAttribute(AUTO_LOGGING_COMPONENT_TYPE);
    }
    return this.reactComponentType;
  }
}
