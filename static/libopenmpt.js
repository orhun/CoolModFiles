const Module = typeof libopenmpt !== 'undefined' ? libopenmpt : {};
let moduleOverrides = {};
let key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key];
    }
}
let arguments_ = [];
let thisProgram = './this.program';
let quit_ = function (status, toThrow) {
    throw toThrow;
};
let ENVIRONMENT_IS_WEB = false;
let ENVIRONMENT_IS_WORKER = false;
let ENVIRONMENT_IS_NODE = false;
let ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
ENVIRONMENT_IS_NODE =
    typeof process === 'object' &&
    typeof process.versions === 'object' &&
    typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
let scriptDirectory = '';
function locateFile(path) {
    if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
    }
    return scriptDirectory + path;
}
let read_, readAsync, readBinary, setWindowTitle;
let nodeFS;
let nodePath;
if (ENVIRONMENT_IS_NODE) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = require('path').dirname(scriptDirectory) + '/';
    } else {
        scriptDirectory = __dirname + '/';
    }
    read_ = function shell_read(filename, binary) {
        if (!nodeFS) nodeFS = require('fs');
        if (!nodePath) nodePath = require('path');
        filename = nodePath['normalize'](filename);
        return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
    };
    readBinary = function readBinary(filename) {
        let ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret);
        }
        assert(ret.buffer);
        return ret;
    };
    if (process['argv'].length > 1) {
        thisProgram = process['argv'][1].replace(/\\/g, '/');
    }
    arguments_ = process['argv'].slice(2);
    if (typeof module !== 'undefined') {
        module['exports'] = Module;
    }
    process['on']('uncaughtException', function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex;
        }
    });
    process['on']('unhandledRejection', abort);
    quit_ = function (status) {
        process['exit'](status);
    };
    Module['inspect'] = function () {
        return '[Emscripten Module object]';
    };
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != 'undefined') {
        read_ = function shell_read(f) {
            return read(f);
        };
    }
    readBinary = function readBinary(f) {
        let data;
        if (typeof readbuffer === 'function') {
            return new Uint8Array(readbuffer(f));
        }
        data = read(f, 'binary');
        assert(typeof data === 'object');
        return data;
    };
    if (typeof scriptArgs != 'undefined') {
        arguments_ = scriptArgs;
    } else if (typeof arguments != 'undefined') {
        arguments_ = arguments;
    }
    if (typeof quit === 'function') {
        quit_ = function (status) {
            quit(status);
        };
    }
    if (typeof print !== 'undefined') {
        if (typeof console === 'undefined') console = {};
        console.log = print;
        console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print;
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src;
    }
    if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
    } else {
        scriptDirectory = '';
    }
    {
        read_ = function shell_read(url) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);
            return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = function readBinary(url) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                xhr.responseType = 'arraybuffer';
                xhr.send(null);
                return new Uint8Array(xhr.response);
            };
        }
        readAsync = function readAsync(url, onload, onerror) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function xhr_onload() {
                if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                    onload(xhr.response);
                    return;
                }
                onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
        };
    }
    setWindowTitle = function (title) {
        document.title = title;
    };
} else {
}
const out = Module['print'] || console.log.bind(console);
const err = Module['printErr'] || console.warn.bind(console);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key];
    }
}
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
let tempRet0 = 0;
const setTempRet0 = function (value) {
    tempRet0 = value;
};
const getTempRet0 = function () {
    return tempRet0;
};
let wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
let noExitRuntime;
if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
if (typeof WebAssembly !== 'object') {
    err('no native wasm support detected');
}
let wasmMemory;
const wasmTable = new WebAssembly.Table({ initial: 2945, maximum: 2945 + 0, element: 'anyfunc' });
let ABORT = false;
let EXITSTATUS = 0;
function assert(condition, text) {
    if (!condition) {
        abort('Assertion failed: ' + text);
    }
}
const UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
    const endIdx = idx + maxBytesToRead;
    let endPtr = idx;
    while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr));
    } else {
        var str = '';
        while (idx < endPtr) {
            let u0 = heap[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue;
            }
            const u1 = heap[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode(((u0 & 31) << 6) | u1);
                continue;
            }
            const u2 = heap[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0);
            } else {
                const ch = u0 - 65536;
                str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
            }
        }
    }
    return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    const startIdx = outIdx;
    const endIdx = outIdx + maxBytesToWrite - 1;
    for (let i = 0; i < str.length; ++i) {
        let u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            const u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | (u >> 6);
            heap[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | (u >> 12);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
        } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | (u >> 18);
            heap[outIdx++] = 128 | ((u >> 12) & 63);
            heap[outIdx++] = 128 | ((u >> 6) & 63);
            heap[outIdx++] = 128 | (u & 63);
        }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
    let len = 0;
    for (let i = 0; i < str.length; ++i) {
        let u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4;
    }
    return len;
}
function allocateUTF8(str) {
    const size = lengthBytesUTF8(str) + 1;
    const ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret;
}
function writeArrayToMemory(array, buffer) {
    HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (let i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
const WASM_PAGE_SIZE = 65536;
function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - (x % multiple);
    }
    return x;
}
let buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module['HEAP8'] = HEAP8 = new Int8Array(buf);
    Module['HEAP16'] = HEAP16 = new Int16Array(buf);
    Module['HEAP32'] = HEAP32 = new Int32Array(buf);
    Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
    Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
    Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
    Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
    Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}
const DYNAMIC_BASE = 5708e3,
    DYNAMICTOP_PTR = 464944;
