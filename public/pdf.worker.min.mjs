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
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WorkerMessageHandler = void 0;
var _util = __webpack_require__(1);
var _pdf = __webpack_require__(2);
var _core_utils = __webpack_require__(3);
var _is_node = __webpack_require__(5);
var _is_web = __webpack_require__(6);
var _is_rw20 = __webpack_require__(7);
var _message_handler = __webpack_require__(8);
var _fetch_stream = __webpack_require__(10);
var _node_stream = __webpack_require__(11);
var _image_utils = __webpack_require__(9);
var _murmurhash = __webpack_require__(12);
var _xml_parser = __webpack_require__(13);
class WorkerMessageHandler {
  static setup(handler, port) {
    const testMessage = {
      name: "test",
      data: null
    };
    const testPromise = new Promise(resolve => {
      handler.on("test", (data, cb) => {
        resolve(true);
        cb(null);
      }, this);
    });
    port.postMessage(testMessage);
    return testPromise;
  }
  static create(handler) {
    const worker = new WorkerMessageHandler();
    handler.on("configure", function (data, cb) {
      if (data.gfxInfo) {
        Object.assign(worker.gfxInfo, data.gfxInfo);
      }
      cb(null);
    }, this);
    handler.on("GetDocRequest", function (data, cb) {
      const source = data.source;
      if (source.data) {
        source.data = (0, _util.binaryToBytes)(source.data);
      } else if (source.chunkedViewer) {
        if (_is_node.isNodeJS) {
          source.stream = new _node_stream.NodeReadableStream(source);
        } else if (_is_web.isWeb) {
          source.stream = new _fetch_stream.FetchStream(source);
        } else {
          cb("Cannot use chunked viewr in this environment.");
        }
      }
      const doc = new _pdf.PDFDocument(worker, source);
      worker.pdfDocuments[doc.docId] = doc;
      cb({
        docId: doc.docId
      });
    }, this);
    handler.on("GetPageRequest", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      cb(doc.getPage(data.pageIndex));
    }, this);
    handler.on("GetPageIndex", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const page = doc.getPage(data.pageIndex);
      cb(null, doc.getPageIndex(page.ref));
    }, this);
    handler.on("GetDestinations", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getDestinations().then(function (destinations) {
        cb(null, destinations);
      });
    }, this);
    handler.on("GetPageLabels", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getPageLabels().then(function (labels) {
        cb(null, labels);
      });
    }, this);
    handler.on("GetPageLayout", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getPageLayout().then(function (layout) {
        cb(null, layout);
      });
    }, this);
    handler.on("GetPageMode", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getPageMode().then(function (mode) {
        cb(null, mode);
      });
    }, this);
    handler.on("GetViewerPreferences", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getViewerPreferences().then(function (prefs) {
        cb(null, prefs);
      });
    }, this);
    handler.on("GetOpenAction", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getOpenAction().then(function (action) {
        cb(null, action);
      });
    }, this);
    handler.on("GetAttachments", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getAttachments().then(function (attachments) {
        cb(null, attachments);
      });
    }, this);
    handler.on("GetJavaScript", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getJavaScript().then(function (javaScript) {
        cb(null, javaScript);
      });
    }, this);
    handler.on("GetDocJSActions", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getJSActions().then(function (jsActions) {
        cb(null, jsActions);
      });
    }, this);
    handler.on("GetMarkedContent", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getMarkedContent(data.structTreeRootRef, data.contentRef).then(function (markedContent) {
        cb(null, markedContent);
      });
    }, this);
    handler.on("GetStructTree", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getStructTree().then(function (structTree) {
        cb(null, structTree);
      });
    }, this);
    handler.on("GetMetadata", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getMetadata().then(function (metadata) {
        cb(null, metadata);
      });
    }, this);
    handler.on("GetData", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getData().then(function (pdfdata) {
        cb(null, (0, _util.bytesToBinary)(pdfdata));
      });
    }, this);
    handler.on("GetDownloadInfo", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getDownloadInfo().then(function (downloadInfo) {
        cb(null, downloadInfo);
      });
    }, this);
    handler.on("GetFingerprint", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      cb(null, doc.getFingerprint());
    }, this);
    handler.on("GetStat", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      cb(null, {
        fingerprint: doc.getFingerprint(),
        stats: doc.xref.stats
      });
    }, this);
    handler.on("SaveDocument", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const name = data.name;
      doc.saveDocument(doc.annotationStorage, name).then(function (res) {
        cb(null, (0, _util.bytesToBinary)(res.data));
      }, function (err) {
        cb(err.message);
      });
    }, this);
    handler.on("GetOperatorList", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const page = doc.getPage(data.pageIndex);
      const task = data.task;
      const intent = data.intent;
      const renderForms = data.renderForms;
      const annotationStorage = doc.annotationStorage.serializable || null;
      page.getOperatorList({
        handler,
        task,
        intent,
        renderForms,
        annotationStorage,
        pageIndex: data.pageIndex
      }).then(function (operatorList) {
        cb(null, operatorList);
      }, function (err) {
        cb(err);
      });
    }, this);
    handler.on("GetCalculationOrderIds", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getCalculationOrderIds().then(function (ids) {
        cb(null, ids);
      });
    }, this);
    handler.on("GetAnnotations", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const page = doc.getPage(data.pageIndex);
      const intent = data.intent;
      page.getAnnotations({
        intent
      }).then(function (annotations) {
        cb(null, annotations);
      }, function (err) {
        cb(err);
      });
    }, this);
    handler.on("GetFieldObjects", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getFieldObjects().then(function (fieldObjects) {
        cb(null, fieldObjects);
      }, function (err) {
        cb(err.message);
      });
    }, this);
    handler.on("HasJSActions", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.hasJSActions().then(function (hasJSActions) {
        cb(null, hasJSActions);
      });
    }, this);
    handler.on("GetPageColors", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const page = doc.getPage(data.pageIndex);
      page.extractTextContentInfo.colorsPromise.then(function (colors) {
        cb(null, colors);
      }, function (err) {
        cb(err);
      });
    }, this);
    handler.on("ExtractTextContent", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const page = doc.getPage(data.pageIndex);
      const parameters = data.parameters;
      page.extractTextContent(parameters).then(function (textContent) {
        cb(null, textContent);
      }, function (err) {
        cb(err);
      });
    }, this);
    handler.on("GetStructTree", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.getStructTree().then(function (tree) {
        cb(null, tree);
      });
    }, this);
    handler.on("FontFallbacks", function (data, cb) {
      const id = data.id;
      const doc = worker.pdfDocuments[data.docId];
      const font = doc.objs.get(id);
      if (font) {
        font.fallback(worker.fallbackFonts);
      }
      cb(null);
    }, this);
    handler.on("Close", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      if (!doc) {
        cb(null);
        return;
      }
      doc.cleanup();
      delete worker.pdfDocuments[data.docId];
      cb(null);
    }, this);
    handler.on("NeedPassword", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      doc.checkPassword(data.password);
      cb(null);
    }, this);
    handler.on("commonobj", function (data, cb) {
      const doc = worker.pdfDocuments[data.docId];
      const id = data[0];
      const type = data[1];
      let obj;
      switch (type) {
        case "JpegStream":
          try {
            obj = new _image_utils.JpegStream(null, null, doc);
          } catch (ex) {
            cb({
              name: ex.name,
              message: ex.message,
              stack: ex.stack
            });
            return;
          }
          break;
        case "MurmurHash3_64":
          obj = new _murmurhash.MurmurHash3_64();
          break;
        case "XFA":
          obj = (0, _xml_parser.parseXfa)({
            data: data[2],
            password: data[3]
          });
          break;
        default:
          cb(`Invalid "commonobj" type: ${type}`);
          return;
      }
      worker.commonObjs[id] = obj;
      cb(null);
    }, this);
    handler.on("commonobj_finalize", function (data, cb) {
      const id = data[0];
      const obj = worker.commonObjs[id];
      if (!obj) {
        cb(`"commonobj" not found: ${id}`);
        return;
      }
      delete worker.commonObjs[id];
      cb(null);
    }, this);
    handler.on("commonobj_method", function (data, cb) {
      const id = data[0];
      const name = data[1];
      const args = data[2];
      const obj = worker.commonObjs[id];
      if (!obj) {
        cb(`"commonobj" not found: ${id}`);
        return;
      }
      try {
        const value = obj[name].apply(obj, args);
        cb(null, value);
      } catch (ex) {
        cb({
          name: ex.name,
          message: ex.message,
          stack: ex.stack
        });
      }
    }, this);
    handler.on("Terminated", function (data, cb) {
      worker.terminate();
      cb(null);
    }, this);
    return worker;
  }
  constructor() {
    this.pdfDocuments = Object.create(null);
    this.commonObjs = Object.create(null);
    this.fontRegistry = new _core_utils.FontRegistry();
    this.fallbackFonts = new _core_utils.FallbackFontManager();
    this.gfxInfo = {
      isSafari: false
    };
  }
  terminate() {
    for (const docId in this.pdfDocuments) {
      this.pdfDocuments[docId].transport.terminate();
    }
  }
}
exports.WorkerMessageHandler = WorkerMessageHandler;
if (typeofDedicatedWorkerGlobalScope !== "undefined") {
  (function () {
    const handler = new _message_handler.MessageHandler("worker", self);
    WorkerMessageHandler.create(handler);
  })();
} else if (typeof SharedWorkerGlobalScope !== "undefined") {
  (function () {
    const handler = new _message_handler.MessageHandler("worker", self);
    self.addEventListener("connect", function (evt) {
      const port = evt.ports[0];
      const workerHandler = new _message_handler.MessageHandler("worker", port);
      WorkerMessageHandler.setup(handler, port).then(function () {
        WorkerMessageHandler.create(workerHandler);
      });
    }, false);
  })();
} else if (_is_node.isNodeJS) {
  const {
    parentPort
  } = __webpack_require__(14);
  const handler = new _message_handler.MessageHandler("worker", parentPort);
  WorkerMessageHandler.create(handler);
} else if (_is_rw20.isReflectAndProxyAvailable) {
  (function () {
    const handler = new _message_handler.MessageHandler("worker", self);
    WorkerMessageHandler.create(handler);
  })();
} else {
  throw new Error("Neither DedicatedWorker nor SharedWorker is available.");
}

