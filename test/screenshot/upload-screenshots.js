/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const COMMIT_HASH = process.env.COMMIT_HASH;
const SERVICE_ACCOUNT_KEY = process.env.SERVICE_ACCOUNT_KEY;
const BUCKET_NAME = 'screenshot-image-captures';
const DIR = './test/screenshot';

const Storage = require('@google-cloud/storage');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

let credentials;
try {
  credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
} catch (err) {
  console.error('Service account key could not be parsed.');
  process.exit(1);
}

const storage = new Storage({
  credentials,
});

const bucket = storage.bucket(BUCKET_NAME);

const screenshots = glob.sync(`${DIR}/**/*.png`);

screenshots.forEach((fname) => {
  const fileName = path.resolve(fname);
  const bucketFileName = fname.replace(DIR, COMMIT_HASH);
  const file = bucket.file(bucketFileName);

  fs.createReadStream(fileName)
    .pipe(file.createWriteStream())
    .on('error', (err) => {
      console.error(err);
    }).on('finish', () => {
      file.makePublic().then(() => {
        console.log('✔︎ Uploaded', fileName);
      }).catch((err) => {
        console.error(err);
      });
    });
});
