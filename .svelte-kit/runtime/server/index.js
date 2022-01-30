/** @param {Partial<import('types/helper').ResponseHeaders> | undefined} object */
function to_headers(object) {
	const headers = new Headers();

	if (object) {
		for (const key in object) {
			const value = object[key];
			if (!value) continue;

			if (typeof value === 'string') {
				headers.set(key, value);
			} else {
				value.forEach((value) => {
					headers.append(key, value);
				});
			}
		}
	}

	return headers;
}

/**
 * Hash using djb2
 * @param {import('types/hooks').StrictBody} value
 */
function hash(value) {
	let hash = 5381;
	let i = value.length;

	if (typeof value === 'string') {
		while (i) hash = (hash * 33) ^ value.charCodeAt(--i);
	} else {
		while (i) hash = (hash * 33) ^ value[--i];
	}

	return (hash >>> 0).toString(36);
}

/** @param {Record<string, any>} obj */

/** @param {Record<string, string>} params */
function decode_params(params) {
	for (const key in params) {
		// input has already been decoded by decodeURI
		// now handle the rest that decodeURIComponent would do
		params[key] = params[key]
			.replace(/%23/g, '#')
			.replace(/%3[Bb]/g, ';')
			.replace(/%2[Cc]/g, ',')
			.replace(/%2[Ff]/g, '/')
			.replace(/%3[Ff]/g, '?')
			.replace(/%3[Aa]/g, ':')
			.replace(/%40/g, '@')
			.replace(/%26/g, '&')
			.replace(/%3[Dd]/g, '=')
			.replace(/%2[Bb]/g, '+')
			.replace(/%24/g, '$');
	}

	return params;
}

/** @param {string} body */
function error(body) {
	return new Response(body, {
		status: 500
	});
}

/** @param {unknown} s */
function is_string(s) {
	return typeof s === 'string' || s instanceof String;
}

const text_types = new Set([
	'application/xml',
	'application/json',
	'application/x-www-form-urlencoded',
	'multipart/form-data'
]);

/**
 * Decides how the body should be parsed based on its mime type. Should match what's in parse_body
 *
 * @param {string | undefined | null} content_type The `content-type` header of a request/response.
 * @returns {boolean}
 */
function is_text(content_type) {
	if (!content_type) return true; // defaults to json
	const type = content_type.split(';')[0].toLowerCase(); // get the mime type

	return type.startsWith('text/') || type.endsWith('+xml') || text_types.has(type);
}

/**
 * @param {import('types/hooks').RequestEvent} event
 * @param {import('types/internal').SSREndpoint} route
 * @param {RegExpExecArray} match
 * @returns {Promise<Response | undefined>}
 */
async function render_endpoint(event, route, match) {
	const mod = await route.load();

	/** @type {import('types/endpoint').RequestHandler} */
	const handler = mod[event.request.method.toLowerCase().replace('delete', 'del')]; // 'delete' is a reserved word

	if (!handler) {
		return;
	}

	// we're mutating `request` so that we don't have to do { ...request, params }
	// on the next line, since that breaks the getters that replace path, query and
	// origin. We could revert that once we remove the getters
	event.params = route.params ? decode_params(route.params(match)) : {};

	const response = await handler(event);
	const preface = `Invalid response from route ${event.url.pathname}`;

	if (typeof response !== 'object') {
		return error(`${preface}: expected an object, got ${typeof response}`);
	}

	if (response.fallthrough) {
		return;
	}

	const { status = 200, body = {} } = response;
	const headers =
		response.headers instanceof Headers ? response.headers : to_headers(response.headers);

	const type = headers.get('content-type');

	if (!is_text(type) && !(body instanceof Uint8Array || is_string(body))) {
		return error(
			`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`
		);
	}

	/** @type {import('types/hooks').StrictBody} */
	let normalized_body;

	if (is_pojo(body) && (!type || type.startsWith('application/json'))) {
		headers.set('content-type', 'application/json; charset=utf-8');
		normalized_body = JSON.stringify(body);
	} else {
		normalized_body = /** @type {import('types/hooks').StrictBody} */ (body);
	}

	if (
		(typeof normalized_body === 'string' || normalized_body instanceof Uint8Array) &&
		!headers.has('etag')
	) {
		const cache_control = headers.get('cache-control');
		if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
			headers.set('etag', `"${hash(normalized_body)}"`);
		}
	}

	return new Response(normalized_body, {
		status,
		headers
	});
}

/** @param {any} body */
function is_pojo(body) {
	if (typeof body !== 'object') return false;

	if (body) {
		if (body instanceof Uint8Array) return false;

		// body could be a node Readable, but we don't want to import
		// node built-ins, so we use duck typing
		if (body._readableState && body._writableState && body._events) return false;

		// similarly, it could be a web ReadableStream
		if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return false;
	}

	return true;
}