let INITIAL_INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
} else {
    wasmMemory = new WebAssembly.Memory({
        initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
        maximum: 2147483648 / WASM_PAGE_SIZE,
    });
}
if (wasmMemory) {
    buffer = wasmMemory.buffer;
}
INITIAL_INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        const callback = callbacks.shift();
        if (typeof callback == 'function') {
            callback(Module);
            continue;
        }
        const func = callback.func;
        if (typeof func === 'number') {
            if (callback.arg === undefined) {
                Module['dynCall_v'](func);
            } else {
                Module['dynCall_vi'](func, callback.arg);
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg);
        }
    }
}
const __ATPRERUN__ = [];
const __ATINIT__ = [];
const __ATMAIN__ = [];
const __ATPOSTRUN__ = [];
let runtimeInitialized = false;
function preRun() {
    if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
            addOnPreRun(Module['preRun'].shift());
        }
    }
    callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
    runtimeInitialized = true;
    if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
    TTY.init();
    callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
    FS.ignorePermissions = false;
    callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
    if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
            addOnPostRun(Module['postRun'].shift());
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
}
const Math_abs = Math.abs;
const Math_ceil = Math.ceil;
const Math_floor = Math.floor;
const Math_min = Math.min;
let runDependencies = 0;
let runDependencyWatcher = null;
let dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
    return id;
}
function addRunDependency(id) {
    runDependencies++;
    if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if (Module['monitorRunDependencies']) {
        Module['monitorRunDependencies'](runDependencies);
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
            const callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
        }
    }
}
Module['preloadedImages'] = {};
Module['preloadedAudios'] = {};
function abort(what) {
    if (Module['onAbort']) {
        Module['onAbort'](what);
    }
    what += '';
    out(what);
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
    throw new WebAssembly.RuntimeError(what);
}
function hasPrefix(str, prefix) {
    return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0;
}
const dataURIPrefix = 'data:application/octet-stream;base64,';
function isDataURI(filename) {
    return hasPrefix(filename, dataURIPrefix);
}
const fileURIPrefix = 'file://';
function isFileURI(filename) {
    return hasPrefix(filename, fileURIPrefix);
}
let wasmBinaryFile = 'libopenmpt.wasm';
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary() {
    try {
        if (wasmBinary) {
            return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
            return readBinary(wasmBinaryFile);
        } else {
            throw 'both async and sync fetching of the wasm failed';
        }
    } catch (err) {
        abort(err);
    }
}
function getBinaryPromise() {
    if (
        !wasmBinary &&
        (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
        typeof fetch === 'function' &&
        !isFileURI(wasmBinaryFile)
    ) {
        return fetch(wasmBinaryFile, { credentials: 'same-origin' })
            .then(function (response) {
                if (!response['ok']) {
                    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response['arrayBuffer']();
            })
            .catch(function () {
                return getBinary();
            });
    }
    return new Promise(function (resolve, reject) {
        resolve(getBinary());
    });
}
function createWasm() {
    const info = { a: asmLibraryArg };
    function receiveInstance(instance, module) {
        const exports = instance.exports;
        Module['asm'] = exports;
        removeRunDependency('wasm-instantiate');
    }
    addRunDependency('wasm-instantiate');
    function receiveInstantiatedSource(output) {
        receiveInstance(output['instance']);
    }
    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise()
            .then(function (binary) {
                return WebAssembly.instantiate(binary, info);
            })
            .then(receiver, function (reason) {
                err('failed to asynchronously prepare wasm: ' + reason);
                abort(reason);
            });
    }
    function instantiateAsync() {
        if (
            !wasmBinary &&
            typeof WebAssembly.instantiateStreaming === 'function' &&
            !isDataURI(wasmBinaryFile) &&
            !isFileURI(wasmBinaryFile) &&
            typeof fetch === 'function'
        ) {
            fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
                const result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiatedSource, function (reason) {
                    err('wasm streaming compile failed: ' + reason);
                    err('falling back to ArrayBuffer instantiation');
                    instantiateArrayBuffer(receiveInstantiatedSource);
                });
            });
        } else {
            return instantiateArrayBuffer(receiveInstantiatedSource);
        }
    }
    if (Module['instantiateWasm']) {
        try {
            const exports = Module['instantiateWasm'](info, receiveInstance);
            return exports;
        } catch (e) {
            err('Module.instantiateWasm callback failed with error: ' + e);
            return false;
        }
    }
    instantiateAsync();
    return {};
}
let tempDouble;
let tempI64;
__ATINIT__.push({
    func: function () {
        ___wasm_call_ctors();
    },
});
function demangle(func) {
    return func;
}
function demangleAll(text) {
    const regex = /\b_Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        const y = demangle(x);
        return x === y ? x : y + ' [' + x + ']';
    });
}
function jsStackTrace() {
    let err = new Error();
    if (!err.stack) {
        try {
            throw new Error();
        } catch (e) {
            err = e;
        }
        if (!err.stack) {
            return '(no stack trace available)';
        }
    }
    return err.stack.toString();
}
function stackTrace() {
    let js = jsStackTrace();
    if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
    return demangleAll(js);
}
function ___assert_fail(condition, filename, line, func) {
    abort(
        'Assertion failed: ' +
            UTF8ToString(condition) +
            ', at: ' +
            [
                filename ? UTF8ToString(filename) : 'unknown filename',
                line,
                func ? UTF8ToString(func) : 'unknown function',
            ],
    );
}
function ___cxa_allocate_exception(size) {
    return _malloc(size);
}
const ___exception_infos = {};
const ___exception_caught = [];
function ___exception_addRef(ptr) {
    if (!ptr) return;
    const info = ___exception_infos[ptr];
    info.refcount++;
}
function ___exception_deAdjust(adjusted) {
    if (!adjusted || ___exception_infos[adjusted]) return adjusted;
    for (const key in ___exception_infos) {
        const ptr = +key;
        const adj = ___exception_infos[ptr].adjusted;
        const len = adj.length;
        for (let i = 0; i < len; i++) {
            if (adj[i] === adjusted) {
                return ptr;
            }
        }
    }
    return adjusted;
}
function ___cxa_begin_catch(ptr) {
    const info = ___exception_infos[ptr];
    if (info && !info.caught) {
        info.caught = true;
        __ZSt18uncaught_exceptionv.uncaught_exceptions--;
    }
    if (info) info.rethrown = false;
    ___exception_caught.push(ptr);
    ___exception_addRef(___exception_deAdjust(ptr));
    return ptr;
}
let ___exception_last = 0;
function ___cxa_free_exception(ptr) {
    return _free(ptr);
}
function ___exception_decRef(ptr) {
    if (!ptr) return;
    const info = ___exception_infos[ptr];
    info.refcount--;
    if (info.refcount === 0 && !info.rethrown) {
        if (info.destructor) {
            Module['dynCall_ii'](info.destructor, ptr);
        }
        delete ___exception_infos[ptr];
        ___cxa_free_exception(ptr);
    }
}
function ___cxa_end_catch() {
    _setThrew(0);
    const ptr = ___exception_caught.pop();
    if (ptr) {
        ___exception_decRef(___exception_deAdjust(ptr));
        ___exception_last = 0;
    }
}
function ___cxa_find_matching_catch_17() {
    let thrown = ___exception_last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0;
    }
    const info = ___exception_infos[thrown];
    const throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
    }
    const typeArray = Array.prototype.slice.call(arguments);
    const pointer = ___cxa_is_pointer_type(throwntype);
    const buffer = 465104;
    HEAP32[buffer >> 2] = thrown;
    thrown = buffer;
    for (let i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_find_matching_catch_2() {
    let thrown = ___exception_last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0;
    }
    const info = ___exception_infos[thrown];
    const throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
    }
    const typeArray = Array.prototype.slice.call(arguments);
    const pointer = ___cxa_is_pointer_type(throwntype);
    const buffer = 465104;
    HEAP32[buffer >> 2] = thrown;
    thrown = buffer;
    for (let i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_find_matching_catch_3() {
    let thrown = ___exception_last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0;
    }
    const info = ___exception_infos[thrown];
    const throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
    }
    const typeArray = Array.prototype.slice.call(arguments);
    const pointer = ___cxa_is_pointer_type(throwntype);
    const buffer = 465104;
    HEAP32[buffer >> 2] = thrown;
    thrown = buffer;
    for (let i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_find_matching_catch_4() {
    let thrown = ___exception_last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0;
    }
    const info = ___exception_infos[thrown];
    const throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
    }
    const typeArray = Array.prototype.slice.call(arguments);
    const pointer = ___cxa_is_pointer_type(throwntype);
    const buffer = 465104;
    HEAP32[buffer >> 2] = thrown;
    thrown = buffer;
    for (let i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_find_matching_catch_6() {
    let thrown = ___exception_last;
    if (!thrown) {
        return (setTempRet0(0), 0) | 0;
    }
    const info = ___exception_infos[thrown];
    const throwntype = info.type;
    if (!throwntype) {
        return (setTempRet0(0), thrown) | 0;
    }
    const typeArray = Array.prototype.slice.call(arguments);
    const pointer = ___cxa_is_pointer_type(throwntype);
    const buffer = 465104;
    HEAP32[buffer >> 2] = thrown;
    thrown = buffer;
    for (let i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted.push(thrown);
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    }
    thrown = HEAP32[thrown >> 2];
    return (setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_rethrow() {
    let ptr = ___exception_caught.pop();
    ptr = ___exception_deAdjust(ptr);
    if (!___exception_infos[ptr].rethrown) {
        ___exception_caught.push(ptr);
        ___exception_infos[ptr].rethrown = true;
    }
    ___exception_last = ptr;
    throw ptr;
}
function ___cxa_throw(ptr, type, destructor) {
    ___exception_infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false,
    };
    ___exception_last = ptr;
    if (!('uncaught_exception' in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exceptions = 1;
    } else {
        __ZSt18uncaught_exceptionv.uncaught_exceptions++;
    }
    throw ptr;
}
function ___cxa_uncaught_exceptions() {
    return __ZSt18uncaught_exceptionv.uncaught_exceptions;
}
function setErrNo(value) {
    HEAP32[___errno_location() >> 2] = value;
    return value;
}
function ___map_file(pathname, size) {
    setErrNo(63);
    return -1;
}
function ___resumeException(ptr) {
    if (!___exception_last) {
        ___exception_last = ptr;
    }
    throw ptr;
}
var PATH = {
    splitPath: function (filename) {
        const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
    },
    normalizeArray: function (parts, allowAboveRoot) {
        let up = 0;
        for (let i = parts.length - 1; i >= 0; i--) {
            const last = parts[i];
            if (last === '.') {
                parts.splice(i, 1);
            } else if (last === '..') {
                parts.splice(i, 1);
                up++;
            } else if (up) {
                parts.splice(i, 1);
                up--;
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift('..');
            }
        }
        return parts;
    },
    normalize: function (path) {
        const isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        path = PATH.normalizeArray(
            path.split('/').filter(function (p) {
                return !!p;
            }),
            !isAbsolute,
        ).join('/');
        if (!path && !isAbsolute) {
            path = '.';
        }
        if (path && trailingSlash) {
            path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
    },
    dirname: function (path) {
        let result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
            return '.';
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
    },
    basename: function (path) {
        if (path === '/') return '/';
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1);
    },
    extname: function (path) {
        return PATH.splitPath(path)[3];
    },
    join: function () {
        const paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
    },
    join2: function (l, r) {
        return PATH.normalize(l + '/' + r);
    },
};
var PATH_FS = {
    resolve: function () {
        let resolvedPath = '',
            resolvedAbsolute = false;
        for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            const path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== 'string') {
                throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
                return '';
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charAt(0) === '/';
        }
        resolvedPath = PATH.normalizeArray(
            resolvedPath.split('/').filter(function (p) {
                return !!p;
            }),
            !resolvedAbsolute,
        ).join('/');
        return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
    },
    relative: function (from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
            let start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== '') break;
            }
            let end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
        }
        const fromParts = trim(from.split('/'));
        const toParts = trim(to.split('/'));
        const length = Math.min(fromParts.length, toParts.length);
        let samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
            }
        }
        let outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
    },
};
var TTY = {
    ttys: [],
    init: function () {},
    shutdown: function () {},
    register: function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
    },
    stream_ops: {
        open: function (stream) {
            const tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
        },
        close: function (stream) {
            stream.tty.ops.flush(stream.tty);
        },
        flush: function (stream) {
            stream.tty.ops.flush(stream.tty);
        },
        read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60);
            }
            let bytesRead = 0;
            for (let i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty);
                } catch (e) {
                    throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result;
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now();
            }
            return bytesRead;
        },
        write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60);
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                }
            } catch (e) {
                throw new FS.ErrnoError(29);
            }
            if (length) {
                stream.node.timestamp = Date.now();
            }
            return i;
        },
    },
    default_tty_ops: {
        get_char: function (tty) {
            if (!tty.input.length) {
                let result = null;
                if (ENVIRONMENT_IS_NODE) {
                    const BUFSIZE = 256;
                    const buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                    let bytesRead = 0;
                    try {
                        bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null);
                    } catch (e) {
                        if (e.toString().indexOf('EOF') != -1) bytesRead = 0;
                        else throw e;
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString('utf-8');
                    } else {
                        result = null;
                    }
                } else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
                    result = window.prompt('Input: ');
                    if (result !== null) {
                        result += '\n';
                    }
                } else if (typeof readline == 'function') {
                    result = readline();
                    if (result !== null) {
                        result += '\n';
                    }
                }
                if (!result) {
                    return null;
                }
                tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
        },
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) tty.output.push(val);
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        },
    },
    default_tty1_ops: {
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) tty.output.push(val);
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        },
    },
};
var MEMFS = {
    ops_table: null,
    mount: function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511, 0);
    },
    createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink,
                    },
                    stream: { llseek: MEMFS.stream_ops.llseek },
                },
                file: {
                    node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync,
                    },
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink,
                    },
                    stream: {},
                },
                chrdev: {
                    node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                    stream: FS.chrdev_stream_ops,
                },
            };
        }
        const node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node;
        }
        return node;
    },
    getFileDataAsRegularArray: function (node) {
        if (node.contents && node.contents.subarray) {
            const arr = [];
            for (let i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
            return arr;
        }
        return node.contents;
    },
    getFileDataAsTypedArray: function (node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
    },
    expandFileStorage: function (node, newCapacity) {
        const prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        const CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(
            newCapacity,
            (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0,
        );
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        const oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        return;
    },
    resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
            return;
        }
        if (!node.contents || node.contents.subarray) {
            const oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
            return;
        }
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
    },
    node_ops: {
        getattr: function (node) {
            const attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length;
            } else {
                attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
        },
        setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size);
            }
        },
        lookup: function (parent, name) {
            throw FS.genericErrors[44];
        },
        mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
        },
        rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                let new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {}
                if (new_node) {
                    for (const i in new_node.contents) {
                        throw new FS.ErrnoError(55);
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            old_node.parent = new_dir;
        },
        unlink: function (parent, name) {
            delete parent.contents[name];
        },
        rmdir: function (parent, name) {
            const node = FS.lookupNode(parent, name);
            for (const i in node.contents) {
                throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
        },
        readdir: function (node) {
            const entries = ['.', '..'];
            for (const key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue;
                }
                entries.push(key);
            }
            return entries;
        },
        symlink: function (parent, newname, oldpath) {
            const node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
        },
        readlink: function (node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28);
            }
            return node.link;
        },
    },
    stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            const contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            const size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset);
            } else {
                for (let i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
            }
            return size;
        },
        write: function (stream, buffer, offset, length, position, canOwn) {
            if (buffer.buffer === HEAP8.buffer) {
                canOwn = false;
            }
            if (!length) return 0;
            const node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = buffer.slice(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length;
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray)
                node.contents.set(buffer.subarray(offset, offset + length), position);
            else {
                for (let i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i];
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
        },
        llseek: function (stream, offset, whence) {
            let position = offset;
            if (whence === 1) {
                position += stream.position;
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes;
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28);
            }
            return position;
        },
        allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
        mmap: function (stream, buffer, offset, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            let ptr;
            let allocated;
            let contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer.buffer) {
                allocated = false;
                ptr = contents.byteOffset;
            } else {
                if (position > 0 || position + length < contents.length) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length);
                    } else {
                        contents = Array.prototype.slice.call(
                            contents,
                            position,
                            position + length,
                        );
                    }
                }
                allocated = true;
                const fromHeap = buffer.buffer == HEAP8.buffer;
                ptr = _malloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48);
                }
                (fromHeap ? HEAP8 : buffer).set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
        },
        msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
                return 0;
            }
            const bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
        },
    },
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: '/',
    initialized: false,
    ignorePermissions: true,
    trackingDelegate: {},
    tracking: { openFlags: { READ: 1, WRITE: 2 } },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return setErrNo(e.errno);
    },
    lookupPath: function (path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path) return { path: '', node: null };
        const defaults = { follow_mount: true, recurse_count: 0 };
        for (const key in defaults) {
            if (opts[key] === undefined) {
                opts[key] = defaults[key];
            }
        }
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
        }
        const parts = PATH.normalizeArray(
            path.split('/').filter(function (p) {
                return !!p;
            }),
            false,
        );
        let current = FS.root;
        let current_path = '/';
        for (let i = 0; i < parts.length; i++) {
            const islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || (islast && opts.follow_mount)) {
                    current = current.mounted.root;
                }
            }
            if (!islast || opts.follow) {
                let count = 0;
                while (FS.isLink(current.mode)) {
                    const link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    const lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count,
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32);
                    }
                }
            }
        }
        return { path: current_path, node: current };
    },
    getPath: function (node) {
        let path;
        while (true) {
            if (FS.isRoot(node)) {
                const mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
            }
            path = path ? node.name + '/' + path : node.name;
            node = node.parent;
        }
    },
    hashName: function (parentid, name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
    },
    hashAddNode: function (node) {
        const hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
    },
    hashRemoveNode: function (node) {
        const hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
        } else {
            let current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break;
                }
                current = current.name_next;
            }
        }
    },
    lookupNode: function (parent, name) {
        const errCode = FS.mayLookup(parent);
        if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
        }
        const hash = FS.hashName(parent.id, name);
        for (let node = FS.nameTable[hash]; node; node = node.name_next) {
            const nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node;
            }
        }
        return FS.lookup(parent, name);
    },
    createNode: function (parent, name, mode, rdev) {
        const node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
    },
    destroyNode: function (node) {
        FS.hashRemoveNode(node);
    },
    isRoot: function (node) {
        return node === node.parent;
    },
    isMountpoint: function (node) {
        return !!node.mounted;
    },
    isFile: function (mode) {
        return (mode & 61440) === 32768;
    },
    isDir: function (mode) {
        return (mode & 61440) === 16384;
    },
    isLink: function (mode) {
        return (mode & 61440) === 40960;
    },
    isChrdev: function (mode) {
        return (mode & 61440) === 8192;
    },
    isBlkdev: function (mode) {
        return (mode & 61440) === 24576;
    },
    isFIFO: function (mode) {
        return (mode & 61440) === 4096;
    },
    isSocket: function (mode) {
        return (mode & 49152) === 49152;
    },
    flagModes: {
        r: 0,
        rs: 1052672,
        'r+': 2,
        w: 577,
        wx: 705,
        xw: 705,
        'w+': 578,
        'wx+': 706,
        'xw+': 706,
        a: 1089,
        ax: 1217,
        xa: 1217,
        'a+': 1090,
        'ax+': 1218,
        'xa+': 1218,
    },
    modeStringToFlags: function (str) {
        const flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
            throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
    },
    flagsToPermissionString: function (flag) {
        let perms = ['r', 'w', 'rw'][flag & 3];
        if (flag & 512) {
            perms += 'w';
        }
        return perms;
    },
    nodePermissions: function (node, perms) {
        if (FS.ignorePermissions) {
            return 0;
        }
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
            return 2;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
            return 2;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
            return 2;
        }
        return 0;
    },
    mayLookup: function (dir) {
        const errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
    },
    mayCreate: function (dir, name) {
        try {
            const node = FS.lookupNode(dir, name);
            return 20;
        } catch (e) {}
        return FS.nodePermissions(dir, 'wx');
    },
    mayDelete: function (dir, name, isdir) {
        let node;
        try {
            node = FS.lookupNode(dir, name);
        } catch (e) {
            return e.errno;
        }
        const errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
            return errCode;
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10;
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31;
            }
        }
        return 0;
    },
    mayOpen: function (node, flags) {
        if (!node) {
            return 44;
        }
        if (FS.isLink(node.mode)) {
            return 32;
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
                return 31;
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (let fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd;
            }
        }
        throw new FS.ErrnoError(33);
    },
    getStream: function (fd) {
        return FS.streams[fd];
    },
    createStream: function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
            FS.FSStream = function () {};
            FS.FSStream.prototype = {
                object: {
                    get: function () {
                        return this.node;
                    },
                    set: function (val) {
                        this.node = val;
                    },
                },
                isRead: {
                    get: function () {
                        return (this.flags & 2097155) !== 1;
                    },
                },
                isWrite: {
                    get: function () {
                        return (this.flags & 2097155) !== 0;
                    },
                },
                isAppend: {
                    get: function () {
                        return this.flags & 1024;
                    },
                },
            };
        }
        const newStream = new FS.FSStream();
        for (const p in stream) {
            newStream[p] = stream[p];
        }
        stream = newStream;
        const fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
    },
    closeStream: function (fd) {
        FS.streams[fd] = null;
    },
    chrdev_stream_ops: {
        open: function (stream) {
            const device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
            }
        },
        llseek: function () {
            throw new FS.ErrnoError(70);
        },
    },
    major: function (dev) {
        return dev >> 8;
    },
    minor: function (dev) {
        return dev & 255;
    },
    makedev: function (ma, mi) {
        return (ma << 8) | mi;
    },
    registerDevice: function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
    },
    getDevice: function (dev) {
        return FS.devices[dev];
    },
    getMounts: function (mount) {
        const mounts = [];
        const check = [mount];
        while (check.length) {
            const m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
        }
        return mounts;
    },
    syncfs: function (populate, callback) {
        if (typeof populate === 'function') {
            callback = populate;
            populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            err(
                'warning: ' +
                    FS.syncFSRequests +
                    ' FS.syncfs operations in flight at once, probably just doing extra work',
            );
        }
        const mounts = FS.getMounts(FS.root.mount);
        let completed = 0;
        function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode);
        }
        function done(errCode) {
            if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode);
                }
                return;
            }
            if (++completed >= mounts.length) {
                doCallback(null);
            }
        }
        mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
                return done(null);
            }
            mount.type.syncfs(mount, populate, done);
        });
    },
    mount: function (type, opts, mountpoint) {
        const root = mountpoint === '/';
        const pseudo = !mountpoint;
        let node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
            const lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54);
            }
        }
        const mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
        const mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot;
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount);
            }
        }
        return mountRoot;
    },
    unmount: function (mountpoint) {
        const lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
        }
        const node = lookup.node;
        const mount = node.mounted;
        const mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function (hash) {
            let current = FS.nameTable[hash];
            while (current) {
                const next = current.name_next;
                if (mounts.indexOf(current.mount) !== -1) {
                    FS.destroyNode(current);
                }
                current = next;
            }
        });
        node.mounted = null;
        const idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
    },
    lookup: function (parent, name) {
        return parent.node_ops.lookup(parent, name);
    },
    mknod: function (path, mode, dev) {
        const lookup = FS.lookupPath(path, { parent: true });
        const parent = lookup.node;
        const name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
            throw new FS.ErrnoError(28);
        }
        const errCode = FS.mayCreate(parent, name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
    },
    create: function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
    },
    mkdir: function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
    },
    mkdirTree: function (path, mode) {
        const dirs = path.split('/');
        let d = '';
        for (let i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += '/' + dirs[i];
            try {
                FS.mkdir(d, mode);
            } catch (e) {
                if (e.errno != 20) throw e;
            }
        }
    },
    mkdev: function (path, mode, dev) {
        if (typeof dev === 'undefined') {
            dev = mode;
            mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
    },
    symlink: function (oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
        }
        const lookup = FS.lookupPath(newpath, { parent: true });
        const parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44);
        }
        const newname = PATH.basename(newpath);
        const errCode = FS.mayCreate(parent, newname);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
    },
    rename: function (old_path, new_path) {
        const old_dirname = PATH.dirname(old_path);
        const new_dirname = PATH.dirname(new_path);
        const old_name = PATH.basename(old_path);
        const new_name = PATH.basename(new_path);
        let lookup, old_dir, new_dir;
        try {
            lookup = FS.lookupPath(old_path, { parent: true });
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, { parent: true });
            new_dir = lookup.node;
        } catch (e) {
            throw new FS.ErrnoError(10);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
        }
        const old_node = FS.lookupNode(old_dir, old_name);
        let relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(28);
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
            throw new FS.ErrnoError(55);
        }
        let new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (old_node === new_node) {
            return;
        }
        const isdir = FS.isDir(old_node.mode);
        let errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        errCode = new_node
            ? FS.mayDelete(new_dir, new_name, isdir)
            : FS.mayCreate(new_dir, new_name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
            throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, 'w');
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        try {
            if (FS.trackingDelegate['willMovePath']) {
                FS.trackingDelegate['willMovePath'](old_path, new_path);
            }
        } catch (e) {
            err(
                "FS.trackingDelegate['willMovePath']('" +
                    old_path +
                    "', '" +
                    new_path +
                    "') threw an exception: " +
                    e.message,
            );
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
            throw e;
        } finally {
            FS.hashAddNode(old_node);
        }
        try {
            if (FS.trackingDelegate['onMovePath'])
                FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch (e) {
            err(
                "FS.trackingDelegate['onMovePath']('" +
                    old_path +
                    "', '" +
                    new_path +
                    "') threw an exception: " +
                    e.message,
            );
        }
    },
    rmdir: function (path) {
        const lookup = FS.lookupPath(path, { parent: true });
        const parent = lookup.node;
        const name = PATH.basename(path);
        const node = FS.lookupNode(parent, name);
        const errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        try {
            if (FS.trackingDelegate['willDeletePath']) {
                FS.trackingDelegate['willDeletePath'](path);
            }
        } catch (e) {
            err(
                "FS.trackingDelegate['willDeletePath']('" +
                    path +
                    "') threw an exception: " +
                    e.message,
            );
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch (e) {
            err(
                "FS.trackingDelegate['onDeletePath']('" +
                    path +
                    "') threw an exception: " +
                    e.message,
            );
        }
    },
    readdir: function (path) {
        const lookup = FS.lookupPath(path, { follow: true });
        const node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
    },
    unlink: function (path) {
        const lookup = FS.lookupPath(path, { parent: true });
        const parent = lookup.node;
        const name = PATH.basename(path);
        const node = FS.lookupNode(parent, name);
        const errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        try {
            if (FS.trackingDelegate['willDeletePath']) {
                FS.trackingDelegate['willDeletePath'](path);
            }
        } catch (e) {
            err(
                "FS.trackingDelegate['willDeletePath']('" +
                    path +
                    "') threw an exception: " +
                    e.message,
            );
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch (e) {
            err(
                "FS.trackingDelegate['onDeletePath']('" +
                    path +
                    "') threw an exception: " +
                    e.message,
            );
        }
    },
    readlink: function (path) {
        const lookup = FS.lookupPath(path);
        const link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    },
    stat: function (path, dontFollow) {
        const lookup = FS.lookupPath(path, { follow: !dontFollow });
        const node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
    },
    lstat: function (path) {
        return FS.stat(path, true);
    },
    chmod: function (path, mode, dontFollow) {
        let node;
        if (typeof path === 'string') {
            const lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
            mode: (mode & 4095) | (node.mode & ~4095),
            timestamp: Date.now(),
        });
    },
    lchmod: function (path, mode) {
        FS.chmod(path, mode, true);
    },
    fchmod: function (fd, mode) {
        const stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
    },
    chown: function (path, uid, gid, dontFollow) {
        let node;
        if (typeof path === 'string') {
            const lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, { timestamp: Date.now() });
    },
    lchown: function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
    },
    fchown: function (fd, uid, gid) {
        const stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
    },
    truncate: function (path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(28);
        }
        let node;
        if (typeof path === 'string') {
            const lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
        }
        const errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    },
    ftruncate: function (fd, len) {
        const stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
    },
    utime: function (path, atime, mtime) {
        const lookup = FS.lookupPath(path, { follow: true });
        const node = lookup.node;
        node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    },
    open: function (path, flags, mode, fd_start, fd_end) {
        if (path === '') {
            throw new FS.ErrnoError(44);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 : mode;
        if (flags & 64) {
            mode = (mode & 4095) | 32768;
        } else {
            mode = 0;
        }
        let node;
        if (typeof path === 'object') {
            node = path;
        } else {
            path = PATH.normalize(path);
            try {
                const lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
                node = lookup.node;
            } catch (e) {}
        }
        let created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20);
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true;
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
        }
        if (!created) {
            const errCode = FS.mayOpen(node, flags);
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        if (flags & 512) {
            FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        const stream = FS.createStream(
            {
                node: node,
                path: FS.getPath(node),
                flags: flags,
                seekable: true,
                position: 0,
                stream_ops: node.stream_ops,
                ungotten: [],
                error: false,
            },
            fd_start,
            fd_end,
        );
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                err('FS.trackingDelegate error on read file: ' + path);
            }
        }
        try {
            if (FS.trackingDelegate['onOpenFile']) {
                let trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ;
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE;
                }
                FS.trackingDelegate['onOpenFile'](path, trackingFlags);
            }
        } catch (e) {
            err(
                "FS.trackingDelegate['onOpenFile']('" +
                    path +
                    "', flags) threw an exception: " +
                    e.message,
            );
        }
        return stream;
    },
    close: function (stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream);
            }
        } catch (e) {
            throw e;
        } finally {
            FS.closeStream(stream.fd);
        }
        stream.fd = null;
    },
    isClosed: function (stream) {
        return stream.fd === null;
    },
    llseek: function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
    },
    read: function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
        }
        const seeking = typeof position !== 'undefined';
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        const bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
        }
        const seeking = typeof position !== 'undefined';
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        const bytesWritten = stream.stream_ops.write(
            stream,
            buffer,
            offset,
            length,
            position,
            canOwn,
        );
        if (!seeking) stream.position += bytesWritten;
        try {
            if (stream.path && FS.trackingDelegate['onWriteToFile'])
                FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch (e) {
            err(
                "FS.trackingDelegate['onWriteToFile']('" +
                    stream.path +
                    "') threw an exception: " +
                    e.message,
            );
        }
        return bytesWritten;
    },
    allocate: function (stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    },
    munmap: function (stream) {
        return 0;
    },
    ioctl: function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
    },
    readFile: function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        let ret;
        const stream = FS.open(path, opts.flags);
        const stat = FS.stat(path);
        const length = stat.size;
        const buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
            ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
            ret = buf;
        }
        FS.close(stream);
        return ret;
    },
    writeFile: function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        const stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === 'string') {
            const buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            const actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
            throw new Error('Unsupported data type');
        }
        FS.close(stream);
    },
    cwd: function () {
        return FS.currentPath;
    },
    chdir: function (path) {
        const lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
        }
        const errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
    },
    createDefaultDirectories: function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
    },
    createDefaultDevices: function () {
        FS.mkdir('/dev');
        FS.registerDevice(FS.makedev(1, 3), {
            read: function () {
                return 0;
            },
            write: function (stream, buffer, offset, length, pos) {
                return length;
            },
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        let random_device;
        if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
            const randomBuffer = new Uint8Array(1);
            random_device = function () {
                crypto.getRandomValues(randomBuffer);
                return randomBuffer[0];
            };
        } else if (ENVIRONMENT_IS_NODE) {
            try {
                const crypto_module = require('crypto');
                random_device = function () {
                    return crypto_module['randomBytes'](1)[0];
                };
            } catch (e) {}
        } else {
        }
        if (!random_device) {
            random_device = function () {
                abort('random_device');
            };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
    },
    createSpecialDirectories: function () {
        FS.mkdir('/proc');
        FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount(
            {
                mount: function () {
                    const node = FS.createNode('/proc/self', 'fd', 16384 | 511, 73);
                    node.node_ops = {
                        lookup: function (parent, name) {
                            const fd = +name;
                            const stream = FS.getStream(fd);
                            if (!stream) throw new FS.ErrnoError(8);
                            const ret = {
                                parent: null,
                                mount: { mountpoint: 'fake' },
                                node_ops: {
                                    readlink: function () {
                                        return stream.path;
                                    },
                                },
                            };
                            ret.parent = ret;
                            return ret;
                        },
                    };
                    return node;
                },
            },
            {},
            '/proc/self/fd',
        );
    },
    createStandardStreams: function () {
        if (Module['stdin']) {
            FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
            FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
            FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
            FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
            FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
            FS.symlink('/dev/tty1', '/dev/stderr');
        }
        const stdin = FS.open('/dev/stdin', 'r');
        const stdout = FS.open('/dev/stdout', 'w');
        const stderr = FS.open('/dev/stderr', 'w');
    },
    ensureErrnoError: function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
                this.errno = errno;
            };
            this.setErrno(errno);
            this.message = 'FS error';
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach(function (code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = '<generic error, no stack>';
        });
    },
    staticInit: function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = { MEMFS: MEMFS };
    },
    init: function (input, output, error) {
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
    },
    quit: function () {
        FS.init.initialized = false;
        const fflush = Module['_fflush'];
        if (fflush) fflush(0);
        for (let i = 0; i < FS.streams.length; i++) {
            const stream = FS.streams[i];
            if (!stream) {
                continue;
            }
            FS.close(stream);
        }
    },
    getMode: function (canRead, canWrite) {
        let mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
    },
    joinPath: function (parts, forceRelative) {
        let path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
    },
    absolutePath: function (relative, base) {
        return PATH_FS.resolve(base, relative);
    },
    standardizePath: function (path) {
        return PATH.normalize(path);
    },
    findObject: function (path, dontResolveLastLink) {
        const ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object;
        } else {
            setErrNo(ret.error);
            return null;
        }
    },
    analyzePath: function (path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
        } catch (e) {}
        const ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null,
        };
        try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === '/';
        } catch (e) {
            ret.error = e.errno;
        }
        return ret;
    },
    createFolder: function (parent, name, canRead, canWrite) {
        const path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        const mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
    },
    createPath: function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        const parts = path.split('/').reverse();
        while (parts.length) {
            const part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current);
            } catch (e) {}
            parent = current;
        }
        return current;
    },
    createFile: function (parent, name, properties, canRead, canWrite) {
        const path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        const mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
    },
    createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
        const path = name
            ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
            : parent;
        const mode = FS.getMode(canRead, canWrite);
        const node = FS.create(path, mode);
        if (data) {
            if (typeof data === 'string') {
                const arr = new Array(data.length);
                for (let i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr;
            }
            FS.chmod(node, mode | 146);
            const stream = FS.open(node, 'w');
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
        }
        return node;
    },
    createDevice: function (parent, name, input, output) {
        const path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        const mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        const dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function (stream) {
                stream.seekable = false;
            },
            close: function (stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10);
                }
            },
            read: function (stream, buffer, offset, length, pos) {
                let bytesRead = 0;
                for (let i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input();
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result;
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now();
                }
                return bytesRead;
            },
            write: function (stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i]);
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now();
                }
                return i;
            },
        });
        return FS.mkdev(path, mode, dev);
    },
    createLink: function (parent, name, target, canRead, canWrite) {
        const path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
    },
    forceLoadFile: function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        let success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
            throw new Error(
                'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.',
            );
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length;
            } catch (e) {
                success = false;
            }
        } else {
            throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) setErrNo(29);
        return success;
    },
    createLazyFile: function (parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined;
            }
            const chunkOffset = idx % this.chunkSize;
            const chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
            let datalength = Number(xhr.getResponseHeader('Content-length'));
            let header;
            const hasByteServing =
                (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
            const usesGzip =
                (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
            let chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            const doXHR = function (from, to) {
                if (from > to)
                    throw new Error(
                        'invalid range (' + from + ', ' + to + ') or no bytes requested!',
                    );
                if (to > datalength - 1)
                    throw new Error('only ' + datalength + ' bytes available! programmer error!');
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize)
                    xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                    throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || []);
                } else {
                    return intArrayFromString(xhr.responseText || '', true);
                }
            };
            const lazyArray = this;
            lazyArray.setDataGetter(function (chunkNum) {
                const start = chunkNum * chunkSize;
                let end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
                    lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof lazyArray.chunks[chunkNum] === 'undefined')
                    throw new Error('doXHR failed!');
                return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                out('LazyFiles on gzip forces download of the whole file when length is accessed');
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest !== 'undefined') {
            if (!ENVIRONMENT_IS_WORKER)
                throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
            const lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
                length: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._length;
                    },
                },
                chunkSize: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._chunkSize;
                    },
                },
            });
            var properties = { isDevice: false, contents: lazyArray };
        } else {
            var properties = { isDevice: false, url: url };
        }
        const node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents;
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function () {
                    return this.contents.length;
                },
            },
        });
        const stream_ops = {};
        const keys = Object.keys(node.stream_ops);
        keys.forEach(function (key) {
            const fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                if (!FS.forceLoadFile(node)) {
                    throw new FS.ErrnoError(29);
                }
                return fn.apply(null, arguments);
            };
        });
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(29);
            }
            const contents = stream.node.contents;
            if (position >= contents.length) return 0;
            const size = Math.min(contents.length - position, length);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i];
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i);
                }
            }
            return size;
        };
        node.stream_ops = stream_ops;
        return node;
    },
    createPreloadedFile: function (
        parent,
        name,
        url,
        canRead,
        canWrite,
        onload,
        onerror,
        dontCreateFile,
        canOwn,
        preFinish,
    ) {
        Browser.init();
        const fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        const dep = getUniqueRunDependency('cp ' + fullname);
        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
                }
                if (onload) onload();
                removeRunDependency(dep);
            }
            let handled = false;
            Module['preloadPlugins'].forEach(function (plugin) {
                if (handled) return;
                if (plugin['canHandle'](fullname)) {
                    plugin['handle'](byteArray, fullname, finish, function () {
                        if (onerror) onerror();
                        removeRunDependency(dep);
                    });
                    handled = true;
                }
            });
            if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
            Browser.asyncLoad(
                url,
                function (byteArray) {
                    processData(byteArray);
                },
                onerror,
            );
        } else {
            processData(url);
        }
    },
    indexedDB: function () {
        return (
            window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
        );
    },
    DB_NAME: function () {
        return 'EM_FS_' + window.location.pathname;
    },
    DB_VERSION: 20,
    DB_STORE_NAME: 'FILE_DATA',
    saveFilesToDB: function (paths, onload, onerror) {
        onload = onload || function () {};
        onerror = onerror || function () {};
        const indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            out('creating db');
            const db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
            const db = openRequest.result;
            const transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
            const files = transaction.objectStore(FS.DB_STORE_NAME);
            let ok = 0,
                fail = 0,
                total = paths.length;
            function finish() {
                if (fail == 0) onload();
                else onerror();
            }
            paths.forEach(function (path) {
                const putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function putRequest_onsuccess() {
                    ok++;
                    if (ok + fail == total) finish();
                };
                putRequest.onerror = function putRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish();
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    },
    loadFilesFromDB: function (paths, onload, onerror) {
        onload = onload || function () {};
        onerror = onerror || function () {};
        const indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
            const db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
            } catch (e) {
                onerror(e);
                return;
            }
            const files = transaction.objectStore(FS.DB_STORE_NAME);
            let ok = 0,
                fail = 0,
                total = paths.length;
            function finish() {
                if (fail == 0) onload();
                else onerror();
            }
            paths.forEach(function (path) {
                const getRequest = files.get(path);
                getRequest.onsuccess = function getRequest_onsuccess() {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path);
                    }
                    FS.createDataFile(
                        PATH.dirname(path),
                        PATH.basename(path),
                        getRequest.result,
                        true,
                        true,
                        true,
                    );
                    ok++;
                    if (ok + fail == total) finish();
                };
                getRequest.onerror = function getRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish();
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    },
};
var SYSCALLS = {
    mappings: {},
    DEFAULT_POLLMASK: 5,
    umask: 511,
    calculateAt: function (dirfd, path) {
        if (path[0] !== '/') {
            let dir;
            if (dirfd === -100) {
                dir = FS.cwd();
            } else {
                const dirstream = FS.getStream(dirfd);
                if (!dirstream) throw new FS.ErrnoError(8);
                dir = dirstream.path;
            }
            path = PATH.join2(dir, path);
        }
        return path;
    },
    doStat: function (func, path, buf) {
        try {
            var stat = func(path);
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -54;
            }
            throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[(buf + 4) >> 2] = 0;
        HEAP32[(buf + 8) >> 2] = stat.ino;
        HEAP32[(buf + 12) >> 2] = stat.mode;
        HEAP32[(buf + 16) >> 2] = stat.nlink;
        HEAP32[(buf + 20) >> 2] = stat.uid;
        HEAP32[(buf + 24) >> 2] = stat.gid;
        HEAP32[(buf + 28) >> 2] = stat.rdev;
        HEAP32[(buf + 32) >> 2] = 0;
        (tempI64 = [
            stat.size >>> 0,
            ((tempDouble = stat.size),
            +Math_abs(tempDouble) >= 1
                ? tempDouble > 0
                    ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                    : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                : 0),
        ]),
            (HEAP32[(buf + 40) >> 2] = tempI64[0]),
            (HEAP32[(buf + 44) >> 2] = tempI64[1]);
        HEAP32[(buf + 48) >> 2] = 4096;
        HEAP32[(buf + 52) >> 2] = stat.blocks;
        HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
        HEAP32[(buf + 60) >> 2] = 0;
        HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
        HEAP32[(buf + 68) >> 2] = 0;
        HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
        HEAP32[(buf + 76) >> 2] = 0;
        (tempI64 = [
            stat.ino >>> 0,
            ((tempDouble = stat.ino),
            +Math_abs(tempDouble) >= 1
                ? tempDouble > 0
                    ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                    : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                : 0),
        ]),
            (HEAP32[(buf + 80) >> 2] = tempI64[0]),
            (HEAP32[(buf + 84) >> 2] = tempI64[1]);
        return 0;
    },
    doMsync: function (addr, stream, len, flags, offset) {
        const buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
    },
    doMkdir: function (path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
    },
    doMknod: function (path, mode, dev) {
        switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
                break;
            default:
                return -28;
        }
        FS.mknod(path, mode, dev);
        return 0;
    },
    doReadlink: function (path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        const ret = FS.readlink(path);
        const len = Math.min(bufsize, lengthBytesUTF8(ret));
        const endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
    },
    doAccess: function (path, amode) {
        if (amode & ~7) {
            return -28;
        }
        let node;
        const lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        if (!node) {
            return -44;
        }
        let perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms && FS.nodePermissions(node, perms)) {
            return -2;
        }
        return 0;
    },
    doDup: function (path, flags, suggestFD) {
        const suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
    },
    doReadv: function (stream, iov, iovcnt, offset) {
        let ret = 0;
        for (let i = 0; i < iovcnt; i++) {
            const ptr = HEAP32[(iov + i * 8) >> 2];
            const len = HEAP32[(iov + (i * 8 + 4)) >> 2];
            const curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
            if (curr < len) break;
        }
        return ret;
    },
    doWritev: function (stream, iov, iovcnt, offset) {
        let ret = 0;
        for (let i = 0; i < iovcnt; i++) {
            const ptr = HEAP32[(iov + i * 8) >> 2];
            const len = HEAP32[(iov + (i * 8 + 4)) >> 2];
            const curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
        }
        return ret;
    },
    varargs: undefined,
    get: function () {
        SYSCALLS.varargs += 4;
        const ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
    },
    getStr: function (ptr) {
        const ret = UTF8ToString(ptr);
        return ret;
    },
    getStreamFromFD: function (fd) {
        const stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
    },
    get64: function (low, high) {
        return low;
    },
};
function syscallMunmap(addr, len) {
    if ((addr | 0) === -1 || len === 0) {
        return -28;
    }
    const info = SYSCALLS.mappings[addr];
    if (!info) return 0;
    if (len === info.len) {
        const stream = FS.getStream(info.fd);
        if (info.prot & 2) {
            SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
        }
        FS.munmap(stream);
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
            _free(info.malloc);
        }
    }
    return 0;
}
function ___sys_munmap(addr, len) {
    try {
        return syscallMunmap(addr, len);
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno;
    }
}
function ___sys_open(path, flags, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        const pathname = SYSCALLS.getStr(path);
        const mode = SYSCALLS.get();
        const stream = FS.open(pathname, flags, mode);
        return stream.fd;
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno;
    }
}
function ___sys_read(fd, buf, count) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        return FS.read(stream, HEAP8, buf, count);
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno;
    }
}
function _abort() {
    abort();
}
let _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function () {
        const t = process['hrtime']();
        return t[0] * 1e3 + t[1] / 1e6;
    };
} else if (typeof dateNow !== 'undefined') {
    _emscripten_get_now = dateNow;
} else
    _emscripten_get_now = function () {
        return performance.now();
    };
