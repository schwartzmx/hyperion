/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

 import { useState } from "react";
 import { Surface } from "./Surface";

 export function InputSurfaceComponent() {

   return Surface({ surface: 'InputSurfaceComp' })(
             <div>
               <span style={{backgroundColor:"lightgreen"}}>A key input component:</span>
               <input type="text"></input>
             </div>
           );
 }
