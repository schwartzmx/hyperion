/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall am_logging
 */

 'use strict';

 import type {ReactComponentData} from 'AdsALReactUtils';

 import {
   AUTO_LOGGING_COMPONENT_TYPE,
   AUTO_LOGGING_DEBUG,
   AUTO_LOGGING_ID,
   LoggableElementsSelector,
 } from 'AdsALConsts';
 import * as ALReactUtils from './ALReactUtils';

 import * as hyperionCore from 'hyperionCore';

 type NodeData = $ReadOnly<{
   name: ?string,
   type: string,
   children?: ?Array<NodeData>,
 }>;

 const AL_ELEMENT_INFO_PROPNAME = '__alInfo';

 export type IReactInfoGetter = {
   getReactComponentData: Element => ?ReactComponentData,
   getReactComponentName: Element => ?string,
 };

 const defaultReactInfoGetter: IReactInfoGetter = {
   getReactComponentData: (element: Element): ?ReactComponentData => {
     return ALReactUtils.getReactComponentData_THIS_CAN_BREAK(element);
   },

   getReactComponentName: (element: Element): ?string => {
     return ALReactUtils.getReactComponentName_THIS_CAN_BREAK(element);
   },
 };

 class ElementInfo {
   _parent: ?ElementInfo;
   +element: Element;
   mountTimestamp: number = 0;
   unmountTimestamp: number = 0;
   children: Set<Element> = new Set();

   _reactInfoGetter: IReactInfoGetter;
   _reactComponentData: ?ReactComponentData;
   _reactComponentName: ?string;

   constructor(
     element: Element,
     reactInfoGetter: IReactInfoGetter,
     parent?: ?ElementInfo,
   ) {
     this.element = element;
     this.setParent(parent);
     hyperionCore.setVirtualPropertyValue(
       element,
       AL_ELEMENT_INFO_PROPNAME,
       this,
     );

     this._reactInfoGetter = reactInfoGetter;
     // Cache react data
     this.getReactComponentData();
     this.getReactComponentName();
   }

   static get(element: Element): ?ElementInfo {
     return hyperionCore.getVirtualPropertyValue<ElementInfo>(
       element,
       AL_ELEMENT_INFO_PROPNAME,
     );
   }

   getParentElement(): ?Element {
     return this._parent?.element;
   }

   setParent(parent: ?ElementInfo): boolean {
     if (parent === this._parent) {
       // nothing to change, just double check the relationship
       if (parent && !parent.children.has(this.element)) {
         FBLogger('ads_manager_auto_logging').mustfix(
           "Unexpected situation, element should be in parent's children",
         );
       }
       return false;
     } else {
       // new parent is not the same, so first remove from current parent
       this._parent?.children.delete(this.element);
       this._parent = parent;
       parent?.children.add(this.element);
       return true;
     }
   }

   getReactComponentData(): ?ReactComponentData {
     if (!this._reactComponentData) {
       this._reactComponentData = this._reactInfoGetter.getReactComponentData(
         this.element,
       );
     }
     return this._reactComponentData;
   }

   getReactComponentName(): ?string {
     if (this._reactComponentName == null) {
       const reactData = this._reactComponentData;
       this._reactComponentName = reactData
         ? reactData.name
         : this._reactInfoGetter.getReactComponentName(this.element);
     }
     return this._reactComponentName;
   }

   getComponentType(): ?string {
     return this.element.getAttribute(AUTO_LOGGING_COMPONENT_TYPE);
   }
 }

 export default class ALUIState {
   _uiElements: WeakMap<Element, ElementInfo> = new WeakMap<
     Element,
     ElementInfo,
   >();
   _roots: Set<Element> = new Set<Element>();
   _cache: Map<Node | null, Array<string>> = new Map<
     Node | null,
     Array<string>,
   >();
   _reactInfoGetter: IReactInfoGetter;

   constructor(reactInfoGetter: ?IReactInfoGetter) {
     if (reactInfoGetter != null) {
       this._reactInfoGetter = reactInfoGetter;
     } else {
       this._reactInfoGetter = defaultReactInfoGetter;
     }
   }

   /**
    * after unmount, we would remove the info from _uiElements, but we may still
    * need the info for a short while until all event subscribers finish running
    * Info is attached to the element itself and we can keep using the cached data until the
    * element itself is deleted (garbage collected)
    */
   getElementInfo(element: Element): ?ElementInfo {
     return ElementInfo.get(element);
   }

   addElement(element: Element): ElementInfo {
     let elementInfo = this._uiElements.get(element);
     if (elementInfo != null) {
       // already added, all good!
       return elementInfo;
     }

     if (AUTO_LOGGING_DEBUG && !element.matches(LoggableElementsSelector)) {
       FBLogger('ads_manager_auto_logging').debug(
         'Unloggable element added to UI %s',
         element.toString(),
       );
     }

     const parent = element.parentElement?.closest(`[${AUTO_LOGGING_ID}]`);
     let parentInfo;
     if (parent) {
       parentInfo = this.getElementInfo(parent) ?? this.addElement(parent);
     } else {
       this._roots.add(element);
     }

     elementInfo =
       this.getElementInfo(element) ??
       new ElementInfo(element, this._reactInfoGetter, parentInfo);
     this._uiElements.set(element, elementInfo);

     this._cache.clear(); // Is this too aggressive?

     return elementInfo;
   }

   removeElement(element: Element): void {
     this.getElementInfo(element)?.setParent(null); // removed parent<->child links
     this._uiElements.delete(element);
     this._roots.delete(element);
     this._cache.clear(); // Is this too aggressive?
   }

   getOrCreateCachedInfo(element: Element): ElementInfo {
     return (
       this.getElementInfo(element) ??
       new ElementInfo(element, this._reactInfoGetter)
     );
   }

   getReactComponentData(element: Element): ?ReactComponentData {
     return this.getOrCreateCachedInfo(element).getReactComponentData();
   }

   getReactComponentName(element: Element): ?string {
     return this.getOrCreateCachedInfo(element).getReactComponentName();
   }
 }