var chars$1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return "new RegExp(" + stringifyString(thing.source) + ", \"" + thing.flags + "\")";
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars$1[num % chars$1.length] + name;
        num = ~~(num / chars$1.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped) {
            result += escaped[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

function noop() { }
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
Promise.resolve();

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

/**
 * @param {unknown} err
 * @return {Error}
 */
function coalesce_to_error(err) {
	return err instanceof Error ||
		(err && /** @type {any} */ (err).name && /** @type {any} */ (err).message)
		? /** @type {Error} */ (err)
		: new Error(JSON.stringify(err));
}

/** @type {Record<string, string>} */
const escape_json_string_in_html_dict = {
	'"': '\\"',
	'<': '\\u003C',
	'>': '\\u003E',
	'/': '\\u002F',
	'\\': '\\\\',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\r': '\\r',
	'\t': '\\t',
	'\0': '\\0',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
};

/** @param {string} str */
function escape_json_string_in_html(str) {
	return escape(
		str,
		escape_json_string_in_html_dict,
		(code) => `\\u${code.toString(16).toUpperCase()}`
	);
}

/** @type {Record<string, string>} */
const escape_html_attr_dict = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;'
};

/**
 * use for escaping string values to be used html attributes on the page
 * e.g.
 * <script data-url="here">
 *
 * @param {string} str
 * @returns string escaped string
 */
function escape_html_attr(str) {
	return '"' + escape(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}

/**
 *
 * @param str {string} string to escape
 * @param dict {Record<string, string>} dictionary of character replacements
 * @param unicode_encoder {function(number): string} encoder to use for high unicode characters
 * @returns {string}
 */
function escape(str, dict, unicode_encoder) {
	let result = '';

	for (let i = 0; i < str.length; i += 1) {
		const char = str.charAt(i);
		const code = char.charCodeAt(0);

		if (char in dict) {
			result += dict[char];
		} else if (code >= 0xd800 && code <= 0xdfff) {
			const next = str.charCodeAt(i + 1);

			// If this is the beginning of a [high, low] surrogate pair,
			// add the next two characters, otherwise escape
			if (code <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
				result += char + str[++i];
			} else {
				result += unicode_encoder(code);
			}
		} else {
			result += char;
		}
	}

	return result;
}

const s = JSON.stringify;

/** @param {URL} url */
function create_prerendering_url_proxy(url) {
	return new Proxy(url, {
		get: (target, prop, receiver) => {
			if (prop === 'search' || prop === 'searchParams') {
				throw new Error(`Cannot access url.${prop} on a page with prerendering enabled`);
			}
			return Reflect.get(target, prop, receiver);
		}
	});
}

const encoder = new TextEncoder();

/**
 * SHA-256 hashing function adapted from https://bitwiseshiftleft.github.io/sjcl
 * modified and redistributed under BSD license
 * @param {string} data
 */
function sha256(data) {
	if (!key[0]) precompute();

	const out = init.slice(0);
	const array = encode(data);

	for (let i = 0; i < array.length; i += 16) {
		const w = array.subarray(i, i + 16);

		let tmp;
		let a;
		let b;

		let out0 = out[0];
		let out1 = out[1];
		let out2 = out[2];
		let out3 = out[3];
		let out4 = out[4];
		let out5 = out[5];
		let out6 = out[6];
		let out7 = out[7];

		/* Rationale for placement of |0 :
		 * If a value can overflow is original 32 bits by a factor of more than a few
		 * million (2^23 ish), there is a possibility that it might overflow the
		 * 53-bit mantissa and lose precision.
		 *
		 * To avoid this, we clamp back to 32 bits by |'ing with 0 on any value that
		 * propagates around the loop, and on the hash state out[]. I don't believe
		 * that the clamps on out4 and on out0 are strictly necessary, but it's close
		 * (for out4 anyway), and better safe than sorry.
		 *
		 * The clamps on out[] are necessary for the output to be correct even in the
		 * common case and for short inputs.
		 */

		for (let i = 0; i < 64; i++) {
			// load up the input word for this round

			if (i < 16) {
				tmp = w[i];
			} else {
				a = w[(i + 1) & 15];

				b = w[(i + 14) & 15];

				tmp = w[i & 15] =
					(((a >>> 7) ^ (a >>> 18) ^ (a >>> 3) ^ (a << 25) ^ (a << 14)) +
						((b >>> 17) ^ (b >>> 19) ^ (b >>> 10) ^ (b << 15) ^ (b << 13)) +
						w[i & 15] +
						w[(i + 9) & 15]) |
					0;
			}

			tmp =
				tmp +
				out7 +
				((out4 >>> 6) ^ (out4 >>> 11) ^ (out4 >>> 25) ^ (out4 << 26) ^ (out4 << 21) ^ (out4 << 7)) +
				(out6 ^ (out4 & (out5 ^ out6))) +
				key[i]; // | 0;

			// shift register
			out7 = out6;
			out6 = out5;
			out5 = out4;

			out4 = (out3 + tmp) | 0;

			out3 = out2;
			out2 = out1;
			out1 = out0;

			out0 =
				(tmp +
					((out1 & out2) ^ (out3 & (out1 ^ out2))) +
					((out1 >>> 2) ^
						(out1 >>> 13) ^
						(out1 >>> 22) ^
						(out1 << 30) ^
						(out1 << 19) ^
						(out1 << 10))) |
				0;
		}

		out[0] = (out[0] + out0) | 0;
		out[1] = (out[1] + out1) | 0;
		out[2] = (out[2] + out2) | 0;
		out[3] = (out[3] + out3) | 0;
		out[4] = (out[4] + out4) | 0;
		out[5] = (out[5] + out5) | 0;
		out[6] = (out[6] + out6) | 0;
		out[7] = (out[7] + out7) | 0;
	}

	const bytes = new Uint8Array(out.buffer);
	reverse_endianness(bytes);

	return base64(bytes);
}

/** The SHA-256 initialization vector */
const init = new Uint32Array(8);

/** The SHA-256 hash key */
const key = new Uint32Array(64);

/** Function to precompute init and key. */
function precompute() {
	/** @param {number} x */
	function frac(x) {
		return (x - Math.floor(x)) * 0x100000000;
	}

	let prime = 2;

	for (let i = 0; i < 64; prime++) {
		let is_prime = true;

		for (let factor = 2; factor * factor <= prime; factor++) {
			if (prime % factor === 0) {
				is_prime = false;

				break;
			}
		}

		if (is_prime) {
			if (i < 8) {
				init[i] = frac(prime ** (1 / 2));
			}

			key[i] = frac(prime ** (1 / 3));

			i++;
		}
	}
}

/** @param {Uint8Array} bytes */
function reverse_endianness(bytes) {
	for (let i = 0; i < bytes.length; i += 4) {
		const a = bytes[i + 0];
		const b = bytes[i + 1];
		const c = bytes[i + 2];
		const d = bytes[i + 3];

		bytes[i + 0] = d;
		bytes[i + 1] = c;
		bytes[i + 2] = b;
		bytes[i + 3] = a;
	}
}

/** @param {string} str */
function encode(str) {
	const encoded = encoder.encode(str);
	const length = encoded.length * 8;

	// result should be a multiple of 512 bits in length,
	// with room for a 1 (after the data) and two 32-bit
	// words containing the original input bit length
	const size = 512 * Math.ceil((length + 65) / 512);
	const bytes = new Uint8Array(size / 8);
	bytes.set(encoded);

	// append a 1
	bytes[encoded.length] = 0b10000000;

	reverse_endianness(bytes);

	// add the input bit length
	const words = new Uint32Array(bytes.buffer);
	words[words.length - 2] = Math.floor(length / 0x100000000); // this will always be zero for us
	words[words.length - 1] = length;

	return words;
}

/*
	Based on https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727

	MIT License
	Copyright (c) 2020 Egor Nepomnyaschih
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/** @param {Uint8Array} bytes */
function base64(bytes) {
	const l = bytes.length;

	let result = '';
	let i;

	for (i = 2; i < l; i += 3) {
		result += chars[bytes[i - 2] >> 2];
		result += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += chars[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
		result += chars[bytes[i] & 0x3f];
	}

	if (i === l + 1) {
		// 1 octet yet to write
		result += chars[bytes[i - 2] >> 2];
		result += chars[(bytes[i - 2] & 0x03) << 4];
		result += '==';
	}

	if (i === l) {
		// 2 octets yet to write
		result += chars[bytes[i - 2] >> 2];
		result += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += chars[(bytes[i - 1] & 0x0f) << 2];
		result += '=';
	}

	return result;
}

/** @type {Promise<void>} */
let csp_ready;

/** @type {() => string} */
let generate_nonce;

/** @type {(input: string) => string} */
let generate_hash;

if (typeof crypto !== 'undefined') {
	const array = new Uint8Array(16);

	generate_nonce = () => {
		crypto.getRandomValues(array);
		return base64(array);
	};

	generate_hash = sha256;
} else {
	// TODO: remove this in favor of web crypto API once we no longer support Node 14
	const name = 'crypto'; // store in a variable to fool esbuild when adapters bundle kit
	csp_ready = import(name).then((crypto) => {
		generate_nonce = () => {
			return crypto.randomBytes(16).toString('base64');
		};

		generate_hash = (input) => {
			return crypto.createHash('sha256').update(input, 'utf-8').digest().toString('base64');
		};
	});
}

const quoted = new Set([
	'self',
	'unsafe-eval',
	'unsafe-hashes',
	'unsafe-inline',
	'none',
	'strict-dynamic',
	'report-sample'
]);

const crypto_pattern = /^(nonce|sha\d\d\d)-/;

class Csp {
	/** @type {boolean} */
	#use_hashes;

	/** @type {boolean} */
	#dev;

	/** @type {boolean} */
	#script_needs_csp;

	/** @type {boolean} */
	#style_needs_csp;

	/** @type {import('types/csp').CspDirectives} */
	#directives;

	/** @type {import('types/csp').Source[]} */
	#script_src;

	/** @type {import('types/csp').Source[]} */
	#style_src;

	/**
	 * @param {{
	 *   mode: string,
	 *   directives: import('types/csp').CspDirectives
	 * }} config
	 * @param {{
	 *   dev: boolean;
	 *   prerender: boolean;
	 *   needs_nonce: boolean;
	 * }} opts
	 */
	constructor({ mode, directives }, { dev, prerender, needs_nonce }) {
		this.#use_hashes = mode === 'hash' || (mode === 'auto' && prerender);
		this.#directives = dev ? { ...directives } : directives; // clone in dev so we can safely mutate
		this.#dev = dev;

		const d = this.#directives;

		if (dev) {
			// remove strict-dynamic in dev...
			// TODO reinstate this if we can figure out how to make strict-dynamic work
			// if (d['default-src']) {
			// 	d['default-src'] = d['default-src'].filter((name) => name !== 'strict-dynamic');
			// 	if (d['default-src'].length === 0) delete d['default-src'];
			// }

			// if (d['script-src']) {
			// 	d['script-src'] = d['script-src'].filter((name) => name !== 'strict-dynamic');
			// 	if (d['script-src'].length === 0) delete d['script-src'];
			// }

			const effective_style_src = d['style-src'] || d['default-src'];

			// ...and add unsafe-inline so we can inject <style> elements
			if (effective_style_src && !effective_style_src.includes('unsafe-inline')) {
				d['style-src'] = [...effective_style_src, 'unsafe-inline'];
			}
		}

		this.#script_src = [];
		this.#style_src = [];

		const effective_script_src = d['script-src'] || d['default-src'];
		const effective_style_src = d['style-src'] || d['default-src'];

		this.#script_needs_csp =
			!!effective_script_src &&
			effective_script_src.filter((value) => value !== 'unsafe-inline').length > 0;

		this.#style_needs_csp =
			!dev &&
			!!effective_style_src &&
			effective_style_src.filter((value) => value !== 'unsafe-inline').length > 0;

		this.script_needs_nonce = this.#script_needs_csp && !this.#use_hashes;
		this.style_needs_nonce = this.#style_needs_csp && !this.#use_hashes;

		if (this.script_needs_nonce || this.style_needs_nonce || needs_nonce) {
			this.nonce = generate_nonce();
		}
	}

	/** @param {string} content */
	add_script(content) {
		if (this.#script_needs_csp) {
			if (this.#use_hashes) {
				this.#script_src.push(`sha256-${generate_hash(content)}`);
			} else if (this.#script_src.length === 0) {
				this.#script_src.push(`nonce-${this.nonce}`);
			}
		}
	}

	/** @param {string} content */
	add_style(content) {
		if (this.#style_needs_csp) {
			if (this.#use_hashes) {
				this.#style_src.push(`sha256-${generate_hash(content)}`);
			} else if (this.#style_src.length === 0) {
				this.#style_src.push(`nonce-${this.nonce}`);
			}
		}
	}

	/** @param {boolean} [is_meta] */
	get_header(is_meta = false) {
		const header = [];

		// due to browser inconsistencies, we can't append sources to default-src
		// (specifically, Firefox appears to not ignore nonce-{nonce} directives
		// on default-src), so we ensure that script-src and style-src exist

		const directives = { ...this.#directives };

		if (this.#style_src.length > 0) {
			directives['style-src'] = [
				...(directives['style-src'] || directives['default-src'] || []),
				...this.#style_src
			];
		}

		if (this.#script_src.length > 0) {
			directives['script-src'] = [
				...(directives['script-src'] || directives['default-src'] || []),
				...this.#script_src
			];
		}

		for (const key in directives) {
			if (is_meta && (key === 'frame-ancestors' || key === 'report-uri' || key === 'sandbox')) {
				// these values cannot be used with a <meta> tag
				// TODO warn?
				continue;
			}

			// @ts-expect-error gimme a break typescript, `key` is obviously a member of directives
			const value = /** @type {string[] | true} */ (directives[key]);

			if (!value) continue;

			const directive = [key];
			if (Array.isArray(value)) {
				value.forEach((value) => {
					if (quoted.has(value) || crypto_pattern.test(value)) {
						directive.push(`'${value}'`);
					} else {
						directive.push(value);
					}
				});
			}

			header.push(directive.join(' '));
		}

		return header.join('; ');
	}

	get_meta() {
		const content = escape_html_attr(this.get_header(true));
		return `<meta http-equiv="content-security-policy" content=${content}>`;
	}
}

// TODO rename this function/module

/**
 * @param {{
 *   branch: Array<import('./types').Loaded>;
 *   options: import('types/internal').SSRRenderOptions;
 *   state: import('types/internal').SSRRenderState;
 *   $session: any;
 *   page_config: { hydrate: boolean, router: boolean };
 *   status: number;
 *   error?: Error;
 *   url: URL;
 *   params: Record<string, string>;
 *   ssr: boolean;
 *   stuff: Record<string, any>;
 * }} opts
 */
async function render_response({
	branch,
	options,
	state,
	$session,
	page_config,
	status,
	error,
	url,
	params,
	ssr,
	stuff
}) {
	if (state.prerender) {
		if (options.csp.mode === 'nonce') {
			throw new Error('Cannot use prerendering if config.kit.csp.mode === "nonce"');
		}

		if (options.template_contains_nonce) {
			throw new Error('Cannot use prerendering if page template contains %svelte.nonce%');
		}
	}

	const stylesheets = new Set(options.manifest._.entry.css);
	const modulepreloads = new Set(options.manifest._.entry.js);
	/** @type {Map<string, string>} */
	const styles = new Map();

	/** @type {Array<{ url: string, body: string, json: string }>} */
	const serialized_data = [];

	let rendered;

	let is_private = false;
	let maxage;

	if (error) {
		error.stack = options.get_stack(error);
	}

	if (ssr) {
		branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
			if (node.css) node.css.forEach((url) => stylesheets.add(url));
			if (node.js) node.js.forEach((url) => modulepreloads.add(url));
			if (node.styles) Object.entries(node.styles).forEach(([k, v]) => styles.set(k, v));

			// TODO probably better if `fetched` wasn't populated unless `hydrate`
			if (fetched && page_config.hydrate) serialized_data.push(...fetched);

			if (uses_credentials) is_private = true;

			maxage = loaded.maxage;
		});

		const session = writable($session);

		/** @type {Record<string, any>} */
		const props = {
			stores: {
				page: writable(null),
				navigating: writable(null),
				session
			},
			page: {
				url: state.prerender ? create_prerendering_url_proxy(url) : url,
				params,
				status,
				error,
				stuff
			},
			components: branch.map(({ node }) => node.module.default)
		};

		// TODO remove this for 1.0
		/**
		 * @param {string} property
		 * @param {string} replacement
		 */
		const print_error = (property, replacement) => {
			Object.defineProperty(props.page, property, {
				get: () => {
					throw new Error(`$page.${property} has been replaced by $page.url.${replacement}`);
				}
			});
		};

		print_error('origin', 'origin');
		print_error('path', 'pathname');
		print_error('query', 'searchParams');

		// props_n (instead of props[n]) makes it easy to avoid
		// unnecessary updates for layout components
		for (let i = 0; i < branch.length; i += 1) {
			props[`props_${i}`] = await branch[i].loaded.props;
		}

		let session_tracking_active = false;
		const unsubscribe = session.subscribe(() => {
			if (session_tracking_active) is_private = true;
		});
		session_tracking_active = true;

		try {
			rendered = options.root.render(props);
		} finally {
			unsubscribe();
		}
	} else {
		rendered = { head: '', html: '', css: { code: '', map: null } };
	}

	let { head, html: body } = rendered;

	const inlined_style = Array.from(styles.values()).join('\n');

	await csp_ready;
	const csp = new Csp(options.csp, {
		dev: options.dev,
		prerender: !!state.prerender,
		needs_nonce: options.template_contains_nonce
	});

	// prettier-ignore
	const init_app = `
		import { start } from ${s(options.prefix + options.manifest._.entry.file)};
		start({
			target: ${options.target ? `document.querySelector(${s(options.target)})` : 'document.body'},
			paths: ${s(options.paths)},
			session: ${try_serialize($session, (error) => {
				throw new Error(`Failed to serialize session data: ${error.message}`);
			})},
			route: ${!!page_config.router},
			spa: ${!ssr},
			trailing_slash: ${s(options.trailing_slash)},
			hydrate: ${ssr && page_config.hydrate ? `{
				status: ${status},
				error: ${serialize_error(error)},
				nodes: [
					${(branch || [])
					.map(({ node }) => `import(${s(options.prefix + node.entry)})`)
					.join(',\n\t\t\t\t\t\t')}
				],
				url: new URL(${s(url.href)}),
				params: ${devalue(params)}
			}` : 'null'}
		});
	`;

	const init_service_worker = `
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('${options.service_worker}');
		}
	`;

	if (options.amp) {
		head += `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"></script>

		<style amp-custom>${inlined_style}\n${rendered.css.code}</style>`;

		if (options.service_worker) {
			head +=
				'<script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js"></script>';

			body += `<amp-install-serviceworker src="${options.service_worker}" layout="nodisplay"></amp-install-serviceworker>`;
		}
	} else {
		if (inlined_style) {
			const attributes = [];
			if (options.dev) attributes.push(' data-svelte');
			if (csp.style_needs_nonce) attributes.push(` nonce="${csp.nonce}"`);

			csp.add_style(inlined_style);

			head += `\n\t<style${attributes.join('')}>${inlined_style}</style>`;
		}

		// prettier-ignore
		head += Array.from(stylesheets)
			.map((dep) => {
				const attributes = [
					'rel="stylesheet"',
					`href="${options.prefix + dep}"`
				];

				if (csp.style_needs_nonce) {
					attributes.push(`nonce="${csp.nonce}"`);
				}

				if (styles.has(dep)) {
					attributes.push('disabled', 'media="(max-width: 0)"');
				}

				return `\n\t<link ${attributes.join(' ')}>`;
			})
			.join('');

		if (page_config.router || page_config.hydrate) {
			head += Array.from(modulepreloads)
				.map((dep) => `\n\t<link rel="modulepreload" href="${options.prefix + dep}">`)
				.join('');

			const attributes = ['type="module"'];

			csp.add_script(init_app);

			if (csp.script_needs_nonce) {
				attributes.push(`nonce="${csp.nonce}"`);
			}

			head += `<script ${attributes.join(' ')}>${init_app}</script>`;

			// prettier-ignore
			body += serialized_data
				.map(({ url, body, json }) => {
					let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
					if (body) attributes += ` data-body="${hash(body)}"`;

					return `<script ${attributes}>${json}</script>`;
				})
				.join('\n\n\t');
		}

		if (options.service_worker) {
			// always include service worker unless it's turned off explicitly
			csp.add_script(init_service_worker);

			head += `
				<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ''}>${init_service_worker}</script>`;
		}
	}

	if (state.prerender) {
		const http_equiv = [];

		const csp_headers = csp.get_meta();
		if (csp_headers) {
			http_equiv.push(csp_headers);
		}

		if (maxage) {
			http_equiv.push(`<meta http-equiv="cache-control" content="max-age=${maxage}">`);
		}

		if (http_equiv.length > 0) {
			head = http_equiv.join('\n') + head;
		}
	}

	const segments = url.pathname.slice(options.paths.base.length).split('/').slice(2);
	const assets =
		options.paths.assets || (segments.length > 0 ? segments.map(() => '..').join('/') : '.');

	const html = options.template({ head, body, assets, nonce: /** @type {string} */ (csp.nonce) });

	const headers = new Headers({
		'content-type': 'text/html',
		etag: `"${hash(html)}"`
	});

	if (maxage) {
		headers.set('cache-control', `${is_private ? 'private' : 'public'}, max-age=${maxage}`);
	}

	if (!options.floc) {
		headers.set('permissions-policy', 'interest-cohort=()');
	}

	if (!state.prerender) {
		const csp_header = csp.get_header();
		if (csp_header) {
			headers.set('content-security-policy', csp_header);
		}
	}

	return new Response(html, {
		status,
		headers
	});
}

/**
 * @param {any} data
 * @param {(error: Error) => void} [fail]
 */
function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(coalesce_to_error(err));
		return null;
	}
}

