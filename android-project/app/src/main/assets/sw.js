/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6709a494d69c19fea5d09a36d0b58b5a"
  }, {
    "url": "pwa-512x512.png",
    "revision": "34e1d70fa828df26a6020e881748e50c"
  }, {
    "url": "pwa-192x192.png",
    "revision": "05ab2286b14b5db29ed3f0543f69c97e"
  }, {
    "url": "index.html",
    "revision": "a4d97a750017c5e0cbe50a2d53d706c1"
  }, {
    "url": "icon.svg",
    "revision": "8ecaaef39e58a685f2d79c46019b4b3d"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0cc7db79cdea6b0da2f7747b69ce063d"
  }, {
    "url": "assets/index-yddWJsfU.css",
    "revision": null
  }, {
    "url": "assets/index-CL-GhQ9u.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0cc7db79cdea6b0da2f7747b69ce063d"
  }, {
    "url": "icon.svg",
    "revision": "8ecaaef39e58a685f2d79c46019b4b3d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "05ab2286b14b5db29ed3f0543f69c97e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "34e1d70fa828df26a6020e881748e50c"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6709a494d69c19fea5d09a36d0b58b5a"
  }, {
    "url": "manifest.webmanifest",
    "revision": "fd817fdb108451aeeb2d88b7173ee678"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