/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AbortException = exports.AnnotationEditorParamsType = exports.AnnotationEditorType = exports.AnnotationMode = exports.AnnotationType = exports.CMapCompressionType = exports.FeatureTest = exports.FontType = exports.ImageKind = exports.Intent = exports Rohan = exports.OPS = exports.PasswordResponses = exports.PermissionFlag = exports.PostScriptStandardFont = exports.PostScriptType1SymbolicFont = exports.PostScriptType1StandardFont = exports.ReadableStreamState = exports.Ref = exports.RenderingStates = exports.SVGGraphics = exports.StreamType = exports.StructTreeRoot = exports.TextLayerMode = exports.Util = exports.VerbosityLevel = exports.XfaLayer = exports.assert = exports.bytesToBinary = exports.bytesToString = exports.createPromiseCapability = exports.escapePDFName = exports.getVerbosityLevel = exports.identity = exports.isObject = exports.isRef = exports.isSameOrigin = exports.isSpace = exports.isString = exports.isStream = exports.log = exports.numberToString = exports.parseQueryString = exports.removeNullCharacters = exports.setVerbosityLevel = exports.shadow = exports.stringToBytes = exports.stringToPDFString = exports.warn = void 0;
const VerbosityLevel = {
  ERRORS: 0,
  WARNINGS: 1,
  INFOS: 5
};
exports.VerbosityLevel = VerbosityLevel;
let verbosity = VerbosityLevel.WARNINGS;
function getVerbosityLevel() {
  return verbosity;
}
function setVerbosityLevel(level) {
  verbosity = level;
}
function warn(msg) {
  if (verbosity >= VerbosityLevel.WARNINGS) {
    console.warn(msg);
  }
}
function log(msg) {
  if (verbosity >= VerbosityLevel.INFOS) {
    console.log(msg);
  }
}
function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg || "Assertion failed");
  }
}
function isObject(v) {
  return typeof v === "object" && v !== null;
}
function isString(v) {
  return typeof v === "string";
}
function isSpace(ch) {
  return ch === 0x20 || ch === 0x09 || ch === 0x0d || ch === 0x0a;
}
function isSameOrigin(baseUrl, url) {
  try {
    const base = new URL(baseUrl);
    if (base.origin === "null") {
      return false;
    }
    const questionMark = url.indexOf("?");
    const fullUrl = new URL(questionMark === -1 ? url : url.slice(0, questionMark), baseUrl);
    return base.origin === fullUrl.origin;
  } catch {
    return false;
  }
}
function createPromiseCapability() {
  const capability = {};
  capability.promise = new Promise(function (resolve, reject) {
    capability.resolve = resolve;
    capability.reject = reject;
  });
  return capability;
}
class AbortException extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortException";
  }
}
exports.AbortException = AbortException;
function bytesToString(bytes) {
  let str = "";
  for (const char of bytes) {
    str += String.fromCharCode(char);
  }
  return str;
}
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0, len = str.length; i < len; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}
function bytesToBinary(bytes) {
  let str = "";
  for (const char of bytes) {
    str += String.fromCharCode(char);
  }
  return btoa(str);
}
function stringToPDFString(str) {
  if (str === null) {
    return "";
  }
  let isUnicode = false;
  for (let i = 0, ii = str.length; i < ii; ++i) {
    const char = str.charCodeAt(i);
    if (char > 0x7f) {
      isUnicode = true;
      break;
    }
  }
  if (!isUnicode) {
    return str;
  }
  let pdfStr = "\xFE\xFF";
  for (let i = 0, ii = str.length; i < ii; ++i) {
    const char = str.charCodeAt(i);
    pdfStr += String.fromCharCode(char >> 8 & 0xff, char & 0xff);
  }
  return pdfStr;
}
function removeNullCharacters(str) {
  if (str.includes("\0")) {
    return str.replaceAll("\0", "");
  }
  return str;
}
function numberToString(num) {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  const rounded = Math.round(num * 100);
  if (rounded % 100 === 0) {
    return (rounded / 100).toString();
  }
  if (rounded % 10 === 0) {
    return num.toFixed(1);
  }
  return num.toFixed(2);
}
function parseQueryString(query) {
  const params = new Map();
  for (const [name, value] of new URLSearchParams(query)) {
    params.set(name.toLowerCase(), value);
  }
  return params;
}
const PDF_NAME_ESCAPE_MAP = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", " ", "#", "%", "/", "<", ">", "(", ")", "{", "}", "[", "]"];
function escapePDFName(str) {
  if (!str) {
    return "";
  }
  let i = 0;
  const n = str.length;
  let res = "";
  while (i < n) {
    const c = str.codePointAt(i);
    if (c < 0x21 || c > 0x7e) {
      res += "#" + c.toString(16);
      i += c > 0xffff ? 2 : 1;
    } else {
      const cc = str[i];
      if (PDF_NAME_ESCAPE_MAP.includes(cc)) {
        res += "#" + c.toString(16);
      } else {
        res += cc;
      }
      i++;
    }
  }
  return res;
}
const shadow = (obj, prop, value) => {
  Object.defineProperty(obj, prop, {
    value,
    enumerable: true,
    configurable: true,
    writable: false
  });
};
exports.shadow = shadow;
const identity = x => x;
exports.identity = identity;
const Ref = function RefClosure() {
  let refCache = null;
  function Ref(num, gen) {
    this.num = num;
    this.gen = gen;
  }
  Ref.prototype = {
    toString: function Ref_toString() {
      const cached = refCache.get(this);
      if (cached) {
        return cached;
      }
      const str = `${this.num}R${this.gen}`;
      refCache.set(this, str);
      return str;
    }
  };
  Ref.get = function Ref_get(num, gen) {
    const R = refCache.get(num)?.[gen];
    if (R) {
      return R;
    }
    const ref = new Ref(num, gen);
    let refByGen = refCache.get(num);
    if (!refByGen) {
      refByGen = [];
      refCache.set(num, refByGen);
    }
    refByGen[gen] = ref;
    return ref;
  };
  Ref.clearCache = function () {
    refCache = new Map();
  };
  return Ref;
}();
exports.Ref = Ref;
const isRef = obj => obj instanceof Ref;
exports.isRef = isRef;
const isStream = obj => typeof obj === "object" && obj !== null && "getReader" in obj && typeof obj.getReader === "function";
exports.isStream = isStream;
const ReadableStreamState = {
  Readable: 0,
  Closed: 1,
  Errored: 2
};
exports.ReadableStreamState = ReadableStreamState;
const Util = {
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => {
        reject(new Error(`Cannot load script at: ${src}`));
      };
      (document.getElementsByTagName("head")[0] || document.body).appendChild(script);
    });
  }
};
exports.Util = Util;
const PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};
exports.PasswordResponses = PasswordResponses;
const RenderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3
};
exports.RenderingStates = RenderingStates;
const OPS = {
  beginAnnotations: 88,
  beginAnnotations2: 89,
  beginMarkedContent: 90,
  beginMarkedContent2: 91,
  beginText: 92,
  endAnnotations: 93,
  endMarkedContent: 94,
  endText: 95,
  dependency: 1,
  setCharwidth: 2,
  setCharwidthAndBounds: 3,
  setLeading: 4,
  setLeadingMoveText: 5,
  setMatrix: 6,
  setTextMatrix: 7,
  setTextMatrixAndSize: 126,
  moveText: 8,
  moveTextSetLeading: 9,
  nextLine: 10,
  restore: 11,
  save: 12,
  setBlackGeneration: 13,
  setBlendMode: 127,
  setCharSpacing: 14,
  setDash: 15,
  setRenderingIntent: 16,
  setFlatness: 17,
  setGState: 18,
  setLineWidth: 19,
  setLineJoin: 20,
  setLineCap: 21,
  setMiterLimit: 22,
  setFillColor: 23,
  setFillColorN: 24,
  setStrokeColor: 25,
  setStrokeColorN: 26,
  setTransfer: 27,
  setUndercolorRemoval: 28,
  setWordSpacing: 29,
  setStrokeColorSpace: 30,
  setFillColorSpace: 31,
  setFont: 32,
  setTextRise: 33,
  setHScale: 34,
  setStrokingColor: 35,
  setFillingColor: 36,
  shadingFill: 37,
  beginCompat: 38,
  endCompat: 39,
  beginInlineImage: 40,
  beginImageData: 41,
  endInlineImage: 42,
  paintXObject: 43,
  markPoint: 44,
  markPoint2: 45,
  closeStroke: 46,
  stroke: 47,
  closePath: 48,
  clip: 49,
  eoClip: 50,
  closePathFillStroke: 51,
  closePathEoFillStroke: 52,
  fillStroke: 53,
  eoFillStroke: 54,
  fill: 55,
  eoFill: 56,
  constructPath: 57,
  endPath: 58,
  paintFormXObjectBegin: 59,
  paintFormXObjectEnd: 60,
  paintShading: 61,
  paintImageMaskXObject: 62,
  paintImageMaskXObjectGroup: 63,
  paintImageXObject: 64,
  paintInlineImageXObject: 65,
  paintInlineImageXObjectGroup: 66,
  paintImageXObjectRepeat: 67,
  paintImageMaskXObjectRepeat: 68,
  paintSolidColorImageMask: 69,
  showText: 70,
  showSpacedText: 71,
  setLeadingMoveTextAndGlyphs: 128,
  nextLineShowText: 72,
  nextLineShowSpacedText: 73,
  beginMarkedContentWithPunct: 129,
  beginMarkedContentWithPunct2: 130,
  setSmoothness: 131,
  setTextKnockout: 132,
  setStrokeAlpha: 133,
  setFillAlpha: 134,
  setStrokeOverprint: 135,
  setFillOverprint: 136,
  setOverprintMode: 137,
  setStrokeAndFillAlpha: 138,
  beginOptionalContent: 139,
  endOptionalContent: 140
};
exports.OPS = OPS;
const AnnotationType = {
  TEXT: 1,
  LINK: 2,
  FREETEXT: 3,
  LINE: 4,
  SQUARE: 5,
  CIRCLE: 6,
  POLYGON: 7,
  POLYLINE: 8,
  HIGHLIGHT: 9,
  UNDERLINE: 10,
  SQUIGGLY: 11,
  STRIKEOUT: 12,
  STAMP: 13,
  CARET: 14,
  INK: 15,
  POPUP: 16,
  FILEATTACHMENT: 17,
  SOUND: 18,
  MOVIE: 19,
  WIDGET: 20,
  SCREEN: 21,
  PRINTERMARK: 22,
  TRAPNET: 23,
  WATERMARK: 24,
  THREED: 25,
  REDACT: 26,
  PROJECTION: 27,
  RICHMEDIA: 28
};
exports.AnnotationType = AnnotationType;
const AnnotationEditorType = {
  FREETEXT: 3,
  INK: 15,
  HIGHLIGHT: 9,
  STAMP: 13
};
exports.AnnotationEditorType = AnnotationEditorType;
const AnnotationEditorParamsType = {
  FREETEXT_DEFAULT_SIZE: 1,
  FREETEXT_DEFAULT_COLOR: 2,
  FREETEXT_DEFAULT_FONTSIZE: 3,
  FREETEXT_DEFAULT_ROTATION: 11,
  INK_DEFAULT_THICKNESS: 4,
  INK_DEFAULT_COLOR: 5,
  INK_DEFAULT_OPACITY: 10,
  HIGHLIGHT_DEFAULT_COLOR: 6,
  HIGHLIGHT_DEFAULT_THICKNESS: 7,
  HIGHLIGHT_SHOW_ALL: 8,
  STAMP_DEFAULT_TYPE: 9
};
exports.AnnotationEditorParamsType = AnnotationEditorParamsType;
const AnnotationMode = {
  ENABLE: 1,
  DISABLE: 2,
  ENABLE_FORMS: 3,
  ENABLE_STORAGE: 4
};
exports.AnnotationMode = AnnotationMode;
const ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};
exports.ImageKind = ImageKind;
const CMapCompressionType = {
  NONE: 0,
  PREDEFINED: 1,
  BINARY: 2
};
exports.CMapCompressionType = CMapCompressionType;
const PermissionFlag = {
  PRINT: 4,
  MODIFY: 8,
  COPY: 16,
  MODIFY_ANNOTATIONS: 32,
  FILL_FORM_FIELDS: 256,
  COPY_FOR_ACCESSIBILITY: 512,
  ASSEMBLE_DOCUMENT: 1024,
  PRINT_HIGH_QUALITY: 2048
};
exports.PermissionFlag = PermissionFlag;
const FeatureTest = {
  PATTERNS: 1,
  SHADING: 2,
  TEXT_LAYER: 4,
  PAGE_COLORS: 8,
  SVG: 16
};
exports.FeatureTest = FeatureTest;
const Intent = {
  DISPLAY: 1,
  PRINT: 2,
  OC: 3
};
exports.Intent = Intent;
const FontType = {
  TYPE0: "Type0",
  TYPE1: "Type1",
  TYPE3: "Type3",
  TRUETYPE: "TrueType",
  CIDFONTTYPE0: "CIDFontType0",
  CIDFONTTYPE2: "CIDFontType2"
};
exports.FontType = FontType;
const StreamType = {
  UNKNOWN: 0,
  FLATE: 1,
  LZW: 2,
  DCT: 3,
  JPX: 4,
  JBIG2: 5,
  CCF: 6,
  AHX: 7,
  A85: 8,
  RUN_LENGTH: 9,
  CRYPT: 10
};
exports.StreamType = StreamType;
const TextLayerMode = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_ENHANCE: 2
};
exports.TextLayerMode = TextLayerMode;
const XfaLayer = {
  text: "text",
  canvas: "canvas",
  svg: "svg"
};
exports.XfaLayer = XfaLayer;
const Rohan = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
exports.Rohan = Rohan;
const StructTreeRoot = Symbol("StructTreeRoot");
exports.StructTreeRoot = StructTreeRoot;
class SVGGraphics {
  constructor(commonObjs, objs, textContent) {
    this.svgFactory = new _util_metapdf.SVGFactory();
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.textContent = textContent;
  }
  getSVG(opList, viewport) {
    this.currentOpList = opList;
    return this.svgFactory.create(viewport.width, viewport.height).then(svg => {
      return this.executeOpList(opList, viewport).then(() => {
        return svg;
      });
    });
  }
  executeOpList(opList, viewport) {
    const svgFactory = this.svgFactory;
    const opListParser = new _util_metapdf.OpListParser(this.commonObjs, this.objs, this.textContent, opList, this.svgFactory, this, viewport);
    return opListParser.parse();
  }
}
exports.SVGGraphics = SVGGraphics;
const PostScriptType1StandardFont = ["AvantGarde-Book", "AvantGarde-BookOblique", "AvantGarde-Demi", "AvantGarde-DemiOblique", "Bookman-Demi", "Bookman-DemiItalic", "Bookman-Light", "Bookman-LightItalic", "Courier", "Courier-Bold", "Courier-BoldOblique", "Courier-Oblique", "Helvetica", "Helvetica-Bold", "Helvetica-BoldOblique", "Helvetica-Oblique", "NewCenturySchlbk-Bold", "NewCenturySchlbk-BoldItalic", "NewCenturySchlbk-Italic", "NewCenturySchlbk-Roman", "Palatino-Bold", "Palatino-BoldItalic", "Palatino-Italic", "Palatino-Roman", "Times-Bold", "Times-BoldItalic", "Times-Italic", "Times-Roman", "ZapfChancery-MediumItalic"];
exports.PostScriptType1StandardFont = PostScriptType1StandardFont;
const PostScriptType1SymbolicFont = ["Symbol", "ZapfDingbats"];
exports.PostScriptType1SymbolicFont = PostScriptType1SymbolicFont;
const PostScriptStandardFont = PostScriptType1StandardFont.concat(PostScriptType1SymbolicFont);
exports.PostScriptStandardFont = PostScriptStandardFont;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PDFDocument = void 0;
var _util = __webpack_require__(1);
var _core_utils = __webpack_require__(3);
var _stream = __webpack_require__(4);
var _base_stream = __webpack_require__(15);
var _crypto = __webpack_require__(16);
var _parser = __webpack_require__(17);
var _primitives = __webpack_require__(18);
var _annotation = __webpack_require__(19);
var _obj = __webpack_require__(20);
var _operator_list = __webpack_require__(21);
var _evaluator = __webpack_require__(22);
var _function = __webpack_require__(23);
var _bidi = __webpack_require__(24);
var _colorspace = __webpack_require__(25);
var _pattern = __webpack_require__(26);
var _murmurhash = __webpack_require__(12);
var _xml_parser = __webpack_require__(13);
var _xfa_fonts = __webpack_require__(27);
var _xfa_object = __webpack_require__(28);
var _text_accessibility = __webpack_require__(29);
var _struct_tree = __webpack_require__(30);
var _default_appearance = __webpack_require__(31);
var _writer = __webpack_require__(32);
const DEFAULT_USER_UNIT = 1.0;
const DOCUMENT_INIT_CHUNK_SIZE = 1024;
function getLength(arg) {
  if (arg instanceof _base_stream.BaseStream) {
    return arg.length;
  }
  if (Number.isInteger(arg)) {
    return arg;
  }
  (0, _util.assert)(typeof arg === "object" && arg !== null && Number.isInteger(arg.length), "Invalid length argument type.");
  return arg.length;
}
class Page {
  constructor({
    doc,
    pageIndex,
    pageDict,
    ref,
    fontCache,
    builtInCMapCache,
    globalImageCache,
    nonBlendModesSet,
    xfaFactory
  }) {
    this.doc = doc;
    this.pageIndex = pageIndex;
    this.pageDict = pageDict;
    this.ref = ref;
    this.fontCache = fontCache;
    this.builtInCMapCache = builtInCMapCache;
    this.globalImageCache = globalImageCache;
    this.nonBlendModesSet = nonBlendModesSet;
    this.xfaFactory = xfaFactory;
    this.id = doc.transport.pageCache.add(this);
    this.rotate = 0;
    this.resources = null;
    this.mediaBox = null;
    this.cropBox = null;
    this.userUnit = DEFAULT_USER_UNIT;
    this.view = null;
    this.objs = new _obj.Dict(doc.xref);
    const resources = pageDict.get("Resources");
    if (resources instanceof _primitives.Dict) {
      this.resources = resources;
    }
    const rotate = pageDict.get("Rotate");
    if (Number.isInteger(rotate) && rotate % 90 === 0) {
      const angle = (rotate % 360 + 360) % 360;
      if (angle !== 0) {
        this.rotate = angle;
      }
    }
    this.lastModified = pageDict.get("LastModified");
    const userUnit = pageDict.get("UserUnit");
    if (typeof userUnit === "number" && userUnit > 0) {
      this.userUnit = userUnit;
    }
    let mediaBox = pageDict.get("MediaBox");
    if (!Array.isArray(mediaBox) || mediaBox.length !== 4) {
      (0, _util.warn)("Page.constructor: Invalid MediaBox.");
    } else {
      this.mediaBox = mediaBox;
    }
    let cropBox = pageDict.get("CropBox");
    if (!Array.isArray(cropBox) || cropBox.length !== 4) {
      if (cropBox) {
        (0, _util.warn)("Page.constructor: Invalid CropBox.");
      }
      cropBox = null;
    } else {
      this.cropBox = cropBox;
    }
    this.view = _core_utils.PageViewport.fromDict({
      pageDict,
      mediaBox: this.mediaBox,
      cropBox: this.cropBox,
      userUnit: this.userUnit,
      rotation: this.rotate
    });
    this.extractTextContentInfo = {
      supported: false,
      ccittStencils: null,
      extractStencils: null,
      extractInlineImage: null,
      colorsPromise: null
    };
  }
  get CommonObjs() {
    return this.doc.CommonObjs;
  }
  getOptionalContentConfig() {
    return this.doc.getOptionalContentConfig();
  }
  getOperatorList({
    handler,
    task,
    intent,
    renderForms,
    annotationStorage,
    pageIndex
  }) {
    const content = this.pageDict.get("Contents");
    const opList = new _operator_list.OperatorList(intent, handler, pageIndex, this.fontCache, this.builtInCMapCache);
    let contentStream;
    if (Array.isArray(content)) {
      const streams = [];
      for (const stream of content) {
        streams.push(this.doc.xref.fetchIfRef(stream));
      }
      contentStream = new _stream.StreamsSequenceStream(streams);
    } else {
      contentStream = this.doc.xref.fetchIfRef(content);
    }
    if (!contentStream) {
      contentStream = new _stream.StringStream("");
    }
    const evaluator = new _evaluator.PartialEvaluator({
      xref: this.doc.xref,
      handler,
      pageIndex,
      idFactory: this.doc.idFactory,
      fontCache: this.fontCache,
      builtInCMapCache: this.builtInCMapCache,
      globalImageCache: this.globalImageCache,
      nonBlendModesSet: this.nonBlendModesSet,
      xfaFactory: this.xfaFactory,
      smaskAbsolute: false
    });
    return evaluator.getOperatorList({
      stream: contentStream,
      task,
      resources: this.resources,
      operatorList: opList,
      initialState: this.view.initialState
    }).then(function () {
      if (renderForms) {
        return page.getAnnotations({
          intent: "display"
        }).then(function (annotations) {
          const sortedAnnotations = [];
          for (const annotation of annotations) {
            if (annotation.subtype === "Widget") {
              sortedAnnotations.push(annotation);
            }
          }
          sortedAnnotations.sort(function (a, b) {
            const a_rect = a.rect;
            const b_rect = b.rect;
            if (a_rect[1] < b_rect[1]) {
              return -1;
            }
            if (a_rect[1] > b_rect[1]) {
              return 1;
            }
            return a_rect[0] - b_rect[0];
          });
          for (const annotation of sortedAnnotations) {
            if (annotationStorage.has(annotation.id)) {
              const value = annotationStorage.getValue(annotation.id).value;
              if (value) {
                (0, _util.warn)("Form render is not implemented");
              }
            }
          }
        });
      }
      return undefined;
    }).then(function () {
      opList.isSmask = evaluator.isSmask;
      return opList;
    });
  }
  extractTextContent({
    handler,
    task,
    normalizeWhitespace,
    sink,
    combineTextItems
  }) {
    const content = this.pageDict.get("Contents");
    let contentStream;
    if (Array.isArray(content)) {
      const streams = [];
      for (const stream of content) {
        streams.push(this.doc.xref.fetchIfRef(stream));
      }
      contentStream = new _stream.StreamsSequenceStream(streams);
    } else {
      contentStream = this.doc.xref.fetchIfRef(content);
    }
    if (!contentStream) {
      contentStream = new _stream.StringStream("");
    }
    const stateManager = new _core_utils.StateManager(this.view.initialState);
    const textContent = {
      items: [],
      styles: Object.create(null)
    };
s.filter(s => s instanceof _stream.DictStream);
    const evaluator = new _evaluator.PartialEvaluator({
      xref: this.doc.xref,
      handler,
      pageIndex: this.pageIndex,
      idFactory: this.doc.idFactory,
      fontCache: this.fontCache,
      builtInCMapCache: this.builtInCMapCache,
      globalImageCache: this.globalImageCache,
      nonBlendModesSet: this.nonBlendModesSet
    });
    const textState = {
      textMatrix: _util_metapdf.IDENTITY_MATRIX,
      fontMatrix: _util_metapdf.IDENTITY_MATRIX,
      textLineMatrix: _util_metapdf.IDENTITY_MATRIX,
      charSpacing: 0,
      wordSpacing: 0,
      textHScale: 1,
      textRise: 0,
      leading: 0,
      font: null,
      fontSize: 0,
      fontSizeScale: 1
    };
    function runBidi(data, start, end, isLTR) {
      const str = data.str.substring(start, end);
      const bidiResult = (0, _bidi.bidi)(str, -1, data.dir === "rtl", isLTR);
      return {
        str: bidiResult.str,
        dir: bidiResult.dir,
        width: data.width
      };
    }
    evaluator.getOperatorList({
      stream: contentStream,
      task,
      resources: this.resources,
      operatorList: {
        addOp(op, args) {
          switch (op) {
            case _util.OPS.setFont:
              textState.font = evaluator.getFont(args[0], null);
              textState.fontMatrix = textState.font.fontMatrix || _util_metapdf.IDENTITY_MATRIX;
              textState.fontSize = args[1];
              break;
            case _util.OPS.setTextMatrix:
              textState.textMatrix = args;
              textState.textLineMatrix = args;
              break;
            case _util.OPS.setTextMatrixAndSize:
              textState.textMatrix = args[0];
              textState.textLineMatrix = args[0];
              textState.fontSize = args[1];
              textState.font = evaluator.getFont(args[2], null);
              textState.fontMatrix = textState.font.fontMatrix || _util_metapdf.IDENTITY_MATRIX;
              break;
            case _util.OPS.setLeadingMoveText:
              textState.leading = -args[1];
            case _util.OPS.moveText:
              const tx = args[0],
                ty = args[1];
              textState.textLineMatrix = _util_metapdf.transform(textState.textLineMatrix, [1, 0, 0, 1, tx, ty]);
              textState.textMatrix = textState.textLineMatrix;
              break;
            case _util.OPS.setLeadingMoveTextAndGlyphs:
              textState.leading = -args[1];
            case _util.OPS.showSpacedText:
              let items = args[0];
              let item;
              for (let i = 0, ii = items.length; i < ii; i++) {
                item = items[i];
                if (typeof item === "number") {
                  const val = item * textState.fontSize * textState.textHScale / 1000;
                  const [a, b, c, d, e, f] = textState.textMatrix;
                  textState.textMatrix = [a, b, c, d, e - val * a, f - val * b];
                } else if (typeof item === "string") {
                  pushTextContent(item, true);
                }
              }
              break;
            case _util.OPS.showText:
            case _util.OPS.nextLineShowText:
              pushTextContent(args[0], false);
              if (op === _util.OPS.nextLineShowText) {
                textState.textLineMatrix = _util_metapdf.transform(textState.textLineMatrix, [1, 0, 0, 1, 0, textState.leading]);
                textState.textMatrix = textState.textLineMatrix;
              }
              break;
            case _util.OPS.nextLine:
              textState.textLineMatrix = _util_metapdf.transform(textState.textLineMatrix, [1, 0, 0, 1, 0, textState.leading]);
              textState.textMatrix = textState.textLineMatrix;
              break;
            case _util.OPS.setCharSpacing:
              textState.charSpacing = args[0];
              break;
            case _util.OPS.setWordSpacing:
              textState.wordSpacing = args[0];
              break;
            case _util.OPS.setHScale:
              textState.textHScale = args[0] / 100;
              break;
            case _util.OPS.setTextRise:
              textState.textRise = args[0];
              break;
          }
        },
        addOpList(op, opList) {}
      }
    });
    function pushTextContent(chars, isShowSpacedText) {
      const font = textState.font;
      if (!font) {
        return;
      }
      const tr = _util_metapdf.transform(stateManager.textRenderingMatrix, textState.textMatrix);
      let isLTR = true;
      if (font.direction) {
        isLTR = font.direction === "ltr";
      }
      const defaultVMetrics = font.defaultVMetrics;
      const width = font.defaultWidth;
      const ff = textState.textHScale * textState.fontSize;
      const [a, b, c, d, e, f] = textState.textMatrix;
      const [fa, fb, fc, fd, fe, ff_] = textState.fontMatrix;
      const vmetricX = fc * ff + fe;
      const vmetricY = fd * ff + ff_;
      let ascent = (font.ascent || defaultVMetrics.ascent) * textState.fontSizeScale;
      let descent = (font.descent || defaultVMetrics.descent) * textState.fontSizeScale;
      const ty = Math.hypot(b, d);
      const scale = Math.hypot(a, b);
      const angle = Math.atan2(b, a);
      const angle_ = Math.atan2(c, d);
      let angleInDegrees = angle * 180 / Math.PI;
      angleInDegrees = (angleInDegrees + 360) % 360;
      let angleInDegrees_ = angle_ * 180 / Math.PI;
      angleInDegrees_ = (angleInDegrees_ + 360) % 360;
      ascent = (vmetricY + ascent) * ty;
      descent = (vmetricY + descent) * ty;
      const height = ascent - descent;
      let style = textContent.styles[font.name];
      if (!style) {
        style = textContent.styles[font.name] = {
          fontFamily: font.fallbackName,
          ascent,
          descent,
          vertical: font.vertical
        };
      }
      const data = {
        transform: tr,
        width,
        height,
        dir: isLTR ? "ltr" : "rtl",
        str: ""
      };
      let lastRun = null;
      let i = 0;
      const ii = chars.length;
      while (i < ii) {
        const char = chars[i];
        if (char === null) {
          i++;
          continue;
        }
        const width = font.widths[char] || font.defaultWidth;
        const widthAdvance = width * textState.fontSize;
        const widthAdvanceScale = widthAdvance * textState.textHScale;
        const wordSpacing = char === 32 ? textState.wordSpacing : 0;
        const space = (textState.charSpacing + wordSpacing) * textState.textHScale;
        let tx = widthAdvanceScale;
        let ty = 0;
        if (font.vertical) {
          tx = 0;
          ty = widthAdvance;
        }
        tx = tx * a + ty * c;
        ty = tx * b + ty * d;
        textState.textMatrix = _util_metapdf.transform(textState.textMatrix, [1, 0, 0, 1, tx, ty]);
        if (font.spaceWidth > 0 && char === 32 && !isShowSpacedText) {
          const spaceWidth = (textState.wordSpacing + textState.charSpacing) * textState.textHScale * textState.fontSize;
          textState.textMatrix = _util_metapdf.transform(textState.textMatrix, [1, 0, 0, 1, spaceWidth * a, spaceWidth * b]);
        }
        if (lastRun) {
          if (lastRun.dir === (isLTR ? "ltr" : "rtl")) {
            lastRun.str += char;
            i++;
          } else {
            textContent.items.push(runBidi(lastRun, 0, lastRun.str.length, isLTR));
            lastRun = null;
          }
        } else {
          lastRun = {
            str: char,
            dir: isLTR ? "ltr" : "rtl",
            width: 0,
            height: 0,
            transform: _util_metapdf.IDENTITY_MATRIX
          };
          i++;
        }
      }
      if (lastRun) {
        textContent.items.push(runBidi(lastRun, 0, lastRun.str.length, isLTR));
      }
      textState.textMatrix = _util_metapdf.transform(textState.textMatrix, [1, 0, 0, 1, width * a, width * b]);
      sink.ready.then(() => sink.append(textContent));
    }
  }
  getAnnotations({
    intent
  }) {
    if (this._annotationsPromise) {
      return this._annotationsPromise;
    }
    const promise = this.pageDict.getAsync("Annots").then(annots => {
      if (!Array.isArray(annots)) {
        return [];
      }
      const annotationPromises = [];
      for (const annotationRef of annots) {
        annotationPromises.push(_annotation.AnnotationFactory.create(this.doc.xref, annotationRef, this, this.id, this.xfaFactory));
      }
      return Promise.all(annotationPromises).then(annotations => {
        const sortedAnnotations = [];
        for (const annotation of annotations) {
          if (annotation.isViewable()) {
            sortedAnnotations.push(annotation.data);
          }
        }
        return sortedAnnotations;
      });
    });
    return this._annotationsPromise = promise;
  }
  get content() {
    return this.pageDict.get("Contents");
  }
  get annotations() {
    return this.pageDict.get("Annots");
  }
}
class PDFDocument {
  constructor(worker, source) {
    this.transport = worker;
    this.pdfDocuments = worker.pdfDocuments;
    this.docId = `d${PDFDocument.nextDocId++}`;
    if ((0, _primitives.isStream)(source.stream)) {
      this.stream = source.stream;
    } else if (source.data) {
      this.stream = new _stream.Stream(source.data);
    } else {
      (0, _util.unreachable)("Invalid PDFDocument constructor call.");
    }
    this.xref = new _obj.XRef(this.stream, source.password, source.initialData);
    this.catalog = new _obj.Catalog(this, this.xref);
    this.fontCache = new _core_utils.Cache();
    this.builtInCMapCache = new _core_utils.Cache();
    this.globalImageCache = new _image_utils.GlobalImageCache();
    this.nonBlendModesSet = new Set();
    this.xfaFactory = new _xfa_object.XfaFactory({
      doc: this,
      xref: this.xref,
      fontCache: this.fontCache
    });
    this.handler = worker.handler;
    this.pageCache = new _core_utils.Cache();
    this.objCache = new _core_utils.Cache();
    this.idFactory = (0, _core_utils.createIdFactory)(0);
    this.pdfManager = new _core_utils.PDFManager(this.docId, this.stream.length, this.handler, this.idFactory);
    this.annotationStorage = new _annotation.AnnotationStorage();
  }
  get XRef() {
    return this.xref;
  }
  get Catalog() {
    return this.catalog;
  }
  get Handler() {
    return this.handler;
  }
  get ObjCache() {
    return this.objCache;
  }
  get CommonObjs() {
    return this.transport.commonObjs;
  }
  get FontCache() {
    return this.fontCache;
  }
  get BuiltInCMapCache() {
    return this.builtInCMapCache;
  }
  get GlobalImageCache() {
    return this.globalImageCache;
  }
  get NonBlendModesSet() {
    return this.nonBlendModesSet;
  }
  get XfaFactory() {
    return this.xfaFactory;
  }
  checkPassword(password) {
    let decryptPromise;
    if (this.xref.isEncrypted) {
      decryptPromise = this.xref.decrypt.catch(reason => {
        if (reason instanceof _util.PasswordException) {
          if (reason.code === _util.PasswordResponses.NEED_PASSWORD) {
            this.pdfManager.requestPassword(reason);
          }
        }
        throw reason;
      });
    } else {
      decryptPromise = Promise.resolve();
    }
    decryptPromise.then(() => {
      this.pdfManager.send("PasswordCorrect", null);
    }).catch(reason => {
      if (reason instanceof _util.PasswordException) {
        if (reason.code === _util.PasswordResponses.INCORRECT_PASSWORD) {
          this.pdfManager.send("PasswordIncorrect", null);
        }
      } else {
        this.pdfManager.send("PasswordIncorrect", null);
      }
    });
  }
  parse(recoveryMode) {
    this.xref.parse(recoveryMode);
  }
  get linearization() {
    let linearization = null;
    try {
      linearization = this.xref.trailer.get("Linearized");
    } catch (err) {
      if (err instanceof _core_utils.MissingDataException) {
        throw err;
      }
      (0, _util.warn)(err);
    }
    return linearization;
  }
  get startXRef() {
    return this.xref.startXRef;
  }
  get numPages() {
    if (this._numPagesPromise) {
      return this._numPagesPromise;
    }
    const promise = this.catalog.getAsync("Pages").then(pagesDict => {
      if (!(pagesDict instanceof _primitives.Dict)) {
        return 0;
      }
      const count = pagesDict.get("Count");
      if (!Number.isInteger(count) || count < 0) {
        throw new Error("Page count is not an integer.");
      }
      return count;
    });
    return this._numPagesPromise = promise;
  }
  get documentInfo() {
    const docInfo = {
      PDFFormatVersion: this.pdfFormatVersion,
      IsLinearized: this.linearization !== null,
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      IsCollectionPresent: false,
      Producer: "",
      Creator: "",
      CreationDate: "",
      ModDate: ""
    };
    const trailer = this.xref.trailer;
    const info = trailer.get("Info");
    if (info instanceof _primitives.Dict) {
      docInfo.Producer = info.get("Producer") || "";
      docInfo.Creator = info.get("Creator") || "";
      docInfo.CreationDate = info.get("CreationDate") || "";
      docInfo.ModDate = info.get("ModDate") || "";
    }
    const acroForm = this.catalog.get("AcroForm");
    if (acroForm instanceof _primitives.Dict) {
      docInfo.IsAcroFormPresent = true;
      if (acroForm.has("XFA")) {
        docInfo.IsXFAPresent = true;
      }
    }
    const collection = this.catalog.get("Collection");
    if (collection instanceof _primitives.Dict) {
      docInfo.IsCollectionPresent = true;
    }
    return docInfo;
  }
  get fingerprint() {
    const id = this.xref.trailer.get("ID");
    let fingerprint = "";
    if (Array.isArray(id) && id[0] && (0, _util.isString)(id[0])) {
      const hash = new _murmurhash.MurmurHash3_64();
      hash.update(id[0]);
      if (id[1] && (0, _util.isString)(id[1])) {
        hash.update(id[1]);
      }
      fingerprint = hash.hexdigest();
    } else {
      fingerprint = this.xref.trailer.get("Fingerprint") || "";
    }
    if (fingerprint) {
      return fingerprint;
    }
    const hash = new _murmurhash.MurmurHash3_64();
    hash.update(this.stream.length.toString());
    hash.update(this.documentInfo.Producer);
    hash.update(this.documentInfo.Creator);
    hash.update(this.documentInfo.CreationDate);
    hash.update(this.documentInfo.ModDate);
    return hash.hexdigest();
  }
  get calculationOrderIds() {
    const acroForm = this.catalog.get("AcroForm");
    if (!(acroForm instanceof _primitives.Dict)) {
      return null;
    }
    const fields = acroForm.get("CO");
    if (!Array.isArray(fields) || fields.length === 0) {
      return null;
    }
    return fields.filter(field => field instanceof _primitives.Ref).map(field => field.toString());
  }
  get formInfo() {
    const acroForm = this.catalog.get("AcroForm");
    if (!(acroForm instanceof _primitives.Dict)) {
      return {
        hasFields: false,
        hasAcroForm: false,
        hasXfa: false
      };
    }
    const fields = acroForm.get("Fields");
    const hasFields = Array.isArray(fields) && fields.length > 0;
    const xfa = acroForm.get("XFA");
    const hasXfa = !!xfa;
    return {
      hasFields,
      hasAcroForm: hasFields || !!acroForm.get("NeedAppearances"),
      hasXfa
    };
  }
  get viewerPreferences() {
    if (this._viewerPreferencesPromise) {
      return this._viewerPreferencesPromise;
    }
    const promise = this.catalog.getAsync("ViewerPreferences").then(prefs => {
      if (!(prefs instanceof _primitives.Dict)) {
        return null;
      }
      const preferences = Object.create(null);
      for (const [key, value] of prefs) {
        switch (key) {
          case "HideToolbar":
          case "HideMenubar":
          case "HideWindowUI":
          case "FitWindow":
          case "CenterWindow":
          case "DisplayDocTitle":
          case "PickTrayByPDFSize":
            if (typeof value === "boolean") {
              preferences[key] = value;
            }
            break;
          case "NonFullScreenPageMode":
          case "ViewArea":
          case "ViewClip":
          case "PrintArea":
          case "PrintClip":
          case "PrintScaling":
          case "Duplex":
          case "Direction":
            if ((0, _util.isName)(value)) {
              preferences[key] = value.name;
            }
            break;
          case "NumCopies":
            if (Number.isInteger(value)) {
              preferences[key] = value;
            }
            break;
          case "PrintPageRange":
            if (Array.isArray(value)) {
              preferences[key] = value;
            }
            break;
        }
      }
      return preferences;
    });
    return this._viewerPreferencesPromise = promise;
  }
  get openAction() {
    if (this._openActionPromise) {
      return this._openActionPromise;
    }
    const promise = this.catalog.getAsync("OpenAction").then(openAction => {
      if (!(openAction instanceof _primitives.Dict)) {
        return null;
      }
      const s = openAction.get("S");
      if (!(0, _util.isName)(s)) {
        return null;
      }
      const action = {
        action: s.name
      };
      switch (s.name) {
        case "GoTo":
          const d = openAction.get("D");
          if (!(0, _primitives.isName)(d)) {
            return null;
          }
          action.dest = d.name;
          break;
        case "GoToR":
          const f = openAction.get("F");
          if (!((0, _util.isString)(f) || f instanceof _primitives.Dict)) {
            return null;
          }
          action.filename = f;
          action.newWindow = openAction.get("NewWindow") || false;
          break;
        case "Launch":
          const win = openAction.get("Win");
          if (win) {
            action.win = win;
          } else {
            const f = openAction.get("F");
            if (!((0, _util.isString)(f) || f instanceof _primitives.Dict)) {
              return null;
            }
            action.url = f;
            action.newWindow = openAction.get("NewWindow") || false;
          }
          break;
        case "Named":
          const n = openAction.get("N");
          if (!(0, _util.isName)(n)) {
            return null;
          }
          action.name = n.name;
          break;
        case "JavaScript":
          const js = openAction.get("JS");
          if (!((0, _util.isString)(js) || js instanceof _base_stream.BaseStream)) {
            return null;
          }
          action.javascript = js;
          break;
        default:
          return null;
      }
      return action;
    });
    return this._openActionPromise = promise;
  }
  getPage(pageIndex) {
    const pageRef = this.catalog.getPage(pageIndex);
    if (!pageRef) {
      return null;
    }
    if (this.pageCache.has(pageRef.toString())) {
      return this.pageCache.get(pageRef.toString());
    }
    const pageDict = this.xref.fetch(pageRef);
    const page = new Page({
      doc: this,
      pageIndex,
      pageDict,
      ref: pageRef,
      fontCache: this.fontCache,
      builtInCMapCache: this.builtInCMapCache,
      globalImageCache: this.globalImageCache,
      nonBlendModesSet: this.nonBlendModesSet,
      xfaFactory: this.xfaFactory
    });
    this.pageCache.put(pageRef.toString(), page);
    return page;
  }
  getPageIndex(pageRef) {
    return this.catalog.getPageIndex(pageRef);
  }
  getDestinations() {
    return this.catalog.destinations;
  }
  getPageLabels() {
    return this.catalog.pageLabels;
  }
  getPageLayout() {
    return this.catalog.pageLayout;
  }
  getPageMode() {
    return this.catalog.pageMode;
  }
  getMetadata() {
    return this.catalog.metadata;
  }
  getData() {
    return Promise.resolve(this.stream.getByteRange(0, this.stream.length));
  }
  getDownloadInfo() {
    return this.catalog.getAsync("AcroForm").then(acroForm => {
      if (!(acroForm instanceof _primitives.Dict)) {
        return {
          length: this.stream.length
        };
      }
      const needAppearances = acroForm.get("NeedAppearances");
      if (typeof needAppearances !== "boolean") {
        return {
          length: this.stream.length
        };
      }
      return {
        length: this.stream.length,
        needAppearances
      };
    });
  }
  get optionalContentConfig() {
    return this.catalog.optionalContentConfig;
  }
  get attachments() {
    return this.catalog.attachments;
  }
  get javaScript() {
    return this.catalog.javaScript;
  }
  get jsActions() {
    return this.catalog.jsActions;
  }
  get structTree() {
    return this.catalog.structTree;
  }
  get fieldObjects() {
    return this.catalog.fieldObjects;
  }
  get hasJSActions() {
    return this.catalog.hasJSActions;
  }
  get xfa() {
    const acroForm = this.catalog.get("AcroForm");
    if (!(acroForm instanceof _primitives.Dict)) {
      return null;
    }
    const xfa = acroForm.get("XFA");
    if (!xfa) {
      return null;
    }
    const streams = !Array.isArray(xfa) ? [xfa] : xfa.filter((x, i) => i % 2 === 1);
    const data = streams.map(stream => (0, _util.bytesToString)(stream.getBytes()));
    try {
      return (0, _xml_parser.parseXfa)({
        data,
        password: this.xref.password
      });
    } catch (e) {
      (0, _util.warn)(e.message);
      return null;
    }
  }
  get calculationOrderIds() {
    return this.catalog.calculationOrderIds;
  }
  cleanup() {
    return this.catalog.cleanup();
  }
  saveDocument(annotationStorage, name) {
    const trailer = this.xref.trailer;
    const info = trailer.get("Info");
    if (info instanceof _primitives.Dict) {
      info.set("ModDate", (0, _default_appearance.toPDFDate)(new Date()));
    }
    const writer = new _writer.Writer(this.xref);
    for (const page of this.pageCache.getAll()) {
      page.getAnnotations({
        intent: "save"
      }).then(annotations => {
        for (const annotation of annotations) {
          if (annotationStorage.has(annotation.id)) {
            const data = annotationStorage.getValue(annotation.id);
            if (data.value) {
              const rect = annotation.rect;
              const appearance = (0, _default_appearance.createDefaultAppearance)(data.value, annotation.fontName, annotation.fontSize, annotation.fontColor, annotation.rotation, rect, annotation.id);
              writer.write(annotation.ref, `<< /AP << /N ${appearance} >> /F 4 /FT /Tx /T (tx) /V (${(0, _util.stringToPDFString)(data.value)}) >>`);
            }
          }
        }
      });
    }
    return writer.write();
  }
}
exports.PDFDocument = PDFDocument;
PDFDocument.nextDocId = 0;

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MissingDataException = exports.PageViewport = exports.PDFManager = exports.LocalPdfManager = exports.LoopbackPort = exports.FontRegistry = exports.FallbackFontManager = exports.CMapFactory = exports.CMap = exports.Cache = void 0;
exports.createIdFactory = createIdFactory;
exports.getLookupTableFactory = getLookupTableFactory;
exports.isLittleEndian = void 0;
var _util = __webpack_require__(1);
var _util_metapdf = __webpack_require__(33);
var _primitives = __webpack_require__(18);
var _parser = __webpack_require__(17);
var _stream = __webpack_require__(4);
var _crypto = __webpack_require__(16);
class MissingDataException extends Error {
  constructor(begin, end) {
    super(`Missing data [${begin}, ${end})`);
    this.name = "MissingDataException";
    this.begin = begin;
    this.end = end;
  }
}
exports.MissingDataException = MissingDataException;
const isLittleEndian = true;
exports.isLittleEndian = isLittleEndian;
const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
const FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];
const LINE_CAP_STYLES = ["butt", "round", "square"];
const LINE_JOIN_STYLES = ["miter", "round", "bevel"];
const NORMAL_CLIP = {};
const EO_CLIP = {
  rule: "evenodd"
};
const TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};
const LinkTarget = {
  NONE: 0,
  SELF: 1,
  BLANK: 2,
  PARENT: 3,
  TOP: 4
};
const ImageType = {
  BITMAP: 1,
  PATH: 2
};
function createIdFactory(pageIndex) {
  const page = pageIndex + 1;
  const idCounters = {
    font: 0,
    xObject: 0,
    content: 0
  };
  return {
    get font() {
      return `p${page}_f${++idCounters.font}`;
    },
    get xObject() {
      return `p${page}_x${++idCounters.xObject}`;
    },
    get content() {
      return `p${page}_c${++idCounters.content}`;
    }
  };
}
class PageViewport {
  constructor({
    viewBox,
    scale,
    rotation,
    offsetX = 0,
    offsetY = 0,
    dontFlip = false,
    optionalContentConfigPromise = null
  }) {
    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.optionalContentConfigPromise = optionalContentConfigPromise;
    const [x1, y1, x2, y2] = viewBox;
    const dx = x2 - x1,
      dy = y2 - y1;
    this.width = dx;
    this.height = dy;
    if (rotation === 0 || rotation === 180) {
      this.transform = [scale, 0, 0, -scale, -x1 * scale, y2 * scale];
    } else {
      this.transform = [0, -scale, -scale, 0, y2 * scale, x2 * scale];
    }
    if (dontFlip) {
      this.transform[3] = -this.transform[3];
      this.transform[5] = -this.transform[5];
    }
    let transform = _util_metapdf.transform(this.transform, [1, 0, 0, 1, offsetX, offsetY]);
    switch (rotation) {
      case 90:
        transform = _util_metapdf.transform(transform, [0, -1, 1, 0, 0, dx]);
        break;
      case 180:
        transform = _util_metapdf.transform(transform, [-1, 0, 0, -1, dx, dy]);
        break;
      case 270:
        transform = _util_metapdf.transform(transform, [0, 1, -1, 0, dy, 0]);
        break;
    }
    this.transform = transform;
    this.initialState = {
      fillColor: null,
      strokeColor: null,
      fillAlpha: 1,
      strokeAlpha: 1,
      lineWidth: 1,
      lineJoin: "miter",
      lineCap: "butt",
      miterLimit: 10,
      dashArray: [],
      dashPhase: 0,
      font: null,
      fontSize: 0,
      fontDirection: 1,
      fontMatrix: FONT_IDENTITY_MATRIX,
      textMatrix: IDENTITY_MATRIX,
      textLineMatrix: IDENTITY_MATRIX,
      charSpacing: 0,
      wordSpacing: 0,
      textHScale: 1,
      textRise: 0,
      leading: 0,
      clip: NORMAL_CLIP,
      renderingIntent: "Default"
    };
  }
  clone({
    scale = this.scale,
    rotation = this.rotation,
    offsetX = this.offsetX,
    offsetY = this.offsetY,
    dontFlip = false,
    optionalContentConfigPromise = this.optionalContentConfigPromise
  } = {}) {
    return new PageViewport({
      viewBox: this.viewBox.slice(),
      scale,
      rotation,
      offsetX,
      offsetY,
      dontFlip,
      optionalContentConfigPromise
    });
  }
  convertToViewportPoint(x, y) {
    return _util_metapdf.applyTransform([x, y], this.transform);
  }
  convertToViewportRectangle(rect) {
    const [x1, y1, x2, y2] = rect;
    const p1 = this.convertToViewportPoint(x1, y1);
    const p2 = this.convertToViewportPoint(x2, y2);
    return [p1[0], p1[1], p2[0], p2[1]];
  }
  convertToPdfPoint(x, y) {
    return _util_metapdf.applyInverseTransform([x, y], this.transform);
  }
  static fromDict({
    pageDict,
    mediaBox,
    cropBox,
    userUnit,
    rotation
  }) {
    let viewBox = mediaBox;
    if (cropBox) {
      if (cropBox[0] === mediaBox[0] && cropBox[1] === mediaBox[1] && cropBox[2] === mediaBox[2] && cropBox[3] === mediaBox[3]) {
        cropBox = null;
      } else {
        const intersection = _util_metapdf.intersect(mediaBox, cropBox);
        if (intersection) {
          viewBox = intersection;
        }
      }
    }
    return new PageViewport({
      viewBox,
      scale: 1,
      rotation,
      offsetX: 0,
      offsetY: 0,
      dontFlip: false
    });
  }
}
exports.PageViewport = PageViewport;
class StateManager {
  constructor(initialState) {
    this.state = initialState;
    this.stateStack = [];
  }
  save() {
    const old = this.state;
    this.stateStack.push(this.state);
    this.state = old.clone();
  }
  restore() {
    const prev = this.stateStack.pop();
    if (prev) {
      this.state = prev;
    }
  }
  transform(matrix) {
    this.state.transform = _util_metapdf.transform(this.state.transform, matrix);
  }
}
function getLookupTableFactory(maxCount = 256) {
  let lookupTables = [];
  return function (resolve) {
    const lookupTable = new Uint8Array(maxCount);
    for (let i = 0; i < maxCount; i++) {
      lookupTable[i] = resolve(i);
    }
    for (const table of lookupTables) {
      if (table.every((value, index) => value === lookupTable[index])) {
        return table;
      }
    }
    lookupTables.push(lookupTable);
    if (lookupTables.length > 50) {
      lookupTables = lookupTables.slice(-50);
    }
    return lookupTable;
  };
}
class BaseCMap {
  constructor(builtInCMap) {
    this._map = [];
    if (builtInCMap) {
      this.name = builtInCMap.name;
      this.vertical = !!builtInCMap.vertical;
    }
  }
  addCodes(charcode, glyphId, length) {
    if (length === 1) {
      if (this._map[charcode] === undefined) {
        this._map[charcode] = glyphId;
      }
    } else if (length > 1) {
      let map = this._map;
      for (let i = 0; i < length - 1; i++) {
        const c = charcode >>> 8 * (length - 1 - i) & 0xff;
        if (map[c] === undefined) {
          map[c] = [];
        }
        map = map[c];
      }
      const c = charcode & 0xff;
      if (map[c] === undefined) {
        map[c] = glyphId;
      }
    }
  }
  lookup(charcode) {
    return this._map[charcode];
  }
  contains(charcode) {
    return this._map[charcode] !== undefined;
  }
  forEach(callback) {
    const map = this._map;
    for (let i = 0, ii = map.length; i < ii; i++) {
      if (map[i] !== undefined) {
        callback(i, map[i]);
      }
    }
  }
  getMap() {
    return this._map;
  }
  get length() {
    return this._map.length;
  }
}
class CMap extends BaseCMap {
  constructor(builtInCMap = null) {
    super(builtInCMap);
    this.wmode = 0;
  }
  getMap() {
    return this._map;
  }
  readCharCode(str, offset, out) {
    let c = str.charCodeAt(offset);
    let map = this.lookup(c);
    let hi = c;
    if (Array.isArray(map)) {
      offset++;
      c = str.charCodeAt(offset);
      hi = hi << 8 | c;
      map = map[c];
      while (Array.isArray(map)) {
        offset++;
        c = str.charCodeAt(offset);
        hi = hi << 8 | c;
        if (Number.isInteger(hi)) {
          throw new Error("Invalid CMap data: unexpected long charcode.");
        }
        map = map[c];
      }
    }
    out.charcode = map;
    out.length = offset - out.offset + 1;
  }
}
exports.CMap = CMap;
const cMapCache = new Map();
const CMapFactory = {
  create({
    encoding,
    fetchBuiltInCMap,
    useCMap
  }) {
    if (encoding instanceof _primitives.Name) {
      const name = encoding.name;
      let cmap;
      if (name.startsWith("Identity-")) {
        cmap = new CMap();
        cmap.name = name;
        if (name === "Identity-V") {
          cmap.vertical = true;
        }
        return Promise.resolve(cmap);
      }
      const cached = cMapCache.get(name);
      if (cached) {
        return cached.promise;
      }
      const capability = (0, _util.createPromiseCapability)();
      cMapCache.set(name, capability);
      fetchBuiltInCMap(name).then(function (data) {
        const cMap = CMapFactory.parse(data.cMapData, useCMap, data.compressionType);
        capability.resolve(cMap);
      }).catch(function (reason) {
        cMapCache.delete(name);
        capability.reject(reason);
      });
      return capability.promise;
    } else if ((0, _primitives.isStream)(encoding)) {
      return CMapFactory.parse(encoding, useCMap);
    }
    throw new Error("CMap encoding must be a name or a stream.");
  },
  parse(data, useCMap, compressionType = _util.CMapCompressionType.NONE) {
    const cMap = useCMap instanceof CMap ? useCMap : new CMap();
    return new Promise(function (resolve, reject) {
      if (!data) {
        reject(new Error("CMap data is not provided."));
        return;
      }
      const stream = data instanceof _stream.Stream ? data : new _stream.StringStream(data);
      if (compressionType !== _util.CMapCompressionType.NONE) {
        (0, _util.warn)("CMap decompression is not implemented.");
        resolve(cMap);
        return;
      }
      const lexer = new _parser.Lexer(stream);
      const parser = new _parser.Parser({
        lexer,
        xref: null
      });
      let token = parser.getObj();
      while (!(token instanceof _primitives.EOF)) {
        if (token instanceof _primitives.Cmd) {
          switch (token.cmd) {
            case "begincmap":
              break;
            case "endcmap":
              resolve(cMap);
              return;
            case "begincodespacerange":
              const count = parser.getObj();
              for (let i = 0; i < count; i++) {
                parser.getObj();
                parser.getObj();
              }
              break;
            case "begincidrange":
              const countCid = parser.getObj();
              for (let i = 0; i < countCid; i++) {
                const start = parser.getObj();
                const end = parser.getObj();
                const dst = parser.getObj();
                for (let j = start; j <= end; j++) {
                  cMap.addCodes(j, dst + (j - start), 2);
                }
              }
              break;
            case "begincidchar":
              const countCidChar = parser.getObj();
              for (let i = 0; i < countCidChar; i++) {
                const src = parser.getObj();
                const dst = parser.getObj();
                cMap.addCodes(src, dst, src.length);
              }
              break;
            case "WMode":
              cMap.wmode = parser.getObj();
              break;
            case "CMapName":
              cMap.name = parser.getObj().name;
              break;
            case "CMapVersion":
              cMap.version = parser.getObj();
              break;
            case "CMapType":
              cMap.type = parser.getObj();
              break;
            case "Registry":
              cMap.registry = parser.getObj();
              break;
            case "Ordering":
              cMap.ordering = parser.getObj();
              break;
            case "Supplement":
              cMap.supplement = parser.getObj();
              break;
            default:
              (0, _util.warn)(`Unknown CMap command: ${token.cmd}`);
              break;
          }
        }
        token = parser.getObj();
      }
      resolve(cMap);
    });
  }
};
exports.CMapFactory = CMapFactory;
const BUILT_IN_CMAPS = ["78-EUC-H", "78-EUC-V", "78-H", "78-RKSJ-H", "78-RKSJ-V", "78-V", "78ms-RKSJ-H", "78ms-RKSJ-V", "83pv-RKSJ-H", "90ms-RKSJ-H", "90ms-RKSJ-V", "90msp-RKSJ-H", "90msp-RKSJ-V", "90pv-RKSJ-H", "90pv-RKSJ-V", "Add-H", "Add-RKSJ-H", "Add-RKSJ-V", "Adobe-CNS1-0", "Adobe-CNS1-1", "Adobe-CNS1-2", "Adobe-CNS1-3", "Adobe-CNS1-4", "Adobe-CNS1-5", "Adobe-CNS1-6", "Adobe-CNS1-B5pc", "Adobe-CNS1-ETen-B5", "Adobe-CNS1-H-Done", "Adobe-CNS1-H-Dyn", "Adobe-CNS1-H-Fixed", "Adobe-GB1-0", "Adobe-GB1-1", "Adobe-GB1-2", "Adobe-GB1-3", "Adobe-GB1-4", "Adobe-GB1-5", "Adobe-Japan1-0", "Adobe-Japan1-1", "Adobe-Japan1-2", "Adobe-Japan1-3", "Adobe-Japan1-4", "Adobe-Japan1-5", "Adobe-Japan1-6", "Adobe-Japan1-UCS2", "Adobe-Korea1-0", "Adobe-Korea1-1", "Adobe-Korea1-2", "B5-H", "B5-V", "B5pc-H", "B5pc-V", "CNS-EUC-H", "CNS-EUC-V", "CNS1-H", "CNS1-V", "CNS2-H", "CNS2-V", "ETen-B5-H", "ETen-B5-V", "ETenms-B5-H", "ETenms-B5-V", "ETHK-B5-H", "ETHK-B5-V", "EUC-H", "EUC-V", "Ext-H", "Ext-RKSJ-H", "Ext-RKSJ-V", "GB-EUC-H", "GB-EUC-V", "GB-H", "GB-V", "GBK-EUC-H", "GBK-EUC-V", "GBK2K-H", "GBK2K-V", "GBKp-EUC-H", "GBKp-EUC-V", "GBT-EUC-H", "GBT-EUC-V", "GBT-H", "GBT-V", "GBTpc-EUC-H", "GBTpc-EUC-V", "HKscs-B5-H", "HKscs-B5-V", "H", "Identity-H", "Identity-V", "KSC-EUC-H", "KSC-EUC-V", "KSC-H", "KSC-V", "KSCms-UHC-H", "KSCms-UHC-HW-H", "KSCms-UHC-HW-V", "KSCms-UHC-V", "KSCpc-EUC-H", "KSCpc-EUC-V", "NCS-H", "NCS-V", "NWP-H", "NWP-V", "RKSJ-H", "RKSJ-V", "Roman", "UniCNS-UCS2-H", "UniCNS-UCS2-V", "UniCNS-UTF16-H", "UniCNS-UTF16-V", "UniCNS-UTF32-H", "UniCNS-UTF32-V", "UniCNS-UTF8-H", "UniCNS-UTF8-V", "UniGB-UCS2-H", "UniGB-UCS2-V", "UniGB-UTF16-H", "UniGB-UTF16-V", "UniGB-UTF32-H", "UniGB-UTF32-V", "UniGB-UTF8-H", "UniGB-UTF8-V", "UniJIS-UCS2-H", "UniJIS-UCS2-HW-H", "UniJIS-UCS2-HW-V", "UniJIS-UCS2-V", "UniJIS-UTF16-H", "UniJIS-UTF16-V", "UniJIS-UTF32-H", "UniJIS-UTF32-V", "UniJIS-UTF8-H", "UniJIS-UTF8-V", "UniJIS2004-UTF16-H", "UniJIS2004-UTF16-V", "UniJIS2004-UTF32-H", "UniJIS2004-UTF32-V", "UniJIS2004-UTF8-H", "UniJIS2004-UTF8-V", "UniJISPro-UCS2-HW-V", "UniJISPro-UCS2-V", "UniJISX0213-UTF32-H", "UniJISX0213-UTF32-V", "UniJISX02132004-UTF32-H", "UniJISX02132004-UTF32-V", "UniKS-UCS2-H", "UniKS-UCS2-V", "UniKS-UTF16-H", "UniKS-UTF16-V", "UniKS-UTF32-H", "UniKS-UTF32-V", "UniKS-UTF8-H", "UniKS-UTF8-V", "V", "WP-Symbol"];
const PDF_MANAGERS = new Map();
class PDFManager {
  constructor(docId, data, owner) {
    this.docId = docId;
    this.data = data;
    this.owner = owner;
    this.pdfDocument = null;
    this.pagePromises = [];
    this.pageCache = [];
    this.cleanupPromise = null;
    PDF_MANAGERS.set(docId, this);
  }
  static getPDFManager(docId, data, owner) {
    if (PDF_MANAGERS.has(docId)) {
      return PDF_MANAGERS.get(docId);
    }
    return new PDFManager(docId, data, owner);
  }
  requestLoadedStream(listener) {}
  send(message, data) {
    this.owner.send(message, data);
  }
  onLoadedStream() {
    this.requestLoadedStream(null);
  }
  ensureDoc(context, args) {
    if (this.pdfDocument) {
      context.pdfDocument = this.pdfDocument;
      return;
    }
    this.pdfDocument = this.owner.loadDocument(this.data);
    context.pdfDocument = this.pdfDocument;
  }
  ensurePage(context, pageIndex) {
    if (context.page) {
      return;
    }
    if (this.pagePromises[pageIndex]) {
      throw new Error("Page is not loaded yet");
    }
    this.pagePromises[pageIndex] = this.pdfDocument.getPage(pageIndex).then(page => {
      this.pageCache[pageIndex] = page;
      context.page = page;
      delete this.pagePromises[pageIndex];
    }).catch(reason => {
      throw reason;
    });
  }
  cleanup(keepLoaded) {
    if (this.cleanupPromise) {
      if (keepLoaded) {
        return this.cleanupPromise;
      }
      this.pdfDocument = null;
      return this.cleanupPromise;
    }
    const promises = [];
    for (const promise of this.pagePromises) {
      if (promise) {
        promises.push(promise);
      }
    }
    return this.cleanupPromise = Promise.all(promises).then(() => {
      if (this.pdfDocument) {
        this.pdfDocument.cleanup();
      }
      this.pdfDocument = null;
      this.pageCache.length = 0;
      PDF_MANAGERS.delete(this.docId);
      this.cleanupPromise = null;
    });
  }
}
exports.PDFManager = PDFManager;
class LocalPdfManager extends PDFManager {
  constructor(docId, data, password, docBaseUrl) {
    super(docId, data, null);
    this.password = password;
    this.docBaseUrl = docBaseUrl;
    this._loadedStreamCapability = (0, _util.createPromiseCapability)();
  }
  requestLoadedStream(listener) {
    this._loadedStreamCapability.promise.then(function (stream) {
      listener.onLoadedStream(stream);
    });
  }
  send(message, data) {}
  loadDocument(data) {
    const stream = new _stream.Stream(data);
    const pdfDocument = new _pdf.PDFDocument(null, stream, this.password, null, this.docBaseUrl);
    this._loadedStreamCapability.resolve(stream);
    return pdfDocument;
  }
}
exports.LocalPdfManager = LocalPdfManager;
class LoopbackPort {
  constructor() {
    this._listeners = [];
  }
  postMessage(obj, transfer) {
    const event = {
      data: obj
    };
    for (const listener of this._listeners) {
      listener.call(this, event);
    }
  }
  addEventListener(name, listener, options) {
    if (name === "message") {
      this._listeners.push(listener);
    }
  }
  removeEventListener(name, listener, options) {
    if (name === "message") {
      const i = this._listeners.indexOf(listener);
      if (i >= 0) {
        this._listeners.splice(i, 1);
      }
    }
  }
  terminate() {
    this._listeners.length = 0;
  }
}
exports.LoopbackPort = LoopbackPort;
class Cache {
  constructor() {
    this._cache = new Map();
    this._last = null;
    this._last_key = null;
  }
  get(key) {
    if (this._last_key === key) {
      return this._last;
    }
    if (this._cache.has(key)) {
      this._last_key = key;
      this._last = this._cache.get(key);
      return this._last;
    }
    return undefined;
  }
  put(key, value) {
    if (this._cache.has(key)) {
      this._cache.get(key).destroy();
    }
    this._cache.set(key, value);
    this._last_key = key;
    this._last = value;
  }
  has(key) {
    return this._cache.has(key);
  }
  purge() {
    for (const value of this._cache.values()) {
      if (typeof value.destroy === "function") {
        value.destroy();
      }
    }
    this._cache.clear();
    this._last = null;
    this._last_key = null;
  }
}
exports.Cache = Cache;
class FontRegistry {
  constructor() {
    this._standardFontData = Object.create(null);
    this._customFontData = Object.create(null);
  }
  registerFont(font) {
    const fontName = font.name;
    const isStandardFont = !!this._standardFontData[fontName];
    if (isStandardFont) {
      (0, _util.warn)(`Font "${fontName}" is already a standard font.`);
      return;
    }
    this._customFontData[fontName] = font;
  }
  get isFontSubstitutionsEnabled() {
    return !!this._substitutions;
  }
  get substitutions() {
    return this._substitutions;
  }
  set substitutions(val) {
    this._substitutions = val;
  }
  get standardFontData() {
    return this._standardFontData;
  }
  set standardFontData(val) {
    this._standardFontData = val;
  }
}
exports.FontRegistry = FontRegistry;
class FallbackFontManager {
  constructor(options, owner) {
    this.owner = owner;
    this.cdnUrl = options.pdfBug ? null : "https://standard-fonts.pdf.js.org/";
  }
  load(font) {
    const fontName = font.name;
    const url = this.cdnUrl + fontName.replace(" ", "") + ".pfb";
    (0, _util.Util).loadScript(url).then(() => {
      this.owner.send("FontLoad", {
        fontName
      });
    }).catch(() => {
      this.owner.send("FontLoad", {
        fontName,
        error: true
      });
    });
  }
}
exports.FallbackFontManager = FallbackFontManager;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StreamsSequenceStream = exports.StringStream = exports.Stream = exports.DecodeStream = exports.DictStream = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _base_stream = __webpack_require__(15);
class Stream extends _base_stream.BaseStream {
  constructor(arrayBuffer, start, length, dict) {
    super();
    this.bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
    this.start = start || 0;
    this.pos = this.start;
    this.end = start + length || this.bytes.length;
    this.dict = dict || _primitives.Dict.empty;
  }
  get length() {
    return this.end - this.start;
  }
  get isEmpty() {
    return this.length === 0;
  }
  getByte() {
    if (this.pos >= this.end) {
      return -1;
    }
    return this.bytes[this.pos++];
  }
  getBytes(length) {
    const bytes = this.bytes;
    const pos = this.pos;
    const str_end = this.end;
    if (!length) {
      const subarray = bytes.subarray(pos, str_end);
      this.pos = str_end;
      return subarray;
    }
    let n = length;
    if (n > str_end - pos) {
      n = str_end - pos;
    }
    if (n <= 0) {
      return new Uint8Array(0);
    }
    const subarray = bytes.subarray(pos, pos + n);
    this.pos = pos + n;
    return subarray;
  }
  getUint16() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    if (b0 === -1 || b1 === -1) {
      return -1;
    }
    return b0 << 8 | b1;
  }
  getInt32() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    const b2 = this.getByte();
    const b3 = this.getByte();
    return b0 << 24 | b1 << 16 | b2 << 8 | b3;
  }
  peekByte() {
    const peekedByte = this.getByte();
    if (peekedByte !== -1) {
      this.pos--;
    }
    return peekedByte;
  }
  peekBytes(length) {
    const bytes = this.getBytes(length);
    this.pos -= bytes.length;
    return bytes;
  }
  getByteRange(begin, end) {
    if (begin < 0) {
      begin = 0;
    }
    if (end > this.bytes.length) {
      end = this.bytes.length;
    }
    return this.bytes.subarray(begin, end);
  }
  skip(n) {
    if (!n) {
      n = 1;
    }
    this.pos += n;
  }
  reset() {
    this.pos = this.start;
  }
  moveStart() {
    this.start = this.pos;
  }
  makeSubStream(start, length, dict) {
    return new Stream(this.bytes.buffer, start, length, dict);
  }
}
exports.Stream = Stream;
class StringStream extends Stream {
  constructor(str) {
    super((0, _util.stringToBytes)(str));
  }
}
exports.StringStream = StringStream;
class DecodeStream extends Stream {
  constructor(stream, maybeMinBufferLength) {
    super();
    if (stream instanceof DecodeStream) {
      (0, _util.unreachable)("DecodeStream buffer is not initializable.");
    }
    this.str = stream;
    this.dict = stream.dict;
    this.minBufferLength = maybeMinBufferLength || 512;
    this._rawMinBufferLength = this.minBufferLength;
    this.buffer = new Uint8Array(this.minBufferLength);
    this.bufferLength = 0;
    this.eof = false;
  }
  get isEmpty() {
    while (this.bufferLength === 0 && !this.eof) {
      this.readBlock();
    }
    return this.bufferLength === 0;
  }
  ensureBuffer(requested) {
    const buffer = this.buffer;
    if (requested <= buffer.byteLength) {
      return buffer;
    }
    let newLength = buffer.byteLength * 2;
    while (newLength < requested) {
      newLength *= 2;
    }
    const newBuffer = new Uint8Array(newLength);
    newBuffer.set(buffer);
    return this.buffer = newBuffer;
  }
  getByte() {
    let pos = this.pos;
    while (this.bufferLength <= pos) {
      if (this.eof) {
        return -1;
      }
      this.readBlock();
    }
    const byte = this.buffer[pos];
    this.pos = pos + 1;
    return byte;
  }
  getBytes(length) {
    let pos = this.pos;
    if (length) {
      this.ensureBuffer(pos + length);
      let end = pos + length;
      while (!this.eof && this.bufferLength < end) {
        this.readBlock();
      }
      const bufEnd = this.bufferLength;
      if (end > bufEnd) {
        end = bufEnd;
      }
      this.pos = end;
      return this.buffer.subarray(pos, end);
    }
    while (!this.eof) {
      this.readBlock();
    }
    const subarray = this.buffer.subarray(pos, this.bufferLength);
    this.pos = this.bufferLength;
    return subarray;
  }
  reset() {
    this.pos = 0;
  }
  readBlock() {
    (0, _util.unreachable)("Abstract method `readBlock` called");
  }
}
exports.DecodeStream = DecodeStream;
class DictStream extends Stream {
  constructor(stream, dict) {
    super(stream.getBytes());
    this.dict = dict;
  }
}
exports.DictStream = DictStream;
class StreamsSequenceStream extends Stream {
  constructor(streams) {
    let length = 0;
    const validStreams = [];
    for (const stream of streams) {
      if (!(0, _primitives.isStream)(stream)) {
        (0, _util.warn)("StreamsSequenceStream - ignoring invalid stream.");
        continue;
      }
      length += stream.length;
      validStreams.push(stream);
    }
    const bytes = new Uint8Array(length);
    let pos = 0;
    for (const stream of validStreams) {
      bytes.set(stream.getBytes(), pos);
      pos += stream.length;
    }
    super(bytes);
    this.streams = validStreams;
  }
}
exports.StreamsSequenceStream = StreamsSequenceStream;

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isNodeJS = void 0;
const isNodeJS = typeof process === "object" && process + "" === "[object process]" && !process.versions["electron"] && !process.versions["nw"];
exports.isNodeJS = isNodeJS;

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isWeb = void 0;
const isWeb = typeof window !== "undefined" && window.document;
exports.isWeb = isWeb;

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isReflectAndProxyAvailable = void 0;
const isReflectAndProxyAvailable = typeof Reflect !== "undefined" && typeof Proxy !== "undefined";
exports.isReflectAndProxyAvailable = isReflectAndProxyAvailable;

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MessageHandler = void 0;
var _util = __webpack_require__(1);
var _image_utils = __webpack_require__(9);
class MessageHandler {
  constructor(name, comObj) {
    this.name = name;
    this.comObj = comObj;
    this.callbackIndex = 1;
    this.callbacks = Object.create(null);
    this.actions = Object.create(null);
    this.comObj.addEventListener("message", event => {
      const data = event.data;
      if (!isObject(data) || !data.pdfjs) {
        return;
      }
      if (data.callbackId) {
        const cb = this.callbacks[data.callbackId];
        if (typeof cb === "function") {
          cb(data.data);
          delete this.callbacks[data.callbackId];
        }
      } else if (data.action) {
        const action = this.actions[data.action];
        if (typeof action === "function") {
          action(data.data);
        }
      } else {
        (0, _util.warn)(`Unkown message from worker: ${data}`);
      }
    });
  }
  on(actionName, handler, scope) {
    const ah = this.actions[actionName];
    if (ah) {
      throw new Error(`There is already an actionName called "${actionName}"`);
    }
    this.actions[actionName] = handler.bind(scope);
  }
  send(actionName, data, transfers) {
    const message = {
      pdfjs: true,
      action: actionName,
      data
    };
    this.comObj.postMessage(message, transfers);
  }
  sendWithPromise(actionName, data, transfers) {
    const callbackId = this.callbackIndex++;
    const message = {
      pdfjs: true,
      action: actionName,
      callbackId,
      data
    };
    const capability = (0, _util.createPromiseCapability)();
    this.callbacks[callbackId] = capability.resolve;
    this.comObj.postMessage(message, transfers);
    return capability.promise;
  }
  postMessageTransfers(transfers) {
    if (!transfers) {
      return;
    }
    if (_image_utils.ImageBitmapUtils.isAvailable) {
      transfers.forEach(function (obj) {
        if (obj instanceof ImageBitmap) {
          obj.close();
        }
      });
    }
  }
}
exports.MessageHandler = MessageHandler;

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.JpegStream = exports.ImageBitmapUtils = exports.GlobalImageCache = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _base_stream = __webpack_require__(15);
var _stream = __webpack_require__(4);
var _jpx = __webpack_require__(34);
var _jbig = __webpack_require__(35);
class JpegStream extends _stream.DecodeStream {
  constructor(stream, maybeMinBufferLength, dict, commonObjs) {
    super(stream, maybeMinBufferLength);
    this.dict = dict;
    this.commonObjs = commonObjs;
  }
  readBlock() {
    if (this.eof) {
      return;
    }
    const Markers = {
      SOF0: 0xc0,
      SOF1: 0xc1,
      SOF2: 0xc2,
      SOF3: 0xc3,
      SOF5: 0xc5,
      SOF6: 0xc6,
      SOF7: 0xc7,
      SOF9: 0xc9,
      SOF10: 0xca,
      SOF11: 0xcb,
      SOF13: 0xcd,
      SOF14: 0xce,
      SOF15: 0xcf,
      DHT: 0xc4,
      DAC: 0xcc,
      SOI: 0xd8,
      EOI: 0xd9,
      SOS: 0xda,
      DQT: 0xdb,
      DNL: 0xdc,
      DRI: 0xdd,
      DHP: 0xde,
      EXP: 0xdf,
      APP0: 0xe0,
      APP1: 0xe1,
      APP2: 0xe2,
      APP3: 0xe3,
      APP4: 0xe4,
      APP5: 0xe5,
      APP6: 0xe6,
      APP7: 0xe7,
      APP8: 0xe8,
      APP9: 0xe9,
      APP10: 0xea,
      APP11: 0xeb,
      APP12: 0xec,
      APP13: 0xed,
      APP14: 0xee,
      APP15: 0xef,
      COM: 0xfe
    };
    const jpg = this.str.getByte();
    if (jpg < 0) {
      this.eof = true;
      return;
    }
    let jpg2 = this.str.getByte();
    if (jpg2 < 0) {
      this.eof = true;
      return;
    }
    if (jpg !== 0xff || jpg2 !== Markers.SOI) {
      (0, _util.warn)("First two bytes of a JPEG stream are not SOF.");
    }
    const buffer = this.ensureBuffer(this.bufferLength + 2);
    buffer[this.bufferLength++] = jpg;
    buffer[this.bufferLength++] = jpg2;
    while (!this.eof) {
      const b = this.str.getByte();
      if (b < 0) {
        this.eof = true;
        break;
      }
      if (b !== 0xff) {
        (0, _util.warn)("Invalid marker in a JPEG stream.");
        break;
      }
      let marker = this.str.getByte();
      if (marker < 0) {
        this.eof = true;
        break;
      }
      if (marker === Markers.SOS) {
        const sosLength = this.str.getUint16();
        if (sosLength < 0) {
          this.eof = true;
          break;
        }
        const data = this.str.getBytes(sosLength - 2);
        const buffer = this.ensureBuffer(this.bufferLength + 4 + data.length);
        buffer[this.bufferLength++] = 0xff;
        buffer[this.bufferLength++] = Markers.SOS;
        buffer[this.bufferLength++] = sosLength >> 8 & 0xff;
        buffer[this.bufferLength++] = sosLength & 0xff;
        buffer.set(data, this.bufferLength);
        this.bufferLength += data.length;
        const remaining = this.str.getBytes();
        const buffer2 = this.ensureBuffer(this.bufferLength + remaining.length);
        buffer2.set(remaining, this.bufferLength);
        this.bufferLength += remaining.length;
        this.eof = true;
        break;
      }
      switch (marker) {
        case Markers.SOF0:
        case Markers.SOF1:
        case Markers.SOF2:
        case Markers.SOF3:
        case Markers.SOF5:
        case Markers.SOF6:
        case Markers.SOF7:
        case Markers.SOF9:
        case Markers.SOF10:
        case Markers.SOF11:
        case Markers.SOF13:
        case Markers.SOF14:
        case Markers.SOF15:
        case Markers.DHT:
        case Markers.DAC:
        case Markers.DQT:
        case Markers.DNL:
        case Markers.DRI:
        case Markers.DHP:
        case Markers.EXP:
        case Markers.APP0:
        case Markers.APP1:
        case Markers.APP2:
        case Markers.APP3:
        case Markers.APP4:
        case Markers.APP5:
        case Markers.APP6:
        case Markers.APP7:
        case Markers.APP8:
        case Markers.APP9:
        case Markers.APP10:
        case Markers.APP11:
        case Markers.APP12:
        case Markers.APP13:
        case Markers.APP14:
        case Markers.APP15:
        case Markers.COM:
          const length = this.str.getUint16();
          if (length < 0) {
            this.eof = true;
            break;
          }
          const data = this.str.getBytes(length - 2);
          const buffer = this.ensureBuffer(this.bufferLength + 4 + data.length);
          buffer[this.bufferLength++] = 0xff;
          buffer[this.bufferLength++] = marker;
          buffer[this.bufferLength++] = length >> 8 & 0xff;
          buffer[this.bufferLength++] = length & 0xff;
          buffer.set(data, this.bufferLength);
          this.bufferLength += data.length;
          break;
        case 0xff:
          const buffer_ = this.ensureBuffer(this.bufferLength + 2);
          buffer_[this.bufferLength++] = 0xff;
          buffer_[this.bufferLength++] = 0xff;
          break;
        case 0x00:
        case 0xd0:
        case 0xd1:
        case 0xd2:
        case 0xd3:
        case 0xd4:
        case 0xd5:
        case 0xd6:
        case 0xd7:
          const buffer__ = this.ensureBuffer(this.bufferLength + 2);
          buffer__[this.bufferLength++] = 0xff;
          buffer__[this.bufferLength++] = marker;
          break;
        default:
          (0, _util.warn)(`Unknown marker in a JPEG stream: ${marker}`);
          break;
      }
    }
  }
}
exports.JpegStream = JpegStream;
class ImageBitmapUtils {
  static get isAvailable() {
    return typeof createImageBitmap !== "undefined";
  }
  static async createImageBitmap(data, options) {
    (0, _util.assert)(this.isAvailable, "Cannot use `createImageBitmap`.");
    return createImageBitmap(data, options);
  }
}
exports.ImageBitmapUtils = ImageBitmapUtils;
class GlobalImageCache {
  constructor() {
    this._cache = new Map();
    this._checksums = new Map();
  }
  get(id) {
    return this._cache.get(id) || null;
  }
  set(id, data) {
    if (!id || !data) {
      return;
    }
    const checksum = (0, _murmurhash.MurmurHash3_64_hexdigest)(data);
    if (this._checksums.has(checksum)) {
      const prevId = this._checksums.get(checksum);
      this._cache.set(id, this.get(prevId));
      return;
    }
    this._cache.set(id, data);
    this._checksums.set(checksum, id);
  }
  clear(id) {
    const data = this._cache.get(id);
    if (!data) {
      return;
    }
    this._cache.delete(id);
    const checksum = (0, _murmurhash.MurmurHash3_64_hexdigest)(data);
    this._checksums.delete(checksum);
  }
  purge() {
    this._cache.clear();
    this._checksums.clear();
  }
}
exports.GlobalImageCache = GlobalImageCache;

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.FetchStream = void 0;
var _util = __webpack_require__(1);
var _base_stream = __webpack_require__(15);
const MIN_CHUNK_SIZE = 16 * 1024;
const MAX_CHUNK_SIZE = 1024 * 1024;
class FetchStream extends _base_stream.BaseStream {
  constructor(source) {
    super();
    this.start = source.start || 0;
    this.end = source.end || 0;
    this.url = source.url;
    this.disableRange = source.disableRange || false;
    this.rangeChunkSize = source.rangeChunkSize || MAX_CHUNK_SIZE;
    this.requests = [];
    this.headers = new Headers(source.httpHeaders);
  }
  get length() {
    return this.end;
  }
  async getBytes() {
    if (this.disableRange) {
      const {
        value
      } = await this.getReader().read();
      return value;
    }
    const rangeReader = this.getRangeReader(this.start, this.end);
    let result = new Uint8Array(this.length);
    let offset = 0;
    let loaded = 0;
    const pump = async reader => {
      while (loaded < this.length) {
        const {
          value
        } = await reader.read();
        result.set(value, offset);
        offset += value.length;
        loaded += value.length;
      }
      return result;
    };
    return pump(rangeReader);
  }
  cancel(reason) {
    for (const request of this.requests) {
      request.abort(reason);
    }
    this.requests.length = 0;
  }
  getReader() {
    if (this.disableRange) {
      const fullReader = this.getFullReader();
      fullReader.onProgress = this.onProgress;
      return fullReader;
    }
    const rangeReader = this.getRangeReader(this.start, this.end);
    rangeReader.onProgress = this.onProgress;
    return rangeReader;
  }
  getFullReader() {
    const readable = new ReadableStream({
      start: controller => {
        const request = new AbortController();
        const signal = request.signal;
        this.requests.push(request);
        fetch(this.url, {
          signal,
          headers: this.headers
        }).then(async response => {
          if (!response.ok) {
            throw new Error(`Invalid HTTP response: ${response.status}`);
          }
          if (response.body) {
            const reader = response.body.getReader();
            const pump = async () => {
              const {
                done,
                value
              } = await reader.read();
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(value);
              pump();
            };
            pump();
          } else {
            const buffer = await response.arrayBuffer();
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
          }
        }).catch(err => {
          controller.error(err);
        });
      },
      cancel: reason => {
        this.cancel(reason);
      }
    });
    return readable.getReader();
  }
  getRangeReader(begin, end) {
    let current = begin;
    let next = begin;
    const chunkSize = this.rangeChunkSize;
    const readable = new ReadableStream({
      start: controller => {
        this.request = new AbortController();
      },
      pull: async controller => {
        if (current >= end) {
          controller.close();
          return;
        }
        next = Math.min(next + chunkSize, end);
        const headers = new Headers(this.headers);
        headers.set("Range", `bytes=${current}-${next - 1}`);
        try {
          const response = await fetch(this.url, {
            signal: this.request.signal,
            headers
          });
          if (!response.ok) {
            throw new Error(`Invalid HTTP response: ${response.status}`);
          }
          const buffer = await response.arrayBuffer();
          current += buffer.byteLength;
          controller.enqueue(new Uint8Array(buffer));
        } catch (err) {
          controller.error(err);
        }
      },
      cancel: reason => {
        this.cancel(reason);
      }
    });
    return readable.getReader();
  }
}
exports.FetchStream = FetchStream;

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.NodeReadableStream = void 0;
var _util = __webpack_require__(1);
var _base_stream = __webpack_require__(15);
class NodeReadableStream extends _base_stream.BaseStream {
  constructor(source) {
    super();
    this.url = source.url;
    this.port = source.port;
    this.reader = null;
  }
  getReader() {
    if (this.reader) {
      return this.reader;
    }
    const readable = new ReadableStream({
      start: async controller => {
        this.port.on("message", message => {
          if (message.data) {
            controller.enqueue(message.data);
          } else {
            controller.close();
          }
        });
        this.port.postMessage({
          action: "getReader",
          url: this.url
        });
      }
    });
    this.reader = readable.getReader();
    return this.reader;
  }
}
exports.NodeReadableStream = NodeReadableStream;

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MurmurHash3_64_hexdigest = MurmurHash3_64_hexdigest;
exports.MurmurHash3_64 = void 0;
var _util = __webpack_require__(1);
class MurmurHash3_64 {
  constructor(seed = 0) {
    this.h1 = seed;
    this.h2 = seed;
  }
  update(data) {
    let h1 = this.h1;
    let h2 = this.h2;
    const c1 = 0x87c37b91;
    const c2 = 0x2745937f;
    const c3 = 0x52dce729;
    const c4 = 0x38495ab5;
    const k1 = 0;
    const k2 = 0;
    const n = data.length;
    let i = 0;
    while (i < n) {
      let k1 = 0;
      let k2 = 0;
      switch (n - i) {
        case 7:
          k2 ^= data.charCodeAt(i + 6) << 16;
        case 6:
          k2 ^= data.charCodeAt(i + 5) << 8;
        case 5:
          k2 ^= data.charCodeAt(i + 4) << 0;
        case 4:
          k1 ^= data.charCodeAt(i + 3) << 24;
        case 3:
          k1 ^= data.charCodeAt(i + 2) << 16;
        case 2:
          k1 ^= data.charCodeAt(i + 1) << 8;
        case 1:
          k1 ^= data.charCodeAt(i) << 0;
          break;
        default:
          k1 = data.charCodeAt(i) | data.charCodeAt(i + 1) << 8 | data.charCodeAt(i + 2) << 16 | data.charCodeAt(i + 3) << 24;
          k2 = data.charCodeAt(i + 4) | data.charCodeAt(i + 5) << 8 | data.charCodeAt(i + 6) << 16 | data.charCodeAt(i + 7) << 24;
          break;
      }
      k1 = k1 * c1 | 0;
      k1 = (k1 << 15 | k1 >>> 17) * c2 | 0;
      h1 ^= k1;
      h1 = (h1 << 19 | h1 >>> 13) * c3 + c4 | 0;
      k2 = k2 * c2 | 0;
      k2 = (k2 << 17 | k2 >>> 15) * c1 | 0;
      h2 ^= k2;
      h2 = (h2 << 13 | h2 >>> 19) * c4 + c3 | 0;
      i += 8;
    }
    h1 ^= n;
    h2 ^= n;
    h1 += h2;
    h2 += h1;
    h1 = (h1 ^ h1 >>> 16) * 0xed558ccd | 0;
    h2 = (h2 ^ h2 >>> 16) * 0xed558ccd | 0;
    h1 = (h1 ^ h1 >>> 16) * 0x1a85ec53 | 0;
    h2 = (h2 ^ h2 >>> 16) * 0x1a85ec53 | 0;
    h1 += h2;
    h2 += h1;
    this.h1 = h1;
    this.h2 = h2;
  }
  hexdigest() {
    let h1 = this.h1;
    let h2 = this.h2;
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }
}
exports.MurmurHash3_64 = MurmurHash3_64;
function MurmurHash3_64_hexdigest(data) {
  const hash = new MurmurHash3_64();
  hash.update(data);
  return hash.hexdigest();
}

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseXfa = parseXfa;
var _util = __webpack_require__(1);
const MAX_NODES_LIMIT = 100000;
class XMLParser {
  constructor() {
    this.currentNode = null;
    this.nodes = [];
    this.currentText = "";
  }
  parse(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const root = doc.documentElement;
    if (root.nodeName === "parsererror") {
      throw new Error(root.textContent);
    }
    return this.parseNode(root);
  }
  parseNode(node) {
    if (this.nodes.length > MAX_NODES_LIMIT) {
      throw new Error("Too many nodes in XFA content.");
    }
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        const newNode = {
          name: node.nodeName,
          attributes: {},
          children: []
        };
        this.nodes.push(newNode);
        for (const {
          name,
          value
        } of node.attributes) {
          newNode.attributes[name] = value;
        }
        for (const child of node.childNodes) {
          const childNode = this.parseNode(child);
          if (childNode) {
            newNode.children.push(childNode);
          }
        }
        return newNode;
      case Node.TEXT_NODE:
        if (node.nodeValue.trim()) {
          return {
            name: "#text",
            value: node.nodeValue
          };
        }
        break;
      case Node.CDATA_SECTION_NODE:
        return {
          name: "#cdata",
          value: node.nodeValue
        };
      case Node.COMMENT_NODE:
        return {
          name: "#comment",
          value: node.nodeValue
        };
    }
    return null;
  }
}
function parseXfa(data) {
  if (!data.data) {
    return null;
  }
  const xml = Array.isArray(data.data) ? data.data.join("") : data.data;
  if (!xml) {
    return null;
  }
  try {
    const parser = new XMLParser();
    return parser.parse(xml);
  } catch (e) {
    (0, _util.warn)(`XFA - XML parsing failed: "${e}".`);
    return null;
  }
}