// Ensure we return something truthy so the client will not re-render the page over the error

/** @param {(Error & {frame?: string} & {loc?: object}) | undefined | null} error */
function serialize_error(error) {
	if (!error) return null;
	let serialized = try_serialize(error);
	if (!serialized) {
		const { name, message, stack } = error;
		serialized = try_serialize({ ...error, name, message, stack });
	}
	if (!serialized) {
		serialized = '{}';
	}
	return serialized;
}

/**
 * @param {import('types/page').LoadOutput} loaded
 * @returns {import('types/internal').NormalizedLoadOutput}
 */
function normalize(loaded) {
	const has_error_status =
		loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
	if (loaded.error || has_error_status) {
		const status = loaded.status;

		if (!loaded.error && has_error_status) {
			return {
				status: status || 500,
				error: new Error()
			};
		}

		const error = typeof loaded.error === 'string' ? new Error(loaded.error) : loaded.error;

		if (!(error instanceof Error)) {
			return {
				status: 500,
				error: new Error(
					`"error" property returned from load() must be a string or instance of Error, received type "${typeof error}"`
				)
			};
		}

		if (!status || status < 400 || status > 599) {
			console.warn('"error" returned from load() without a valid status code — defaulting to 500');
			return { status: 500, error };
		}

		return { status, error };
	}

	if (loaded.redirect) {
		if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
			return {
				status: 500,
				error: new Error(
					'"redirect" property returned from load() must be accompanied by a 3xx status code'
				)
			};
		}

		if (typeof loaded.redirect !== 'string') {
			return {
				status: 500,
				error: new Error('"redirect" property returned from load() must be a string')
			};
		}
	}

	// TODO remove before 1.0
	if (/** @type {any} */ (loaded).context) {
		throw new Error(
			'You are returning "context" from a load function. ' +
				'"context" was renamed to "stuff", please adjust your code accordingly.'
		);
	}

	return /** @type {import('types/internal').NormalizedLoadOutput} */ (loaded);
}

