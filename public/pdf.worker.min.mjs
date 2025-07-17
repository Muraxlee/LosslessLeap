
"use strict";

/* Copyright 2024 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// A subset of the web-worker based implementation of the platform.
// This is used when the web-worker is not available.
//
// N.B. This implementation is not yet complete.
const pdfjsWorker =
  typeof window !== "undefined"
    ? (window.pdfjsWorker)
    : null;
class FakeWorker {
  constructor() {
    this._vfs = new Map();
    this._isTerminated = false;
    this._port = new MessageChannel();
  }
  get port() {
    return this._port.port1;
  }
  /**
   * Post a message to the main thread.
   */
  postMessage(data, transfer) {
    if (this._isTerminated) {
      return;
    }
    this._port.port2.postMessage(data, transfer);
  }
  /**
   * Terminate the worker.
   */
  terminate() {
    if (this._isTerminated) {
      return;
    }
    this._isTerminated = true;
    this.postMessage({
      source: "worker",
      handler: "terminate",
    });
    this._port.port1.close();
    this._port.port2.close();
  }
  /**
   * Listen for messages from the main thread.
   * @param {function} listener - The listener to add.
   */
  addEventListener(type, listener) {
    this._port.port2.addEventListener(type, listener);
  }
  /**
   * Don't listen for messages from the main thread.
   * @param {function} listener - The listener to remove.
   */
  removeEventListener(type, listener) {
    this._port.port2.removeEventListener(type, listener);
  }
  /**
   * Dispatch an event to the main thread.
   * @param {Event} event - The event to dispatch.
   * @returns {boolean}
   */
  dispatchEvent(event) {
    return this._port.port2.dispatchEvent(event);
  }
  /**
   * The method to use to handle the messages from the main thread.
   * It's implemented in the main thread.
   * @param {Object} data - The message.
   */
  onmessage(data) {}
}
if (typeof window === "undefined" || !pdfjsWorker.Worker) {
  pdfjsWorker.Worker = FakeWorker;
}
if (typeof window !== "undefined" && !("structuredClone" in window)) {
  window.structuredClone = function structuredClone(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        newObj[key] = structuredClone(obj[key]);
      }
    }
    return newObj;
  };
}
if (typeof pdfjsWorker.WorkerMessageHandler === "undefined") {
  pdfjsWorker.WorkerMessageHandler = {
    setup(handler, port) {
      let testMessageProcessed = false;
      handler.on("test", function (data) {
        testMessageProcessed = true;
        // The port can be sticky, so we need to remove the event listener.
        handler.off("test", arguments.callee);
      });
      port.onmessage = function (evt) {
        const data = evt.data;
        if (data.source !== "main") {
          return;
        }
        const promise = handler.sendWithPromise(data.handler, data.data);
        if (!promise) {
          return;
        }
        promise.then(function (result) {
          port.postMessage({
            source: "worker",
            handler: data.handler,
            callbackId: data.callbackId,
            data: result,
          });
        });
      };
    },
  };
}
//# sourceMappingURL=pdf.worker.min.mjs.map
