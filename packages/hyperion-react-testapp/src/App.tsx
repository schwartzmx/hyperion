/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

import React from 'react';
import './App.css';
import LargeComp from './component/LargeComponent';
import NestedComponent from './component/NestedComponent';
import { PortalBodyContainerComponent } from './component/PortalComponent';
import DynamicSvgComponent from './component/DynamicSvgComponent';
import ElementNameComponent from './component/ElementNameComponent';
import TextComponent from './component/TextComponent';
import RecursiveRuncComponent from "./component/RecursiveFuncComponent";
// import ALSessionGraph from "@hyperion/hyperion-autologging-visualizer/src/components/ALSessionGraph";
import ALSessionGraph from "./component/ALSessionGraph";

function App() {

  const maxDepth = 1000;

  return (
    <div className="App">
      <div>
        <ALSessionGraph />
      </div>
      <div>
        <NestedComponent></NestedComponent>
        <LargeComp depth={1} maxDepth={maxDepth}></LargeComp>
      </div>
      <div>
        <PortalBodyContainerComponent message="Portal outside of Surface"></PortalBodyContainerComponent>
      </div>
      <div>
        <ElementNameComponent />
      </div>
      <DynamicSvgComponent></DynamicSvgComponent>
      <TextComponent />
      <RecursiveRuncComponent i={3}></RecursiveRuncComponent>
    </div>
  );
}

export default App;

{/* <h1>Large tree without interception:</h1>


        <InitComp></InitComp>

      <h1>Interception enabled</h1>


      <h1>Large tree with interception</h1>
      <LargeComp depth={1} maxDepth={maxDepth}></LargeComp> */}