const _emscripten_get_now_is_monotonic = true;
function _clock_gettime(clk_id, tp) {
    let now;
    if (clk_id === 0) {
        now = Date.now();
    } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
    } else {
        setErrNo(28);
        return -1;
    }
    HEAP32[tp >> 2] = (now / 1e3) | 0;
    HEAP32[(tp + 4) >> 2] = ((now % 1e3) * 1e3 * 1e3) | 0;
    return 0;
}
function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num);
}
function _emscripten_get_heap_size() {
    return HEAPU8.length;
}
function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
    } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
    requestedSize = requestedSize >>> 0;
    const oldSize = _emscripten_get_heap_size();
    const PAGE_MULTIPLE = 65536;
    const maxHeapSize = 2147483648;
    if (requestedSize > maxHeapSize) {
        return false;
    }
    const minHeapSize = 16777216;
    for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
        let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        const newSize = Math.min(
            maxHeapSize,
            alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), PAGE_MULTIPLE),
        );
        const replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true;
        }
    }
    return false;
}
const ENV = {};
function __getExecutableName() {
    return thisProgram || './this.program';
}
function getEnvStrings() {
    if (!getEnvStrings.strings) {
        const env = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG:
                (
                    (typeof navigator === 'object' &&
                        navigator.languages &&
                        navigator.languages[0]) ||
                    'C'
                ).replace('-', '_') + '.UTF-8',
            _: __getExecutableName(),
        };
        for (var x in ENV) {
            env[x] = ENV[x];
        }
        const strings = [];
        for (var x in env) {
            strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
    let bufSize = 0;
    getEnvStrings().forEach(function (string, i) {
        const ptr = environ_buf + bufSize;
        HEAP32[(__environ + i * 4) >> 2] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
    });
    return 0;
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
    const strings = getEnvStrings();
    HEAP32[penviron_count >> 2] = strings.length;
    let bufSize = 0;
    strings.forEach(function (string) {
        bufSize += string.length + 1;
    });
    HEAP32[penviron_buf_size >> 2] = bufSize;
    return 0;
}
function _fd_close(fd) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno;
    }
}
function _fd_read(fd, iov, iovcnt, pnum) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        const num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno;
    }
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        const HIGH_OFFSET = 4294967296;
        const offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        const DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return -61;
        }
        FS.llseek(stream, offset, whence);
        (tempI64 = [
            stream.position >>> 0,
            ((tempDouble = stream.position),
            +Math_abs(tempDouble) >= 1
                ? tempDouble > 0
                    ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                    : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                : 0),
        ]),
            (HEAP32[newOffset >> 2] = tempI64[0]),
            (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0;
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno;
    }
}
function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        const num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno;
    }
}
function _getTempRet0() {
    return getTempRet0() | 0;
}
function _llvm_eh_typeid_for(type) {
    return type;
}
function _tzset() {
    if (_tzset.called) return;
    _tzset.called = true;
    HEAP32[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;
    const currentYear = new Date().getFullYear();
    const winter = new Date(currentYear, 0, 1);
    const summer = new Date(currentYear, 6, 1);
    HEAP32[__get_daylight() >> 2] = Number(
        winter.getTimezoneOffset() != summer.getTimezoneOffset(),
    );
    function extractZone(date) {
        const match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : 'GMT';
    }
    const winterName = extractZone(winter);
    const summerName = extractZone(summer);
    const winterNamePtr = allocateUTF8(winterName);
    const summerNamePtr = allocateUTF8(summerName);
    if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[(__get_tzname() + 4) >> 2] = summerNamePtr;
    } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[(__get_tzname() + 4) >> 2] = winterNamePtr;
    }
}
function _mktime(tmPtr) {
    _tzset();
    const date = new Date(
        HEAP32[(tmPtr + 20) >> 2] + 1900,
        HEAP32[(tmPtr + 16) >> 2],
        HEAP32[(tmPtr + 12) >> 2],
        HEAP32[(tmPtr + 8) >> 2],
        HEAP32[(tmPtr + 4) >> 2],
        HEAP32[tmPtr >> 2],
        0,
    );
    const dst = HEAP32[(tmPtr + 32) >> 2];
    const guessedOffset = date.getTimezoneOffset();
    const start = new Date(date.getFullYear(), 0, 1);
    const summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    const winterOffset = start.getTimezoneOffset();
    const dstOffset = Math.min(winterOffset, summerOffset);
    if (dst < 0) {
        HEAP32[(tmPtr + 32) >> 2] = Number(
            summerOffset != winterOffset && dstOffset == guessedOffset,
        );
    } else if (dst > 0 != (dstOffset == guessedOffset)) {
        const nonDstOffset = Math.max(winterOffset, summerOffset);
        const trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    }
    HEAP32[(tmPtr + 24) >> 2] = date.getDay();
    const yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0;
    HEAP32[(tmPtr + 28) >> 2] = yday;
    return (date.getTime() / 1e3) | 0;
}
function _round(d) {
    d = +d;
    return d >= +0 ? +Math_floor(d + +0.5) : +Math_ceil(d - +0.5);
}
function _roundf(d) {
    d = +d;
    return d >= +0 ? +Math_floor(d + +0.5) : +Math_ceil(d - +0.5);
}
function _setTempRet0($i) {
    setTempRet0($i | 0);
}
function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
    let sum = 0;
    for (let i = 0; i <= index; sum += array[i++]) {}
    return sum;
}
const __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
    const newDate = new Date(date.getTime());
    while (days > 0) {
        const leap = __isLeapYear(newDate.getFullYear());
        const currentMonth = newDate.getMonth();
        const daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1);
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1);
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        }
    }
    return newDate;
}
function _strftime(s, maxsize, format, tm) {
    const tm_zone = HEAP32[(tm + 40) >> 2];
    const date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[(tm + 4) >> 2],
        tm_hour: HEAP32[(tm + 8) >> 2],
        tm_mday: HEAP32[(tm + 12) >> 2],
        tm_mon: HEAP32[(tm + 16) >> 2],
        tm_year: HEAP32[(tm + 20) >> 2],
        tm_wday: HEAP32[(tm + 24) >> 2],
        tm_yday: HEAP32[(tm + 28) >> 2],
        tm_isdst: HEAP32[(tm + 32) >> 2],
        tm_gmtoff: HEAP32[(tm + 36) >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
    };
    let pattern = UTF8ToString(format);
    const EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',
        '%D': '%m/%d/%y',
        '%F': '%Y-%m-%d',
        '%h': '%b',
        '%r': '%I:%M:%S %p',
        '%R': '%H:%M',
        '%T': '%H:%M:%S',
        '%x': '%m/%d/%y',
        '%X': '%H:%M:%S',
        '%Ec': '%c',
        '%EC': '%C',
        '%Ex': '%m/%d/%y',
        '%EX': '%H:%M:%S',
        '%Ey': '%y',
        '%EY': '%Y',
        '%Od': '%d',
        '%Oe': '%e',
        '%OH': '%H',
        '%OI': '%I',
        '%Om': '%m',
        '%OM': '%M',
        '%OS': '%S',
        '%Ou': '%u',
        '%OU': '%U',
        '%OV': '%V',
        '%Ow': '%w',
        '%OW': '%W',
        '%Oy': '%y',
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
    }
    const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    function leadingSomething(value, digits, character) {
        let str = typeof value === 'number' ? value.toString() : value || '';
        while (str.length < digits) {
            str = character[0] + str;
        }
        return str;
    }
    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
    }
    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
        }
        let compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate());
            }
        }
        return compare;
    }
    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30);
        }
    }
    function getWeekBasedYear(date) {
        const thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        const janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        const janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        const firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        const firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1;
            } else {
                return thisDate.getFullYear();
            }
        } else {
            return thisDate.getFullYear() - 1;
        }
    }
    const EXPANSION_RULES_2 = {
        '%a': function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3);
        },
        '%A': function (date) {
            return WEEKDAYS[date.tm_wday];
        },
        '%b': function (date) {
            return MONTHS[date.tm_mon].substring(0, 3);
        },
        '%B': function (date) {
            return MONTHS[date.tm_mon];
        },
        '%C': function (date) {
            const year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2);
        },
        '%d': function (date) {
            return leadingNulls(date.tm_mday, 2);
        },
        '%e': function (date) {
            return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function (date) {
            return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function (date) {
            return getWeekBasedYear(date);
        },
        '%H': function (date) {
            return leadingNulls(date.tm_hour, 2);
        },
        '%I': function (date) {
            let twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2);
        },
        '%j': function (date) {
            return leadingNulls(
                date.tm_mday +
                    __arraySum(
                        __isLeapYear(date.tm_year + 1900)
                            ? __MONTH_DAYS_LEAP
                            : __MONTH_DAYS_REGULAR,
                        date.tm_mon - 1,
                    ),
                3,
            );
        },
        '%m': function (date) {
            return leadingNulls(date.tm_mon + 1, 2);
        },
        '%M': function (date) {
            return leadingNulls(date.tm_min, 2);
        },
        '%n': function () {
            return '\n';
        },
        '%p': function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return 'AM';
            } else {
                return 'PM';
            }
        },
        '%S': function (date) {
            return leadingNulls(date.tm_sec, 2);
        },
        '%t': function () {
            return '\t';
        },
        '%u': function (date) {
            return date.tm_wday || 7;
        },
        '%U': function (date) {
            const janFirst = new Date(date.tm_year + 1900, 0, 1);
            const firstSunday =
                janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            const endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                const februaryFirstUntilEndMonth =
                    __arraySum(
                        __isLeapYear(endDate.getFullYear())
                            ? __MONTH_DAYS_LEAP
                            : __MONTH_DAYS_REGULAR,
                        endDate.getMonth() - 1,
                    ) - 31;
                const firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                const days =
                    firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2);
            }
            return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00';
        },
        '%V': function (date) {
            const janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
            const janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
            const firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            const firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            const endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return '53';
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return '01';
            }
            let daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2);
        },
        '%w': function (date) {
            return date.tm_wday;
        },
        '%W': function (date) {
            const janFirst = new Date(date.tm_year, 0, 1);
            const firstMonday =
                janFirst.getDay() === 1
                    ? janFirst
                    : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            const endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                const februaryFirstUntilEndMonth =
                    __arraySum(
                        __isLeapYear(endDate.getFullYear())
                            ? __MONTH_DAYS_LEAP
                            : __MONTH_DAYS_REGULAR,
                        endDate.getMonth() - 1,
                    ) - 31;
                const firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                const days =
                    firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2);
            }
            return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00';
        },
        '%y': function (date) {
            return (date.tm_year + 1900).toString().substring(2);
        },
        '%Y': function (date) {
            return date.tm_year + 1900;
        },
        '%z': function (date) {
            let off = date.tm_gmtoff;
            const ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
        },
        '%Z': function (date) {
            return date.tm_zone;
        },
        '%%': function () {
            return '%';
        },
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
    }
    const bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0;
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
    return _strftime(s, maxsize, format, tm);
}
const FSNode = function (parent, name, mode, rdev) {
    if (!parent) {
        parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
};
const readMode = 292 | 73;
const writeMode = 146;
Object.defineProperties(FSNode.prototype, {
    read: {
        get: function () {
            return (this.mode & readMode) === readMode;
        },
        set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
        },
    },
    write: {
        get: function () {
            return (this.mode & writeMode) === writeMode;
        },
        set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
        },
    },
    isFolder: {
        get: function () {
            return FS.isDir(this.mode);
        },
    },
    isDevice: {
        get: function () {
            return FS.isChrdev(this.mode);
        },
    },
});
FS.FSNode = FSNode;
FS.staticInit();
function intArrayFromString(stringy, dontAddNull, length) {
    const len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    const u8array = new Array(len);
    const numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
}
var asmLibraryArg = {
    x: ___assert_fail,
    p: ___cxa_allocate_exception,
    m: ___cxa_begin_catch,
    o: ___cxa_end_catch,
    ua: ___cxa_find_matching_catch_17,
    b: ___cxa_find_matching_catch_2,
    h: ___cxa_find_matching_catch_3,
    T: ___cxa_find_matching_catch_4,
    ta: ___cxa_find_matching_catch_6,
    q: ___cxa_free_exception,
    S: ___cxa_rethrow,
    z: ___cxa_throw,
    qa: ___cxa_uncaught_exceptions,
    la: ___map_file,
    e: ___resumeException,
    ka: ___sys_munmap,
    ia: ___sys_open,
    ha: ___sys_read,
    ga: _abort,
    ra: _clock_gettime,
    ea: _emscripten_memcpy_big,
    fa: _emscripten_resize_heap,
    ma: _environ_get,
    na: _environ_sizes_get,
    M: _fd_close,
    oa: _fd_read,
    W: _fd_seek,
    N: _fd_write,
    a: _getTempRet0,
    Ba: invoke_dd,
    B: invoke_di,
    za: invoke_did,
    O: invoke_didi,
    wa: invoke_dii,
    E: invoke_diii,
    R: invoke_fi,
    F: invoke_fii,
    L: invoke_fiii,
    r: invoke_i,
    Q: invoke_id,
    Aa: invoke_if,
    f: invoke_ii,
    Ca: invoke_iid,
    c: invoke_iii,
    i: invoke_iiii,
    va: invoke_iiiidd,
    n: invoke_iiiii,
    pa: invoke_iiiiid,
    s: invoke_iiiiii,
    A: invoke_iiiiiii,
    K: invoke_iiiiiiii,
    J: invoke_iiiiiiiiiiii,
    U: invoke_iiiiij,
    ba: invoke_ij,
    Z: invoke_iji,
    _: invoke_ijii,
    $: invoke_ijiij,
    ca: invoke_ji,
    V: invoke_jii,
    Y: invoke_jiii,
    aa: invoke_jiiii,
    k: invoke_v,
    l: invoke_vi,
    H: invoke_vid,
    d: invoke_vii,
    xa: invoke_viid,
    ya: invoke_viidi,
    P: invoke_viif,
    g: invoke_viii,
    j: invoke_viiii,
    u: invoke_viiiii,
    C: invoke_viiiiii,
    y: invoke_viiiiiii,
    D: invoke_viiiiiiiiii,
    I: invoke_viiiiiiiiiiiiiii,
    X: invoke_viiji,
    da: invoke_viijii,
    t: _llvm_eh_typeid_for,
    memory: wasmMemory,
    sa: _mktime,
    v: _round,
    w: _roundf,
    G: _setTempRet0,
    ja: _strftime_l,
    table: wasmTable,
};
const asm = createWasm();
Module['asm'] = asm;
var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
    return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Da']).apply(
        null,
        arguments,
    );
});
var _openmpt_get_library_version = (Module['_openmpt_get_library_version'] = function () {
    return (_openmpt_get_library_version = Module['_openmpt_get_library_version'] =
        Module['asm']['Ea']).apply(null, arguments);
});
var _openmpt_get_core_version = (Module['_openmpt_get_core_version'] = function () {
    return (_openmpt_get_core_version = Module['_openmpt_get_core_version'] =
        Module['asm']['Fa']).apply(null, arguments);
});
var _openmpt_free_string = (Module['_openmpt_free_string'] = function () {
    return (_openmpt_free_string = Module['_openmpt_free_string'] = Module['asm']['Ga']).apply(
        null,
        arguments,
    );
});
var _free = (Module['_free'] = function () {
    return (_free = Module['_free'] = Module['asm']['Ha']).apply(null, arguments);
});
var _openmpt_get_string = (Module['_openmpt_get_string'] = function () {
    return (_openmpt_get_string = Module['_openmpt_get_string'] = Module['asm']['Ia']).apply(
        null,
        arguments,
    );
});
var _openmpt_get_supported_extensions = (Module['_openmpt_get_supported_extensions'] = function () {
    return (_openmpt_get_supported_extensions = Module['_openmpt_get_supported_extensions'] =
        Module['asm']['Ja']).apply(null, arguments);
});
var _openmpt_is_extension_supported = (Module['_openmpt_is_extension_supported'] = function () {
    return (_openmpt_is_extension_supported = Module['_openmpt_is_extension_supported'] =
        Module['asm']['Ka']).apply(null, arguments);
});
var _openmpt_log_func_default = (Module['_openmpt_log_func_default'] = function () {
    return (_openmpt_log_func_default = Module['_openmpt_log_func_default'] =
        Module['asm']['La']).apply(null, arguments);
});
var _openmpt_log_func_silent = (Module['_openmpt_log_func_silent'] = function () {
    return (_openmpt_log_func_silent = Module['_openmpt_log_func_silent'] =
        Module['asm']['Ma']).apply(null, arguments);
});
var _openmpt_error_is_transient = (Module['_openmpt_error_is_transient'] = function () {
    return (_openmpt_error_is_transient = Module['_openmpt_error_is_transient'] =
        Module['asm']['Na']).apply(null, arguments);
});
var _openmpt_error_string = (Module['_openmpt_error_string'] = function () {
    return (_openmpt_error_string = Module['_openmpt_error_string'] = Module['asm']['Oa']).apply(
        null,
        arguments,
    );
});
var _openmpt_error_func_default = (Module['_openmpt_error_func_default'] = function () {
    return (_openmpt_error_func_default = Module['_openmpt_error_func_default'] =
        Module['asm']['Pa']).apply(null, arguments);
});
var _openmpt_error_func_log = (Module['_openmpt_error_func_log'] = function () {
    return (_openmpt_error_func_log = Module['_openmpt_error_func_log'] =
        Module['asm']['Qa']).apply(null, arguments);
});
var _openmpt_error_func_store = (Module['_openmpt_error_func_store'] = function () {
    return (_openmpt_error_func_store = Module['_openmpt_error_func_store'] =
        Module['asm']['Ra']).apply(null, arguments);
});
var _openmpt_error_func_ignore = (Module['_openmpt_error_func_ignore'] = function () {
    return (_openmpt_error_func_ignore = Module['_openmpt_error_func_ignore'] =
        Module['asm']['Sa']).apply(null, arguments);
});
var _openmpt_error_func_errno = (Module['_openmpt_error_func_errno'] = function () {
    return (_openmpt_error_func_errno = Module['_openmpt_error_func_errno'] =
        Module['asm']['Ta']).apply(null, arguments);
});
var _openmpt_error_func_errno_userdata = (Module['_openmpt_error_func_errno_userdata'] =
    function () {
        return (_openmpt_error_func_errno_userdata = Module['_openmpt_error_func_errno_userdata'] =
            Module['asm']['Ua']).apply(null, arguments);
    });