const absolute = /^([a-z]+:)?\/?\//;
const scheme = /^[a-z]+:/;

/**
 * @param {string} base
 * @param {string} path
 */
function resolve(base, path) {
	if (scheme.test(path)) return path;

	const base_match = absolute.exec(base);
	const path_match = absolute.exec(path);

	if (!base_match) {
		throw new Error(`bad base path: "${base}"`);
	}

	const baseparts = path_match ? [] : base.slice(base_match[0].length).split('/');
	const pathparts = path_match ? path.slice(path_match[0].length).split('/') : path.split('/');

	baseparts.pop();

	for (let i = 0; i < pathparts.length; i += 1) {
		const part = pathparts[i];
		if (part === '.') continue;
		else if (part === '..') baseparts.pop();
		else baseparts.push(part);
	}

	const prefix = (path_match && path_match[0]) || (base_match && base_match[0]) || '';

	return `${prefix}${baseparts.join('/')}`;
}

/** @param {string} path */
function is_root_relative(path) {
	return path[0] === '/' && path[1] !== '/';
}

/**
 * @param {{
 *   event: import('types/hooks').RequestEvent;
 *   options: import('types/internal').SSRRenderOptions;
 *   state: import('types/internal').SSRRenderState;
 *   route: import('types/internal').SSRPage | null;
 *   url: URL;
 *   params: Record<string, string>;
 *   node: import('types/internal').SSRNode;
 *   $session: any;
 *   stuff: Record<string, any>;
 *   is_error: boolean;
 *   status?: number;
 *   error?: Error;
 * }} opts
 * @returns {Promise<import('./types').Loaded | undefined>} undefined for fallthrough
 */