/***/ }),
/* 14 */
/***/ ((module) => {



module.exports = require("worker_threads");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.BaseStream = void 0;
var _util = __webpack_require__(1);
class BaseStream {
  constructor() {
    if (this.constructor === BaseStream) {
      (0, _util.unreachable)("Cannot initialize BaseStream.");
    }
  }
  get length() {
    return 0;
  }
  get isEmpty() {
    return this.length === 0;
  }
  getByte() {
    return -1;
  }
  getBytes(length) {
    return null;
  }
  getUint16() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    if (b0 === -1 || b1 === -1) {
      return -1;
    }
    return b0 << 8 | b1;
  }
  getInt32() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    const b2 = this.getByte();
    const b3 = this.getByte();
    return b0 << 24 | b1 << 16 | b2 << 8 | b3;
  }
  peekByte() {
    return -1;
  }
  peekBytes(length) {
    return null;
  }
  getByteRange(begin, end) {
    return null;
  }
  skip(n) {}
  reset() {}
  moveStart() {}
  makeSubStream(start, length, dict) {
    (0, _util.unreachable)("Abstract method `makeSubStream` called");
  }
  decode() {
    (0, _util.unreachable)("Abstract method `decode` called");
  }
  get canAsyncDecodeImageFromBuffer() {
    return false;
  }
  asyncDecodeImageFromBuffer(buffer) {
    return Promise.reject(new Error("Not implemented"));
  }
  get isDataLoaded() {
    return true;
  }
  get numChunks() {
    return 0;
  }
  get currentChunk() {
    return null;
  }
  get nextChunk() {
    return null;
  }
  get lastChunk() {
    return null;
  }
  onData(callback) {}
  get progressive() {
    return false;
  }
  readBlock() {}
  cancel(reason) {}
}
exports.BaseStream = BaseStream;

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createCipherTransform = createCipherTransform;
exports.decrypt = decrypt;
exports.calculateMD5 = calculateMD5;
const AES_BLOCK_SIZE = 16;
const roundKey = new Uint8Array(32);
const iv = new Uint8Array(AES_BLOCK_SIZE);
const tmp = new Uint8Array(AES_BLOCK_SIZE);
function createCipherTransform(key, initialVector) {
  let mode = "aes-128-cbc";
  if (key.length === 24) {
    mode = "aes-192-cbc";
  } else if (key.length === 32) {
    mode = "aes-256-cbc";
  }
  return {
    encrypt(data) {
      const cipher = require("crypto").createCipheriv(mode, key, initialVector);
      return cipher.update(data);
    },
    decrypt(data) {
      const decipher = require("crypto").createDecipheriv(mode, key, initialVector);
      return decipher.update(data);
    }
  };
}
function decrypt(data, key, initialVector) {
  const c = createCipherTransform(key, initialVector);
  return c.decrypt(data);
}
function calculateMD5(data, start, length) {
  const crypto = require("crypto");
  const md5 = crypto.createHash("md5");
  md5.update(data.subarray(start, start + length));
  return md5.digest("binary");
}

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Parser = exports.Lexer = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _stream = __webpack_require__(4);
class Lexer {
  constructor(stream, handler) {
    this.stream = stream;
    this.handler = handler;
    this.nextChar();
  }
  nextChar() {
    return this.currentChar = this.stream.getByte();
  }
  peekChar() {
    return this.stream.peekByte();
  }
  getObj() {
    let comment = "";
    let whiteSpace = 0;
    while (true) {
      const ch = this.currentChar;
      if (ch === -1) {
        return _primitives.EOF;
      }
      whiteSpace = 0;
      while ((0, _util.isSpace)(ch) || ch === 0) {
        whiteSpace++;
        this.nextChar();
      }
      if (this.currentChar === -1) {
        return _primitives.EOF;
      }
      if (whiteSpace > 0) {
        continue;
      }
      switch (this.currentChar) {
        case 37:
          comment = "";
          this.nextChar();
          while (this.currentChar !== -1 && this.currentChar !== 13 && this.currentChar !== 10) {
            comment += String.fromCharCode(this.currentChar);
            this.nextChar();
          }
          this.handler.send("comment", comment);
          continue;
        case 40:
          return this.getLiteralString();
        case 60:
          this.nextChar();
          if (this.currentChar === 60) {
            this.nextChar();
            return _primitives.Cmd.get("<<");
          }
          return this.getHexString();
        case 62:
          this.nextChar();
          if (this.currentChar === 62) {
            this.nextChar();
            return _primitives.Cmd.get(">>");
          }
          throw new Error("Invalid character");
        case 91:
          this.nextChar();
          return _primitives.Cmd.get("[");
        case 93:
          this.nextChar();
          return _primitives.Cmd.get("]");
        case 123:
          this.nextChar();
          return _primitives.Cmd.get("{");
        case 125:
          this.nextChar();
          return _primitives.Cmd.get("}");
        case 47:
          this.nextChar();
          return this.getName();
        default:
          if (this.currentChar >= 48 && this.currentChar <= 57 || this.currentChar === 45 || this.currentChar === 43 || this.currentChar === 46) {
            return this.getNumber();
          }
          return this.getCmd();
      }
    }
  }
  getLiteralString() {
    this.nextChar();
    let str = "";
    let parens = 1;
    while (this.currentChar !== -1) {
      if (this.currentChar === 40) {
        parens++;
      } else if (this.currentChar === 41) {
        parens--;
        if (parens === 0) {
          break;
        }
      } else if (this.currentChar === 92) {
        this.nextChar();
        switch (this.currentChar) {
          case 110:
            str += "\n";
            break;
          case 114:
            str += "\r";
            break;
          case 116:
            str += "\t";
            break;
          case 98:
            str += "\b";
            break;
          case 102:
            str += "\f";
            break;
          case 92:
          case 40:
          case 41:
            str += String.fromCharCode(this.currentChar);
            break;
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
            let octal = this.currentChar - 48;
            this.nextChar();
            if (this.currentChar >= 48 && this.currentChar <= 55) {
              octal = (octal << 3) + (this.currentChar - 48);
              this.nextChar();
              if (this.currentChar >= 48 && this.currentChar <= 55) {
                octal = (octal << 3) + (this.currentChar - 48);
              }
            }
            str += String.fromCharCode(octal);
            continue;
          case 13:
            this.nextChar();
            if (this.currentChar === 10) {
              this.nextChar();
            }
            continue;
          case 10:
            this.nextChar();
            continue;
          default:
            str += String.fromCharCode(this.currentChar);
        }
      } else {
        str += String.fromCharCode(this.currentChar);
      }
      this.nextChar();
    }
    this.nextChar();
    return str;
  }
  getHexString() {
    let str = "";
    while (this.currentChar !== -1 && this.currentChar !== 62) {
      str += String.fromCharCode(this.currentChar);
      this.nextChar();
    }
    this.nextChar();
    let hex = "";
    if (str.length % 2 === 1) {
      str += "0";
    }
    for (let i = 0; i < str.length; i += 2) {
      const h = str.charCodeAt(i);
      const l = str.charCodeAt(i + 1);
      const val = parseInt(String.fromCharCode(h, l), 16);
      if (!isNaN(val)) {
        hex += String.fromCharCode(val);
      }
    }
    return hex;
  }
  getNumber() {
    let str = "";
    while (this.currentChar !== -1 && (this.currentChar >= 48 && this.currentChar <= 57 || this.currentChar === 45 || this.currentChar === 43 || this.currentChar === 46)) {
      str += String.fromCharCode(this.currentChar);
      this.nextChar();
    }
    if (str.includes(".")) {
      return parseFloat(str);
    }
    return parseInt(str, 10);
  }
  getName() {
    let str = "";
    while (this.currentChar !== -1 && !(0, _util.isSpace)(this.currentChar) && this.currentChar !== 40 && this.currentChar !== 41 && this.currentChar !== 60 && this.currentChar !== 62 && this.currentChar !== 91 && this.currentChar !== 93 && this.currentChar !== 123 && this.currentChar !== 125 && this.currentChar !== 47 && this.currentChar !== 37) {
      if (this.currentChar === 35) {
        this.nextChar();
        const h1 = this.currentChar;
        this.nextChar();
        const h2 = this.currentChar;
        const hex = String.fromCharCode(h1, h2);
        str += String.fromCharCode(parseInt(hex, 16));
      } else {
        str += String.fromCharCode(this.currentChar);
      }
      this.nextChar();
    }
    return _primitives.Name.get(str);
  }
  getCmd() {
    let str = "";
    while (this.currentChar !== -1 && !(0, _util.isSpace)(this.currentChar) && this.currentChar !== 40 && this.currentChar !== 41 && this.currentChar !== 60 && this.currentChar !== 62 && this.currentChar !== 91 && this.currentChar !== 93 && this.currentChar !== 123 && this.currentChar !== 125 && this.currentChar !== 47 && this.currentChar !== 37) {
      str += String.fromCharCode(this.currentChar);
      this.nextChar();
    }
    return _primitives.Cmd.get(str);
  }
}
exports.Lexer = Lexer;
class Parser {
  constructor({
    lexer,
    xref,
    recoveryMode = false
  }) {
    this.lexer = lexer;
    this.xref = xref;
    this.recoveryMode = recoveryMode;
    this.objId = null;
    this.cache = new Map();
  }
  getObj(objId = null) {
    this.objId = objId;
    let obj = this.getObjInternal();
    if (objId !== null && this.cache.has(objId)) {
      if (!(obj instanceof _primitives.Dict) && !(obj instanceof _stream.Stream)) {
        return this.cache.get(objId);
      }
      this.cache.set(objId, obj);
    }
    return obj;
  }
  getObjInternal() {
    const obj = this.lexer.getObj();
    if (obj instanceof _primitives.Cmd) {
      switch (obj.cmd) {
        case "<<":
          const dict = new _primitives.Dict(this.xref);
          while (true) {
            let key = this.getObj();
            if (key instanceof _primitives.Cmd && key.cmd === ">>") {
              break;
            }
            if (!(key instanceof _primitives.Name)) {
              if (this.recoveryMode) {
                key = new _primitives.Name("invalid");
              } else {
                throw new Error("Dictionary key is not a name");
              }
            }
            let value = this.getObj();
            if (value instanceof _primitives.EOF) {
              if (this.recoveryMode) {
                value = _primitives.Null;
              } else {
                break;
              }
            }
            dict.set(key.name, value);
          }
          if (this.objId !== null && dict.has("Length")) {
            const length = this.getObj();
            if (!(typeof length === "number")) {
              if (this.recoveryMode) {
                return new _stream.Stream([], 0, 0, dict);
              }
              throw new Error("Invalid stream length");
            }
            const stream = this.lexer.stream.makeSubStream(this.lexer.stream.pos, length, dict);
            this.lexer.stream.pos += length;
            return new _stream.Stream(stream.getBytes(), 0, length, dict);
          }
          return dict;
        case "[":
          const arr = [];
          while (true) {
            const element = this.getObj();
            if (element instanceof _primitives.Cmd && element.cmd === "]") {
              break;
            }
            if (element instanceof _primitives.EOF) {
              if (this.recoveryMode) {
                break;
              }
              return arr;
            }
            arr.push(element);
          }
          return arr;
        case "R":
          const num = this.getObj();
          const gen = this.getObj();
          if (typeof num !== "number" || typeof gen !== "number") {
            throw new Error("Invalid reference");
          }
          return _util.Ref.get(num, gen);
        case "endobj":
          return _primitives.Cmd.get("endobj");
        case "trailer":
          return _primitives.Cmd.get("trailer");
        case "startxref":
          return _primitives.Cmd.get("startxref");
        case "xref":
          return _primitives.Cmd.get("xref");
      }
    }
    return obj;
  }
}
exports.Parser = Parser;

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StringStream = exports.Stream = exports.Ref = exports.Primitive = exports.Parser = exports.Null = exports.Name = exports.Lexer = exports.EOF = exports.Dict = exports.Cmd = void 0;
var _util = __webpack_require__(1);
var _stream = __webpack_require__(4);
const EOF = Symbol("EOF");
exports.EOF = EOF;
const Name = function NameClosure() {
  const nameCache = new Map();
  function Name(name) {
    this.name = name;
  }
  Name.prototype = {};
  Name.get = function Name_get(name) {
    let nameValue = nameCache.get(name);
    if (nameValue) {
      return nameValue;
    }
    nameValue = new Name(name);
    nameCache.set(name, nameValue);
    return nameValue;
  };
  Name.clearCache = function () {
    nameCache.clear();
  };
  return Name;
}();
exports.Name = Name;
const Cmd = function CmdClosure() {
  const cmdCache = new Map();
  function Cmd(cmd) {
    this.cmd = cmd;
  }
  Cmd.prototype = {};
  Cmd.get = function Cmd_get(cmd) {
    let cmdValue = cmdCache.get(cmd);
    if (cmdValue) {
      return cmdValue;
    }
    cmdValue = new Cmd(cmd);
    cmdCache.set(cmd, cmdValue);
    return cmdValue;
  };
  Cmd.clearCache = function () {
    cmdCache.clear();
  };
  return Cmd;
}();
exports.Cmd = Cmd;
class Dict {
  constructor(xref = null) {
    this._map = Object.create(null);
    this.xref = xref;
    this.objId = null;
    this.suppressEncryption = false;
    this.isViewable = true;
  }
  get size() {
    return Object.keys(this._map).length;
  }
  get(key) {
    const value = this._map[key];
    if (value === undefined) {
      return undefined;
    }
    if ((0, _util.isRef)(value)) {
      return this.xref.fetch(value);
    }
    return value;
  }
  getAsync(key) {
    const value = this._map[key];
    if (value === undefined) {
      return Promise.resolve(undefined);
    }
    if ((0, _util.isRef)(value)) {
      return this.xref.fetchAsync(value);
    }
    return Promise.resolve(value);
  }
  getRaw(key) {
    return this._map[key];
  }
  set(key, value) {
    (0, _util.assert)(typeof key === "string", "Dict.set: The key must be a string.");
    if (value === undefined) {
      delete this._map[key];
      return;
    }
    this._map[key] = value;
  }
  has(key) {
    return key in this._map;
  }
  forEach(callback) {
    for (const key in this._map) {
      callback(key, this.get(key));
    }
  }
  [Symbol.iterator]() {
    return this.getKeys().map(key => [key, this.get(key)])[Symbol.iterator]();
  }
  getKeys() {
    return Object.keys(this._map);
  }
  getRawValues() {
    return Object.values(this._map);
  }
  clone(xref) {
    const dict = new Dict(xref || this.xref);
    for (const key in this._map) {
      dict._map[key] = this._map[key];
    }
    return dict;
  }
}
exports.Dict = Dict;
Dict.empty = new Dict();
const Ref = function RefClosure() {
  let refCache = null;
  function Ref(num, gen) {
    this.num = num;
    this.gen = gen;
  }
  Ref.prototype = {
    toString: function Ref_toString() {
      if (!refCache) {
        return `${this.num}R${this.gen}`;
      }
      const cached = refCache.get(this);
      if (cached) {
        return cached;
      }
      const str = `${this.num}R${this.gen}`;
      refCache.set(this, str);
      return str;
    }
  };
  Ref.get = function Ref_get(num, gen) {
    if (!refCache) {
      return new Ref(num, gen);
    }
    const R = refCache.get(num)?.[gen];
    if (R) {
      return R;
    }
    const ref = new Ref(num, gen);
    let refByGen = refCache.get(num);
    if (!refByGen) {
      refByGen = [];
      refCache.set(num, refByGen);
    }
    refByGen[gen] = ref;
    return ref;
  };
  Ref.clearCache = function () {
    refCache = new Map();
  };
  return Ref;
}();
exports.Ref = Ref;
const Null = null;
exports.Null = Null;

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AnnotationStorage = exports.AnnotationFactory = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _util_metapdf = __webpack_require__(33);
class Annotation {
  constructor(params) {
    const {
      dict,
      ref
    } = params;
    this.data = {
      annotationFlags: dict.get("F"),
      borderStyle: new BorderStyle(dict.get("BS")),
      color: dict.get("C"),
      contents: (0, _util.stringToPDFString)(dict.get("Contents") || ""),
      hasAppearance: dict.has("AP"),
      id: ref.toString(),
      modificationDate: (0, _util.stringToPDFString)(dict.get("M") || ""),
      rect: dict.get("Rect"),
      subtype: dict.get("Subtype").name,
      rotation: dict.get("Rotate") || 0
    };
  }
  isViewable() {
    const {
      annotationFlags
    } = this.data;
    if (!annotationFlags) {
      return true;
    }
    return annotationFlags.isViewable();
  }
  static getLinearPoints(vertices) {
    const points = [];
    for (let i = 0, ii = vertices.length; i < ii; i += 2) {
      points.push({
        x: vertices[i],
        y: vertices[i + 1]
      });
    }
    return points;
  }
  static getQuadPoints(vertices) {
    const points = [];
    for (let i = 0, ii = vertices.length; i < ii; i += 8) {
      points.push({
        x1: vertices[i],
        y1: vertices[i + 1]
      }, {
        x2: vertices[i + 2],
        y2: vertices[i + 3]
      }, {
        x3: vertices[i + 4],
        y3: vertices[i + 5]
      }, {
        x4: vertices[i + 6],
        y4: vertices[i + 7]
      });
    }
    return points;
  }
}
class AnnotationFactory {
  static create(xref, ref, pdfManager, id, xfaFactory) {
    const dict = xref.fetchIfRef(ref);
    if (!(dict instanceof _primitives.Dict)) {
      return Promise.resolve(null);
    }
    let subtype = dict.get("Subtype");
    if (!(subtype instanceof _primitives.Name)) {
      return Promise.resolve(null);
    }
    subtype = subtype.name;
    const params = {
      xref,
      ref,
      dict,
      pdfManager,
      id,
      xfaFactory
    };
    switch (subtype) {
      case "Link":
        return Promise.resolve(new LinkAnnotation(params));
      case "Text":
        return Promise.resolve(new TextAnnotation(params));
      case "Widget":
        const fieldType = _util_metapdf.getInheritableProperty({
          dict,
          key: "FT"
        });
        if (fieldType instanceof _primitives.Name) {
          switch (fieldType.name) {
            case "Tx":
              return Promise.resolve(new TextWidgetAnnotation(params));
            case "Btn":
              return Promise.resolve(new ButtonWidgetAnnotation(params));
            case "Ch":
              return Promise.resolve(new ChoiceWidgetAnnotation(params));
            case "Sig":
              return Promise.resolve(new SignatureWidgetAnnotation(params));
          }
        }
        (0, _util.warn)(`Unimplemented widget field type "${fieldType}".`);
        return Promise.resolve(new WidgetAnnotation(params));
      case "Popup":
        return Promise.resolve(new PopupAnnotation(params));
      case "FreeText":
        return Promise.resolve(new FreeTextAnnotation(params));
      case "Line":
        return Promise.resolve(new LineAnnotation(params));
      case "Square":
        return Promise.resolve(new SquareAnnotation(params));
      case "Circle":
        return Promise.resolve(new CircleAnnotation(params));
      case "PolyLine":
        return Promise.resolve(new PolylineAnnotation(params));
      case "Polygon":
        return Promise.resolve(new PolygonAnnotation(params));
      case "Caret":
        return Promise.resolve(new CaretAnnotation(params));
      case "Ink":
        return Promise.resolve(new InkAnnotation(params));
      case "Highlight":
        return Promise.resolve(new HighlightAnnotation(params));
      case "Underline":
        return Promise.resolve(new UnderlineAnnotation(params));
      case "Squiggly":
        return Promise.resolve(new SquigglyAnnotation(params));
      case "StrikeOut":
        return Promise.resolve(new StrikeOutAnnotation(params));
      case "Stamp":
        return Promise.resolve(new StampAnnotation(params));
      case "FileAttachment":
        return Promise.resolve(new FileAttachmentAnnotation(params));
      case "Movie":
      case "Screen":
      case "PrinterMark":
      case "TrapNet":
      case "Watermark":
      case "3D":
      case "Redact":
      case "Projection":
      case "RichMedia":
      default:
        (0, _util.warn)(`Unimplemented annotation type "${subtype}".`);
        return Promise.resolve(new Annotation(params));
    }
  }
}
exports.AnnotationFactory = AnnotationFactory;
class AnnotationStorage {
  constructor() {
    this.storage = new Map();
    this.onAnnotationUpdated = null;
  }
  setValue(annotationId, value) {
    const obj = {
      value,
      modified: true
    };
    this.storage.set(annotationId, obj);
    if (this.onAnnotationUpdated) {
      this.onAnnotationUpdated(annotationId, value);
    }
  }
  getValue(annotationId, defaultValue) {
    if (this.storage.has(annotationId)) {
      return this.storage.get(annotationId);
    }
    return {
      value: defaultValue,
      modified: false
    };
  }
  getAll() {
    return this.storage.size > 0 ? this.storage : null;
  }
  get serializable() {
    if (this.storage.size === 0) {
      return null;
    }
    const serializable = new Map();
    for (const [id, {
      value,
      modified
    }] of this.storage) {
      if (modified) {
        serializable.set(id, value);
      }
    }
    return serializable.size > 0 ? serializable : null;
  }
  resetModified() {
    for (const value of this.storage.values()) {
      value.modified = false;
    }
  }
}
exports.AnnotationStorage = AnnotationStorage;
class BorderStyle {
  constructor(borderStyle) {
    this.width = 1;
    this.style = _util.AnnotationBorderStyleType.SOLID;
    this.dashArray = [3];
    this.horizontalCornerRadius = 0;
    this.verticalCornerRadius = 0;
    if (!(borderStyle instanceof _primitives.Dict)) {
      return;
    }
    if (borderStyle.has("W")) {
      this.width = borderStyle.get("W");
    }
    if (borderStyle.has("S")) {
      const s = borderStyle.get("S").name;
      switch (s) {
        case "S":
          this.style = _util.AnnotationBorderStyleType.SOLID;
          break;
        case "D":
          this.style = _util.AnnotationBorderStyleType.DASHED;
          const d = borderStyle.get("D");
          if (Array.isArray(d)) {
            this.dashArray = d;
          }
          break;
        case "B":
          this.style = _util.AnnotationBorderStyleType.BEVELED;
          break;
        case "I":
          this.style = _util.AnnotationBorderStyleType.INSET;
          break;
        case "U":
          this.style = _util.AnnotationBorderStyleType.UNDERLINE;
          break;
      }
    }
  }
}
class LinkAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.url = "";
    this.data.dest = "";
    const action = params.dict.get("A");
    if (action instanceof _primitives.Dict) {
      const s = action.get("S");
      if (s instanceof _primitives.Name && s.name === "URI") {
        let uri = action.get("URI");
        if (uri && (0, _util.isString)(uri)) {
          const sevenBits = /^[\x00-\x7F]*$/;
          if (!sevenBits.test(uri)) {
            uri = "";
          }
          this.data.url = uri;
        }
      } else if (s instanceof _primitives.Name && s.name === "GoTo") {
        const d = action.get("D");
        if (d) {
          if ((0, _util.isString)(d)) {
            this.data.dest = d;
          } else if (d instanceof _primitives.Name) {
            this.data.dest = d.name;
          } else if (Array.isArray(d) && d[0] instanceof _primitives.Ref) {
            this.data.dest = d[0].toString();
          }
        }
      }
    } else if (params.dict.has("Dest")) {
      const dest = params.dict.get("Dest");
      if ((0, _util.isString)(dest)) {
        this.data.dest = dest;
      } else if (dest instanceof _primitives.Name) {
        this.data.dest = dest.name;
      }
    }
  }
}
class TextAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.name = params.dict.get("Name").name;
    this.data.hasPopup = params.dict.has("Popup");
    this.data.readOnly = params.dict.get("F") & 0b100 ? true : false;
  }
}
class WidgetAnnotation extends Annotation {
  constructor(params) {
    super(params);
    const dict = params.dict;
    const data = this.data;
    data.annotationType = _util.AnnotationType.WIDGET;
    data.fieldName = (0, _util.stringToPDFString)(_util_metapdf.getInheritableProperty({
      dict,
      key: "T"
    }) || "");
    data.fieldType = _util_metapdf.getInheritableProperty({
      dict,
      key: "FT"
    }).name;
    data.fieldValue = _util_metapdf.getInheritableProperty({
      dict,
      key: "V"
    });
    data.alternativeText = (0, _util.stringToPDFString)(dict.get("TU") || "");
    data.defaultAppearance = _util_metapdf.getInheritableProperty({
      dict,
      key: "DA"
    }) || "";
    data.fieldFlags = _util_metapdf.getInheritableProperty({
      dict,
      key: "Ff"
    }) || 0;
    data.readOnly = data.fieldFlags & 1;
    this.ref = params.ref;
    if (xfaFactory.isValid) {
      const xfa = xfaFactory.find(data.fieldName);
      if (xfa) {
        const {
          value,
          readOnly
        } = xfa;
        if (value !== null) {
          data.fieldValue = value;
        }
        if (readOnly) {
          data.readOnly = true;
        }
      }
    }
  }
}
class TextWidgetAnnotation extends WidgetAnnotation {
  constructor(params) {
    super(params);
    const data = this.data;
    data.multiLine = data.fieldFlags & 1 << 12;
    data.fileSelect = data.fieldFlags & 1 << 20;
    data.isPassword = data.fieldFlags & 1 << 13;
    data.comb = data.fieldFlags & 1 << 24;
    data.maxLen = params.dict.get("MaxLen") || 0;
    if (data.comb) {
      const fieldRect = this.data.rect;
      const f_width = fieldRect[2] - fieldRect[0];
      const f_height = fieldRect[3] - fieldRect[1];
      const maxLen = this.data.maxLen || 0;
      data.cellWidth = f_width / maxLen;
      data.cellHeight = f_height;
    }
    const da = data.defaultAppearance;
    if (da) {
      const [fontName, fontSize, fontColor] = da.split(" ");
      data.fontName = fontName.substring(1);
      data.fontSize = parseFloat(fontSize);
      if (fontColor) {
        const rgb = fontColor.substring(0, fontColor.length - 2).split(",");
        data.fontColor = [parseFloat(rgb[0]), parseFloat(rgb[1]), parseFloat(rgb[2])];
      }
    }
  }
}
class ButtonWidgetAnnotation extends WidgetAnnotation {
  constructor(params) {
    super(params);
    const data = this.data;
    data.checkBox = !(data.fieldFlags & 1 << 16) && data.fieldFlags & 1 << 15;
    data.radioButton = data.fieldFlags & 1 << 16 && data.fieldFlags & 1 << 15;
    data.pushButton = !(data.fieldFlags & 1 << 16) && !(data.fieldFlags & 1 << 15);
    data.exportValue = params.dict.get("AP")?.get("N")?.getKeys()[0] || null;
  }
}
class ChoiceWidgetAnnotation extends WidgetAnnotation {
  constructor(params) {
    super(params);
    const data = this.data;
    data.options = [];
    const options = _util_metapdf.getInheritableProperty({
      dict: params.dict,
      key: "Opt"
    }) || [];
    for (const option of options) {
      data.options.push({
        exportValue: (0, _util.stringToPDFString)(option[0]),
        displayValue: (0, _util.stringToPDFString)(option[1] || option[0])
      });
    }
    data.combo = data.fieldFlags & 1 << 17;
    data.multiSelect = data.fieldFlags & 1 << 21;
    data.sort = data.fieldFlags & 1 << 19;
    if (data.sort) {
      data.options.sort((a, b) => a.displayValue.localeCompare(b.displayValue));
    }
  }
}
class SignatureWidgetAnnotation extends WidgetAnnotation {
  constructor(params) {
    super(params);
  }
}
class PopupAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.parentType = params.dict.get("Parent").get("Subtype").name;
    this.data.parentId = params.dict.get("Parent").toString();
    this.data.title = (0, _util.stringToPDFString)(params.dict.get("T") || "");
    this.data.open = params.dict.get("Open") || false;
  }
}
class FreeTextAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.fontFamily = "Helvetica";
    this.data.fontSize = 10;
    this.data.fontColor = [0, 0, 0];
    this.data.richText = params.dict.has("RC");
    this.data.defaultAppearance = params.dict.get("DA") || "";
    this.data.quadding = params.dict.get("Q") || 0;
  }
}
class LineAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.lineCoordinates = params.dict.get("L");
    this.data.lineEndings = [params.dict.get("LE")?.[0]?.name || "None", params.dict.get("LE")?.[1]?.name || "None"];
    this.data.interiorColor = params.dict.get("IC");
  }
}
class SquareAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.interiorColor = params.dict.get("IC");
  }
}
class CircleAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.interiorColor = params.dict.get("IC");
  }
}
class PolylineAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.vertices = Annotation.getLinearPoints(params.dict.get("Vertices"));
    this.data.lineEndings = [params.dict.get("LE")?.[0]?.name || "None", params.dict.get("LE")?.[1]?.name || "None"];
    this.data.interiorColor = params.dict.get("IC");
  }
}
class PolygonAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.vertices = Annotation.getLinearPoints(params.dict.get("Vertices"));
    this.data.interiorColor = params.dict.get("IC");
  }
}
class CaretAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.caretSymbol = params.dict.get("Sy")?.name || "P";
  }
}
class InkAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.inkLists = [];
    const inkLists = params.dict.get("InkList");
    if (Array.isArray(inkLists)) {
      for (const inkList of inkLists) {
        this.data.inkLists.push(Annotation.getLinearPoints(inkList));
      }
    }
  }
}
class HighlightAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.quadPoints = Annotation.getQuadPoints(params.dict.get("QuadPoints"));
  }
}
class UnderlineAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.quadPoints = Annotation.getQuadPoints(params.dict.get("QuadPoints"));
  }
}
class SquigglyAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.quadPoints = Annotation.getQuadPoints(params.dict.get("QuadPoints"));
  }
}
class StrikeOutAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.quadPoints = Annotation.getQuadPoints(params.dict.get("QuadPoints"));
  }
}
class StampAnnotation extends Annotation {
  constructor(params) {
    super(params);
    this.data.stampName = params.dict.get("Name")?.name || "Approved";
  }
}
class FileAttachmentAnnotation extends Annotation {
  constructor(params) {
    super(params);
    const file = params.dict.get("FS");
    const content = file.get("EF").get("F").getBytes();
    this.data.file = {
      filename: (0, _util.stringToPDFString)(file.get("F")),
      content
    };
    this.data.attachmentType = params.dict.get("Name")?.name || "PushPin";
  }
}

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.XRef = exports.ObjectLoader = exports.Catalog = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _stream = __webpack_require__(4);
var _parser = __webpack_require__(17);
var _crypto = __webpack_require__(16);
class ObjectLoader {
  constructor(dict, keys, xref) {
    this.dict = dict;
    this.keys = keys;
    this.xref = xref;
    this.capability = (0, _util.createPromiseCapability)();
  }
  load() {
    if (this.capability.promise) {
      return this.capability.promise;
    }
    const promises = [];
    for (const key of this.keys) {
      if (this.dict.has(key)) {
        promises.push(this.dict.getAsync(key));
      }
    }
    return Promise.all(promises);
  }
}
exports.ObjectLoader = ObjectLoader;
class XRef {
  constructor(stream, password, initialData) {
    this.stream = stream;
    this.entries = [];
    this.xrefstms = Object.create(null);
    this._cache = new Map();
    this.password = password;
    this.initialData = initialData;
    this.stats = {
      streamTypes: Object.create(null),
      fontTypes: Object.create(null)
    };
    let trailer = this.readXRef();
    if (!trailer) {
      throw new Error("Invalid XRef stream");
    }
    this.trailer = trailer;
    const encrypt = trailer.get("Encrypt");
    if (encrypt) {
      (0, _util.warn)("Document is encrypted");
      const ref = trailer.getRaw("Encrypt");
      this.encryption = new _crypto.MurmurHash3_64(encrypt, ref, this.password);
      this.isEncrypted = true;
    }
  }
  getEntry(i) {
    const e = this.entries[i];
    if (e && e.free) {
      return null;
    }
    return e;
  }
  fetchIfRef(obj, suppressEncryption) {
    if (!(0, _util.isRef)(obj)) {
      return obj;
    }
    return this.fetch(obj, suppressEncryption);
  }
  fetch(ref, suppressEncryption) {
    const num = ref.num;
    if (this._cache.has(num)) {
      const cacheEntry = this._cache.get(num);
      if (cacheEntry.obj !== undefined) {
        return cacheEntry.obj;
      }
    }
    const entry = this.getEntry(num);
    if (!entry) {
      this._cache.set(num, {
        obj: null
      });
      return null;
    }
    let obj;
    try {
      obj = this.fetchObject(ref, entry, suppressEncryption);
    } catch (e) {
      (0, _util.warn)(`XRef.fetch: "${e}".`);
      return null;
    }
    if (this._cache.has(num)) {
      this._cache.get(num).obj = obj;
    } else {
      this._cache.set(num, {
        obj
      });
    }
    return obj;
  }
  fetchAsync(ref) {
    return new Promise(resolve => {
      resolve(this.fetch(ref));
    });
  }
  fetchObject(ref, entry, suppressEncryption) {
    const num = ref.num;
    let stream, dict;
    if (entry.uncompressed) {
      stream = this.stream.makeSubStream(entry.offset, entry.length);
      const lexer = new _parser.Lexer(stream);
      const parser = new _parser.Parser({
        lexer,
        xref: this,
        objId: num
      });
      const obj1 = parser.getObj();
      const obj2 = parser.getObj();
      if (!(obj1 instanceof _primitives.Cmd) || obj1.cmd !== "obj") {
        throw new Error("Invalid object header");
      }
      if (obj2 instanceof _primitives.Dict) {
        dict = obj2;
      } else {
        throw new Error("Invalid object");
      }
      stream = new _stream.Stream(this.stream.getBytes(), entry.offset + dict.length, entry.length - dict.length, dict);
    } else {
      const stm = this.fetch(entry.stm);
      if (!(stm instanceof _stream.Stream)) {
        throw new Error("Invalid object stream");
      }
      const first = stm.dict.get("First");
      const n = stm.dict.get("N");
      const streamBytes = stm.getBytes();
      const bytes = new Uint8Array(entry.length);
      bytes.set(streamBytes.subarray(entry.offset, entry.offset + entry.length));
      stream = new _stream.Stream(bytes);
      const lexer = new _parser.Lexer(stream);
      const parser = new _parser.Parser({
        lexer,
        xref: this,
        objId: num
      });
      dict = parser.getObj();
    }
    if (this.isEncrypted && !suppressEncryption) {
      const decrypt = this.encryption.createDecryptStream(dict);
      stream = decrypt(stream);
    }
    return new _stream.Stream(stream.getBytes(), 0, stream.length, dict);
  }
  readXRef() {
    const stream = this.stream;
    let startXRef = stream.length - 1024;
    if (startXRef < 0) {
      startXRef = 0;
    }
    const trailerBytes = stream.getByteRange(startXRef, stream.length);
    const trailerStr = (0, _util.bytesToString)(trailerBytes);
    const trailerPos = trailerStr.lastIndexOf("startxref");
    if (trailerPos === -1) {
      return null;
    }
    let xrefPos = parseInt(trailerStr.substring(trailerPos + 9), 10);
    if (isNaN(xrefPos)) {
      return null;
    }
    stream.pos = xrefPos;
    const lexer = new _parser.Lexer(stream);
    let token = lexer.getObj();
    let trailer;
    if (token instanceof _primitives.Cmd && token.cmd === "xref") {
      this.readXRefTable(lexer);
      token = lexer.getObj();
      if (!(token instanceof _primitives.Cmd) || token.cmd !== "trailer") {
        return null;
      }
      trailer = lexer.getObj();
    } else if (typeof token === "number") {
      const objNum = token;
      const objGen = lexer.getObj();
      if (typeof objGen !== "number") {
        return null;
      }
      token = lexer.getObj();
      if (!(token instanceof _primitives.Cmd) || token.cmd !== "obj") {
        return null;
      }
      const dict = lexer.getObj();
      if (!(dict instanceof _primitives.Dict)) {
        return null;
      }
      const length = dict.get("Length");
      if (typeof length !== "number") {
        return null;
      }
      const stream = new _stream.Stream(lexer.stream.getBytes(), lexer.stream.pos, length, dict);
      this.readXRefStream(stream);
      trailer = dict;
    } else {
      return null;
    }
    const prev = trailer.get("Prev");
    if (typeof prev === "number") {
      stream.pos = prev;
      this.readXRef();
    }
    return trailer;
  }
  readXRefTable(lexer) {
    let token = lexer.getObj();
    while (typeof token === "number") {
      const start = token;
      const count = lexer.getObj();
      if (typeof count !== "number") {
        return;
      }
      for (let i = 0; i < count; i++) {
        const offset = lexer.getObj();
        const gen = lexer.getObj();
        const type = lexer.getObj();
        if (type instanceof _primitives.Cmd && type.cmd === "n") {
          this.entries[start + i] = {
            offset,
            gen,
            free: false
          };
        } else if (type instanceof _primitives.Cmd && type.cmd === "f") {
          this.entries[start + i] = {
            offset,
            gen,
            free: true
          };
        }
      }
      token = lexer.getObj();
    }
  }
  readXRefStream(stream) {
    const dict = stream.dict;
    const w = dict.get("W");
    if (!Array.isArray(w) || w.length !== 3) {
      return;
    }
    const size = dict.get("Size");
    if (typeof size !== "number") {
      return;
    }
    const index = dict.get("Index") || [0, size];
    if (!Array.isArray(index)) {
      return;
    }
    const bytes = stream.getBytes();
    const bytesPerEntry = w[0] + w[1] + w[2];
    for (let i = 0; i < index.length; i += 2) {
      const start = index[i];
      const count = index[i + 1];
      for (let j = 0; j < count; j++) {
        const entry = bytes.subarray(j * bytesPerEntry, (j + 1) * bytesPerEntry);
        let type = 0;
        for (let k = 0; k < w[0]; k++) {
          type = (type << 8) + entry[k];
        }
        let offset = 0;
        for (let k = 0; k < w[1]; k++) {
          offset = (offset << 8) + entry[w[0] + k];
        }
        let gen = 0;
        for (let k = 0; k < w[2]; k++) {
          gen = (gen << 8) + entry[w[0] + w[1] + k];
        }
        if (type === 1) {
          this.entries[start + j] = {
            offset,
            gen,
            free: false,
            uncompressed: true
          };
        } else if (type === 2) {
          this.entries[start + j] = {
            stm: offset,
            offset: gen,
            free: false,
            uncompressed: false
          };
        } else if (type === 0) {
          this.entries[start + j] = {
            offset,
            gen,
            free: true
          };
        }
      }
    }
  }
}
exports.XRef = XRef;
class Catalog {
  constructor(pdfDocument, xref) {
    this.pdfDocument = pdfDocument;
    this.xref = xref;
    this.catDict = xref.trailer.get("Root");
    this.fontCache = new _core_utils.Cache();
    this.builtInCMapCache = new _core_utils.Cache();
    this.pageKidsCountCache = new _core_utils.Cache();
  }
  get version() {
    const version = this.catDict.get("Version");
    if (!(version instanceof _primitives.Name)) {
      return null;
    }
    return version.name;
  }
  get collection() {
    const collection = this.catDict.get("Collection");
    if (collection instanceof _primitives.Dict) {
      return collection;
    }
    return null;
  }
  get acroForm() {
    const acroForm = this.catDict.get("AcroForm");
    if (acroForm instanceof _primitives.Dict) {
      return acroForm;
    }
    return null;
  }
  get metadata() {
    const metadata = this.catDict.get("Metadata");
    if (!(metadata instanceof _stream.Stream)) {
      return null;
    }
    return metadata.getBytes();
  }
  get toplevelPagesDict() {
    const pages = this.catDict.get("Pages");
    (0, _util.assert)(pages instanceof _primitives.Dict, "Invalid top-level pages reference.");
    return pages;
  }
  get pageLayout() {
    const pageLayout = this.catDict.get("PageLayout");
    if (pageLayout instanceof _primitives.Name) {
      return pageLayout.name;
    }
    return null;
  }
  get pageMode() {
    const pageMode = this.catDict.get("PageMode");
    if (pageMode instanceof _primitives.Name) {
      return pageMode.name;
    }
    return null;
  }
  get viewerPreferences() {
    const viewerPreferences = this.catDict.get("ViewerPreferences");
    if (viewerPreferences instanceof _primitives.Dict) {
      return viewerPreferences;
    }
    return null;
  }
  get openAction() {
    const openAction = this.catDict.get("OpenAction");
    if (openAction instanceof _primitives.Dict) {
      return openAction;
    }
    return null;
  }
  get attachments() {
    const names = this.catDict.get("Names");
    if (!(names instanceof _primitives.Dict)) {
      return null;
    }
    const embeddedFiles = names.get("EmbeddedFiles");
    if (!(embeddedFiles instanceof _primitives.Dict)) {
      return null;
    }
    const namesArray = embeddedFiles.get("Names");
    if (!Array.isArray(namesArray)) {
      return null;
    }
    const attachments = new Map();
    for (let i = 0, ii = namesArray.length; i < ii; i += 2) {
      const name = (0, _util.stringToPDFString)(namesArray[i]);
      const fileSpecRef = namesArray[i + 1];
      const fileSpec = this.xref.fetch(fileSpecRef);
      if (!(fileSpec instanceof _primitives.Dict)) {
        continue;
      }
      const ef = fileSpec.get("EF");
      if (!(ef instanceof _primitives.Dict)) {
        continue;
      }
      const f = ef.get("F");
      if (!(f instanceof _stream.Stream)) {
        continue;
      }
      attachments.set(name, {
        filename: (0, _util.stringToPDFString)(fileSpec.get("F")),
        content: f.getBytes()
      });
    }
    return attachments;
  }
  get javaScript() {
    const names = this.catDict.get("Names");
    if (!(names instanceof _primitives.Dict)) {
      return null;
    }
    const javascript = names.get("JavaScript");
    if (!(javascript instanceof _primitives.Dict)) {
      return null;
    }
    const namesArray = javascript.get("Names");
    if (!Array.isArray(namesArray)) {
      return null;
    }
    const scripts = [];
    for (let i = 0, ii = namesArray.length; i < ii; i += 2) {
      const js = this.xref.fetch(namesArray[i + 1]).get("JS");
      if ((0, _util.isStream)(js)) {
        scripts.push((0, _util.bytesToString)(js.getBytes()));
      } else if ((0, _util.isString)(js)) {
        scripts.push(js);
      }
    }
    return scripts;
  }
  get jsActions() {
    const actions = this.catDict.get("OpenAction");
    if (!(actions instanceof _primitives.Dict)) {
      return null;
    }
    const jsActions = new Map();
    for (const [key, value] of actions) {
      if (key.endsWith("_JS")) {
        jsActions.set(key, value);
      }
    }
    return jsActions;
  }
  get structTree() {
    const structTreeRoot = this.catDict.get("StructTreeRoot");
    if (!(structTreeRoot instanceof _primitives.Dict)) {
      return null;
    }
    return structTreeRoot;
  }
  get markInfo() {
    const markInfo = this.catDict.get("MarkInfo");
    if (!(markInfo instanceof _primitives.Dict)) {
      return null;
    }
    return markInfo;
  }
  get destinations() {
    const dests = this.catDict.get("Dests");
    if (dests instanceof _primitives.Dict) {
      return dests;
    }
    const names = this.catDict.get("Names");
    if (names instanceof _primitives.Dict && names.has("Dests")) {
      return names.get("Dests");
    }
    return null;
  }
  get fieldObjects() {
    if (!this.acroForm) {
      return null;
    }
    const fields = this.acroForm.get("Fields");
    if (!Array.isArray(fields)) {
      return null;
    }
    const fieldObjects = new Map();
    for (const ref of fields) {
      const dict = this.xref.fetch(ref);
      if (dict instanceof _primitives.Dict) {
        const name = dict.get("T");
        if ((0, _util.isString)(name)) {
          fieldObjects.set(name, ref);
        }
      }
    }
    return fieldObjects;
  }
  get calculationOrderIds() {
    if (!this.acroForm) {
      return null;
    }
    const co = this.acroForm.get("CO");
    if (!Array.isArray(co)) {
      return null;
    }
    return co.map(ref => ref.toString());
  }
  get pageLabels() {
    const labels = this.catDict.get("PageLabels");
    if (!(labels instanceof _primitives.Dict)) {
      return null;
    }
    const nums = labels.get("Nums");
    if (!Array.isArray(nums)) {
      return null;
    }
    const pageLabels = new Array(this.numPages);
    let i = 0;
    while (i < nums.length) {
      const page = nums[i++];
      const dict = this.xref.fetch(nums[i++]);
      const type = dict.get("S")?.name;
      const prefix = (0, _util.stringToPDFString)(dict.get("P") || "");
      const start = dict.get("St") || 1;
      for (let j = 0; j < this.numPages - page; j++) {
        let label = prefix;
        switch (type) {
          case "D":
            label += start + j;
            break;
          case "R":
            label += (0, _util.toRoman)(start + j, true);
            break;
          case "r":
            label += (0, _util.toRoman)(start + j, false);
            break;
          case "A":
            label += String.fromCharCode(65 + (start + j - 1) % 26);
            break;
          case "a":
            label += String.fromCharCode(97 + (start + j - 1) % 26);
            break;
          default:
            pageLabels[page + j] = "";
            continue;
        }
        pageLabels[page + j] = label;
      }
    }
    return pageLabels;
  }
  get optionalContentConfig() {
    const ocd = this.catDict.get("OCProperties");
    if (!ocd) {
      return null;
    }
    const configs = ocd.get("Configs");
    if (!Array.isArray(configs)) {
      return null;
    }
    const defaultIndex = ocd.get("D") instanceof _primitives.Dict ? ocd.get("D").get("Order")?.[0] : 0;
    const defaultConfig = this.xref.fetch(configs[defaultIndex]);
    if (!(defaultConfig instanceof _primitives.Dict)) {
      return null;
    }
    const groups = new Map();
    const ocgs = ocd.get("OCGs");
    if (Array.isArray(ocgs)) {
      for (const ref of ocgs) {
        const group = this.xref.fetch(ref);
        if (group instanceof _primitives.Dict) {
          groups.set(ref.toString(), {
            name: (0, _util.stringToPDFString)(group.get("Name")),
            intent: group.get("Intent")?.name || "View",
            usage: group.get("Usage") instanceof _primitives.Dict ? group.get("Usage").get("PageElement")?.name : ""
          });
        }
      }
    }
    const order = defaultConfig.get("Order");
    const on = defaultConfig.get("ON");
    const off = defaultConfig.get("OFF");
    const as = defaultConfig.get("AS");
    const config = {
      name: (0, _util.stringToPDFString)(defaultConfig.get("Name")),
      creator: (0, _util.stringToPDFString)(defaultConfig.get("Creator")),
      groups: [],
      order: [],
      baseState: defaultConfig.get("BaseState")?.name || "ON"
    };
    if (Array.isArray(order)) {
      for (const ref of order) {
        if (ref instanceof _primitives.Ref) {
          config.order.push(ref.toString());
        }
      }
    }
    for (const ref of on) {
      if (ref instanceof _primitives.Ref) {
        const group = groups.get(ref.toString());
        if (group) {
          config.groups.push(group);
        }
      }
    }
    return config;
  }
  getPage(pageIndex) {
    return this._getPage(pageIndex).pageRef;
  }
  getPageIndex(pageRef) {
    const pageNum = pageRef.num;
    for (let i = 0; i < this.numPages; i++) {
      const ref = this.getPage(i);
      if (ref.num === pageNum) {
        return i;
      }
    }
    return -1;
  }
  _getPage(pageIndex) {
    const pageRef = this.toplevelPagesDict.get("Kids")[pageIndex];
    if (!(pageRef instanceof _primitives.Ref)) {
      throw new Error("Invalid page reference.");
    }
    return {
      pageRef,
      pageDict: this.xref.fetch(pageRef)
    };
  }
}
exports.Catalog = Catalog;

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.OperatorList = void 0;
var _util = __webpack_require__(1);
var _util_metapdf = __webpack_require__(33);
class OperatorList {
  constructor(intent, handler, pageIndex, fontCache, builtInCMapCache) {
    this.fnArray = [];
    this.argsArray = [];
    this.intent = intent;
    this.handler = handler;
    this.pageIndex = pageIndex;
    this.fontCache = fontCache;
    this.builtInCMapCache = builtInCMapCache;
    this.parsingState = {
      baseImage: null,
      clone: () => {
        return Object.create(this.parsingState);
      }
    };
    this.fontList = new Set();
  }
  get length() {
    return this.fnArray.length;
  }
  addOp(fn, args) {
    this.fnArray.push(fn);
    this.argsArray.push(args);
    if (fn === _util.OPS.dependency) {
      for (const dep of args) {
        if (dep.startsWith("font-")) {
          this.fontList.add(dep);
        }
      }
    }
  }
  get _transfers() {
    const transfers = [];
    for (const font of this.fontList) {
      const fontObj = this.fontCache.get(this.pageIndex + "_" + font);
      if (fontObj?.data) {
        transfers.push(fontObj.data.buffer);
      }
    }
    return transfers;
  }
  get operatorList() {
    return {
      fnArray: this.fnArray,
      argsArray: this.argsArray,
      lastChunk: true
    };
  }
}
exports.OperatorList = OperatorList;

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PartialEvaluator = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _parser = __webpack_require__(17);
var _stream = __webpack_require__(4);
var _core_utils = __webpack_require__(3);
var _colorspace = __webpack_require__(25);
var _function = __webpack_require__(23);
var _pattern = __webpack_require__(26);
var _image_utils = __webpack_require__(9);
var _util_metapdf = __webpack_require__(33);
const MAX_PATTERN_NESTING = 5;
class PartialEvaluator {
  constructor({
    xref,
    handler,
    pageIndex,
    idFactory,
    fontCache,
    builtInCMapCache,
    globalImageCache,
    nonBlendModesSet,
    xfaFactory,
    smaskAbsolute = false
  }) {
    this.xref = xref;
    this.handler = handler;
    this.pageIndex = pageIndex;
    this.idFactory = idFactory;
    this.fontCache = fontCache;
    this.builtInCMapCache = builtInCMapCache;
    this.globalImageCache = globalImageCache;
    this.nonBlendModesSet = nonBlendModesSet;
    this.xfaFactory = xfaFactory;
    this.smaskAbsolute = smaskAbsolute;
  }
  clone(newOptions = Object.create(null)) {
    const newEvaluator = Object.create(this);
    newEvaluator.smaskAbsolute = newOptions.smaskAbsolute !== undefined ? newOptions.smaskAbsolute : this.smaskAbsolute;
    return newEvaluator;
  }
  hasBlendModes(resources, nonBlendModesSet) {
    if (!(resources instanceof _primitives.Dict)) {
      return false;
    }
    if (nonBlendModesSet.has(resources)) {
      return !nonBlendModesSet.get(resources);
    }
    const GState = resources.get("ExtGState");
    if (GState instanceof _primitives.Dict) {
      for (const key of GState.getKeys()) {
        const gState = GState.get(key);
        if (gState instanceof _primitives.Dict && gState.has("BM") && gState.get("BM") !== "Normal") {
          nonBlendModesSet.set(resources, true);
          return true;
        }
      }
    }
    const XObject = resources.get("XObject");
    if (XObject instanceof _primitives.Dict) {
      for (const key of XObject.getKeys()) {
        const xObject = XObject.get(key);
        if (!(xObject instanceof _stream.Stream)) {
          continue;
        }
        const xObjectDict = xObject.dict;
        if (xObjectDict.get("Subtype")?.name !== "Form") {
          continue;
        }
        const xObjectResources = xObjectDict.get("Resources");
        if (this.hasBlendModes(xObjectResources, nonBlendModesSet)) {
          nonBlendModesSet.set(resources, true);
          return true;
        }
      }
    }
    nonBlendModesSet.set(resources, false);
    return false;
  }
  getOperatorList({
    stream,
    task,
    resources,
    operatorList,
    initialState
  }) {
    const self = this;
    const xref = this.xref;
    const handler = this.handler;
    const pageIndex = this.pageIndex;
    const idFactory = this.idFactory;
    const nonBlendModesSet = this.nonBlendModesSet;
    const xfaFactory = this.xfaFactory;
    let parsingState = operatorList.parsingState;
    const lexer = new _parser.Lexer(stream);
    const parser = new _parser.Parser({
      lexer,
      xref
    });
    const state = initialState.clone();
    const stateStack = [];
    const nestedPatternLevel = 0;
    const dependencies = new Set();
    const gsFromStack = false;
    const opBuf = [];
    const RESTART_SCAN_OPERATORS = new Set(["EMC", "EX", "BMC", "BDC", "DP"]);
    function pop() {
      if (opBuf.length === 0) {
        throw new _core_utils.MissingDataException();
      }
      return opBuf.pop();
    }
    function shift() {
      if (opBuf.length === 0) {
        throw new _core_utils.MissingDataException();
      }
      return opBuf.shift();
    }
    function handleSetFont(fontName, font, resources) {
      const fontRes = resources.get("Font");
      if (!fontRes) {
        return;
      }
      const fontDict = fontRes.get(fontName);
      if (!fontDict) {
        return;
      }
      const fontObj = self.translateFont(fontDict);
      if (fontObj) {
        font = fontObj;
      }
      return font;
    }
    function parsePattern(stream, resources, matrix) {
      const pattern = new _pattern.Pattern(stream, resources, xref, handler);
      const operatorList = new _operator_list.OperatorList();
      const patternEvaluator = self.clone();
      patternEvaluator.getOperatorList({
        stream: pattern.stream,
        task,
        resources: pattern.resources,
        operatorList,
        initialState: state
      });
      return pattern;
    }
    function buildPaintImageXObject({
      resources,
      xobj,
      inline,
      operatorList,
      cacheKey
    }) {
      const dict = xobj.dict;
      const w = dict.get("Width");
      const h = dict.get("Height");
      if (!(w && h)) {
        (0, _util.warn)("Image dimensions are missing, or not numbers.");
        return;
      }
      const image = {
        width: w,
        height: h
      };
      let bitspersample = dict.get("BitsPerComponent");
      if (!bitspersample) {
        bitspersample = 8;
      }
      image.bpc = bitspersample;
      let colorspace = dict.get("ColorSpace");
      if (!colorspace) {
        (0, _util.warn)("No colorspace for image");
        return;
      }
      colorspace = _colorspace.ColorSpace.parse(colorspace, xref, resources, pdfManager.composite);
      image.cs = colorspace;
      const imageMask = dict.get("ImageMask") || false;
      if (imageMask) {
        image.mask = true;
      }
      const smask = dict.get("SMask");
      if (smask instanceof _stream.Stream) {
        const smaskEvaluator = self.clone({
          smaskAbsolute: true
        });
        const smaskObj = {
          stream: smask,
          dict: smask.dict
        };
        smaskEvaluator.buildPaintImageXObject({
          resources,
          xobj: smaskObj,
          inline: false,
          operatorList,
          cacheKey: cacheKey + "_smask"
        });
        const smaskId = operatorList.smaskId;
        image.smask = smaskId;
      }
      const decode = dict.get("Decode");
      if (decode) {
        image.decode = decode;
      }
      const interpolate = dict.get("Interpolate");
      if (interpolate) {
        image.interpolate = interpolate;
      }
      const str = xobj;
      const props = {
        id: `img_${idFactory.xObject}`,
        data: str.getBytes()
      };
      self.globalImageCache.set(props.id, props.data);
      image.id = props.id;
      operatorList.addOp(_util.OPS.paintImageXObject, [image]);
    }
    return new Promise(function loop(i) {
      if (task.isTerminated) {
        return;
      }
      while (i < stream.length) {
        const obj = stream.get(i++);
        if (obj instanceof _primitives.Cmd) {
          const cmd = obj.cmd;
          switch (cmd) {
            case "q":
              stateStack.push(state.clone());
              break;
            case "Q":
              if (stateStack.length) {
                state = stateStack.pop();
              }
              break;
            case "w":
              state.lineWidth = pop();
              break;
            case "J":
              state.lineCap = pop();
              break;
            case "j":
              state.lineJoin = pop();
              break;
            case "M":
              state.miterLimit = pop();
              break;
            case "d":
              const dashArray = pop();
              const dashPhase = pop();
              state.dashArray = dashArray;
              state.dashPhase = dashPhase;
              break;
            case "ri":
              state.renderingIntent = pop();
              break;
            case "i":
              pop();
              break;
            case "gs":
              const gsName = pop();
              const gs = resources.get("ExtGState").get(gsName);
              if (!gs) {
                (0, _util.warn)(`Unknown graphics state: ${gsName}`);
                break;
              }
              for (const [key, value] of gs) {
                switch (key) {
                  case "LW":
                    state.lineWidth = value;
                    break;
                  case "LC":
                    state.lineCap = value;
                    break;
                  case "LJ":
                    state.lineJoin = value;
                    break;
                  case "ML":
                    state.miterLimit = value;
                    break;
                  case "D":
                    state.dashArray = value[0];
                    state.dashPhase = value[1];
                    break;
                  case "RI":
                    state.renderingIntent = value;
                    break;
                  case "OP":
                  case "op":
                  case "OPM":
                    (0, _util.warn)(`Unsupported graphics state key: ${key}`);
                    break;
                  case "Font":
                    state.font = handleSetFont(value[0].name, state.font, resources);
                    state.fontSize = value[1];
                    break;
                  case "BM":
                    state.blendMode = value;
                    break;
                  case "SMask":
                    if (!value || value.name === "None") {
                      state.smask = null;
                      break;
                    }
                    const smaskDict = value instanceof _primitives.Dict ? value : xref.fetchIfRef(value);
                    if (!(smaskDict instanceof _primitives.Dict)) {
                      (0, _util.warn)("Invalid SMask dictionary.");
                      break;
                    }
                    state.smask = {
                      subtype: smaskDict.get("S")?.name,
                      backdrop: smaskDict.get("BC"),
                      transfer: smaskDict.get("TR")
                    };
                    break;
                  case "ca":
                  case "CA":
                    state.strokeAlpha = value;
                    break;
                  case "AIS":
                    state.alphaIsShape = value;
                    break;
                  case "TK":
                    state.textKnockout = value;
                    break;
                }
              }
              break;
            case "cm":
              const cm = pop();
              state.transform = _util_metapdf.transform(state.transform, cm);
              break;
            case "Tf":
              const fontName = pop();
              const fontSize = pop();
              state.font = handleSetFont(fontName.name, state.font, resources);
              state.fontSize = fontSize;
              break;
            case "BT":
              state.textMatrix = _util_metapdf.IDENTITY_MATRIX;
              state.textLineMatrix = _util_metapdf.IDENTITY_MATRIX;
              break;
            case "ET":
              break;
            case "Tj":
            case "'":
              const str = pop();
              if (str) {
                const tj = [{
                  str
                }];
                if (cmd === "'") {
                  operatorList.addOp(_util.OPS.nextLine, []);
                }
                operatorList.addOp(_util.OPS.showText, [tj]);
              }
              break;
            case "TJ":
              const items = pop();
              if (items) {
                operatorList.addOp(_util.OPS.showSpacedText, [items]);
              }
              break;
            case "Td":
            case "TD":
              const y = pop();
              const x = pop();
              state.textLineMatrix = _util_metapdf.transform(state.textLineMatrix, [1, 0, 0, 1, x, y]);
              state.textMatrix = state.textLineMatrix;
              if (cmd === "TD") {
                state.leading = -y;
              }
              break;
            case "Tm":
              const tm = pop();
              state.textMatrix = tm;
              state.textLineMatrix = tm;
              break;
            case "T*":
              state.textLineMatrix = _util_metapdf.transform(state.textLineMatrix, [1, 0, 0, 1, 0, state.leading]);
              state.textMatrix = state.textLineMatrix;
              break;
            case "Tc":
              state.charSpacing = pop();
              break;
            case "Tw":
              state.wordSpacing = pop();
              break;
            case "Tz":
              state.textHScale = pop();
              break;
            case "TL":
              state.leading = pop();
              break;
            case "Ts":
              state.textRise = pop();
              break;
            case "Tr":
              state.textRenderingMode = pop();
              break;
            case "SC":
            case "sc":
              const cs_sc = state.fillColorSpace;
              const sc = pop();
              cs_sc.getRgb(sc, 0).then(rgb => {
                state.fillColor = rgb;
              });
              break;
            case "SCN":
            case "scn":
              const cs_scn = state.fillColorSpace;
              const scn = pop();
              if (scn instanceof _primitives.Name) {
                const pattern = resources.get("Pattern").get(scn.name);
                if (pattern) {
                  const patternData = parsePattern(pattern.stream, pattern.resources, state.transform);
                  state.fillColor = patternData;
                }
              } else {
                cs_scn.getRgb(scn, 0).then(rgb => {
                  state.fillColor = rgb;
                });
              }
              break;
            case "CS":
            case "cs":
              const cs_name_cs = pop();
              state.strokeColorSpace = _colorspace.ColorSpace.parse(cs_name_cs, xref, resources);
              break;
            case "G":
            case "g":
              const gray_g = pop();
              const cs_g = _colorspace.ColorSpace.get("DeviceGray");
              cs_g.getRgb(gray_g, 0).then(rgb => {
                state.fillColor = rgb;
                state.strokeColor = rgb;
              });
              break;
            case "RG":
            case "rg":
              const b_rg = pop();
              const g_rg = pop();
              const r_rg = pop();
              const cs_rg = _colorspace.ColorSpace.get("DeviceRGB");
              cs_rg.getRgb([r_rg, g_rg, b_rg], 0).then(rgb => {
                state.fillColor = rgb;
                state.strokeColor = rgb;
              });
              break;
            case "K":
            case "k":
              const k_k = pop();
              const c_k = pop();
              const m_k = pop();
              const y_k = pop();
              const cs_k = _colorspace.ColorSpace.get("DeviceCMYK");
              cs_k.getRgb([c_k, m_k, y_k, k_k], 0).then(rgb => {
                state.fillColor = rgb;
                state.strokeColor = rgb;
              });
              break;
            case "BI":
              const bi_xobj = parser.getObj();
              buildPaintImageXObject({
                resources,
                xobj: bi_xobj,
                inline: true,
                operatorList,
                cacheKey: `inline_${i}`
              });
              break;
            case "Do":
              const do_xobjName = pop();
              const do_xobj = resources.get("XObject").get(do_xobjName.name);
              if (!do_xobj) {
                (0, _util.warn)(`XObject ${do_xobjName.name} does not exist.`);
                break;
              }
              if (do_xobj instanceof _stream.Stream) {
                const subtype = do_xobj.dict.get("Subtype");
                if (subtype instanceof _primitives.Name) {
                  switch (subtype.name) {
                    case "Form":
                      const formEvaluator = self.clone();
                      formEvaluator.getOperatorList({
                        stream: do_xobj,
                        task,
                        resources: do_xobj.dict.get("Resources") || resources,
                        operatorList,
                        initialState: state
                      });
                      break;
                    case "Image":
                      buildPaintImageXObject({
                        resources,
                        xobj: do_xobj,
                        inline: false,
                        operatorList,
                        cacheKey: `xobj_${do_xobj.objId}`
                      });
                      break;
                    case "PS":
                      (0, _util.warn)("Unsupported XObject subtype: PS");
                      break;
                    default:
                      (0, _util.warn)(`Unsupported XObject subtype: ${subtype.name}`);
                      break;
                  }
                }
              }
              break;
            case "sh":
              const sh_shadingName = pop();
              const sh_shading = resources.get("Shading").get(sh_shadingName.name);
              if (!sh_shading) {
                (0, _util.warn)(`Shading ${sh_shadingName.name} does not exist.`);
                break;
              }
              const shading = _pattern.Shading.parse(sh_shading, xref, resources, handler);
              operatorList.addOp(_util.OPS.paintShading, [shading]);
              break;
            case "MP":
            case "DP":
            case "BMC":
            case "BDC":
            case "EMC":
              const tag = pop();
              const properties = cmd === "BDC" || cmd === "DP" ? pop() : null;
              operatorList.addOp(_util.OPS.beginMarkedContent, [tag.name, properties instanceof _primitives.Dict ? properties : null]);
              if (cmd === "EMC") {
                operatorList.addOp(_util.OPS.endMarkedContent, []);
              }
              break;
            case "BX":
              operatorList.addOp(_util.OPS.beginCompat, []);
              break;
            case "EX":
              operatorList.addOp(_util.OPS.endCompat, []);
              break;
            default:
              if (cmd in _util.OPS) {
                operatorList.addOp(_util.OPS[cmd], opBuf.slice());
                opBuf.length = 0;
              } else {
                (0, _util.warn)(`Unknown operator ${cmd}`);
              }
              break;
          }
        } else {
          opBuf.push(obj);
        }
      }
      Promise.resolve().then(() => loop(i));
    }(0));
  }
  getPermissions(permissions) {
    if (!permissions) {
      return null;
    }
    let flags = 0;
    for (let i = 0, ii = permissions.length; i < ii; ++i) {
      const p = permissions[i];
      if (p.startsWith("3.")) {
        flags |= parseInt(p.substring(2), 10);
      }
    }
    return flags;
  }
  getFont(fontRef, defaultFont) {
    const font = this.fontCache.get(fontRef.toString());
    if (font) {
      return font;
    }
    const fontDict = this.xref.fetchIfRef(fontRef);
    if (!fontDict) {
      return defaultFont;
    }
    const newFont = this.translateFont(fontDict);
    if (newFont) {
      this.fontCache.put(fontRef.toString(), newFont);
      return newFont;
    }
    return defaultFont;
  }
  translateFont(fontDict) {
    const fontID = (0, _util.isRef)(fontDict.objId) ? fontDict.objId.toString() : `p${this.pageIndex}_f${this.idFactory.font}`;
    if (this.fontCache.has(fontID)) {
      return this.fontCache.get(fontID);
    }
    const font = new _core_utils.TranslatedFont(fontID, fontDict, this.xref, this.resources, this.fontCache, this.builtInCMapCache);
    this.fontCache.put(fontID, font);
    return font;
  }
}
exports.PartialEvaluator = PartialEvaluator;

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.PDFFunction = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _stream = __webpack_require__(4);
class PDFFunction {
  static getSampled(src, srcOffset, srcLength, dest, destOffset) {
    const fn = PDFFunction.parse(src)[0];
    const n = fn.size;
    const diff = fn.encode[1] - fn.encode[0];
    const step = diff / (n - 1);
    for (let i = 0; i < srcLength; i++) {
      const x = src[srcOffset + i];
      const j = Math.floor((x - fn.encode[0]) / step);
      dest[destOffset + i] = fn.samples[j];
    }
  }
  static getIR(src) {
    const fn = PDFFunction.parse(src);
    return `function fn_` + fn[0].name + `(x) {
    ${fn[0].ir.join("\n")}
}`;
  }
  static parse(xref, fnDict) {
    const fn = [];
    if (!(fnDict instanceof _primitives.Dict)) {
      return fn;
    }
    const functionType = fnDict.get("FunctionType");
    let domain = fnDict.get("Domain");
    if (!Array.isArray(domain)) {
      domain = [0, 1];
    }
    let range = fnDict.get("Range");
    if (!Array.isArray(range)) {
      range = [0, 1];
    }
    switch (functionType) {
      case 0:
        const size = fnDict.get("Size");
        const bitsPerSample = fnDict.get("BitsPerSample");
        const order = fnDict.get("Order") || 1;
        const encode = fnDict.get("Encode") || [0, size[0] - 1];
        const decode = fnDict.get("Decode");
        const samples = fnDict.get("Samples");
        fn.push({
          type: 0,
          size,
          bitsPerSample,
          order,
          encode,
          decode,
          samples
        });
        break;
      case 2:
        const c0 = fnDict.get("C0") || [0];
        const c1 = fnDict.get("C1") || [1];
        const n = fnDict.get("N");
        fn.push({
          type: 2,
          c0,
          c1,
          n
        });
        break;
      case 3:
        const functions = fnDict.get("Functions");
        const bounds = fnDict.get("Bounds");
        const encode3 = fnDict.get("Encode");
        const fns = [];
        for (const func of functions) {
          fns.push(PDFFunction.parse(xref, xref.fetchIfRef(func)));
        }
        fn.push({
          type: 3,
          functions: fns,
          bounds,
          encode: encode3
        });
        break;
      case 4:
        const stream = fnDict;
        if (!(stream instanceof _stream.Stream)) {
          return fn;
        }
        const ir = [];
        const stack = [];
        const bytes = stream.getBytes();
        let i = 0;
        while (i < bytes.length) {
          const b = bytes[i++];
          if (b >= 32 && b <= 126) {
            let str = "";
            while (i < bytes.length && bytes[i] >= 32 && bytes[i] <= 126) {
              str += String.fromCharCode(bytes[i++]);
            }
            const num = parseFloat(str);
            if (!isNaN(num)) {
              stack.push(num);
            }
          } else if (b === 123) {
            let block = "";
            let nesting = 1;
            while (i < bytes.length) {
              const b2 = bytes[i++];
              if (b2 === 123) {
                nesting++;
              } else if (b2 === 125) {
                nesting--;
                if (nesting === 0) {
                  break;
                }
              }
              block += String.fromCharCode(b2);
            }
            ir.push(block);
          }
        }
        fn.push({
          type: 4,
          ir
        });
        break;
      default:
        (0, _util.warn)("Unknown PDFFunction type: " + functionType);
        return fn;
    }
    return fn;
  }
}
exports.PDFFunction = PDFFunction;

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.bidi = bidi;
const BIDI_LRM = "\u200E";
const BIDI_RLM = "\u200F";
const BIDI_LRE = "\u202A";
const BIDI_RLE = "\u202B";
const BIDI_PDF = "\u202C";
const BIDI_LTR = 1;
const BIDI_RTL = 2;
const BIDI_Char = {
  L: 1,
  R: 2,
  AL: 4,
  EN: 8,
  AN: 16,
  ET: 32,
  ES: 64,
  CS: 128,
  NSM: 256,
  BN: 512,
  B: 1024,
  S: 2048,
  WS: 4096,
  ON: 8192
};
function bidi(str, startLevel, isRtl, isLtr) {
  if (!str) {
    return {
      str,
      dir: "ltr"
    };
  }
  const strLength = str.length;
  let text = "";
  for (let i = 0; i < strLength; ++i) {
    const char = str.charAt(i);
    const charCode = str.charCodeAt(i);
    let override = null;
    if (isRtl) {
      override = BIDI_RTL;
    } else if (isLtr) {
      override = BIDI_LTR;
    }
    const bidiType = getBidiType(charCode);
    if (override) {
      text += override === BIDI_LTR ? BIDI_LRE : BIDI_RLE;
      text += char;
      text += BIDI_PDF;
    } else {
      text += char;
    }
  }
  return {
    str: text,
    dir: isRtl ? "rtl" : "ltr"
  };
}
function getBidiType(charCode) {
  if (charCode >= 0x41 && charCode <= 0x5a || charCode >= 0x61 && charCode <= 0x7a) {
    return BIDI_Char.L;
  }
  if (charCode >= 0x590 && charCode <= 0x8ff) {
    return BIDI_Char.R;
  }
  if (charCode >= 0x30 && charCode <= 0x39) {
    return BIDI_Char.EN;
  }
  if (charCode === 0x20 || charCode === 0xa0) {
    return BIDI_Char.WS;
  }
  return BIDI_Char.ON;
}

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ColorSpace = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _function = __webpack_require__(23);
class ColorSpace {
  constructor(name, numComps) {
    if (this.constructor === ColorSpace) {
      (0, _util.unreachable)("Cannot initialize ColorSpace.");
    }
    this.name = name;
    this.numComps = numComps;
  }
  static get(name) {
    switch (name) {
      case "DeviceGray":
        return this.singletons.gray;
      case "DeviceRGB":
        return this.singletons.rgb;
      case "DeviceCMYK":
        return this.singletons.cmyk;
      case "Pattern":
        return new PatternCS();
    }
    (0, _util.unreachable)(`Unsupported colorspace: ${name}`);
  }
  static parse(cs, xref, resources, pdfManager) {
    if ((0, _primitives.isName)(cs)) {
      const name = cs.name;
      if (this.singletons[name]) {
        return this.singletons[name];
      }
      const csFromRes = resources.get("ColorSpace")?.get(name);
      if (csFromRes) {
        if (this._cache.has(csFromRes)) {
          return this._cache.get(csFromRes);
        }
        const cs_ = this.parse(csFromRes, xref, resources, pdfManager);
        this._cache.set(csFromRes, cs_);
        return cs_;
      }
      return this.get(name);
    }
    if (Array.isArray(cs)) {
      const name = cs[0].name;
      switch (name) {
        case "DeviceGray":
        case "G":
          return this.singletons.gray;
        case "DeviceRGB":
        case "RGB":
          return this.singletons.rgb;
        case "DeviceCMYK":
        case "CMYK":
          return this.singletons.cmyk;
        case "CalGray":
          return new CalGrayCS(cs[1], xref);
        case "CalRGB":
          return new CalRGBCS(cs[1], xref);
        case "Lab":
          return new LabCS(cs[1], xref);
        case "ICCBased":
          return new ICCBasedCS(cs[1], xref, pdfManager);
        case "Indexed":
          return new IndexedCS(cs[1], cs[2], cs[3]);
        case "Pattern":
          return new PatternCS(this.parse(cs[1], xref, resources, pdfManager));
        case "Separation":
          return new SeparationCS(cs[1], cs[2], cs[3], xref);
        case "DeviceN":
          return new DeviceNCS(cs[1], cs[2], cs[3], cs[4], xref);
      }
    }
    (0, _util.unreachable)(`Unsupported colorspace: ${cs}`);
  }
  getRgb(src, srcOffset) {
    const numComps = this.numComps;
    const comps = new Float32Array(numComps);
    for (let i = 0; i < numComps; ++i) {
      comps[i] = src[srcOffset + i];
    }
    return this._getRgb(comps);
  }
  _getRgb(src) {
    (0, _util.unreachable)("Abstract method `_getRgb` called");
  }
  isDefaultDecode(decodeMap) {
    return false;
  }
  static get singletons() {
    return (0, _util.shadow)(this, "singletons", {
      gray: new DeviceGrayCS(),
      rgb: new DeviceRGBCS(),
      cmyk: new DeviceCMYKCS()
    });
  }
  static get _cache() {
    return (0, _util.shadow)(this, "_cache", new Map());
  }
}
exports.ColorSpace = ColorSpace;
class DeviceGrayCS extends ColorSpace {
  constructor() {
    super("DeviceGray", 1);
  }
  _getRgb(src) {
    const c = src[0] * 255;
    return new Uint8ClampedArray([c, c, c]);
  }
  isDefaultDecode(decodeMap) {
    return decodeMap[0] === 0 && decodeMap[1] === 1;
  }
}
class DeviceRGBCS extends ColorSpace {
  constructor() {
    super("DeviceRGB", 3);
  }
  _getRgb(src) {
    return new Uint8ClampedArray([src[0] * 255, src[1] * 255, src[2] * 255]);
  }
  isDefaultDecode(decodeMap) {
    return decodeMap[0] === 0 && decodeMap[1] === 1 && decodeMap[2] === 0 && decodeMap[3] === 1 && decodeMap[4] === 0 && decodeMap[5] === 1;
  }
}
class DeviceCMYKCS extends ColorSpace {
  constructor() {
    super("DeviceCMYK", 4);
  }
  _getRgb(src) {
    const c = src[0],
      m = src[1],
      y = src[2],
      k = src[3];
    return new Uint8ClampedArray([(1 - c) * (1 - k) * 255, (1 - m) * (1 - k) * 255, (1 - y) * (1 - k) * 255]);
  }
  isDefaultDecode(decodeMap) {
    return decodeMap[0] === 0 && decodeMap[1] === 1 && decodeMap[2] === 0 && decodeMap[3] === 1 && decodeMap[4] === 0 && decodeMap[5] === 1 && decodeMap[6] === 0 && decodeMap[7] === 1;
  }
}
class CalGrayCS extends ColorSpace {
  constructor(dict, xref) {
    super("CalGray", 1);
    this.whitePoint = dict.get("WhitePoint");
    this.blackPoint = dict.get("BlackPoint") || [0, 0, 0];
    this.gamma = dict.get("Gamma") || 1;
  }
  _getRgb(src) {
    const A = src[0];
    const L = this.whitePoint[1] * Math.pow(A, this.gamma);
    return new Uint8ClampedArray([L, L, L]);
  }
}
class CalRGBCS extends ColorSpace {
  constructor(dict, xref) {
    super("CalRGB", 3);
    this.whitePoint = dict.get("WhitePoint");
    this.blackPoint = dict.get("BlackPoint") || [0, 0, 0];
    this.gamma = dict.get("Gamma") || [1, 1, 1];
    this.matrix = dict.get("Matrix") || [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }
  _getRgb(src) {
    const A = src[0],
      B = src[1],
      C = src[2];
    const R = Math.pow(A, this.gamma[0]);
    const G = Math.pow(B, this.gamma[1]);
    const B_ = Math.pow(C, this.gamma[2]);
    const M = this.matrix;
    const X = M[0] * R + M[3] * G + M[6] * B_;
    const Y = M[1] * R + M[4] * G + M[7] * B_;
    const Z = M[2] * R + M[5] * G + M[8] * B_;
    const r = X * 3.2404542 - Y * 1.5371385 - Z * 0.4985314;
    const g = -X * 0.969266 + Y * 1.8760108 + Z * 0.041556;
    const b = X * 0.0556434 - Y * 0.2040259 + Z * 1.0572252;
    return new Uint8ClampedArray([r * 255, g * 255, b * 255]);
  }
}
class LabCS extends ColorSpace {
  constructor(dict, xref) {
    super("Lab", 3);
    this.whitePoint = dict.get("WhitePoint");
    this.blackPoint = dict.get("BlackPoint") || [0, 0, 0];
    this.range = dict.get("Range") || [-100, 100, -100, 100];
  }
  _getRgb(src) {
    const L = src[0],
      a = src[1],
      b = src[2];
    const Y = (L + 16) / 116;
    const X = a / 500 + Y;
    const Z = Y - b / 200;
    const f = x => x > 6 / 29 ? x * x * x : (x - 16 / 116) * 3 * (6 / 29) * (6 / 29);
    const X_ = f(X) * this.whitePoint[0];
    const Y_ = f(Y) * this.whitePoint[1];
    const Z_ = f(Z) * this.whitePoint[2];
    const r = X_ * 3.2404542 - Y_ * 1.5371385 - Z_ * 0.4985314;
    const g = -X_ * 0.969266 + Y_ * 1.8760108 + Z_ * 0.041556;
    const b_ = X_ * 0.0556434 - Y_ * 0.2040259 + Z_ * 1.0572252;
    return new Uint8ClampedArray([r * 255, g * 255, b_ * 255]);
  }
}
class ICCBasedCS extends ColorSpace {
  constructor(stream, xref, pdfManager) {
    super("ICCBased", stream.dict.get("N"));
    this.stream = stream;
    this.pdfManager = pdfManager;
    if (this.pdfManager.composite) {
      this._colorSpace = ColorSpace.parse(stream.dict.get("Alternate"), xref, null, pdfManager);
    }
  }
  _getRgb(src) {
    if (this.pdfManager.composite) {
      return this._colorSpace._getRgb(src);
    }
    return new Uint8ClampedArray([0, 0, 0]);
  }
}
class IndexedCS extends ColorSpace {
  constructor(base, hival, lookup) {
    super("Indexed", 1);
    this.base = base;
    this.hival = hival;
    this.lookup = lookup;
  }
  _getRgb(src) {
    const i = src[0];
    if (i < 0 || i > this.hival) {
      return this.base._getRgb([0]);
    }
    let comps = [];
    if ((0, _util.isStream)(this.lookup)) {
      const bytes = this.lookup.getBytes();
      const start = i * this.base.numComps;
      comps = Array.from(bytes.subarray(start, start + this.base.numComps));
    } else {
      const start = i * this.base.numComps;
      comps = this.lookup.slice(start, start + this.base.numComps).map(c => c.charCodeAt(0));
    }
    return this.base._getRgb(comps);
  }
}
class PatternCS extends ColorSpace {
  constructor(base) {
    super("Pattern", base ? base.numComps : 1);
    this.base = base;
  }
  _getRgb(src) {
    return new Uint8ClampedArray([0, 0, 0]);
  }
}
class SeparationCS extends ColorSpace {
  constructor(name, alternate, tintTransform, xref) {
    super("Separation", 1);
    this.name = name;
    this.alternate = alternate;
    this.tintTransform = _function.PDFFunction.parse(xref, tintTransform)[0];
  }
  _getRgb(src) {
    const t = this.tintTransform;
    const c = src[0];
    const n = t.n;
    const c0 = t.c0,
      c1 = t.c1;
    const result = [];
    for (let i = 0; i < c0.length; i++) {
      result.push(c0[i] + Math.pow(c, n) * (c1[i] - c0[i]));
    }
    return this.alternate._getRgb(result);
  }
}
class DeviceNCS extends ColorSpace {
  constructor(names, alternate, tintTransform, attributes, xref) {
    super("DeviceN", names.length);
    this.names = names;
    this.alternate = alternate;
    this.tintTransform = _function.PDFFunction.parse(xref, tintTransform)[0];
    this.attributes = attributes;
  }
  _getRgb(src) {
    const t = this.tintTransform;
    const result = [];
    t.ir.forEach(op => {
      if (typeof op === "string") {
        const stack = [];
        const ops = op.split(" ");
        for (const o of ops) {
          switch (o) {
            case "pop":
              stack.pop();
              break;
            case "dup":
              stack.push(stack[stack.length - 1]);
              break;
            case "exch":
              const a = stack.pop();
              const b = stack.pop();
              stack.push(a, b);
              break;
            case "index":
              const i = stack.pop();
              stack.push(stack[stack.length - 1 - i]);
              break;
            default:
              const num = parseFloat(o);
              if (!isNaN(num)) {
                stack.push(num);
              }
              break;
          }
        }
        result.push(...stack);
      }
    });
    return this.alternate._getRgb(result);
  }
}

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Shading = exports.Pattern = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _function = __webpack_require__(23);
var _colorspace = __webpack_require__(25);
class Pattern {
  constructor(stream) {
    this.stream = stream;
  }
  static parse(pattern, xref, resources, handler, pdfManager, stateManager) {
    if (pattern instanceof _primitives.Dict) {
      const type = pattern.get("PatternType");
      if (type === 1) {
        return new TilingPattern(pattern, xref, resources, handler, pdfManager, stateManager);
      } else if (type === 2) {
        return new ShadingPattern(pattern, xref, resources, handler, pdfManager);
      }
    }
    (0, _util.unreachable)("Unsupported pattern type.");
  }
}
exports.Pattern = Pattern;
class TilingPattern extends Pattern {
  constructor(dict, xref, resources, handler, pdfManager, stateManager) {
    super(null);
    this.dict = dict;
    this.xref = xref;
    this.resources = resources;
    this.handler = handler;
    this.pdfManager = pdfManager;
    this.stateManager = stateManager;
    this.type = 1;
    this.paintType = dict.get("PaintType");
    this.tilingType = dict.get("TilingType");
    this.bbox = dict.get("BBox");
    this.xstep = dict.get("XStep");
    this.ystep = dict.get("YStep");
    this.matrix = dict.get("Matrix") || [1, 0, 0, 1, 0, 0];
    this.stream = dict.get("stream");
  }
}
class ShadingPattern extends Pattern {
  constructor(dict, xref, resources, handler, pdfManager) {
    super(null);
    this.dict = dict;
    this.xref = xref;
    this.resources = resources;
    this.handler = handler;
    this.pdfManager = pdfManager;
    this.type = 2;
    this.shading = Shading.parse(dict.get("Shading"), xref, resources, handler);
    this.matrix = dict.get("Matrix") || [1, 0, 0, 1, 0, 0];
  }
}
class Shading {
  constructor(dict, xref, resources, handler) {
    this.dict = dict;
    this.xref = xref;
    this.resources = resources;
    this.handler = handler;
  }
  static parse(shading, xref, resources, handler) {
    const dict = shading instanceof _primitives.Dict ? shading : xref.fetchIfRef(shading);
    const type = dict.get("ShadingType");
    switch (type) {
      case 1:
        return new FunctionBasedShading(dict, xref, resources, handler);
      case 2:
        return new AxialShading(dict, xref, resources, handler);
      case 3:
        return new RadialShading(dict, xref, resources, handler);
      case 4:
      case 5:
      case 6:
      case 7:
        (0, _util.warn)(`Shading type ${type} is not implemented.`);
        return new DummyShading(dict, xref, resources, handler);
      default:
        (0, _util.unreachable)("Unsupported shading type.");
    }
  }
}
exports.Shading = Shading;
class DummyShading extends Shading {
  constructor(dict, xref, resources, handler) {
    super(dict, xref, resources, handler);
    this.type = 0;
  }
  getIR() {
    return ["Dummy", this.dict.toJS()];
  }
}
class FunctionBasedShading extends Shading {
  constructor(dict, xref, resources, handler) {
    super(dict, xref, resources, handler);
    this.type = 1;
    this.domain = dict.get("Domain");
    this.matrix = dict.get("Matrix");
    this.func = _function.PDFFunction.parse(xref, dict.get("Function"))[0];
    this.colorSpace = _colorspace.ColorSpace.parse(dict.get("ColorSpace"), xref, resources);
  }
  getIR() {
    return ["FunctionBased", this.domain, this.matrix, this.func.getIR(), this.colorSpace.getIR()];
  }
}
class AxialShading extends Shading {
  constructor(dict, xref, resources, handler) {
    super(dict, xref, resources, handler);
    this.type = 2;
    this.coords = dict.get("Coords");
    this.domain = dict.get("Domain");
    this.func = _function.PDFFunction.parse(xref, dict.get("Function"))[0];
    this.extend = dict.get("Extend") || [false, false];
    this.colorSpace = _colorspace.ColorSpace.parse(dict.get("ColorSpace"), xref, resources);
  }
  getIR() {
    return ["Axial", this.coords, this.domain, this.func.getIR(), this.extend, this.colorSpace.getIR()];
  }
}
class RadialShading extends Shading {
  constructor(dict, xref, resources, handler) {
    super(dict, xref, resources, handler);
    this.type = 3;
    this.coords = dict.get("Coords");
    this.domain = dict.get("Domain");
    this.func = _function.PDFFunction.parse(xref, dict.get("Function"))[0];
    this.extend = dict.get("Extend") || [false, false];
    this.colorSpace = _colorspace.ColorSpace.parse(dict.get("ColorSpace"), xref, resources);
  }
  getIR() {
    return ["Radial", this.coords, this.domain, this.func.getIR(), this.extend, this.colorSpace.getIR()];
  }
}

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.XfaFont = void 0;
var _util = __webpack_require__(1);
var _core_utils = __webpack_require__(3);
var _util_metapdf = __webpack_require__(33);
class XfaFont {
  constructor(doc, xfa) {
    this.doc = doc;
    this.xfa = xfa;
  }
  createFont(fontInfo) {
    const fontName = fontInfo.name.replace(/[,_]/g, "-");
    let font = this.doc.fontCache.get(fontName);
    if (font) {
      return font;
    }
    const pdfFont = new _core_utils.TranslatedFont(fontName, "Type1", this.doc.xref, this.doc.resources, this.doc.fontCache, this.doc.builtInCMapCache);
    pdfFont.name = fontName;
    pdfFont.type = "Type1";
    pdfFont.subtype = "Type1";
    pdfFont.fontMatrix = _util_metapdf.FONT_IDENTITY_MATRIX;
    pdfFont.widths = Object.create(null);
    pdfFont.defaultWidth = 0;
    pdfFont.vertical = false;
    pdfFont.direction = 1;
    pdfFont.ascent = fontInfo.ascent || 0.8;
    pdfFont.descent = fontInfo.descent || -0.2;
    pdfFont.isMonospace = fontInfo.isMonospace;
    pdfFont.isSerif = fontInfo.isSerif;
    this.doc.fontCache.put(fontName, pdfFont);
    return pdfFont;
  }
}
exports.XfaFont = XfaFont;

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.XfaFactory = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _xml_parser = __webpack_require__(13);
class XfaFactory {
  constructor({
    doc,
    xref,
    fontCache
  }) {
    this.doc = doc;
    this.xref = xref;
    this.fontCache = fontCache;
    this.isValid = true;
    try {
      this.xfa = (0, _xml_parser.parseXfa)({
        data: doc.xfa,
        password: doc.xref.password
      });
    } catch (e) {
      this.isValid = false;
      (0, _util.warn)(`XFA - XML parsing failed: "${e}".`);
    }
  }
  find(path) {
    if (!this.isValid || !this.xfa) {
      return null;
    }
    const name = path.split(".").pop().replace(/\[\d+\]$/, "");
    const node = this.searchNode(this.xfa, name);
    if (!node) {
      return null;
    }
    const value = this.getNodeValue(node);
    const readOnly = this.isReadOnly(node);
    return {
      value,
      readOnly
    };
  }
  searchNode(node, name) {
    if (node.name === name || node.attributes.name === name) {
      return node;
    }
    for (const child of node.children) {
      const found = this.searchNode(child, name);
      if (found) {
        return found;
      }
    }
    return null;
  }
  getNodeValue(node) {
    for (const child of node.children) {
      if (child.name === "value") {
        for (const valueNode of child.children) {
          if (valueNode.name === "#text") {
            return valueNode.value;
          }
        }
      }
    }
    return null;
  }
  isReadOnly(node) {
    for (const child of node.children) {
      if (child.name === "ui") {
        for (const uiChild of child.children) {
          if (uiChild.name === "checkButton" && uiChild.attributes.access === "readOnly") {
            return true;
          }
        }
      }
    }
    return false;
  }
}
exports.XfaFactory = XfaFactory;

/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.TextAccessibility = void 0;
var _util = __webpack_require__(1);
var _struct_tree = __webpack_require__(30);
class TextAccessibility {
  constructor(pdfManager) {
    this.pdfManager = pdfManager;
  }
  getTextContent(pageIndex) {
    const structTree = this.pdfManager.pdfDocument.structTree;
    if (!structTree) {
      return Promise.resolve(null);
    }
    const page = this.pdfManager.pdfDocument.getPage(pageIndex);
    return page.extractTextContent({
      includeMarkedContent: true
    }).then(textContent => {
      const textAcc = new _struct_tree.StructTreeBuilder(structTree, textContent).build();
      return textAcc;
    });
  }
}
exports.TextAccessibility = TextAccessibility;

/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StructTreeBuilder = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
class StructTreeBuilder {
  constructor(structTree, textContent) {
    this.structTree = structTree;
    this.textContent = textContent;
  }
  build() {
    const root = this.structTree.get("K");
    if (!root) {
      return null;
    }
    const accessibility = {
      role: "document",
      children: []
    };
    const queue = [{
      node: root,
      parent: accessibility
    }];
    while (queue.length > 0) {
      const {
        node,
        parent
      } = queue.shift();
      if (!node) {
        continue;
      }
      const type = node.get("S")?.name;
      const id = node.get("ID");
      const lang = node.get("Lang");
      const alt = node.get("Alt");
      const actualText = node.get("ActualText");
      const obj = {
        role: type,
        children: []
      };
      if (id) {
        obj.id = id;
      }
      if (lang) {
        obj.lang = lang;
      }
      if (alt) {
        obj.alt = alt;
      }
      if (actualText) {
        obj.actualText = actualText;
      }
      parent.children.push(obj);
      const kids = node.get("K");
      if (!kids) {
        continue;
      }
      if (Array.isArray(kids)) {
        for (const kid of kids) {
          queue.push({
            node: kid,
            parent: obj
          });
        }
      } else {
        const mcid = kids;
        const markedContent = this.textContent.items.find(item => item.marker?.mcid === mcid);
        if (markedContent) {
          obj.children.push({
            type: "content",
            id: markedContent.marker.id
          });
        }
      }
    }
    return accessibility;
  }
}
exports.StructTreeBuilder = StructTreeBuilder;

/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.toPDFDate = toPDFDate;
exports.createDefaultAppearance = createDefaultAppearance;
var _util = __webpack_require__(1);
function toPDFDate(date) {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `D:${year}${month}${day}${hours}${minutes}${seconds}Z`;
}
function createDefaultAppearance(value, fontName, fontSize, fontColor, rotation, rect, id) {
  const rotationRad = rotation * Math.PI / 180;
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  const width = rect[2] - rect[0];
  const height = rect[3] - rect[1];
  const x = rect[0] + width / 2;
  const y = rect[1] + height / 2;
  const tm = [cos, sin, -sin, cos, x, y];
  return `<<
  /Subtype /Form
  /FormType 1
  /BBox [${rect.join(" ")}]
  /Matrix [1 0 0 1 0 0]
  /Resources <<
    /Font <<
      /${fontName} <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /${fontName}
      >>
    >>
  >>
  /Length ${value.length + 50}
>>
stream
BT
  /${fontName} ${fontSize} Tf
  ${fontColor.join(" ")} rg
  1 0 0 1 ${width / 2} ${height / 2} Tm
  (${value}) Tj
ET
endstream`;
}

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Writer = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _stream = __webpack_require__(4);
class Writer {
  constructor(xref) {
    this.xref = xref;
    this.data = [];
    this.offsets = new Map();
  }
  writeHeader() {
    this.data.push("%PDF-1.7\n");
  }
  writeObject(ref, obj) {
    this.offsets.set(ref.toString(), this.data.length);
    this.data.push(`${ref.num} ${ref.gen} obj\n`);
    this.writeValue(obj);
    this.data.push("\nendobj\n");
  }
  writeValue(obj) {
    if (obj instanceof _primitives.Name) {
      this.data.push(`/${obj.name}`);
    } else if (obj instanceof _primitives.Dict) {
      this.data.push("<<\n");
      for (const [key, value] of obj) {
        this.data.push(`/${key} `);
        this.writeValue(value);
        this.data.push("\n");
      }
      this.data.push(">>");
    } else if (obj instanceof _primitives.Ref) {
      this.data.push(`${obj.num} ${obj.gen} R`);
    } else if (Array.isArray(obj)) {
      this.data.push("[ ");
      for (const item of obj) {
        this.writeValue(item);
        this.data.push(" ");
      }
      this.data.push("]");
    } else if (typeof obj === "string") {
      this.data.push(`(${(0, _util.stringToPDFString)(obj)})`);
    } else if (typeof obj === "number") {
      this.data.push(obj.toString());
    } else if (typeof obj === "boolean") {
      this.data.push(obj ? "true" : "false");
    } else if (obj === _primitives.Null) {
      this.data.push("null");
    } else if (obj instanceof _stream.Stream) {
      this.writeValue(obj.dict);
      this.data.push("\nstream\n");
      this.data.push((0, _util.bytesToString)(obj.getBytes()));
      this.data.push("\nendstream");
    }
  }
  writeXRefTable() {
    const startXRef = this.data.length;
    this.data.push("xref\n");
    this.data.push(`0 ${this.xref.entries.length}\n`);
    for (let i = 0; i < this.xref.entries.length; i++) {
      const entry = this.xref.entries[i];
      if (entry.free) {
        this.data.push(`${"0".padStart(10, "0")} ${"65535".padStart(5, "0")} f \n`);
      } else {
        const offset = this.offsets.get(`${i}R${entry.gen}`);
        if (offset === undefined) {
          const originalEntry = this.xref.getEntry(i);
          this.data.push(`${originalEntry.offset.toString().padStart(10, "0")} ${originalEntry.gen.toString().padStart(5, "0")} n \n`);
        } else {
          this.data.push(`${offset.toString().padStart(10, "0")} ${entry.gen.toString().padStart(5, "0")} n \n`);
        }
      }
    }
    this.data.push("trailer\n");
    this.writeValue(this.xref.trailer);
    this.data.push(`\nstartxref\n${startXRef}\n%%EOF`);
  }
  write() {
    this.writeHeader();
    for (const [key, value] of this.xref._cache) {
      if (value.obj) {
        this.writeObject(_primitives.Ref.get(key, value.obj.gen), value.obj);
      }
    }
    this.writeXRefTable();
    return new TextEncoder().encode(this.data.join(""));
  }
}
exports.Writer = Writer;

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.transform = transform;
exports.applyTransform = applyTransform;
exports.applyInverseTransform = applyInverseTransform;
exports.getInheritableProperty = getInheritableProperty;
exports.intersect = intersect;
exports.TranslatedFont = exports.SVGFactory = exports.OpListParser = exports.FONT_IDENTITY_MATRIX = exports.IDENTITY_MATRIX = void 0;
var _util = __webpack_require__(1);
var _primitives = __webpack_require__(18);
var _stream = __webpack_require__(4);
var _core_utils = __webpack_require__(3);
const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
exports.IDENTITY_MATRIX = IDENTITY_MATRIX;
const FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];
exports.FONT_IDENTITY_MATRIX = FONT_IDENTITY_MATRIX;
function transform(m1, m2) {
  return [m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1], m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3], m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
}
function applyTransform(p, m) {
  const xt = p[0] * m[0] + p[1] * m[2] + m[4];
  const yt = p[0] * m[1] + p[1] * m[3] + m[5];
  return [xt, yt];
}
function applyInverseTransform(p, m) {
  const d = m[0] * m[3] - m[1] * m[2];
  const xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[3] * m[4]) / d;
  const yt = (p[1] * m[0] - p[0] * m[1] + m[1] * m[4] - m[0] * m[5]) / d;
  return [xt, yt];
}
function getInheritableProperty({
  dict,
  key,
  getArray = false,
  stopWhenFound = true
}) {
  let result, i, ii;
  let anObject = dict;
  while (anObject) {
    result = getArray ? anObject.get(key) : anObject.getArray(key);
    if (result !== undefined) {
      if (stopWhenFound) {
        return result;
      }
    }
    anObject = anObject.get("Parent");
  }
  return undefined;
}
function intersect(r1, r2) {
  const x1 = Math.max(r1[0], r2[0]);
  const y1 = Math.max(r1[1], r2[1]);
  const x2 = Math.min(r1[2], r2[2]);
  const y2 = Math.min(r1[3], r2[3]);
  if (x2 < x1 || y2 < y1) {
    return null;
  }
  return [x1, y1, x2, y2];
}
class OpListParser {
  constructor(commonObjs, objs, textContent, opList, svgFactory, gfx, viewport) {
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.textContent = textContent;
    this.opList = opList;
    this.svgFactory = svgFactory;
    this.gfx = gfx;
    this.viewport = viewport;
  }
  async parse() {
    const {
      fnArray,
      argsArray
    } = this.opList;
    for (let i = 0, ii = fnArray.length; i < ii; i++) {
      const fnId = fnArray[i];
      const fn = _util.OPS[fnId];
      const args = argsArray[i];
      switch (fn) {
        case "paintImageXObject":
          const imgData = args[0];
          const img = this.objs.get(imgData.id);
          const smask = imgData.smask ? this.objs.get(imgData.smask) : null;
          await this.gfx.drawInlineImage(img, smask, this.viewport.transform, imgData.width, imgData.height, imgData.interpolate);
          break;
        case "paintInlineImageXObject":
          const imgData_ = args[0];
          const img_ = this.objs.get(imgData_.id);
          await this.gfx.drawInlineImage(img_, null, this.viewport.transform, imgData_.width, imgData_.height, imgData_.interpolate);
          break;
        case "showText":
          const glyphs = args[0];
          this.gfx.showText(glyphs);
          break;
        case "showSpacedText":
          const items = args[0];
          for (const item of items) {
            if (typeof item === "string") {
              this.gfx.showText([{
                str: item,
                dir: "ltr",
                width: 0,
                height: 0,
                transform: IDENTITY_MATRIX
              }]);
            }
          }
          break;
        case "save":
          this.gfx.save();
          break;
        case "restore":
          this.gfx.restore();
          break;
        case "transform":
          this.gfx.transform(...args);
          break;
        case "setGState":
          const gs = args[0];
          this.gfx.setGState(gs);
          break;
        case "setFillRGBColor":
          this.gfx.setFillStyle(this.gfx.newStdRGBColor(...args));
          break;
        case "setStrokeRGBColor":
          this.gfx.setStrokeStyle(this.gfx.newStdRGBColor(...args));
          break;
        case "setFillGray":
          this.gfx.setFillStyle(this.gfx.newGrayColor(args[0]));
          break;
        case "setStrokeGray":
          this.gfx.setStrokeStyle(this.gfx.newGrayColor(args[0]));
          break;
        case "setLineWidth":
          this.gfx.setLineWidth(args[0]);
          break;
        case "setLineCap":
          this.gfx.setLineCap(args[0]);
          break;
        case "setLineJoin":
          this.gfx.setLineJoin(args[0]);
          break;
        case "setMiterLimit":
          this.gfx.setMiterLimit(args[0]);
          break;
        case "setDash":
          this.gfx.setDash(args[0], args[1]);
          break;
        case "constructPath":
          const [ops, opArgs] = args;
          this.gfx.beginPath();
          for (let j = 0, jj = ops.length; j < jj; j++) {
            const op = ops[j];
            const opArg = opArgs[j];
            switch (op) {
              case _util.OPS.moveTo:
                this.gfx.moveTo(opArg[0], opArg[1]);
                break;
              case _util.OPS.lineTo:
                this.gfx.lineTo(opArg[0], opArg[1]);
                break;
              case _util.OPS.curveTo:
                this.gfx.bezierCurveTo(opArg[0], opArg[1], opArg[2], opArg[3], opArg[4], opArg[5]);
                break;
              case _util.OPS.curveTo2:
                this.gfx.quadraticCurveTo(opArg[0], opArg[1], opArg[2], opArg[3]);
                break;
              case _util.OPS.curveTo3:
                this.gfx.bezierCurveTo(opArg[0], opArg[1], opArg[2], opArg[3], opArg[4], opArg[5]);
                break;
              case _util.OPS.closePath:
                this.gfx.closePath();
                break;
              case _util.OPS.rectangle:
                this.gfx.rect(opArg[0], opArg[1], opArg[2], opArg[3]);
                break;
            }
          }
          break;
        case "fill":
          this.gfx.fill();
          break;
        case "stroke":
          this.gfx.stroke();
          break;
        case "clip":
          this.gfx.clip();
          break;
        case "eoFill":
          this.gfx.fill("evenodd");
          break;
        case "eoClip":
          this.gfx.clip("evenodd");
          break;
      }
    }
  }
}
exports.OpListParser = OpListParser;
class SVGFactory {
  create(width, height) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", width + "px");
    svg.setAttribute("height", height + "px");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    return Promise.resolve(svg);
  }
}
exports.SVGFactory = SVGFactory;
class TranslatedFont {
  constructor(id, fontDict, xref, resources, fontCache, builtInCMapCache) {
    this.id = id;
    this.fontDict = fontDict;
    this.xref = xref;
    this.resources = resources;
    this.fontCache = fontCache;
    this.builtInCMapCache = builtInCMapCache;
    this.name = fontDict.get("BaseFont").name;
    this.type = fontDict.get("Subtype").name;
    this.firstChar = fontDict.get("FirstChar") || 0;
    this.lastChar = fontDict.get("LastChar") || 255;
    this.widths = fontDict.get("Widths") || [];
    this.defaultWidth = fontDict.get("MissingWidth") || 0;
    this.isMonospace = false;
    this.isSerif = false;
    this.ascent = 0;
    this.descent = 0;
    this.vertical = false;
    this.direction = 1;
    this.fontMatrix = fontDict.get("FontMatrix") || FONT_IDENTITY_MATRIX;
    const fontDescriptor = fontDict.get("FontDescriptor");
    if (fontDescriptor) {
      this.ascent = fontDescriptor.get("Ascent") || 0;
      this.descent = fontDescriptor.get("Descent") || 0;
      this.isMonospace = !!(fontDescriptor.get("Flags") & 1);
      this.isSerif = !!(fontDescriptor.get("Flags") & 2);
    }
    const toUnicode = fontDict.get("ToUnicode");
    if (toUnicode instanceof _stream.Stream) {
      this.toUnicode = this.parseToUnicode(toUnicode);
    }
    const encoding = fontDict.get("Encoding");
    if (encoding instanceof _primitives.Name) {
      this.encoding = this.parseEncoding(encoding.name);
    } else if (encoding instanceof _primitives.Dict) {
      const baseEncoding = encoding.get("BaseEncoding");
      if (baseEncoding instanceof _primitives.Name) {
        this.encoding = this.parseEncoding(baseEncoding.name);
      }
      const differences = encoding.get("Differences");
      if (Array.isArray(differences)) {
        let code = 0;
        for (const item of differences) {
          if (typeof item === "number") {
            code = item;
          } else if (item instanceof _primitives.Name) {
            this.encoding[code++] = item.name;
          }
        }
      }
    }
    this.fallbackName = this.name.split("+").pop();
  }
  parseToUnicode(toUnicode) {
    const cmap = new _core_utils.CMap();
    _core_utils.CMapFactory.parse(toUnicode, cmap);
    return cmap;
  }
  parseEncoding(encodingName) {
    const encodings = {
      MacRomanEncoding: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quotesingle", "parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater", "question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore", "grave", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "", "Adieresis", "Aring", "Ccedilla", "Eacute", "Ntilde", "Odieresis", "Udieresis", "aacute", "agrave", "acircumflex", "adieresis", "atilde", "aring", "ccedilla", "eacute", "egrave", "ecircumflex", "edieresis", "iacute", "igrave", "icircumflex", "idieresis", "ntilde", "oacute", "ograve", "ocircumflex", "odieresis", "otilde", "uacute", "ugrave", "ucircumflex", "udieresis", "dagger", "degree", "cent", "sterling", "section", "bullet", "paragraph", "germandbls", "registered", "copyright", "trademark", "acute", "dieresis", "", "AE", "Oslash", "infinity", "plusminus", "lessequal", "greaterequal", "yen", "mu", "partialdiff", "summation", "product", "pi", "integral", "ordfeminine", "ordmasculine", "Omega", "ae", "oslash", "questiondown", "exclamdown", "logicalnot", "radical", "florin", "approxequal", "Delta", "guillemotleft", "guillemotright", "ellipsis", "nbsp", "Agrave", "Atilde", "Otilde", "OE", "oe", "endash", "emdash", "quotedblleft", "quotedblright", "quoteleft", "quoteright", "divide", "lozenge", "ydieresis", "Ydieresis", "fraction", "currency", "guilsinglleft", "guilsinglright", "fi", "fl", "daggerdbl", "periodcentered", "quotesinglbase", "quotedblbase", "perthousand", "Acircumflex", "Ecircumflex", "Aacute", "Edieresis", "Egrave", "Iacute", "Icircumflex", "Idieresis", "Igrave", "Oacute", "Ocircumflex", "apple", "Ograve", "Uacute", "Ucircumflex", "Ugrave", "dotlessi", "circumflex", "tilde", "macron", "breve", "dotaccent", "ring", "cedilla", "hungarumlaut", "ogonek", "caron"],
      WinAnsiEncoding: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quotesingle", "parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater", "question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore", "grave", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "bullet", "Euro", "bullet", "quotesinglbase", "florin", "quotedblbase", "ellipsis", "dagger", "daggerdbl", "circumflex", "perthousand", "Scaron", "guilsinglleft", "OE", "bullet", "Zcaron", "bullet", "bullet", "quoteleft", "quoteright", "quotedblleft", "quotedblright", "bullet", "endash", "emdash", "tilde", "trademark", "scaron", "guilsinglright", "oe", "bullet", "zcaron", "Ydieresis", "space", "exclamdown", "cent", "sterling", "currency", "yen", "brokenbar", "section", "dieresis", "copyright", "ordfeminine", "guillemotleft", "logicalnot", "hyphen", "registered", "macron", "degree", "plusminus", "twosuperior", "threesuperior", "acute", "mu", "paragraph", "periodcentered", "cedilla", "onesuperior", "ordmasculine", "guillemotright", "onequarter", "onehalf", "threequarters", "questiondown", "Agrave", "Aacute", "Acircumflex", "Atilde", "Adieresis", "Aring", "AE", "Ccedilla", "Egrave", "Eacute", "Ecircumflex", "Edieresis", "Igrave", "Iacute", "Icircumflex", "Idieresis", "Eth", "Ntilde", "Ograve", "Oacute", "Ocircumflex", "Otilde", "Odieresis", "multiply", "Oslash", "Ugrave", "Uacute", "Ucircumflex", "Udieresis", "Yacute", "Thorn", "germandbls", "agrave", "aacute", "acircumflex", "atilde", "adieresis", "aring", "ae", "ccedilla", "egrave", "eacute", "ecircumflex", "edieresis", "igrave", "iacute", "icircumflex", "idieresis", "eth", "ntilde", "ograve", "oacute", "ocircumflex", "otilde", "odieresis", "divide", "oslash", "ugrave", "uacute", "ucircumflex", "udieresis", "yacute", "thorn", "ydieresis"],
      StandardEncoding: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quotesingle", "parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater", "question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore", "grave", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Lslash", "Scaron", "Zcaron", "OE", "OE", "Ydieresis", "", "exclamdown", "cent", "sterling", "fraction", "yen", "florin", "section", "currency", "quotesingle", "quotedblleft", "guillemotleft", "guilsinglleft", "guilsinglright", "fi", "fl", "", "endash", "dagger", "daggerdbl", "periodcentered", "", "paragraph", "bullet", "quotesinglbase", "quotedblbase", "quotedblright", "guillemotright", "ellipsis", "perthousand", "", "questiondown", "", "grave", "acute", "circumflex", "tilde", "macron", "breve", "dotaccent", "dieresis", "", "ring", "cedilla", "", "hungarumlaut", "ogonek", "caron", "emdash", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "AE", "", "ordfeminine", "", "", "", "", "Lslash", "Oslash", "OE", "ordmasculine", "", "", "", "", "", "ae", "", "", "", "dotlessi", "", "", "lslash", "oslash", "oe", "germandbls"]
    };
    return encodings[encodingName] || [];
  }
}
exports.TranslatedFont = TranslatedFont;