var _openmpt_could_open_probability = (Module['_openmpt_could_open_probability'] = function () {
    return (_openmpt_could_open_probability = Module['_openmpt_could_open_probability'] =
        Module['asm']['Va']).apply(null, arguments);
});
var _openmpt_could_open_probability2 = (Module['_openmpt_could_open_probability2'] = function () {
    return (_openmpt_could_open_probability2 = Module['_openmpt_could_open_probability2'] =
        Module['asm']['Wa']).apply(null, arguments);
});
var _openmpt_could_open_propability = (Module['_openmpt_could_open_propability'] = function () {
    return (_openmpt_could_open_propability = Module['_openmpt_could_open_propability'] =
        Module['asm']['Xa']).apply(null, arguments);
});
var _openmpt_probe_file_header_get_recommended_size = (Module[
    '_openmpt_probe_file_header_get_recommended_size'
] = function () {
    return (_openmpt_probe_file_header_get_recommended_size = Module[
        '_openmpt_probe_file_header_get_recommended_size'
    ] =
        Module['asm']['Ya']).apply(null, arguments);
});
var _openmpt_probe_file_header = (Module['_openmpt_probe_file_header'] = function () {
    return (_openmpt_probe_file_header = Module['_openmpt_probe_file_header'] =
        Module['asm']['Za']).apply(null, arguments);
});
var _openmpt_probe_file_header_without_filesize = (Module[
    '_openmpt_probe_file_header_without_filesize'
] = function () {
    return (_openmpt_probe_file_header_without_filesize = Module[
        '_openmpt_probe_file_header_without_filesize'
    ] =
        Module['asm']['_a']).apply(null, arguments);
});
var _openmpt_probe_file_header_from_stream = (Module['_openmpt_probe_file_header_from_stream'] =
    function () {
        return (_openmpt_probe_file_header_from_stream = Module[
            '_openmpt_probe_file_header_from_stream'
        ] =
            Module['asm']['$a']).apply(null, arguments);
    });