async function load_node({
	event,
	options,
	state,
	route,
	url,
	params,
	node,
	$session,
	stuff,
	is_error,
	status,
	error
}) {
	const { module } = node;

	let uses_credentials = false;

	/**
	 * @type {Array<{
	 *   url: string;
	 *   body: string;
	 *   json: string;
	 * }>}
	 */
	const fetched = [];

	/**
	 * @type {string[]}
	 */
	let set_cookie_headers = [];

	let loaded;

	if (module.load) {
		/** @type {import('types/page').LoadInput | import('types/page').ErrorLoadInput} */
		const load_input = {
			url: state.prerender ? create_prerendering_url_proxy(url) : url,
			params,
			get session() {
				uses_credentials = true;
				return $session;
			},
			/**
			 * @param {RequestInfo} resource
			 * @param {RequestInit} opts
			 */
			fetch: async (resource, opts = {}) => {
				/** @type {string} */
				let requested;

				if (typeof resource === 'string') {
					requested = resource;
				} else {
					requested = resource.url;

					opts = {
						method: resource.method,
						headers: resource.headers,
						body: resource.body,
						mode: resource.mode,
						credentials: resource.credentials,
						cache: resource.cache,
						redirect: resource.redirect,
						referrer: resource.referrer,
						integrity: resource.integrity,
						...opts
					};
				}

				opts.headers = new Headers(opts.headers);

				const resolved = resolve(event.url.pathname, requested.split('?')[0]);

				/** @type {Response} */
				let response;

				/** @type {import('types/internal').PrerenderDependency} */
				let dependency;

				// handle fetch requests for static assets. e.g. prebaked data, etc.
				// we need to support everything the browser's fetch supports
				const prefix = options.paths.assets || options.paths.base;
				const filename = decodeURIComponent(
					resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved
				).slice(1);
				const filename_html = `${filename}/index.html`; // path may also match path/index.html

				const is_asset = options.manifest.assets.has(filename);
				const is_asset_html = options.manifest.assets.has(filename_html);

				if (is_asset || is_asset_html) {
					const file = is_asset ? filename : filename_html;

					if (options.read) {
						const type = is_asset
							? options.manifest._.mime[filename.slice(filename.lastIndexOf('.'))]
							: 'text/html';

						response = new Response(options.read(file), {
							headers: type ? { 'content-type': type } : {}
						});
					} else {
						response = await fetch(`${url.origin}/${file}`, /** @type {RequestInit} */ (opts));
					}
				} else if (is_root_relative(resolved)) {
					if (opts.credentials !== 'omit') {
						uses_credentials = true;

						const cookie = event.request.headers.get('cookie');
						const authorization = event.request.headers.get('authorization');

						if (cookie) {
							opts.headers.set('cookie', cookie);
						}

						if (authorization && !opts.headers.has('authorization')) {
							opts.headers.set('authorization', authorization);
						}
					}

					if (opts.body && typeof opts.body !== 'string') {
						// per https://developer.mozilla.org/en-US/docs/Web/API/Request/Request, this can be a
						// Blob, BufferSource, FormData, URLSearchParams, USVString, or ReadableStream object.
						// non-string bodies are irksome to deal with, but luckily aren't particularly useful
						// in this context anyway, so we take the easy route and ban them
						throw new Error('Request body must be a string');
					}

					response = await respond(new Request(new URL(requested, event.url).href, opts), options, {
						fetched: requested,
						initiator: route
					});

					if (state.prerender) {
						dependency = { response, body: null };
						state.prerender.dependencies.set(resolved, dependency);
					}
				} else {
					// external
					if (resolved.startsWith('//')) {
						throw new Error(
							`Cannot request protocol-relative URL (${requested}) in server-side fetch`
						);
					}

					// external fetch
					// allow cookie passthrough for "same-origin"
					// if SvelteKit is serving my.domain.com:
					// -        domain.com WILL NOT receive cookies
					// -     my.domain.com WILL receive cookies
					// -    api.domain.dom WILL NOT receive cookies
					// - sub.my.domain.com WILL receive cookies
					// ports do not affect the resolution
					// leading dot prevents mydomain.com matching domain.com
					if (
						`.${new URL(requested).hostname}`.endsWith(`.${event.url.hostname}`) &&
						opts.credentials !== 'omit'
					) {
						uses_credentials = true;

						const cookie = event.request.headers.get('cookie');
						if (cookie) opts.headers.set('cookie', cookie);
					}

					const external_request = new Request(requested, /** @type {RequestInit} */ (opts));
					response = await options.hooks.externalFetch.call(null, external_request);
				}

				const proxy = new Proxy(response, {
					get(response, key, _receiver) {
						async function text() {
							const body = await response.text();

							/** @type {import('types/helper').ResponseHeaders} */
							const headers = {};
							for (const [key, value] of response.headers) {
								if (key === 'set-cookie') {
									set_cookie_headers = set_cookie_headers.concat(value);
								} else if (key !== 'etag') {
									headers[key] = value;
								}
							}

							if (!opts.body || typeof opts.body === 'string') {
								// prettier-ignore
								fetched.push({
										url: requested,
										body: /** @type {string} */ (opts.body),
										json: `{"status":${response.status},"statusText":${s(response.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
									});
							}

							if (dependency) {
								dependency.body = body;
							}

							return body;
						}

						if (key === 'arrayBuffer') {
							return async () => {
								const buffer = await response.arrayBuffer();

								if (dependency) {
									dependency.body = new Uint8Array(buffer);
								}

								// TODO should buffer be inlined into the page (albeit base64'd)?
								// any conditions in which it shouldn't be?

								return buffer;
							};
						}

						if (key === 'text') {
							return text;
						}

						if (key === 'json') {
							return async () => {
								return JSON.parse(await text());
							};
						}

						// TODO arrayBuffer?

						return Reflect.get(response, key, response);
					}
				});

				return proxy;
			},
			stuff: { ...stuff }
		};

		if (options.dev) {
			// TODO remove this for 1.0
			Object.defineProperty(load_input, 'page', {
				get: () => {
					throw new Error('`page` in `load` functions has been replaced by `url` and `params`');
				}
			});
		}

		if (is_error) {
			/** @type {import('types/page').ErrorLoadInput} */ (load_input).status = status;
			/** @type {import('types/page').ErrorLoadInput} */ (load_input).error = error;
		}

		loaded = await module.load.call(null, load_input);

		if (!loaded) {
			throw new Error(`load function must return a value${options.dev ? ` (${node.entry})` : ''}`);
		}
	} else {
		loaded = {};
	}

	if (loaded.fallthrough && !is_error) {
		return;
	}

	return {
		node,
		loaded: normalize(loaded),
		stuff: loaded.stuff || stuff,
		fetched,
		set_cookie_headers,
		uses_credentials
	};
}

/**
 * @typedef {import('./types.js').Loaded} Loaded
 * @typedef {import('types/internal').SSRRenderOptions} SSRRenderOptions
 * @typedef {import('types/internal').SSRRenderState} SSRRenderState
 */

/**
 * @param {{
 *   event: import('types/hooks').RequestEvent;
 *   options: SSRRenderOptions;
 *   state: SSRRenderState;
 *   $session: any;
 *   status: number;
 *   error: Error;
 *   ssr: boolean;
 * }} opts
 */
async function respond_with_error({ event, options, state, $session, status, error, ssr }) {
	try {
		const default_layout = await options.manifest._.nodes[0](); // 0 is always the root layout
		const default_error = await options.manifest._.nodes[1](); // 1 is always the root error

		/** @type {Record<string, string>} */
		const params = {}; // error page has no params

		const layout_loaded = /** @type {Loaded} */ (
			await load_node({
				event,
				options,
				state,
				route: null,
				url: event.url, // TODO this is redundant, no?
				params,
				node: default_layout,
				$session,
				stuff: {},
				is_error: false
			})
		);

		const error_loaded = /** @type {Loaded} */ (
			await load_node({
				event,
				options,
				state,
				route: null,
				url: event.url,
				params,
				node: default_error,
				$session,
				stuff: layout_loaded ? layout_loaded.stuff : {},
				is_error: true,
				status,
				error
			})
		);

		return await render_response({
			options,
			state,
			$session,
			page_config: {
				hydrate: options.hydrate,
				router: options.router
			},
			stuff: error_loaded.stuff,
			status,
			error,
			branch: [layout_loaded, error_loaded],
			url: event.url,
			params,
			ssr
		});
	} catch (err) {
		const error = coalesce_to_error(err);

		options.handle_error(error, event);

		return new Response(error.stack, {
			status: 500
		});
	}
}

/**
 * @typedef {import('./types.js').Loaded} Loaded
 * @typedef {import('types/internal').SSRNode} SSRNode
 * @typedef {import('types/internal').SSRRenderOptions} SSRRenderOptions
 * @typedef {import('types/internal').SSRRenderState} SSRRenderState
 */

/**
 * @param {{
 *   event: import('types/hooks').RequestEvent;
 *   options: SSRRenderOptions;
 *   state: SSRRenderState;
 *   $session: any;
 *   route: import('types/internal').SSRPage;
 *   params: Record<string, string>;
 *   ssr: boolean;
 * }} opts
 * @returns {Promise<Response | undefined>}
 */
async function respond$1(opts) {
	const { event, options, state, $session, route, ssr } = opts;

	/** @type {Array<SSRNode | undefined>} */
	let nodes;

	if (!ssr) {
		return await render_response({
			...opts,
			branch: [],
			page_config: {
				hydrate: true,
				router: true
			},
			status: 200,
			url: event.url,
			stuff: {}
		});
	}

	try {
		nodes = await Promise.all(
			route.a.map((n) => options.manifest._.nodes[n] && options.manifest._.nodes[n]())
		);
	} catch (err) {
		const error = coalesce_to_error(err);

		options.handle_error(error, event);

		return await respond_with_error({
			event,
			options,
			state,
			$session,
			status: 500,
			error,
			ssr
		});
	}

	// the leaf node will be present. only layouts may be undefined
	const leaf = /** @type {SSRNode} */ (nodes[nodes.length - 1]).module;

	let page_config = get_page_config(leaf, options);

	if (!leaf.prerender && state.prerender && !state.prerender.all) {
		// if the page has `export const prerender = true`, continue,
		// otherwise bail out at this point
		return new Response(undefined, {
			status: 204
		});
	}

	/** @type {Array<Loaded>} */
	let branch = [];

	/** @type {number} */
	let status = 200;

	/** @type {Error|undefined} */
	let error;

	/** @type {string[]} */
	let set_cookie_headers = [];

	let stuff = {};

	ssr: if (ssr) {
		for (let i = 0; i < nodes.length; i += 1) {
			const node = nodes[i];

			/** @type {Loaded | undefined} */
			let loaded;

			if (node) {
				try {
					loaded = await load_node({
						...opts,
						url: event.url,
						node,
						stuff,
						is_error: false
					});

					if (!loaded) return;

					set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);

					if (loaded.loaded.redirect) {
						return with_cookies(
							new Response(undefined, {
								status: loaded.loaded.status,
								headers: {
									location: loaded.loaded.redirect
								}
							}),
							set_cookie_headers
						);
					}

					if (loaded.loaded.error) {
						({ status, error } = loaded.loaded);
					}
				} catch (err) {
					const e = coalesce_to_error(err);

					options.handle_error(e, event);

					status = 500;
					error = e;
				}

				if (loaded && !error) {
					branch.push(loaded);
				}

				if (error) {
					while (i--) {
						if (route.b[i]) {
							const error_node = await options.manifest._.nodes[route.b[i]]();

							/** @type {Loaded} */
							let node_loaded;
							let j = i;
							while (!(node_loaded = branch[j])) {
								j -= 1;
							}

							try {
								const error_loaded = /** @type {import('./types').Loaded} */ (
									await load_node({
										...opts,
										url: event.url,
										node: error_node,
										stuff: node_loaded.stuff,
										is_error: true,
										status,
										error
									})
								);

								if (error_loaded.loaded.error) {
									continue;
								}

								page_config = get_page_config(error_node.module, options);
								branch = branch.slice(0, j + 1).concat(error_loaded);
								stuff = { ...node_loaded.stuff, ...error_loaded.stuff };
								break ssr;
							} catch (err) {
								const e = coalesce_to_error(err);

								options.handle_error(e, event);

								continue;
							}
						}
					}

					// TODO backtrack until we find an __error.svelte component
					// that we can use as the leaf node
					// for now just return regular error page
					return with_cookies(
						await respond_with_error({
							event,
							options,
							state,
							$session,
							status,
							error,
							ssr
						}),
						set_cookie_headers
					);
				}
			}

			if (loaded && loaded.loaded.stuff) {
				stuff = {
					...stuff,
					...loaded.loaded.stuff
				};
			}
		}
	}

	try {
		return with_cookies(
			await render_response({
				...opts,
				stuff,
				url: event.url,
				page_config,
				status,
				error,
				branch: branch.filter(Boolean)
			}),
			set_cookie_headers
		);
	} catch (err) {
		const error = coalesce_to_error(err);

		options.handle_error(error, event);

		return with_cookies(
			await respond_with_error({
				...opts,
				status: 500,
				error
			}),
			set_cookie_headers
		);
	}
}

/**
 * @param {import('types/internal').SSRComponent} leaf
 * @param {SSRRenderOptions} options
 */
function get_page_config(leaf, options) {
	// TODO remove for 1.0
	if ('ssr' in leaf) {
		throw new Error(
			'`export const ssr` has been removed — use the handle hook instead: https://kit.svelte.dev/docs#hooks-handle'
		);
	}

	return {
		router: 'router' in leaf ? !!leaf.router : options.router,
		hydrate: 'hydrate' in leaf ? !!leaf.hydrate : options.hydrate
	};
}

/**
 * @param {Response} response
 * @param {string[]} set_cookie_headers
 */
function with_cookies(response, set_cookie_headers) {
	if (set_cookie_headers.length) {
		set_cookie_headers.forEach((value) => {
			response.headers.append('set-cookie', value);
		});
	}
	return response;
}

/**
 * @param {import('types/hooks').RequestEvent} event
 * @param {import('types/internal').SSRPage} route
 * @param {RegExpExecArray} match
 * @param {import('types/internal').SSRRenderOptions} options
 * @param {import('types/internal').SSRRenderState} state
 * @param {boolean} ssr
 * @returns {Promise<Response | undefined>}
 */
async function render_page(event, route, match, options, state, ssr) {
	if (state.initiator === route) {
		// infinite request cycle detected
		return new Response(`Not found: ${event.url.pathname}`, {
			status: 404
		});
	}

	const params = route.params ? decode_params(route.params(match)) : {};

	const $session = await options.hooks.getSession(event);

	const response = await respond$1({
		event,
		options,
		state,
		$session,
		route,
		params,
		ssr
	});

	if (response) {
		return response;
	}

	if (state.fetched) {
		// we came here because of a bad request in a `load` function.
		// rather than render the error page — which could lead to an
		// infinite loop, if the `load` belonged to the root layout,
		// we respond with a bare-bones 500
		return new Response(`Bad request in load function: failed to fetch ${state.fetched}`, {
			status: 500
		});
	}
}

/** @type {import('types/internal').Respond} */
async function respond(request, options, state = {}) {
	const url = new URL(request.url);

	if (url.pathname !== '/' && options.trailing_slash !== 'ignore') {
		const has_trailing_slash = url.pathname.endsWith('/');

		if (
			(has_trailing_slash && options.trailing_slash === 'never') ||
			(!has_trailing_slash &&
				options.trailing_slash === 'always' &&
				!(url.pathname.split('/').pop() || '').includes('.'))
		) {
			url.pathname = has_trailing_slash ? url.pathname.slice(0, -1) : url.pathname + '/';

			if (url.search === '?') url.search = '';

			return new Response(undefined, {
				status: 301,
				headers: {
					location: url.pathname + url.search
				}
			});
		}
	}

	const { parameter, allowed } = options.method_override;
	const method_override = url.searchParams.get(parameter)?.toUpperCase();

	if (method_override) {
		if (request.method === 'POST') {
			if (allowed.includes(method_override)) {
				request = new Proxy(request, {
					get: (target, property, _receiver) => {
						if (property === 'method') return method_override;
						return Reflect.get(target, property, target);
					}
				});
			} else {
				const verb = allowed.length === 0 ? 'enabled' : 'allowed';
				const body = `${parameter}=${method_override} is not ${verb}. See https://kit.svelte.dev/docs#configuration-methodoverride`;

				return new Response(body, {
					status: 400
				});
			}
		} else {
			throw new Error(`${parameter}=${method_override} is only allowed with POST requests`);
		}
	}

	/** @type {import('types/hooks').RequestEvent} */
	const event = {
		request,
		url,
		params: {},
		locals: {},
		platform: state.platform
	};

	// TODO remove this for 1.0
	/**
	 * @param {string} property
	 * @param {string} replacement
	 * @param {string} suffix
	 */
	const removed = (property, replacement, suffix = '') => ({
		get: () => {
			throw new Error(`event.${property} has been replaced by event.${replacement}` + suffix);
		}
	});

	const details = '. See https://github.com/sveltejs/kit/pull/3384 for details';

	const body_getter = {
		get: () => {
			throw new Error(
				'To access the request body use the text/json/arrayBuffer/formData methods, e.g. `body = await request.json()`' +
					details
			);
		}
	};

	Object.defineProperties(event, {
		method: removed('method', 'request.method', details),
		headers: removed('headers', 'request.headers', details),
		origin: removed('origin', 'url.origin'),
		path: removed('path', 'url.pathname'),
		query: removed('query', 'url.searchParams'),
		body: body_getter,
		rawBody: body_getter
	});

	let ssr = true;

	try {
		const response = await options.hooks.handle({
			event,
			resolve: async (event, opts) => {
				if (opts && 'ssr' in opts) ssr = /** @type {boolean} */ (opts.ssr);

				if (state.prerender && state.prerender.fallback) {
					return await render_response({
						url: event.url,
						params: event.params,
						options,
						state,
						$session: await options.hooks.getSession(event),
						page_config: { router: true, hydrate: true },
						stuff: {},
						status: 200,
						branch: [],
						ssr: false
					});
				}

				let decoded = decodeURI(event.url.pathname);

				if (options.paths.base) {
					if (!decoded.startsWith(options.paths.base)) {
						return new Response(undefined, { status: 404 });
					}
					decoded = decoded.slice(options.paths.base.length) || '/';
				}

				for (const route of options.manifest._.routes) {
					const match = route.pattern.exec(decoded);
					if (!match) continue;

					const response =
						route.type === 'endpoint'
							? await render_endpoint(event, route, match)
							: await render_page(event, route, match, options, state, ssr);

					if (response) {
						// respond with 304 if etag matches
						if (response.status === 200 && response.headers.has('etag')) {
							let if_none_match_value = request.headers.get('if-none-match');

							// ignore W/ prefix https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match#directives
							if (if_none_match_value?.startsWith('W/"')) {
								if_none_match_value = if_none_match_value.substring(2);
							}

							const etag = /** @type {string} */ (response.headers.get('etag'));

							if (if_none_match_value === etag) {
								const headers = new Headers({ etag });

								// https://datatracker.ietf.org/doc/html/rfc7232#section-4.1
								for (const key of [
									'cache-control',
									'content-location',
									'date',
									'expires',
									'vary'
								]) {
									const value = response.headers.get(key);
									if (value) headers.set(key, value);
								}

								return new Response(undefined, {
									status: 304,
									headers
								});
							}
						}

						return response;
					}
				}

				// if this request came direct from the user, rather than
				// via a `fetch` in a `load`, render a 404 page
				if (!state.initiator) {
					const $session = await options.hooks.getSession(event);
					return await respond_with_error({
						event,
						options,
						state,
						$session,
						status: 404,
						error: new Error(`Not found: ${event.url.pathname}`),
						ssr
					});
				}

				// we can't load the endpoint from our own manifest,
				// so we need to make an actual HTTP request
				return await fetch(request);
			},

			// TODO remove for 1.0
			// @ts-expect-error
			get request() {
				throw new Error('request in handle has been replaced with event' + details);
			}
		});

		// TODO for 1.0, change the error message to point to docs rather than PR
		if (response && !(response instanceof Response)) {
			throw new Error('handle must return a Response object' + details);
		}

		return response;
	} catch (/** @type {unknown} */ e) {
		const error = coalesce_to_error(e);

		options.handle_error(error, event);

		try {
			const $session = await options.hooks.getSession(event);
			return await respond_with_error({
				event,
				options,
				state,
				$session,
				status: 500,
				error,
				ssr
			});
		} catch (/** @type {unknown} */ e) {
			const error = coalesce_to_error(e);

			return new Response(options.dev ? error.stack : error.message, {
				status: 500
			});
		}
	}
}

export { respond };