/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.JpxImage = void 0;
var _util = __webpack_require__(1);
var _stream = __webpack_require__(4);
class JpxImage {
  constructor() {
    this.failOnInvalidImage = false;
  }
  parse(data) {
    const stream = new _stream.Stream(data);
    const results = {};
    while (stream.pos < stream.end) {
      const box = this.parseBox(stream);
      if (!box) {
        break;
      }
      switch (box.type) {
        case "jp2h":
          this.parseJp2h(box.data, results);
          break;
        case "jp2c":
          results.contiguousCodestream = box.data;
          break;
      }
    }
    return results;
  }
  parseBox(stream) {
    const length = stream.getInt32();
    const type = (0, _util.bytesToString)(stream.getBytes(4));
    let data;
    if (length === 1) {
      (0, _util.unreachable)("JPX Large box format is not supported");
    }
    if (length > stream.end - stream.pos) {
      if (this.failOnInvalidImage) {
        throw new Error("JPX box length is larger than stream length");
      }
      (0, _util.warn)("JPX box length is larger than stream length");
      return null;
    }
    data = stream.getBytes(length - 8);
    return {
      type,
      data
    };
  }
  parseJp2h(data, results) {
    const stream = new _stream.Stream(data);
    while (stream.pos < stream.end) {
      const box = this.parseBox(stream);
      if (!box) {
        break;
      }
      switch (box.type) {
        case "ihdr":
          this.parseIhdr(box.data, results);
          break;
        case "colr":
          this.parseColr(box.data, results);
          break;
      }
    }
  }
  parseIhdr(data, results) {
    const stream = new _stream.Stream(data);
    results.height = stream.getInt32();
    results.width = stream.getInt32();
    results.numComponents = stream.getUint16();
    results.bitsPerComponent = (stream.getByte() & 0x7f) + 1;
    results.compressionType = stream.getByte();
    results.colorspaceKnown = stream.getByte() === 1;
    results.ipr = stream.getByte() === 1;
  }
  parseColr(data, results) {
    const stream = new _stream.Stream(data);
    const method = stream.getByte();
    if (method === 1) {
      results.colorspace = stream.getInt32();
    }
  }
}
exports.JpxImage = JpxImage;