var _openmpt_module_create = (Module['_openmpt_module_create'] = function () {
    return (_openmpt_module_create = Module['_openmpt_module_create'] = Module['asm']['ab']).apply(
        null,
        arguments,
    );
});
var _openmpt_module_create2 = (Module['_openmpt_module_create2'] = function () {
    return (_openmpt_module_create2 = Module['_openmpt_module_create2'] =
        Module['asm']['bb']).apply(null, arguments);
});
var _openmpt_module_create_from_memory = (Module['_openmpt_module_create_from_memory'] =
    function () {
        return (_openmpt_module_create_from_memory = Module['_openmpt_module_create_from_memory'] =
            Module['asm']['cb']).apply(null, arguments);
    });
var _openmpt_module_create_from_memory2 = (Module['_openmpt_module_create_from_memory2'] =
    function () {
        return (_openmpt_module_create_from_memory2 = Module[
            '_openmpt_module_create_from_memory2'
        ] =
            Module['asm']['db']).apply(null, arguments);
    });
var _openmpt_module_destroy = (Module['_openmpt_module_destroy'] = function () {
    return (_openmpt_module_destroy = Module['_openmpt_module_destroy'] =
        Module['asm']['eb']).apply(null, arguments);
});
var _openmpt_module_set_log_func = (Module['_openmpt_module_set_log_func'] = function () {
    return (_openmpt_module_set_log_func = Module['_openmpt_module_set_log_func'] =
        Module['asm']['fb']).apply(null, arguments);
});
var _openmpt_module_set_error_func = (Module['_openmpt_module_set_error_func'] = function () {
    return (_openmpt_module_set_error_func = Module['_openmpt_module_set_error_func'] =
        Module['asm']['gb']).apply(null, arguments);
});
var _openmpt_module_error_get_last = (Module['_openmpt_module_error_get_last'] = function () {
    return (_openmpt_module_error_get_last = Module['_openmpt_module_error_get_last'] =
        Module['asm']['hb']).apply(null, arguments);
});
var _openmpt_module_error_get_last_message = (Module['_openmpt_module_error_get_last_message'] =
    function () {
        return (_openmpt_module_error_get_last_message = Module[
            '_openmpt_module_error_get_last_message'
        ] =
            Module['asm']['ib']).apply(null, arguments);
    });
