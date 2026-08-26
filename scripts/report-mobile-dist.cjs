/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { getRuntimeSpecifiers } = require('./mobile-dist-utils.cjs');

const outputDirectory = path.resolve(__dirname, '..', 'dist-mobile');
const artifacts = fs
  .readdirSync(outputDirectory)
  .filter((name) => /^hyperionMobile.*[.]js$/.test(name))
  .sort()
  .map((name) => {
    const contents = fs.readFileSync(path.join(outputDirectory, name));
    return {
      name,
      bytes: contents.byteLength,
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
      imports: getRuntimeSpecifiers(contents.toString('utf8')),
    };
  });

console.log(JSON.stringify({ artifacts }, null, 2));