/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Jbig2Image = void 0;
var _util = __webpack_require__(1);
var _stream = __webpack_require__(4);
class Jbig2Image {
  constructor() {
    this.failOnInvalidImage = false;
  }
  parse(data) {
    const stream = new _stream.Stream(data);
    const fileHeader = this.parseFileHeader(stream);
    if (fileHeader.numberOfPages === 1) {
      return this.parseSegments(fileHeader, stream);
    }
    const pages = [];
    for (let i = 0; i < fileHeader.numberOfPages; i++) {
      pages.push(this.parseSegments(fileHeader, stream));
    }
    return pages;
  }
  parseFileHeader(stream) {
    const id = (0, _util.bytesToString)(stream.getBytes(8));
    if (id !== "\x97JB2\r\n\x1A\n") {
      throw new Error("Invalid JBIG2 file header");
    }
    const version = stream.getByte();
    const flags = stream.getByte();
    const numberOfPages = flags & 1 ? stream.getInt32() : 0;
    return {
      id,
      version,
      flags,
      numberOfPages
    };
  }
  parseSegments(fileHeader, stream) {
    const segments = [];
    while (stream.pos < stream.end) {
      const segment = this.parseSegment(stream);
      if (!segment) {
        break;
      }
      if (segment.type === 51) {
        break;
      }
      segments.push(segment);
    }
    return segments;
  }
  parseSegment(stream) {
    const number = stream.getInt32();
    const flags = stream.getByte();
    const type = flags & 0x3f;
    const referredToSegmentCount = flags >> 6;
    let referredToSegments = [];
    if (referredToSegmentCount > 0) {
      if (number <= 256) {
        for (let i = 0; i < referredToSegmentCount; i++) {
          referredToSegments.push(stream.getByte());
        }
      } else if (number <= 65536) {
        for (let i = 0; i < referredToSegmentCount; i++) {
          referredToSegments.push(stream.getUint16());
        }
      } else {
        for (let i = 0; i < referredToSegmentCount; i++) {
          referredToSegments.push(stream.getInt32());
        }
      }
    }
    const page = stream.getInt32();
    const length = stream.getInt32();
    const data = stream.getBytes(length);
    return {
      number,
      flags,
      type,
      referredToSegments,
      page,
      length,
      data
    };
  }
}
exports.Jbig2Image = Jbig2Image;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;
//# sourceMappingURL=pdf.worker.min.mjs.map