var _openmpt_module_error_set_last = (Module['_openmpt_module_error_set_last'] = function () {
    return (_openmpt_module_error_set_last = Module['_openmpt_module_error_set_last'] =
        Module['asm']['jb']).apply(null, arguments);
});
var _openmpt_module_error_clear = (Module['_openmpt_module_error_clear'] = function () {
    return (_openmpt_module_error_clear = Module['_openmpt_module_error_clear'] =
        Module['asm']['kb']).apply(null, arguments);
});
var _openmpt_module_select_subsong = (Module['_openmpt_module_select_subsong'] = function () {
    return (_openmpt_module_select_subsong = Module['_openmpt_module_select_subsong'] =
        Module['asm']['lb']).apply(null, arguments);
});
var _openmpt_module_get_selected_subsong = (Module['_openmpt_module_get_selected_subsong'] =
    function () {
        return (_openmpt_module_get_selected_subsong = Module[
            '_openmpt_module_get_selected_subsong'
        ] =
            Module['asm']['mb']).apply(null, arguments);
    });
var _openmpt_module_set_repeat_count = (Module['_openmpt_module_set_repeat_count'] = function () {
    return (_openmpt_module_set_repeat_count = Module['_openmpt_module_set_repeat_count'] =
        Module['asm']['nb']).apply(null, arguments);
});
var _openmpt_module_get_repeat_count = (Module['_openmpt_module_get_repeat_count'] = function () {
    return (_openmpt_module_get_repeat_count = Module['_openmpt_module_get_repeat_count'] =
        Module['asm']['ob']).apply(null, arguments);
});
var _openmpt_module_get_duration_seconds = (Module['_openmpt_module_get_duration_seconds'] =
    function () {
        return (_openmpt_module_get_duration_seconds = Module[
            '_openmpt_module_get_duration_seconds'
        ] =
            Module['asm']['pb']).apply(null, arguments);
    });
var _openmpt_module_set_position_seconds = (Module['_openmpt_module_set_position_seconds'] =
    function () {
        return (_openmpt_module_set_position_seconds = Module[
            '_openmpt_module_set_position_seconds'
        ] =
            Module['asm']['qb']).apply(null, arguments);
    });
var _openmpt_module_get_position_seconds = (Module['_openmpt_module_get_position_seconds'] =
    function () {
        return (_openmpt_module_get_position_seconds = Module[
            '_openmpt_module_get_position_seconds'
        ] =
            Module['asm']['rb']).apply(null, arguments);
    });
var _openmpt_module_set_position_order_row = (Module['_openmpt_module_set_position_order_row'] =
    function () {
        return (_openmpt_module_set_position_order_row = Module[
            '_openmpt_module_set_position_order_row'
        ] =
            Module['asm']['sb']).apply(null, arguments);
    });
var _openmpt_module_get_render_param = (Module['_openmpt_module_get_render_param'] = function () {
    return (_openmpt_module_get_render_param = Module['_openmpt_module_get_render_param'] =
        Module['asm']['tb']).apply(null, arguments);
});
var _openmpt_module_set_render_param = (Module['_openmpt_module_set_render_param'] = function () {
    return (_openmpt_module_set_render_param = Module['_openmpt_module_set_render_param'] =
        Module['asm']['ub']).apply(null, arguments);
});
var _openmpt_module_read_mono = (Module['_openmpt_module_read_mono'] = function () {
    return (_openmpt_module_read_mono = Module['_openmpt_module_read_mono'] =
        Module['asm']['vb']).apply(null, arguments);
});
var _openmpt_module_read_stereo = (Module['_openmpt_module_read_stereo'] = function () {
    return (_openmpt_module_read_stereo = Module['_openmpt_module_read_stereo'] =
        Module['asm']['wb']).apply(null, arguments);
});
var _openmpt_module_read_quad = (Module['_openmpt_module_read_quad'] = function () {
    return (_openmpt_module_read_quad = Module['_openmpt_module_read_quad'] =
        Module['asm']['xb']).apply(null, arguments);
});
var _openmpt_module_read_float_mono = (Module['_openmpt_module_read_float_mono'] = function () {
    return (_openmpt_module_read_float_mono = Module['_openmpt_module_read_float_mono'] =
        Module['asm']['yb']).apply(null, arguments);
});
var _openmpt_module_read_float_stereo = (Module['_openmpt_module_read_float_stereo'] = function () {
    return (_openmpt_module_read_float_stereo = Module['_openmpt_module_read_float_stereo'] =
        Module['asm']['zb']).apply(null, arguments);
});
var _openmpt_module_read_float_quad = (Module['_openmpt_module_read_float_quad'] = function () {
    return (_openmpt_module_read_float_quad = Module['_openmpt_module_read_float_quad'] =
        Module['asm']['Ab']).apply(null, arguments);
});
var _openmpt_module_read_interleaved_stereo = (Module['_openmpt_module_read_interleaved_stereo'] =
    function () {
        return (_openmpt_module_read_interleaved_stereo = Module[
            '_openmpt_module_read_interleaved_stereo'
        ] =
            Module['asm']['Bb']).apply(null, arguments);
    });
var _openmpt_module_read_interleaved_quad = (Module['_openmpt_module_read_interleaved_quad'] =
    function () {
        return (_openmpt_module_read_interleaved_quad = Module[
            '_openmpt_module_read_interleaved_quad'
        ] =
            Module['asm']['Cb']).apply(null, arguments);
    });
var _openmpt_module_read_interleaved_float_stereo = (Module[
    '_openmpt_module_read_interleaved_float_stereo'
] = function () {
    return (_openmpt_module_read_interleaved_float_stereo = Module[
        '_openmpt_module_read_interleaved_float_stereo'
    ] =
        Module['asm']['Db']).apply(null, arguments);
});
var _openmpt_module_read_interleaved_float_quad = (Module[
    '_openmpt_module_read_interleaved_float_quad'
] = function () {
    return (_openmpt_module_read_interleaved_float_quad = Module[
        '_openmpt_module_read_interleaved_float_quad'
    ] =
        Module['asm']['Eb']).apply(null, arguments);
});
var _openmpt_module_get_metadata_keys = (Module['_openmpt_module_get_metadata_keys'] = function () {
    return (_openmpt_module_get_metadata_keys = Module['_openmpt_module_get_metadata_keys'] =
        Module['asm']['Fb']).apply(null, arguments);
});
var _openmpt_module_get_metadata = (Module['_openmpt_module_get_metadata'] = function () {
    return (_openmpt_module_get_metadata = Module['_openmpt_module_get_metadata'] =
        Module['asm']['Gb']).apply(null, arguments);
});
var _openmpt_module_get_current_estimated_bpm = (Module[
    '_openmpt_module_get_current_estimated_bpm'
] = function () {
    return (_openmpt_module_get_current_estimated_bpm = Module[
        '_openmpt_module_get_current_estimated_bpm'
    ] =
        Module['asm']['Hb']).apply(null, arguments);
});
var _openmpt_module_get_current_speed = (Module['_openmpt_module_get_current_speed'] = function () {
    return (_openmpt_module_get_current_speed = Module['_openmpt_module_get_current_speed'] =
        Module['asm']['Ib']).apply(null, arguments);
});
var _openmpt_module_get_current_tempo = (Module['_openmpt_module_get_current_tempo'] = function () {
    return (_openmpt_module_get_current_tempo = Module['_openmpt_module_get_current_tempo'] =
        Module['asm']['Jb']).apply(null, arguments);
});
var _openmpt_module_get_current_order = (Module['_openmpt_module_get_current_order'] = function () {
    return (_openmpt_module_get_current_order = Module['_openmpt_module_get_current_order'] =
        Module['asm']['Kb']).apply(null, arguments);
});
var _openmpt_module_get_current_pattern = (Module['_openmpt_module_get_current_pattern'] =
    function () {
        return (_openmpt_module_get_current_pattern = Module[
            '_openmpt_module_get_current_pattern'
        ] =
            Module['asm']['Lb']).apply(null, arguments);
    });
