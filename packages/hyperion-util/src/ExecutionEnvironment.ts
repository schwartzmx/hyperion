/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';

import global from "@hyperion/global/src/global";

export const canUseDOM: boolean = !!(
  global !== undefined &&
  (global as Window)?.document &&
  (global as Window)?.document?.createElement
);