var _openmpt_module_get_current_row = (Module['_openmpt_module_get_current_row'] = function () {
    return (_openmpt_module_get_current_row = Module['_openmpt_module_get_current_row'] =
        Module['asm']['Mb']).apply(null, arguments);
});
var _openmpt_module_get_current_playing_channels = (Module[
    '_openmpt_module_get_current_playing_channels'
] = function () {
    return (_openmpt_module_get_current_playing_channels = Module[
        '_openmpt_module_get_current_playing_channels'
    ] =
        Module['asm']['Nb']).apply(null, arguments);
});
var _openmpt_module_get_current_channel_vu_mono = (Module[
    '_openmpt_module_get_current_channel_vu_mono'
] = function () {
    return (_openmpt_module_get_current_channel_vu_mono = Module[
        '_openmpt_module_get_current_channel_vu_mono'
    ] =
        Module['asm']['Ob']).apply(null, arguments);
});
var _openmpt_module_get_current_channel_vu_left = (Module[
    '_openmpt_module_get_current_channel_vu_left'
] = function () {
    return (_openmpt_module_get_current_channel_vu_left = Module[
        '_openmpt_module_get_current_channel_vu_left'
    ] =
        Module['asm']['Pb']).apply(null, arguments);
});
var _openmpt_module_get_current_channel_vu_right = (Module[
    '_openmpt_module_get_current_channel_vu_right'
] = function () {
    return (_openmpt_module_get_current_channel_vu_right = Module[
        '_openmpt_module_get_current_channel_vu_right'
    ] =
        Module['asm']['Qb']).apply(null, arguments);
});
var _openmpt_module_get_current_channel_vu_rear_left = (Module[
    '_openmpt_module_get_current_channel_vu_rear_left'
] = function () {
    return (_openmpt_module_get_current_channel_vu_rear_left = Module[
        '_openmpt_module_get_current_channel_vu_rear_left'
    ] =
        Module['asm']['Rb']).apply(null, arguments);
});
var _openmpt_module_get_current_channel_vu_rear_right = (Module[
    '_openmpt_module_get_current_channel_vu_rear_right'
] = function () {
    return (_openmpt_module_get_current_channel_vu_rear_right = Module[
        '_openmpt_module_get_current_channel_vu_rear_right'
    ] =
        Module['asm']['Sb']).apply(null, arguments);
});
var _openmpt_module_get_num_subsongs = (Module['_openmpt_module_get_num_subsongs'] = function () {
    return (_openmpt_module_get_num_subsongs = Module['_openmpt_module_get_num_subsongs'] =
        Module['asm']['Tb']).apply(null, arguments);
});
var _openmpt_module_get_num_channels = (Module['_openmpt_module_get_num_channels'] = function () {
    return (_openmpt_module_get_num_channels = Module['_openmpt_module_get_num_channels'] =
        Module['asm']['Ub']).apply(null, arguments);
});
var _openmpt_module_get_num_orders = (Module['_openmpt_module_get_num_orders'] = function () {
    return (_openmpt_module_get_num_orders = Module['_openmpt_module_get_num_orders'] =
        Module['asm']['Vb']).apply(null, arguments);
});
var _openmpt_module_get_num_patterns = (Module['_openmpt_module_get_num_patterns'] = function () {
    return (_openmpt_module_get_num_patterns = Module['_openmpt_module_get_num_patterns'] =
        Module['asm']['Wb']).apply(null, arguments);
});
var _openmpt_module_get_num_instruments = (Module['_openmpt_module_get_num_instruments'] =
    function () {
        return (_openmpt_module_get_num_instruments = Module[
            '_openmpt_module_get_num_instruments'
        ] =
            Module['asm']['Xb']).apply(null, arguments);
    });
var _openmpt_module_get_num_samples = (Module['_openmpt_module_get_num_samples'] = function () {
    return (_openmpt_module_get_num_samples = Module['_openmpt_module_get_num_samples'] =
        Module['asm']['Yb']).apply(null, arguments);
});
var _openmpt_module_get_subsong_name = (Module['_openmpt_module_get_subsong_name'] = function () {
    return (_openmpt_module_get_subsong_name = Module['_openmpt_module_get_subsong_name'] =
        Module['asm']['Zb']).apply(null, arguments);
});
var _openmpt_module_get_channel_name = (Module['_openmpt_module_get_channel_name'] = function () {
    return (_openmpt_module_get_channel_name = Module['_openmpt_module_get_channel_name'] =
        Module['asm']['_b']).apply(null, arguments);
});
var _openmpt_module_get_order_name = (Module['_openmpt_module_get_order_name'] = function () {
    return (_openmpt_module_get_order_name = Module['_openmpt_module_get_order_name'] =
        Module['asm']['$b']).apply(null, arguments);
});
var _openmpt_module_get_pattern_name = (Module['_openmpt_module_get_pattern_name'] = function () {
    return (_openmpt_module_get_pattern_name = Module['_openmpt_module_get_pattern_name'] =
        Module['asm']['ac']).apply(null, arguments);
});
var _openmpt_module_get_instrument_name = (Module['_openmpt_module_get_instrument_name'] =
    function () {
        return (_openmpt_module_get_instrument_name = Module[
            '_openmpt_module_get_instrument_name'
        ] =
            Module['asm']['bc']).apply(null, arguments);
    });
var _openmpt_module_get_sample_name = (Module['_openmpt_module_get_sample_name'] = function () {
    return (_openmpt_module_get_sample_name = Module['_openmpt_module_get_sample_name'] =
        Module['asm']['cc']).apply(null, arguments);
});
var _openmpt_module_get_order_pattern = (Module['_openmpt_module_get_order_pattern'] = function () {
    return (_openmpt_module_get_order_pattern = Module['_openmpt_module_get_order_pattern'] =
        Module['asm']['dc']).apply(null, arguments);
});
var _openmpt_module_get_pattern_num_rows = (Module['_openmpt_module_get_pattern_num_rows'] =
    function () {
        return (_openmpt_module_get_pattern_num_rows = Module[
            '_openmpt_module_get_pattern_num_rows'
        ] =
            Module['asm']['ec']).apply(null, arguments);
    });
var _openmpt_module_get_pattern_row_channel_command = (Module[
    '_openmpt_module_get_pattern_row_channel_command'
] = function () {
    return (_openmpt_module_get_pattern_row_channel_command = Module[
        '_openmpt_module_get_pattern_row_channel_command'
    ] =
        Module['asm']['fc']).apply(null, arguments);
});
var _openmpt_module_format_pattern_row_channel_command = (Module[
    '_openmpt_module_format_pattern_row_channel_command'
] = function () {
    return (_openmpt_module_format_pattern_row_channel_command = Module[
        '_openmpt_module_format_pattern_row_channel_command'
    ] =
        Module['asm']['gc']).apply(null, arguments);
});
var _openmpt_module_highlight_pattern_row_channel_command = (Module[
    '_openmpt_module_highlight_pattern_row_channel_command'
] = function () {
    return (_openmpt_module_highlight_pattern_row_channel_command = Module[
        '_openmpt_module_highlight_pattern_row_channel_command'
    ] =
        Module['asm']['hc']).apply(null, arguments);
});
var _openmpt_module_format_pattern_row_channel = (Module[
    '_openmpt_module_format_pattern_row_channel'
] = function () {
    return (_openmpt_module_format_pattern_row_channel = Module[
        '_openmpt_module_format_pattern_row_channel'
    ] =
        Module['asm']['ic']).apply(null, arguments);
});
var _openmpt_module_highlight_pattern_row_channel = (Module[
    '_openmpt_module_highlight_pattern_row_channel'
] = function () {
    return (_openmpt_module_highlight_pattern_row_channel = Module[
        '_openmpt_module_highlight_pattern_row_channel'
    ] =
        Module['asm']['jc']).apply(null, arguments);
});
var _openmpt_module_get_ctls = (Module['_openmpt_module_get_ctls'] = function () {
    return (_openmpt_module_get_ctls = Module['_openmpt_module_get_ctls'] =
        Module['asm']['kc']).apply(null, arguments);
});
var _openmpt_module_ctl_get = (Module['_openmpt_module_ctl_get'] = function () {
    return (_openmpt_module_ctl_get = Module['_openmpt_module_ctl_get'] =
        Module['asm']['lc']).apply(null, arguments);
});
var _openmpt_module_ctl_get_boolean = (Module['_openmpt_module_ctl_get_boolean'] = function () {
    return (_openmpt_module_ctl_get_boolean = Module['_openmpt_module_ctl_get_boolean'] =
        Module['asm']['mc']).apply(null, arguments);
});
var _openmpt_module_ctl_get_integer = (Module['_openmpt_module_ctl_get_integer'] = function () {
    return (_openmpt_module_ctl_get_integer = Module['_openmpt_module_ctl_get_integer'] =
        Module['asm']['nc']).apply(null, arguments);
});
var _openmpt_module_ctl_get_floatingpoint = (Module['_openmpt_module_ctl_get_floatingpoint'] =
    function () {
        return (_openmpt_module_ctl_get_floatingpoint = Module[
            '_openmpt_module_ctl_get_floatingpoint'
        ] =
            Module['asm']['oc']).apply(null, arguments);
    });
var _openmpt_module_ctl_get_text = (Module['_openmpt_module_ctl_get_text'] = function () {
    return (_openmpt_module_ctl_get_text = Module['_openmpt_module_ctl_get_text'] =
        Module['asm']['pc']).apply(null, arguments);
});
var _openmpt_module_ctl_set = (Module['_openmpt_module_ctl_set'] = function () {
    return (_openmpt_module_ctl_set = Module['_openmpt_module_ctl_set'] =
        Module['asm']['qc']).apply(null, arguments);
});
var _openmpt_module_ctl_set_boolean = (Module['_openmpt_module_ctl_set_boolean'] = function () {
    return (_openmpt_module_ctl_set_boolean = Module['_openmpt_module_ctl_set_boolean'] =
        Module['asm']['rc']).apply(null, arguments);
});
var _openmpt_module_ctl_set_integer = (Module['_openmpt_module_ctl_set_integer'] = function () {
    return (_openmpt_module_ctl_set_integer = Module['_openmpt_module_ctl_set_integer'] =
        Module['asm']['sc']).apply(null, arguments);
});
var _openmpt_module_ctl_set_floatingpoint = (Module['_openmpt_module_ctl_set_floatingpoint'] =
    function () {
        return (_openmpt_module_ctl_set_floatingpoint = Module[
            '_openmpt_module_ctl_set_floatingpoint'
        ] =
            Module['asm']['tc']).apply(null, arguments);
    });
var _openmpt_module_ctl_set_text = (Module['_openmpt_module_ctl_set_text'] = function () {
    return (_openmpt_module_ctl_set_text = Module['_openmpt_module_ctl_set_text'] =
        Module['asm']['uc']).apply(null, arguments);
});
var _openmpt_module_ext_create = (Module['_openmpt_module_ext_create'] = function () {
    return (_openmpt_module_ext_create = Module['_openmpt_module_ext_create'] =
        Module['asm']['vc']).apply(null, arguments);
});
var _openmpt_module_ext_create_from_memory = (Module['_openmpt_module_ext_create_from_memory'] =
    function () {
        return (_openmpt_module_ext_create_from_memory = Module[
            '_openmpt_module_ext_create_from_memory'
        ] =
            Module['asm']['wc']).apply(null, arguments);
    });
var _openmpt_module_ext_destroy = (Module['_openmpt_module_ext_destroy'] = function () {
    return (_openmpt_module_ext_destroy = Module['_openmpt_module_ext_destroy'] =
        Module['asm']['xc']).apply(null, arguments);
});
var _openmpt_module_ext_get_module = (Module['_openmpt_module_ext_get_module'] = function () {
    return (_openmpt_module_ext_get_module = Module['_openmpt_module_ext_get_module'] =
        Module['asm']['yc']).apply(null, arguments);
});
var _openmpt_module_ext_get_interface = (Module['_openmpt_module_ext_get_interface'] = function () {
    return (_openmpt_module_ext_get_interface = Module['_openmpt_module_ext_get_interface'] =
        Module['asm']['zc']).apply(null, arguments);
});
var _malloc = (Module['_malloc'] = function () {
    return (_malloc = Module['_malloc'] = Module['asm']['Ac']).apply(null, arguments);
});
var ___errno_location = (Module['___errno_location'] = function () {
    return (___errno_location = Module['___errno_location'] = Module['asm']['Bc']).apply(
        null,
        arguments,
    );
});
var __get_tzname = (Module['__get_tzname'] = function () {
    return (__get_tzname = Module['__get_tzname'] = Module['asm']['Cc']).apply(null, arguments);
});
var __get_daylight = (Module['__get_daylight'] = function () {
    return (__get_daylight = Module['__get_daylight'] = Module['asm']['Dc']).apply(null, arguments);
});
var __get_timezone = (Module['__get_timezone'] = function () {
    return (__get_timezone = Module['__get_timezone'] = Module['asm']['Ec']).apply(null, arguments);
});
var _setThrew = (Module['_setThrew'] = function () {
    return (_setThrew = Module['_setThrew'] = Module['asm']['Fc']).apply(null, arguments);
});
var __ZSt18uncaught_exceptionv = (Module['__ZSt18uncaught_exceptionv'] = function () {
    return (__ZSt18uncaught_exceptionv = Module['__ZSt18uncaught_exceptionv'] =
        Module['asm']['Gc']).apply(null, arguments);
});
var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
    return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['Hc']).apply(
        null,
        arguments,
    );
});
var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
    return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['Ic']).apply(
        null,
        arguments,
    );
});
var dynCall_v = (Module['dynCall_v'] = function () {
    return (dynCall_v = Module['dynCall_v'] = Module['asm']['Jc']).apply(null, arguments);
});
var dynCall_vi = (Module['dynCall_vi'] = function () {
    return (dynCall_vi = Module['dynCall_vi'] = Module['asm']['Kc']).apply(null, arguments);
});
var dynCall_vii = (Module['dynCall_vii'] = function () {
    return (dynCall_vii = Module['dynCall_vii'] = Module['asm']['Lc']).apply(null, arguments);
});
var dynCall_viii = (Module['dynCall_viii'] = function () {
    return (dynCall_viii = Module['dynCall_viii'] = Module['asm']['Mc']).apply(null, arguments);
});
var dynCall_viiii = (Module['dynCall_viiii'] = function () {
    return (dynCall_viiii = Module['dynCall_viiii'] = Module['asm']['Nc']).apply(null, arguments);
});
var dynCall_viiiii = (Module['dynCall_viiiii'] = function () {
    return (dynCall_viiiii = Module['dynCall_viiiii'] = Module['asm']['Oc']).apply(null, arguments);
});
var dynCall_viiiiii = (Module['dynCall_viiiiii'] = function () {
    return (dynCall_viiiiii = Module['dynCall_viiiiii'] = Module['asm']['Pc']).apply(
        null,
        arguments,
    );
});
var dynCall_viiiiiii = (Module['dynCall_viiiiiii'] = function () {
    return (dynCall_viiiiiii = Module['dynCall_viiiiiii'] = Module['asm']['Qc']).apply(
        null,
        arguments,
    );
});
var dynCall_viiiiiiiiii = (Module['dynCall_viiiiiiiiii'] = function () {
    return (dynCall_viiiiiiiiii = Module['dynCall_viiiiiiiiii'] = Module['asm']['Rc']).apply(
        null,
        arguments,
    );
});
var dynCall_viiiiiiiiiiiiiii = (Module['dynCall_viiiiiiiiiiiiiii'] = function () {
    return (dynCall_viiiiiiiiiiiiiii = Module['dynCall_viiiiiiiiiiiiiii'] =
        Module['asm']['Sc']).apply(null, arguments);
});
var dynCall_viiji = (Module['dynCall_viiji'] = function () {
    return (dynCall_viiji = Module['dynCall_viiji'] = Module['asm']['Tc']).apply(null, arguments);
});
var dynCall_viijii = (Module['dynCall_viijii'] = function () {
    return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['Uc']).apply(null, arguments);
});
var dynCall_viif = (Module['dynCall_viif'] = function () {
    return (dynCall_viif = Module['dynCall_viif'] = Module['asm']['Vc']).apply(null, arguments);
});
var dynCall_viid = (Module['dynCall_viid'] = function () {
    return (dynCall_viid = Module['dynCall_viid'] = Module['asm']['Wc']).apply(null, arguments);
});
var dynCall_viidi = (Module['dynCall_viidi'] = function () {
    return (dynCall_viidi = Module['dynCall_viidi'] = Module['asm']['Xc']).apply(null, arguments);
});
var dynCall_vid = (Module['dynCall_vid'] = function () {
    return (dynCall_vid = Module['dynCall_vid'] = Module['asm']['Yc']).apply(null, arguments);
});
var dynCall_i = (Module['dynCall_i'] = function () {
    return (dynCall_i = Module['dynCall_i'] = Module['asm']['Zc']).apply(null, arguments);
});
var dynCall_ii = (Module['dynCall_ii'] = function () {
    return (dynCall_ii = Module['dynCall_ii'] = Module['asm']['_c']).apply(null, arguments);
});
var dynCall_iii = (Module['dynCall_iii'] = function () {
    return (dynCall_iii = Module['dynCall_iii'] = Module['asm']['$c']).apply(null, arguments);
});
var dynCall_iiii = (Module['dynCall_iiii'] = function () {
    return (dynCall_iiii = Module['dynCall_iiii'] = Module['asm']['ad']).apply(null, arguments);
});
var dynCall_iiiii = (Module['dynCall_iiiii'] = function () {
    return (dynCall_iiiii = Module['dynCall_iiiii'] = Module['asm']['bd']).apply(null, arguments);
});
var dynCall_iiiiii = (Module['dynCall_iiiiii'] = function () {
    return (dynCall_iiiiii = Module['dynCall_iiiiii'] = Module['asm']['cd']).apply(null, arguments);
});
var dynCall_iiiiiii = (Module['dynCall_iiiiiii'] = function () {
    return (dynCall_iiiiiii = Module['dynCall_iiiiiii'] = Module['asm']['dd']).apply(
        null,
        arguments,
    );
});
var dynCall_iiiiiiii = (Module['dynCall_iiiiiiii'] = function () {
    return (dynCall_iiiiiiii = Module['dynCall_iiiiiiii'] = Module['asm']['ed']).apply(
        null,
        arguments,
    );
});
var dynCall_iiiiiiiiiiii = (Module['dynCall_iiiiiiiiiiii'] = function () {
    return (dynCall_iiiiiiiiiiii = Module['dynCall_iiiiiiiiiiii'] = Module['asm']['fd']).apply(
        null,
        arguments,
    );
});
var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
    return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['gd']).apply(null, arguments);
});
var dynCall_iiiiid = (Module['dynCall_iiiiid'] = function () {
    return (dynCall_iiiiid = Module['dynCall_iiiiid'] = Module['asm']['hd']).apply(null, arguments);
});
var dynCall_iiiidd = (Module['dynCall_iiiidd'] = function () {
    return (dynCall_iiiidd = Module['dynCall_iiiidd'] = Module['asm']['id']).apply(null, arguments);
});
var dynCall_iid = (Module['dynCall_iid'] = function () {
    return (dynCall_iid = Module['dynCall_iid'] = Module['asm']['jd']).apply(null, arguments);
});
var dynCall_ij = (Module['dynCall_ij'] = function () {
    return (dynCall_ij = Module['dynCall_ij'] = Module['asm']['kd']).apply(null, arguments);
});
var dynCall_iji = (Module['dynCall_iji'] = function () {
    return (dynCall_iji = Module['dynCall_iji'] = Module['asm']['ld']).apply(null, arguments);
});
var dynCall_ijii = (Module['dynCall_ijii'] = function () {
    return (dynCall_ijii = Module['dynCall_ijii'] = Module['asm']['md']).apply(null, arguments);
});
var dynCall_ijiij = (Module['dynCall_ijiij'] = function () {
    return (dynCall_ijiij = Module['dynCall_ijiij'] = Module['asm']['nd']).apply(null, arguments);
});
var dynCall_if = (Module['dynCall_if'] = function () {
    return (dynCall_if = Module['dynCall_if'] = Module['asm']['od']).apply(null, arguments);
});
var dynCall_id = (Module['dynCall_id'] = function () {
    return (dynCall_id = Module['dynCall_id'] = Module['asm']['pd']).apply(null, arguments);
});
var dynCall_ji = (Module['dynCall_ji'] = function () {
    return (dynCall_ji = Module['dynCall_ji'] = Module['asm']['qd']).apply(null, arguments);
});
var dynCall_jii = (Module['dynCall_jii'] = function () {
    return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['rd']).apply(null, arguments);
});
var dynCall_jiii = (Module['dynCall_jiii'] = function () {
    return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['sd']).apply(null, arguments);
});
var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
    return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['td']).apply(null, arguments);
});
var dynCall_fi = (Module['dynCall_fi'] = function () {
    return (dynCall_fi = Module['dynCall_fi'] = Module['asm']['ud']).apply(null, arguments);
});
var dynCall_fii = (Module['dynCall_fii'] = function () {
    return (dynCall_fii = Module['dynCall_fii'] = Module['asm']['vd']).apply(null, arguments);
});
var dynCall_fiii = (Module['dynCall_fiii'] = function () {
    return (dynCall_fiii = Module['dynCall_fiii'] = Module['asm']['wd']).apply(null, arguments);
});
var dynCall_di = (Module['dynCall_di'] = function () {
    return (dynCall_di = Module['dynCall_di'] = Module['asm']['xd']).apply(null, arguments);
});
var dynCall_dii = (Module['dynCall_dii'] = function () {
    return (dynCall_dii = Module['dynCall_dii'] = Module['asm']['yd']).apply(null, arguments);
});
var dynCall_diii = (Module['dynCall_diii'] = function () {
    return (dynCall_diii = Module['dynCall_diii'] = Module['asm']['zd']).apply(null, arguments);
});
var dynCall_did = (Module['dynCall_did'] = function () {
    return (dynCall_did = Module['dynCall_did'] = Module['asm']['Ad']).apply(null, arguments);
});
var dynCall_didi = (Module['dynCall_didi'] = function () {
    return (dynCall_didi = Module['dynCall_didi'] = Module['asm']['Bd']).apply(null, arguments);
});
var dynCall_dd = (Module['dynCall_dd'] = function () {
    return (dynCall_dd = Module['dynCall_dd'] = Module['asm']['Cd']).apply(null, arguments);
});
var stackSave = (Module['stackSave'] = function () {
    return (stackSave = Module['stackSave'] = Module['asm']['Dd']).apply(null, arguments);
});
var stackAlloc = (Module['stackAlloc'] = function () {
    return (stackAlloc = Module['stackAlloc'] = Module['asm']['Ed']).apply(null, arguments);
});
var stackRestore = (Module['stackRestore'] = function () {
    return (stackRestore = Module['stackRestore'] = Module['asm']['Fd']).apply(null, arguments);
});
function invoke_iiii(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_iiii(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iii(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_iii(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viii(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        dynCall_viii(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_vii(index, a1, a2) {
    const sp = stackSave();
    try {
        dynCall_vii(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_ii(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_ii(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
    const sp = stackSave();
    try {
        return dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_vi(index, a1) {
    const sp = stackSave();
    try {
        dynCall_vi(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_v(index) {
    const sp = stackSave();
    try {
        dynCall_v(index);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiii(index, a1, a2, a3, a4) {
    const sp = stackSave();
    try {
        dynCall_viiii(index, a1, a2, a3, a4);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
    const sp = stackSave();
    try {
        return dynCall_iiiii(index, a1, a2, a3, a4);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_i(index) {
    const sp = stackSave();
    try {
        return dynCall_i(index);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
    const sp = stackSave();
    try {
        dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
    const sp = stackSave();
    try {
        dynCall_viiiii(index, a1, a2, a3, a4, a5);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
    const sp = stackSave();
    try {
        return dynCall_iiiiii(index, a1, a2, a3, a4, a5);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_fi(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_fi(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iid(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_iid(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_vid(index, a1, a2) {
    const sp = stackSave();
    try {
        dynCall_vid(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_di(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_di(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_id(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_id(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_dd(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_dd(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_if(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_if(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    const sp = stackSave();
    try {
        dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viif(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        dynCall_viif(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_fii(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_fii(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_didi(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_didi(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_did(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_did(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_diii(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_diii(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
    const sp = stackSave();
    try {
        return dynCall_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viidi(index, a1, a2, a3, a4) {
    const sp = stackSave();
    try {
        dynCall_viidi(index, a1, a2, a3, a4);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viid(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        dynCall_viid(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_dii(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_dii(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiidd(index, a1, a2, a3, a4, a5) {
    const sp = stackSave();
    try {
        return dynCall_iiiidd(index, a1, a2, a3, a4, a5);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
    const sp = stackSave();
    try {
        return dynCall_iiiiid(index, a1, a2, a3, a4, a5);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_fiii(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_fiii(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    const sp = stackSave();
    try {
        return dynCall_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    const sp = stackSave();
    try {
        dynCall_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiiiiiiiiiiiiii(
    index,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
) {
    const sp = stackSave();
    try {
        dynCall_viiiiiiiiiiiiiii(
            index,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
            a9,
            a10,
            a11,
            a12,
            a13,
            a14,
            a15,
        );
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
    const sp = stackSave();
    try {
        dynCall_viijii(index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_ji(index, a1) {
    const sp = stackSave();
    try {
        return dynCall_ji(index, a1);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_ij(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_ij(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_jiiii(index, a1, a2, a3, a4) {
    const sp = stackSave();
    try {
        return dynCall_jiiii(index, a1, a2, a3, a4);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_ijiij(index, a1, a2, a3, a4, a5, a6) {
    const sp = stackSave();
    try {
        return dynCall_ijiij(index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_ijii(index, a1, a2, a3, a4) {
    const sp = stackSave();
    try {
        return dynCall_ijii(index, a1, a2, a3, a4);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iji(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_iji(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_jiii(index, a1, a2, a3) {
    const sp = stackSave();
    try {
        return dynCall_jiii(index, a1, a2, a3);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_viiji(index, a1, a2, a3, a4, a5) {
    const sp = stackSave();
    try {
        dynCall_viiji(index, a1, a2, a3, a4, a5);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_jii(index, a1, a2) {
    const sp = stackSave();
    try {
        return dynCall_jii(index, a1, a2);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
    const sp = stackSave();
    try {
        return dynCall_iiiiij(index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== 'longjmp') throw e;
        _setThrew(1, 0);
    }
}
Module['asm'] = asm;
Module['stringToUTF8'] = stringToUTF8;
Module['lengthBytesUTF8'] = lengthBytesUTF8;
Module['writeArrayToMemory'] = writeArrayToMemory;
Module['stackSave'] = stackSave;
Module['stackRestore'] = stackRestore;
Module['stackAlloc'] = stackAlloc;
let calledRun;
function ExitStatus(status) {
    this.name = 'ExitStatus';
    this.message = 'Program terminated with exit(' + status + ')';
    this.status = status;
}
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller;
};
function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return;
    }
    preRun();
    if (runDependencies > 0) return;
    function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
        postRun();
    }
    if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(function () {
            setTimeout(function () {
                Module['setStatus']('');
            }, 1);
            doRun();
        }, 1);
    } else {
        doRun();
    }
}
Module['run'] = run;
if (Module['preInit']) {
    if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
    while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
    }
}
noExitRuntime = true;
run();
