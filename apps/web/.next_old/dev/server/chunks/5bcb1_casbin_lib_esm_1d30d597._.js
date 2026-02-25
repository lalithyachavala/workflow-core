module.exports = [
"[project]/apps/web/node_modules/casbin/lib/esm/util/ip.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ip",
    ()=>ip
]);
// This is a minimal subset of node-ip for handling IPMatch
// https://github.com/indutny/node-ip/blob/master/lib/ip.js
//
// ### License
//
// This software is licensed under the MIT License.
//
// Copyright Fedor Indutny, 2012.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/buffer/index.js [app-route] (ecmascript)");
;
const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
const ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
const ip = {
    toBuffer: function(ip, buff, offset) {
        offset = offset ? offset : 0;
        let result;
        if (this.isV4Format(ip)) {
            result = buff || new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Buffer"](offset + 4);
            ip.split(/\./g).map(function(byte) {
                offset = offset ? offset : 0;
                result[offset++] = parseInt(byte, 10) & 0xff;
            });
        } else if (this.isV6Format(ip)) {
            const sections = ip.split(':', 8);
            let i;
            for(i = 0; i < sections.length; i++){
                const isv4 = this.isV4Format(sections[i]);
                let v4Buffer;
                if (isv4) {
                    v4Buffer = this.toBuffer(sections[i]);
                    sections[i] = v4Buffer.slice(0, 2).toString('hex');
                }
                if (v4Buffer && ++i < 8) {
                    sections.splice(i, 0, v4Buffer.slice(2, 4).toString('hex'));
                }
            }
            if (sections[0] === '') {
                while(sections.length < 8)sections.unshift('0');
            } else if (sections[sections.length - 1] === '') {
                while(sections.length < 8)sections.push('0');
            } else if (sections.length < 8) {
                for(i = 0; i < sections.length && sections[i] !== ''; i++){}
                const argv = [
                    i,
                    1
                ];
                for(i = 9 - sections.length; i > 0; i--){
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    argv.push('0');
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line prefer-spread
                sections.splice.apply(sections, argv);
            }
            result = buff || new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Buffer"](offset + 16);
            for(i = 0; i < sections.length; i++){
                const word = parseInt(sections[i], 16);
                result[offset++] = word >> 8 & 0xff;
                result[offset++] = word & 0xff;
            }
        }
        if (!result) {
            throw Error('Invalid ip address: ' + ip);
        }
        return result;
    },
    toString: function(buff, offset, length) {
        offset = offset ? offset : 0;
        length = length || buff.length - offset;
        let result = [];
        if (length === 4) {
            // IPv4
            for(let i = 0; i < length; i++){
                result.push(buff[offset + i]);
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result = result.join('.');
        } else if (length === 16) {
            // IPv6
            for(let i = 0; i < length; i += 2){
                result.push(buff.readUInt16BE(offset + i).toString(16));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result = result.join(':');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result = result.replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result = result.replace(/:{3,4}/, '::');
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result;
    },
    isV4Format: function(ip) {
        return ipv4Regex.test(ip);
    },
    isV6Format: function(ip) {
        return ipv6Regex.test(ip);
    },
    fromPrefixLen: function(prefixlen, family) {
        if (prefixlen > 32) {
            family = 'ipv6';
        } else {
            family = _normalizeFamily(typeof family === 'string' ? family : '');
        }
        let len = 4;
        if (family === 'ipv6') {
            len = 16;
        }
        const buff = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Buffer"](len);
        for(let i = 0, n = buff.length; i < n; ++i){
            let bits = 8;
            if (prefixlen < 8) {
                bits = prefixlen;
            }
            prefixlen -= bits;
            buff[i] = ~(0xff >> bits) & 0xff;
        }
        return ip.toString(buff);
    },
    mask: function(addr, mask) {
        const addrBuffer = ip.toBuffer(addr);
        const maskBuffer = ip.toBuffer(mask);
        const result = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$buffer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Buffer"](Math.max(addrBuffer.length, maskBuffer.length));
        let i;
        // Same protocol - do bitwise and
        if (addrBuffer.length === maskBuffer.length) {
            for(i = 0; i < addrBuffer.length; i++){
                result[i] = addrBuffer[i] & maskBuffer[i];
            }
        } else if (maskBuffer.length === 4) {
            // IPv6 address and IPv4 mask
            // (Mask low bits)
            for(i = 0; i < maskBuffer.length; i++){
                result[i] = addrBuffer[addrBuffer.length - 4 + i] & maskBuffer[i];
            }
        } else {
            // IPv6 mask and IPv4 addr
            for(let i = 0; i < result.length - 6; i++){
                result[i] = 0;
            }
            // ::ffff:ipv4
            result[10] = 0xff;
            result[11] = 0xff;
            for(i = 0; i < addrBuffer.length; i++){
                result[i + 12] = addrBuffer[i] & maskBuffer[i + 12];
            }
            i = i + 12;
        }
        for(; i < result.length; i++)result[i] = 0;
        return ip.toString(result);
    },
    subnet: function(addr, mask) {
        const networkAddress = ip.toLong(ip.mask(addr, mask));
        // Calculate the mask's length.
        const maskBuffer = ip.toBuffer(mask);
        let maskLength = 0;
        for(let i = 0; i < maskBuffer.length; i++){
            if (maskBuffer[i] === 0xff) {
                maskLength += 8;
            } else {
                let octet = maskBuffer[i] & 0xff;
                while(octet){
                    octet = octet << 1 & 0xff;
                    maskLength++;
                }
            }
        }
        return {
            contains: function(other) {
                return networkAddress === ip.toLong(ip.mask(other, mask));
            }
        };
    },
    cidrSubnet: function(cidrString) {
        const cidrParts = cidrString.split('/');
        const addr = cidrParts[0];
        if (cidrParts.length !== 2) throw new Error('invalid CIDR subnet: ' + addr);
        const mask = ip.fromPrefixLen(parseInt(cidrParts[1], 10));
        return ip.subnet(addr, mask);
    },
    isEqual: function(a, b) {
        let aBuffer = ip.toBuffer(a);
        let bBuffer = ip.toBuffer(b);
        // Same protocol
        if (aBuffer.length === bBuffer.length) {
            for(let i = 0; i < aBuffer.length; i++){
                if (aBuffer[i] !== bBuffer[i]) return false;
            }
            return true;
        }
        // Swap
        if (bBuffer.length === 4) {
            const t = bBuffer;
            bBuffer = aBuffer;
            aBuffer = t;
        }
        // a - IPv4, b - IPv6
        for(let i = 0; i < 10; i++){
            if (bBuffer[i] !== 0) return false;
        }
        const word = bBuffer.readUInt16BE(10);
        if (word !== 0 && word !== 0xffff) return false;
        for(let i = 0; i < 4; i++){
            if (aBuffer[i] !== bBuffer[i + 12]) return false;
        }
        return true;
    },
    toLong: function(ip) {
        let ipl = 0;
        ip.split('.').forEach(function(octet) {
            ipl <<= 8;
            ipl += parseInt(octet);
        });
        return ipl >>> 0;
    },
    fromLong: function(ipl) {
        return (ipl >>> 24) + '.' + (ipl >> 16 & 255) + '.' + (ipl >> 8 & 255) + '.' + (ipl & 255);
    }
};
function _normalizeFamily(family) {
    return family ? family.toLowerCase() : 'ipv4';
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/util/builtinOperators.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateGFunction",
    ()=>generateGFunction,
    "generateSyncedGFunction",
    ()=>generateSyncedGFunction,
    "globMatch",
    ()=>globMatch,
    "ipMatchFunc",
    ()=>ipMatchFunc,
    "keyGet2Func",
    ()=>keyGet2Func,
    "keyGetFunc",
    ()=>keyGetFunc,
    "keyMatch2Func",
    ()=>keyMatch2Func,
    "keyMatch3Func",
    ()=>keyMatch3Func,
    "keyMatch4Func",
    ()=>keyMatch4Func,
    "keyMatch5Func",
    ()=>keyMatch5Func,
    "keyMatchFunc",
    ()=>keyMatchFunc,
    "regexMatchFunc",
    ()=>regexMatchFunc
]);
// Copyright 2017 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/ip.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/minimatch/dist/esm/index.js [app-route] (ecmascript) <locals>");
;
;
// regexMatch determines whether key1 matches the pattern of key2 in regular expression.
function regexMatch(key1, key2) {
    return new RegExp(key2).test(key1);
}
// keyMatch determines whether key1 matches the pattern of key2 (similar to RESTful path),
// key2 can contain a *.
// For example, '/foo/bar' matches '/foo/*'
function keyMatch(key1, key2) {
    const pos = key2.indexOf('*');
    if (pos === -1) {
        return key1 === key2;
    }
    if (key1.length > pos) {
        return key1.slice(0, pos) === key2.slice(0, pos);
    }
    return key1 === key2.slice(0, pos);
}
// keyMatchFunc is the wrapper for keyMatch.
function keyMatchFunc(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return keyMatch(name1, name2);
}
// KeyGet returns the matched part
// For example, "/foo/bar/foo" matches "/foo/*"
// "bar/foo" will been returned
function keyGet(key1, key2) {
    const pos = key2.indexOf('*');
    if (pos === -1) {
        return '';
    }
    if (key1.length > pos) {
        if (key1.slice(0, pos) === key2.slice(0, pos)) {
            return key1.slice(pos, key1.length);
        }
    }
    return '';
}
// keyGetFunc is the wrapper for keyGet.
function keyGetFunc(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return keyGet(name1, name2);
}
// keyMatch2 determines whether key1 matches the pattern of key2 (similar to RESTful path),
// key2 can contain a *.
// For example, '/foo/bar' matches '/foo/*', '/resource1' matches '/:resource'
function keyMatch2(key1, key2) {
    key2 = key2.replace(/\/\*/g, '/.*');
    const regexp = new RegExp(/(.*):[^/]+(.*)/g);
    for(;;){
        if (!key2.includes('/:')) {
            break;
        }
        key2 = key2.replace(regexp, '$1[^/]+$2');
    }
    if (key2 === '*') {
        key2 = '(.*)';
    }
    return regexMatch(key1, '^' + key2 + '$');
}
// keyMatch2Func is the wrapper for keyMatch2.
function keyMatch2Func(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return keyMatch2(name1, name2);
}
// KeyGet2 returns value matched pattern
// For example, "/resource1" matches "/:resource"
// if the pathVar == "resource", then "resource1" will be returned
function keyGet2(key1, key2, pathVar) {
    if (keyMatch2(key1, key2)) {
        const re = new RegExp('[^/]+', 'g');
        const keys = key2.match(re);
        const values = key1.match(re);
        if (!keys || !values) {
            return '';
        }
        const index = keys.indexOf(`:${pathVar}`);
        if (index === -1) {
            return '';
        }
        return values[index];
    } else {
        return '';
    }
}
function keyGet2Func(...args) {
    const [arg0, arg1, arg2] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    const name3 = (arg2 || '').toString();
    return keyGet2(name1, name2, name3);
}
// keyMatch3 determines whether key1 matches the pattern of key2 (similar to RESTful path), key2 can contain a *.
// For example, '/foo/bar' matches '/foo/*', '/resource1' matches '/{resource}'
function keyMatch3(key1, key2) {
    key2 = key2.replace(/\/\*/g, '/.*');
    const regexp = new RegExp(/(.*){[^/]+}(.*)/g);
    for(;;){
        if (!key2.includes('/{')) {
            break;
        }
        key2 = key2.replace(regexp, '$1[^/]+$2');
    }
    return regexMatch(key1, '^' + key2 + '$');
}
// keyMatch3Func is the wrapper for keyMatch3.
function keyMatch3Func(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return keyMatch3(name1, name2);
}
// keyMatch4 determines whether key1 matches the pattern of key2 (similar to RESTful path), key2 can contain a *.
// Besides what keyMatch3 does, keyMatch4 can also match repeated patterns:
// "/parent/123/child/123" matches "/parent/{id}/child/{id}"
// "/parent/123/child/456" does not match "/parent/{id}/child/{id}"
// But keyMatch3 will match both.
function keyMatch4(key1, key2) {
    key2 = key2.replace(/\/\*/g, '/.*');
    const tokens = [];
    let j = -1;
    for(let i = 0; i < key2.length; i++){
        const c = key2.charAt(i);
        if (c === '{') {
            j = i;
        } else if (c === '}') {
            tokens.push(key2.substring(j, i + 1));
        }
    }
    let regexp = new RegExp(/(.*){[^/]+}(.*)/g);
    for(;;){
        if (!key2.includes('/{')) {
            break;
        }
        key2 = key2.replace(regexp, '$1([^/]+)$2');
    }
    regexp = new RegExp('^' + key2 + '$');
    let values = regexp.exec(key1);
    if (!values) {
        return false;
    }
    values = values.slice(1);
    if (tokens.length !== values.length) {
        throw new Error('KeyMatch4: number of tokens is not equal to number of values');
    }
    const m = new Map();
    tokens.forEach((n, index)=>{
        const key = tokens[index];
        let v = m.get(key);
        if (!v) {
            v = [];
        }
        if (values) {
            v.push(values[index]);
        }
        m.set(key, v);
    });
    for (const value of m.values()){
        if (value.length > 1) {
            for(let i = 1; i < values.length; i++){
                if (values[i] !== values[0]) {
                    return false;
                }
            }
        }
    }
    return true;
}
// keyMatch4Func is the wrapper for keyMatch4.
function keyMatch4Func(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return keyMatch4(name1, name2);
}
// KeyMatch determines whether key1 matches the pattern of key2 and ignores the parameters in key2.
// For example, "/foo/bar?status=1&type=2" matches "/foo/bar"
function KeyMatch5(key1, key2) {
    const i = key1.indexOf('?');
    if (i !== -1) {
        key1 = key1.slice(0, i);
    }
    key2 = key2.replace(/\/\*/g, '/.*');
    const regexp = new RegExp(/(.*){[^/]+}(.*)/g);
    for(;;){
        if (!key2.includes('/{')) {
            break;
        }
        key2 = key2.replace(regexp, '$1[^/]+$2');
    }
    return regexMatch(key1, '^' + key2 + '$');
}
// keyMatch5Func is the wrapper for KeyMatch5.
function keyMatch5Func(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return KeyMatch5(name1, name2);
}
// regexMatchFunc is the wrapper for regexMatch.
function regexMatchFunc(...args) {
    const [arg0, arg1] = args;
    const name1 = (arg0 || '').toString();
    const name2 = (arg1 || '').toString();
    return regexMatch(name1, name2);
}
// ipMatch determines whether IP address ip1 matches the pattern of IP address ip2,
// ip2 can be an IP address or a CIDR pattern.
// For example, '192.168.2.123' matches '192.168.2.0/24'
function ipMatch(ip1, ip2) {
    // check ip1
    if (!(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].isV4Format(ip1) || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].isV6Format(ip1))) {
        throw new Error('invalid argument: ip1 in ipMatch() function is not an IP address.');
    }
    // check ip2
    const cidrParts = ip2.split('/');
    if (cidrParts.length === 2) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].cidrSubnet(ip2).contains(ip1);
    } else {
        if (!(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].isV4Format(ip2) || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].isV6Format(ip2))) {
            console.log(ip2);
            throw new Error('invalid argument: ip2 in ipMatch() function is not an IP address.');
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$ip$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ip"].isEqual(ip1, ip2);
    }
}
// ipMatchFunc is the wrapper for ipMatch.
function ipMatchFunc(...args) {
    const [arg0, arg1] = args;
    const ip1 = (arg0 || '').toString();
    const ip2 = (arg1 || '').toString();
    return ipMatch(ip1, ip2);
}
/**
 * Returns true if the specified `string` matches the given glob `pattern`.
 *
 * @param string String to match
 * @param pattern Glob pattern to use for matching.
 * @returns Returns true if the string matches the glob pattern.
 *
 * @example
 * ```javascript
 * globMatch("abc.conf", "*.conf") => true
 * ```
 */ function globMatch(string, pattern) {
    // The minimatch doesn't support the pattern starts with *
    // See https://github.com/isaacs/minimatch/issues/195
    if (pattern[0] === '*' && pattern[1] === '/') {
        pattern = pattern.substring(1);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["minimatch"])(string, pattern);
}
// generateGFunction is the factory method of the g(_, _) function.
function generateGFunction(rm) {
    const memorized = new Map();
    return async function(...args) {
        const key = args.toString();
        let value = memorized.get(key);
        if (value) {
            return value;
        }
        const [arg0, arg1] = args;
        const name1 = (arg0 || '').toString();
        const name2 = (arg1 || '').toString();
        if (!rm) {
            value = name1 === name2;
        } else if (args.length === 2) {
            value = await rm.hasLink(name1, name2);
        } else {
            const domain = args[2].toString();
            value = await rm.hasLink(name1, name2, domain);
        }
        memorized.set(key, value);
        return value;
    };
}
// generateSyncedGFunction is the synchronous factory method of the g(_, _) function.
function generateSyncedGFunction(rm) {
    const memorized = new Map();
    return function(...args) {
        const key = args.toString();
        let value = memorized.get(key);
        if (value) {
            return value;
        }
        const [arg0, arg1] = args;
        const name1 = (arg0 || '').toString();
        const name2 = (arg1 || '').toString();
        if (!rm) {
            value = name1 === name2;
        } else if (!(rm === null || rm === void 0 ? void 0 : rm.syncedHasLink)) {
            throw new Error('RoleManager requires syncedHasLink for synchronous execution');
        } else if (args.length === 2) {
            value = rm.syncedHasLink(name1, name2);
        } else {
            const domain = args[2].toString();
            value = rm.syncedHasLink(name1, name2, domain);
        }
        memorized.set(key, value);
        return value;
    };
}
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/adapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/helper.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasicCsvParser",
    ()=>BasicCsvParser,
    "BracketAwareCsvParser",
    ()=>BracketAwareCsvParser,
    "Helper",
    ()=>Helper,
    "PolicyLoader",
    ()=>PolicyLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$csv$2d$parse$2f$lib$2f$sync$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/csv-parse/lib/sync.js [app-route] (ecmascript) <locals>");
;
class BasicCsvParser {
    parse(line) {
        if (!line || line.trimStart().charAt(0) === '#') {
            return null;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$csv$2d$parse$2f$lib$2f$sync$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parse"])(line, {
            delimiter: ',',
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true
        });
    }
}
class BracketAwareCsvParser {
    constructor(baseParser = new BasicCsvParser()){
        this.baseParser = baseParser;
    }
    parse(line) {
        const rawTokens = this.baseParser.parse(line);
        if (!rawTokens || !rawTokens[0]) {
            return null;
        }
        const tokens = rawTokens[0];
        const processedTokens = [];
        let currentToken = '';
        let bracketCount = 0;
        for (const token of tokens){
            for (const char of token){
                if (char === '(') bracketCount++;
                else if (char === ')') bracketCount--;
            }
            currentToken += (currentToken ? ',' : '') + token;
            if (bracketCount === 0) {
                processedTokens.push(currentToken);
                currentToken = '';
            }
        }
        if (bracketCount !== 0) {
            throw new Error(`Unmatched brackets in policy line: ${line}`);
        }
        return processedTokens.length > 0 ? [
            processedTokens
        ] : null;
    }
}
class PolicyLoader {
    constructor(parser = new BracketAwareCsvParser()){
        this.parser = parser;
    }
    loadPolicyLine(line, model) {
        const tokens = this.parser.parse(line);
        if (!tokens || !tokens[0]) {
            return;
        }
        let key = tokens[0][0].trim();
        if (key.startsWith('"') && key.endsWith('"')) {
            key = key.slice(1, -1);
        }
        const sec = key.substring(0, 1);
        const item = model.model.get(sec);
        if (!item) {
            return;
        }
        const policy = item.get(key);
        if (!policy) {
            return;
        }
        const values = tokens[0].slice(1).map((v)=>{
            if (v.startsWith('"') && v.endsWith('"')) {
                v = v.slice(1, -1);
            }
            return v.replace(/""/g, '"').trim();
        });
        policy.policy.push(values);
    }
}
class Helper {
    static loadPolicyLine(line, model) {
        Helper.policyLoader.loadPolicyLine(line, model);
    }
}
Helper.policyLoader = new PolicyLoader();
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultFileSystem",
    ()=>getDefaultFileSystem,
    "mustGetDefaultFileSystem",
    ()=>mustGetDefaultFileSystem,
    "setDefaultFileSystem",
    ()=>setDefaultFileSystem
]);
let defaultFileSystem = undefined;
const ErrorNoFileSystem = new Error('please set the default FileSystem by call the setDefaultFileSystem');
const setDefaultFileSystem = (fs)=>{
    defaultFileSystem = fs;
};
const getDefaultFileSystem = ()=>defaultFileSystem;
const mustGetDefaultFileSystem = ()=>{
    if (defaultFileSystem) {
        return defaultFileSystem;
    }
    throw ErrorNoFileSystem;
};
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/fileAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileAdapter",
    ()=>FileAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/helper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)");
;
;
;
class FileAdapter {
    /**
     * FileAdapter is the constructor for FileAdapter.
     *
     * @param filePath filePath the path of the policy file.
     * @param fs {@link FileSystem}
     */ constructor(filePath, fs){
        this.filePath = filePath;
        this.fs = fs;
    }
    async loadPolicy(model) {
        if (!this.filePath) {
            // throw new Error('invalid file path, file path cannot be empty');
            return;
        }
        await this.loadPolicyFile(model, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Helper"].loadPolicyLine);
    }
    async loadPolicyFile(model, handler) {
        const bodyBuf = await (this.fs ? this.fs : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mustGetDefaultFileSystem"])()).readFileSync(this.filePath);
        const lines = bodyBuf.toString().split('\n');
        lines.forEach((line)=>{
            if (!line || line.trim().startsWith('#')) {
                return;
            }
            handler(line, model);
        });
    }
    /**
     * savePolicy saves all policy rules to the storage.
     */ async savePolicy(model) {
        if (!this.filePath) {
            // throw new Error('invalid file path, file path cannot be empty');
            return false;
        }
        let result = '';
        const pList = model.model.get('p');
        if (!pList) {
            return false;
        }
        pList.forEach((n)=>{
            n.policy.forEach((m)=>{
                result += n.key + ', ';
                result += (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayToString"])(m);
                result += '\n';
            });
        });
        const gList = model.model.get('g');
        if (!gList) {
            return false;
        }
        gList.forEach((n)=>{
            n.policy.forEach((m)=>{
                result += n.key + ', ';
                result += (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayToString"])(m.map((element)=>this.escapeCsv(element)));
                result += '\n';
            });
        });
        await this.savePolicyFile(result.trim());
        return true;
    }
    escapeCsv(value) {
        // If the value contains a comma, wrap it in double quotes and escape any existing double quotes
        if (value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
    async savePolicyFile(text) {
        (this.fs ? this.fs : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mustGetDefaultFileSystem"])()).writeFileSync(this.filePath, text);
    }
    /**
     * addPolicy adds a policy rule to the storage.
     */ async addPolicy(sec, ptype, rule) {
        throw new Error('not implemented');
    }
    /**
     * addPolicies adds policy rules to the storage.
     This is part of the Auto-Save feature.
     */ async addPolicies(sec, ptype, rules) {
        throw new Error('not implemented');
    }
    /**
     * UpdatePolicy updates a policy rule from storage.
     * This is part of the Auto-Save feature.
     */ updatePolicy(sec, ptype, oldRule, newRule) {
        throw new Error('not implemented');
    }
    /**
     * removePolicy removes a policy rule from the storage.
     */ async removePolicy(sec, ptype, rule) {
        throw new Error('not implemented');
    }
    /**
     * removePolicies removes policy rules from the storage.
     * This is part of the Auto-Save feature.
     */ async removePolicies(sec, ptype, rules) {
        throw new Error('not implemented');
    }
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */ async removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
        throw new Error('not implemented');
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/stringAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StringAdapter",
    ()=>StringAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/helper.js [app-route] (ecmascript)");
;
class StringAdapter {
    /**
     * StringAdapter is the constructor for StringAdapter.
     * @param {string} policy policy formatted as a CSV string.
     */ constructor(policy){
        this.policy = policy;
    }
    async loadPolicy(model) {
        if (!this.policy) {
            throw new Error('Invalid policy, policy document cannot be false-y');
        }
        await this.loadRules(model, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Helper"].loadPolicyLine);
    }
    async loadRules(model, handler) {
        const rules = this.policy.split('\n');
        rules.forEach((n, index)=>{
            if (!n) {
                return;
            }
            handler(n, model);
        });
    }
    /**
     * savePolicy saves all policy rules to the storage.
     */ async savePolicy(model) {
        throw new Error('not implemented');
    }
    /**
     * addPolicy adds a policy rule to the storage.
     */ async addPolicy(sec, ptype, rule) {
        throw new Error('not implemented');
    }
    /**
     * removePolicy removes a policy rule from the storage.
     */ async removePolicy(sec, ptype, rule) {
        throw new Error('not implemented');
    }
    /**
     * removeFilteredPolicy removes policy rules that match the filter from the storage.
     */ async removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
        throw new Error('not implemented');
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/watcher.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/watcherEx.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2022 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/filteredAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/defaultFilteredAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefaultFilteredAdapter",
    ()=>DefaultFilteredAdapter,
    "Filter",
    ()=>Filter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/helper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
;
;
;
class Filter {
    constructor(){
        this.g = [];
        this.p = [];
    }
}
class DefaultFilteredAdapter extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FileAdapter"] {
    constructor(filePath){
        super(filePath);
        this.filtered = false;
    }
    // loadPolicy loads all policy rules from the storage.
    async loadPolicy(model) {
        this.filtered = false;
        await super.loadPolicy(model);
    }
    async loadFilteredPolicy(model, filter) {
        if (!filter) {
            await this.loadPolicy(model);
            return;
        }
        if (!this.filePath) {
            throw new Error('invalid file path, file path cannot be empty');
        }
        await this.loadFilteredPolicyFile(model, filter, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Helper"].loadPolicyLine);
        this.filtered = true;
    }
    async loadFilteredPolicyFile(model, filter, handler) {
        const bodyBuf = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readFile"])(this.filePath);
        const lines = bodyBuf.toString().split('\n');
        lines.forEach((n, index)=>{
            const line = n;
            if (!line || DefaultFilteredAdapter.filterLine(line, filter)) {
                return;
            }
            handler(line, model);
        });
    }
    isFiltered() {
        return this.filtered;
    }
    async savePolicy(model) {
        if (this.filtered) {
            throw new Error('cannot save a filtered policy');
        }
        await super.savePolicy(model);
        return true;
    }
    static filterLine(line, filter) {
        if (!filter) {
            return false;
        }
        const p = line.split(',');
        if (p.length === 0) {
            return true;
        }
        let filterSlice = [];
        switch(p[0].trim()){
            case 'p':
                filterSlice = filter.p;
                break;
            case 'g':
                filterSlice = filter.g;
                break;
        }
        return DefaultFilteredAdapter.filterWords(p, filterSlice);
    }
    static filterWords(line, filter) {
        if (line.length < filter.length + 1) {
            return true;
        }
        let skipLine = false;
        for(let i = 0; i < filter.length; i++){
            if (filter[i] && filter[i] !== filter[i + 1]) {
                skipLine = true;
                break;
            }
        }
        return skipLine;
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/batchAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/batchFileAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchFileAdapter",
    ()=>BatchFileAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileAdapter.js [app-route] (ecmascript)");
;
class BatchFileAdapter extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FileAdapter"] {
    /**
     * FileAdapter is the constructor for FileAdapter.
     * @param {string} filePath filePath the path of the policy file.
     */ constructor(filePath){
        super(filePath);
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/updatableAdapter.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2021 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/persist/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$adapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/adapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$stringAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/stringAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/helper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$watcher$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/watcher.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$watcherEx$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/watcherEx.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$filteredAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/filteredAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$defaultFilteredAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/defaultFilteredAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$batchAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/batchAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$batchFileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/batchFileAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$updatableAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/updatableAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "array2DEquals",
    ()=>array2DEquals,
    "arrayEquals",
    ()=>arrayEquals,
    "arrayRemoveDuplicates",
    ()=>arrayRemoveDuplicates,
    "arrayToString",
    ()=>arrayToString,
    "bracketCompatible",
    ()=>bracketCompatible,
    "customIn",
    ()=>customIn,
    "deepCopy",
    ()=>deepCopy,
    "escapeAssertion",
    ()=>escapeAssertion,
    "generatorRunAsync",
    ()=>generatorRunAsync,
    "generatorRunSync",
    ()=>generatorRunSync,
    "getEvalValue",
    ()=>getEvalValue,
    "hasEval",
    ()=>hasEval,
    "paramsToString",
    ()=>paramsToString,
    "readFile",
    ()=>readFile,
    "removeComments",
    ()=>removeComments,
    "replaceEval",
    ()=>replaceEval,
    "setEquals",
    ()=>setEquals,
    "writeFile",
    ()=>writeFile
]);
// Copyright 2017 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// escapeAssertion escapes the dots in the assertion,
// because the expression evaluation doesn't support such variable names.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)");
;
const escapeAssertionReg = new RegExp(/([()\s|&,=!><+\-*/]|^)((r|p)[0-9]*)\./g);
function escapeAssertion(s) {
    s = s.replace(escapeAssertionReg, (match)=>{
        // Replace only the last dot with underscore (preserve the prefix character)
        const lastDotIdx = match.lastIndexOf('.');
        if (lastDotIdx > 0) {
            return match.substring(0, lastDotIdx) + '_';
        }
        return match;
    });
    return s;
}
// removeComments removes the comments starting with # in the text.
function removeComments(s) {
    const pos = s.indexOf('#');
    return pos > -1 ? s.slice(0, pos).trim() : s;
}
// arrayEquals determines whether two string arrays are identical.
function arrayEquals(a = [], b = []) {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
        return false;
    }
    for(let i = 0; i < aLen; i++){
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
// array2DEquals determines whether two 2-dimensional string arrays are identical.
function array2DEquals(a = [], b = []) {
    const aLen = a.length;
    const bLen = a.length;
    if (aLen !== bLen) {
        return false;
    }
    for(let i = 0; i < aLen; i++){
        if (!arrayEquals(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
// arrayRemoveDuplicates removes any duplicated elements in a string array.
function arrayRemoveDuplicates(s) {
    return [
        ...new Set(s)
    ];
}
// arrayToString gets a printable string for a string array.
function arrayToString(a) {
    return a.join(', ');
}
// paramsToString gets a printable string for variable number of parameters.
function paramsToString(...v) {
    return v.join(', ');
}
// setEquals determines whether two string sets are identical.
function setEquals(a, b) {
    return arrayEquals(a.sort(), b.sort());
}
// readFile return a promise for readFile.
function readFile(path, encoding) {
    const fs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mustGetDefaultFileSystem"])();
    return new Promise((resolve, reject)=>{
        try {
            const content = fs.readFileSync(path, encoding || 'utf8');
            resolve(content);
        } catch (e) {
            reject(e);
        }
    });
}
// writeFile return a promise for writeFile.
function writeFile(path, file, encoding) {
    const fs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mustGetDefaultFileSystem"])();
    return new Promise((resolve, reject)=>{
        try {
            fs.writeFileSync(path, file, encoding || 'utf-8');
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}
const evalRegG = new RegExp(/\beval\(([^),]*)\)/g);
const evalReg = new RegExp(/\beval\(([^),]*)\)/);
// hasEval determine whether matcher contains function eval
function hasEval(s) {
    return evalReg.test(s);
}
// replaceEval replace function eval with the value of its parameters
function replaceEval(s, ruleName, rule) {
    return s.replace(`eval(${ruleName})`, '(' + rule + ')');
}
// getEvalValue returns the parameters of function eval
function getEvalValue(s) {
    const subMatch = s.match(evalRegG);
    const rules = [];
    if (!subMatch) {
        return [];
    }
    for (const rule of subMatch){
        const index = rule.indexOf('(');
        rules.push(rule.slice(index + 1, -1));
    }
    return rules;
}
// generatorRunSync handle generator function in Sync model and return value which is not Promise
function generatorRunSync(iterator) {
    let { value, done } = iterator.next();
    while(true){
        if (value instanceof Promise) {
            throw new Error('cannot handle Promise in generatorRunSync, Please use generatorRunAsync');
        }
        if (!done) {
            const temp = value;
            ({ value, done } = iterator.next(temp));
        } else {
            return value;
        }
    }
}
// generatorRunAsync handle generator function in Async model and return Promise
async function generatorRunAsync(iterator) {
    let { value, done } = iterator.next();
    while(true){
        if (!done) {
            const temp = await value;
            ({ value, done } = iterator.next(temp));
        } else {
            return value;
        }
    }
}
function deepCopy(obj) {
    if (typeof obj !== 'object') return;
    const newObj = obj instanceof Array ? [] : {};
    for(const key in obj){
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
        }
    }
    return newObj;
}
function customIn(a, b) {
    if (b instanceof Array) {
        return b.includes(a);
    }
    return a in b;
}
function bracketCompatible(exp) {
    // TODO: This function didn't support nested bracket.
    if (!(exp.includes(' in ') && exp.includes(' ('))) {
        return exp;
    }
    const re = / \([^)]*\)/g;
    const array = exp.split('');
    let reResult;
    while((reResult = re.exec(exp)) !== null){
        if (!reResult[0].includes(',')) {
            continue;
        }
        array[reResult.index + 1] = '[';
        array[re.lastIndex - 1] = ']';
    }
    exp = array.join('');
    return exp;
}
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/builtinOperators.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "array2DEquals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["array2DEquals"],
    "arrayEquals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayEquals"],
    "arrayRemoveDuplicates",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayRemoveDuplicates"],
    "arrayToString",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayToString"],
    "bracketCompatible",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bracketCompatible"],
    "customIn",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customIn"],
    "deepCopy",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCopy"],
    "escapeAssertion",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapeAssertion"],
    "generateGFunction",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateGFunction"],
    "generateSyncedGFunction",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSyncedGFunction"],
    "generatorRunAsync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"],
    "generatorRunSync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunSync"],
    "getEvalValue",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEvalValue"],
    "globMatch",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globMatch"],
    "hasEval",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEval"],
    "ipMatchFunc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ipMatchFunc"],
    "keyGet2Func",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyGet2Func"],
    "keyGetFunc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyGetFunc"],
    "keyMatch2Func",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch2Func"],
    "keyMatch3Func",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch3Func"],
    "keyMatch4Func",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch4Func"],
    "keyMatch5Func",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch5Func"],
    "keyMatchFunc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatchFunc"],
    "paramsToString",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paramsToString"],
    "readFile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readFile"],
    "regexMatchFunc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["regexMatchFunc"],
    "removeComments",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeComments"],
    "replaceEval",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceEval"],
    "setEquals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setEquals"],
    "writeFile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeFile"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/builtinOperators.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
}),
"[project]/apps/web/node_modules/casbin/lib/esm/config.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Config",
    ()=>Config
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)");
;
class Config {
    constructor(fs){
        this.data = new Map();
        if (fs) {
            this.fs = fs;
        }
    }
    /**
     * newConfig create an empty configuration representation from file.
     *
     * @param confName the path of the model file.
     * @return the constructor of Config.
     * @deprecated use {@link newConfigFromFile} instead.
     */ static newConfig(confName) {
        return this.newConfigFromFile(confName);
    }
    /**
     * newConfigFromFile create an empty configuration representation from file.
     * @param path the path of the model file.
     * @param fs {@link FileSystem}
     */ static newConfigFromFile(path, fs) {
        const config = new Config(fs);
        config.parse(path);
        return config;
    }
    /**
     * newConfigFromText create an empty configuration representation from text.
     *
     * @param text the model text.
     * @return the constructor of Config.
     */ static newConfigFromText(text) {
        const config = new Config();
        config.parseBuffer(Buffer.from(text));
        return config;
    }
    /**
     * addConfig adds a new section->key:value to the configuration.
     */ addConfig(section, option, value) {
        if (section === '') {
            section = Config.DEFAULT_SECTION;
        }
        const hasKey = this.data.has(section);
        if (!hasKey) {
            this.data.set(section, new Map());
        }
        const item = this.data.get(section);
        if (item) {
            item.set(option, value);
            return item.has(option);
        } else {
            return false;
        }
    }
    parse(path) {
        const body = (this.fs ? this.fs : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mustGetDefaultFileSystem"])()).readFileSync(path);
        this.parseBuffer(Buffer.isBuffer(body) ? body : Buffer.from(body));
    }
    parseBuffer(buf) {
        const lines = buf.toString().split('\n').filter((v)=>v);
        const linesCount = lines.length;
        let section = '';
        let currentLine = '';
        const seenSections = new Set();
        lines.forEach((n, index)=>{
            let commentPos = n.indexOf(Config.DEFAULT_COMMENT);
            if (commentPos > -1) {
                n = n.slice(0, commentPos);
            }
            commentPos = n.indexOf(Config.DEFAULT_COMMENT_SEM);
            if (commentPos > -1) {
                n = n.slice(0, commentPos);
            }
            const line = n.trim();
            if (!line) {
                return;
            }
            const lineNumber = index + 1;
            if (line.startsWith('[') && line.endsWith(']')) {
                if (currentLine.length !== 0) {
                    this.write(section, lineNumber - 1, currentLine);
                    currentLine = '';
                }
                section = line.substring(1, line.length - 1);
                if (seenSections.has(section)) {
                    throw new Error(`Duplicated section: ${section} at line ${lineNumber}`);
                }
                seenSections.add(section);
            } else {
                let shouldWrite = false;
                if (line.endsWith(Config.DEFAULT_MULTI_LINE_SEPARATOR)) {
                    currentLine += line.substring(0, line.length - 1).trim();
                } else {
                    currentLine += line;
                    shouldWrite = true;
                }
                if (shouldWrite || lineNumber === linesCount) {
                    this.write(section, lineNumber, currentLine);
                    currentLine = '';
                }
            }
        });
    }
    write(section, lineNum, line) {
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) {
            throw new Error(`parse the content error : line ${lineNum}`);
        }
        const key = line.substring(0, equalIndex);
        const value = line.substring(equalIndex + 1);
        this.addConfig(section, key.trim(), value.trim());
    }
    getBool(key) {
        return !!this.get(key);
    }
    getInt(key) {
        return Number.parseInt(this.get(key), 10);
    }
    getFloat(key) {
        return Number.parseFloat(this.get(key));
    }
    getString(key) {
        return this.get(key);
    }
    getStrings(key) {
        const v = this.get(key);
        return v.split(',');
    }
    set(key, value) {
        if (!key) {
            throw new Error('key is empty');
        }
        let section = '';
        let option;
        const keys = key.toLowerCase().split('::');
        if (keys.length >= 2) {
            section = keys[0];
            option = keys[1];
        } else {
            option = keys[0];
        }
        this.addConfig(section, option, value);
    }
    get(key) {
        let section;
        let option;
        const keys = key.toLowerCase().split('::');
        if (keys.length >= 2) {
            section = keys[0];
            option = keys[1];
        } else {
            section = Config.DEFAULT_SECTION;
            option = keys[0];
        }
        const item = this.data.get(section);
        const itemChild = item && item.get(option);
        return itemChild ? itemChild : '';
    }
}
Config.DEFAULT_SECTION = 'default';
Config.DEFAULT_COMMENT = '#';
Config.DEFAULT_COMMENT_SEM = ';';
Config.DEFAULT_MULTI_LINE_SEPARATOR = '\\';
}),
"[project]/apps/web/node_modules/casbin/lib/esm/effect/effector.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([
    "Effect",
    ()=>Effect
]);
var Effect;
(function(Effect) {
    Effect[Effect["Allow"] = 1] = "Allow";
    Effect[Effect["Indeterminate"] = 2] = "Indeterminate";
    Effect[Effect["Deny"] = 3] = "Deny";
})(Effect || (Effect = {}));
}),
"[project]/apps/web/node_modules/casbin/lib/esm/effect/effectorStream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2020 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffectorStream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefaultEffectorStream",
    ()=>DefaultEffectorStream
]);
// Copyright 2020 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/effector.js [app-route] (ecmascript)");
;
class DefaultEffectorStream {
    constructor(expr){
        this.done = false;
        this.res = false;
        this.rec = false;
        this.expr = expr;
    }
    current() {
        return this.res;
    }
    pushEffect(eft) {
        switch(this.expr){
            case "some(where (p_eft == allow))" /* EffectExpress.ALLOW */ :
                if (eft === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow) {
                    this.res = true;
                    this.done = true;
                    this.rec = true;
                }
                break;
            case "!some(where (p_eft == deny))" /* EffectExpress.DENY */ :
                this.res = true;
                if (eft === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Deny) {
                    this.res = false;
                    this.done = true;
                    this.rec = true;
                }
                break;
            case "some(where (p_eft == allow)) && !some(where (p_eft == deny))" /* EffectExpress.ALLOW_AND_DENY */ :
                if (eft === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow) {
                    this.res = true;
                    this.rec = true;
                } else if (eft === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Deny) {
                    this.res = false;
                    this.done = true;
                    this.rec = true;
                } else {
                    this.rec = false;
                }
                break;
            case "priority(p_eft) || deny" /* EffectExpress.PRIORITY */ :
            case "subjectPriority(p_eft) || deny" /* EffectExpress.SUBJECT_PRIORITY */ :
                if (eft !== __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate) {
                    this.res = eft === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow;
                    this.done = true;
                    this.rec = true;
                }
                break;
            default:
                throw new Error('unsupported effect');
        }
        return [
            this.res,
            this.rec,
            this.done
        ];
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffector.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefaultEffector",
    ()=>DefaultEffector
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffectorStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffectorStream.js [app-route] (ecmascript)");
;
class DefaultEffector {
    newStream(expr) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffectorStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultEffectorStream"](expr);
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/effect/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/effector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effectorStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/effectorStream.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffectorStream$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffectorStream.js [app-route] (ecmascript)");
;
;
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/log/defaultLogger.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2019 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// DefaultLogger is the implementation for a Logger
__turbopack_context__.s([
    "DefaultLogger",
    ()=>DefaultLogger
]);
class DefaultLogger {
    constructor(){
        this.enable = false;
    }
    enableLog(enable) {
        this.enable = enable;
    }
    isEnable() {
        return this.enable;
    }
    print(...v) {
        if (this.enable) {
            console.log(...v);
        }
    }
    printf(format, ...v) {
        if (this.enable) {
            console.log(format, ...v);
        }
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/log/logger.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2019 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLogger",
    ()=>getLogger,
    "logPrint",
    ()=>logPrint,
    "logPrintf",
    ()=>logPrintf,
    "setLogger",
    ()=>setLogger
]);
// Copyright 2019 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$defaultLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/defaultLogger.js [app-route] (ecmascript)");
;
let logger = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$defaultLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultLogger"]();
// setLogger sets the current logger.
function setLogger(l) {
    logger = l;
}
// getLogger returns the current logger.
function getLogger() {
    return logger;
}
// logPrint prints the log.
function logPrint(...v) {
    logger.print(...v);
}
// logPrintf prints the log with the format.
function logPrintf(format, ...v) {
    logger.printf(format, ...v);
}
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2019 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$defaultLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/defaultLogger.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logger.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
;
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/rbac/defaultRoleManager.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DefaultRoleManager",
    ()=>DefaultRoleManager
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
;
// DEFAULT_DOMAIN defines the default domain space.
const DEFAULT_DOMAIN = 'casbin::default';
// loadOrDefault returns the existing value for the key if present.
// Otherwise, it stores and returns the given value.
function loadOrDefault(map, key, value) {
    const read = map.get(key);
    if (read === undefined) {
        map.set(key, value);
        return value;
    }
    return read;
}
/**
 * Role represents the data structure for a role in RBAC.
 */ class Role {
    constructor(name){
        this.name = name;
        this.roles = [];
    }
    addRole(role) {
        if (this.roles.some((n)=>n.name === role.name)) {
            return;
        }
        this.roles.push(role);
    }
    deleteRole(role) {
        this.roles = this.roles.filter((n)=>n.name !== role.name);
    }
    hasRole(name, hierarchyLevel) {
        if (this.name === name) {
            return true;
        }
        if (hierarchyLevel <= 0) {
            return false;
        }
        for (const role of this.roles){
            if (role.hasRole(name, hierarchyLevel - 1)) {
                return true;
            }
        }
        return false;
    }
    hasDirectRole(name) {
        return this.roles.some((n)=>n.name === name);
    }
    toString() {
        return this.name + this.roles.join(', ');
    }
    getRoles() {
        return this.roles.map((n)=>n.name);
    }
}
class Roles extends Map {
    constructor(){
        super();
    }
    hasRole(name, matchingFunc) {
        let ok = false;
        if (matchingFunc) {
            this.forEach((value, key)=>{
                if (matchingFunc(name, key)) {
                    ok = true;
                }
            });
        } else {
            return this.has(name);
        }
        return ok;
    }
    createRole(name, matchingFunc) {
        const role = loadOrDefault(this, name, new Role(name));
        if (matchingFunc) {
            this.forEach((value, key)=>{
                if (matchingFunc(name, key) && name !== key) {
                    // Add new role to matching role
                    const role1 = loadOrDefault(this, key, new Role(key));
                    role.addRole(role1);
                }
            });
        }
        return role;
    }
}
class DefaultRoleManager {
    /**
     * DefaultRoleManager is the constructor for creating an instance of the
     * default RoleManager implementation.
     *
     * @param maxHierarchyLevel the maximized allowed RBAC hierarchy level.
     */ constructor(maxHierarchyLevel){
        this.hasPattern = false;
        this.hasDomainPattern = false;
        this.hasDomainHierarchy = false;
        this.allDomains = new Map();
        this.allDomains.set(DEFAULT_DOMAIN, new Roles());
        this.maxHierarchyLevel = maxHierarchyLevel;
    }
    /**
     * addMatchingFunc support use pattern in g
     * @param name name
     * @param fn matching function
     * @deprecated
     */ async addMatchingFunc(name, fn) {
        this.hasPattern = true;
        if (typeof name === 'string' && fn) {
            this.matchingFunc = fn;
        } else if (typeof name === 'function') {
            this.matchingFunc = name;
        } else {
            throw new Error('error: domain should be 1 parameter');
        }
    }
    /**
     * addDomainMatchingFunc support use domain pattern in g
     * @param fn domain matching function
     * ```
     */ async addDomainMatchingFunc(fn) {
        this.hasDomainPattern = true;
        this.domainMatchingFunc = fn;
    }
    /**
     * addDomainHierarchy sets a rolemanager to define role inheritance between domains
     * @param rm RoleManager to define domain hierarchy
     */ async addDomainHierarchy(rm) {
        if (!(rm === null || rm === void 0 ? void 0 : rm.syncedHasLink)) throw Error('Domain hierarchy must be syncronous.');
        this.hasDomainHierarchy = true;
        this.domainHierarchyManager = rm;
    }
    generateTempRoles(domain) {
        if (!this.hasPattern && !this.hasDomainPattern && !this.hasDomainHierarchy) {
            return loadOrDefault(this.allDomains, domain, new Roles());
        }
        const extraDomain = new Set([
            domain
        ]);
        if (this.hasDomainPattern || this.hasDomainHierarchy) {
            this.allDomains.forEach((value, key)=>{
                var _a;
                if (this.hasDomainPattern && this.domainMatchingFunc(domain, key) || ((_a = this.domainHierarchyManager) === null || _a === void 0 ? void 0 : _a.syncedHasLink) && this.domainHierarchyManager.syncedHasLink(key, domain)) {
                    extraDomain.add(key);
                }
            });
        }
        const allRoles = new Roles();
        extraDomain.forEach((dom)=>{
            loadOrDefault(this.allDomains, dom, new Roles()).forEach((value, key)=>{
                const role1 = allRoles.createRole(value.name, this.matchingFunc);
                value.getRoles().forEach((n)=>{
                    role1.addRole(allRoles.createRole(n, this.matchingFunc));
                });
            });
        });
        return allRoles;
    }
    /**
     * addLink adds the inheritance link between role: name1 and role: name2.
     * aka role: name1 inherits role: name2.
     * domain is a prefix to the roles.
     */ async addLink(name1, name2, ...domain) {
        if (domain.length === 0) {
            domain = [
                DEFAULT_DOMAIN
            ];
        } else if (domain.length > 1) {
            throw new Error('error: domain should be 1 parameter');
        }
        const allRoles = loadOrDefault(this.allDomains, domain[0], new Roles());
        const role1 = loadOrDefault(allRoles, name1, new Role(name1));
        const role2 = loadOrDefault(allRoles, name2, new Role(name2));
        role1.addRole(role2);
    }
    /**
     * clear clears all stored data and resets the role manager to the initial state.
     */ async clear() {
        this.allDomains = new Map();
        this.allDomains.set(DEFAULT_DOMAIN, new Roles());
    }
    /**
     * deleteLink deletes the inheritance link between role: name1 and role: name2.
     * aka role: name1 does not inherit role: name2 any more.
     * domain is a prefix to the roles.
     */ async deleteLink(name1, name2, ...domain) {
        if (domain.length === 0) {
            domain = [
                DEFAULT_DOMAIN
            ];
        } else if (domain.length > 1) {
            throw new Error('error: domain should be 1 parameter');
        }
        const allRoles = loadOrDefault(this.allDomains, domain[0], new Roles());
        if (!allRoles.has(name1) || !allRoles.has(name2)) {
            return;
        }
        const role1 = loadOrDefault(allRoles, name1, new Role(name1));
        const role2 = loadOrDefault(allRoles, name2, new Role(name2));
        role1.deleteRole(role2);
    }
    /**
     * hasLink determines whether role: name1 inherits role: name2.
     * domain is a prefix to the roles.
     */ syncedHasLink(name1, name2, ...domain) {
        if (domain.length === 0) {
            domain = [
                DEFAULT_DOMAIN
            ];
        } else if (domain.length > 1) {
            throw new Error('error: domain should be 1 parameter');
        }
        if (name1 === name2) {
            return true;
        }
        const allRoles = this.generateTempRoles(domain[0]);
        if (!allRoles.hasRole(name1, this.matchingFunc) || !allRoles.hasRole(name2, this.matchingFunc)) {
            return false;
        }
        const role1 = allRoles.createRole(name1, this.matchingFunc);
        return role1.hasRole(name2, this.maxHierarchyLevel);
    }
    async hasLink(name1, name2, ...domain) {
        return new Promise((resolve)=>resolve(this.syncedHasLink(name1, name2, ...domain)));
    }
    /**
     * getRoles gets the roles that a subject inherits.
     * domain is a prefix to the roles.
     */ async getRoles(name, ...domain) {
        if (domain.length === 0) {
            domain = [
                DEFAULT_DOMAIN
            ];
        } else if (domain.length > 1) {
            throw new Error('error: domain should be 1 parameter');
        }
        const allRoles = this.generateTempRoles(domain[0]);
        if (!allRoles.hasRole(name, this.matchingFunc)) {
            return [];
        }
        return allRoles.createRole(name, this.matchingFunc).getRoles();
    }
    /**
     * getUsers gets the users that inherits a subject.
     * domain is an unreferenced parameter here, may be used in other implementations.
     */ async getUsers(name, ...domain) {
        if (domain.length === 0) {
            domain = [
                DEFAULT_DOMAIN
            ];
        } else if (domain.length > 1) {
            throw new Error('error: domain should be 1 parameter');
        }
        const allRoles = this.generateTempRoles(domain[0]);
        if (!allRoles.hasRole(name, this.matchingFunc)) {
            return [];
        }
        const users = [];
        for (const user of allRoles.values()){
            if (user.hasDirectRole(name)) users.push(user.name);
        }
        return users;
    }
    /**
     * printRoles prints all the roles to log.
     */ async printRoles() {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogger"])().isEnable()) {
            [
                ...this.allDomains.values()
            ].forEach((n)=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])(n.toString());
            });
        }
    }
    /**
     * getDomains gets domains that a user has.
     */ async getDomains(name) {
        const domains = [];
        this.allDomains.forEach((roles, domain)=>{
            // Skip the default domain if there are other domains
            if (domain === DEFAULT_DOMAIN && this.allDomains.size > 1) {
                return;
            }
            const role = roles.get(name);
            if (role) {
                // Check if role has any roles it inherits OR if any other role inherits from it
                const hasRoles = role.getRoles().length > 0;
                const hasUsers = this.hasUserForRole(roles, name);
                if (hasRoles || hasUsers) {
                    domains.push(domain);
                }
            }
        });
        return domains;
    }
    /**
     * getAllDomains gets all domains.
     */ async getAllDomains() {
        const domains = Array.from(this.allDomains.keys());
        // Filter out the default domain if there are other domains
        if (domains.length > 1) {
            return domains.filter((d)=>d !== DEFAULT_DOMAIN);
        }
        return domains;
    }
    hasUserForRole(roles, name) {
        for (const role of roles.values()){
            if (role.hasDirectRole(name)) {
                return true;
            }
        }
        return false;
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/rbac/roleManager.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([]);
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/rbac/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/defaultRoleManager.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$roleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/roleManager.js [app-route] (ecmascript)");
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Model",
    ()=>Model,
    "PolicyOp",
    ()=>PolicyOp,
    "newModel",
    ()=>newModel,
    "newModelFromFile",
    ()=>newModelFromFile,
    "newModelFromString",
    ()=>newModelFromString,
    "requiredSections",
    ()=>requiredSections,
    "sectionNameMap",
    ()=>sectionNameMap
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$assertion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/assertion.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/defaultRoleManager.js [app-route] (ecmascript)");
;
;
;
;
;
const defaultDomain = '';
const defaultSeparator = '::';
const sectionNameMap = {
    r: 'request_definition',
    p: 'policy_definition',
    g: 'role_definition',
    e: 'policy_effect',
    m: 'matchers'
};
var PolicyOp;
(function(PolicyOp) {
    PolicyOp[PolicyOp["PolicyAdd"] = 0] = "PolicyAdd";
    PolicyOp[PolicyOp["PolicyRemove"] = 1] = "PolicyRemove";
})(PolicyOp || (PolicyOp = {}));
const requiredSections = [
    'r',
    'p',
    'e',
    'm'
];
class Model {
    /**
     * constructor is the constructor for Model.
     */ constructor(){
        this.model = new Map();
    }
    loadAssertion(cfg, sec, key) {
        const secName = sectionNameMap[sec];
        const value = cfg.getString(`${secName}::${key}`);
        return this.addDef(sec, key, value);
    }
    getKeySuffix(i) {
        if (i === 1) {
            return '';
        }
        return i.toString();
    }
    loadSection(cfg, sec) {
        let i = 1;
        for(;;){
            if (!this.loadAssertion(cfg, sec, sec + this.getKeySuffix(i))) {
                break;
            } else {
                i++;
            }
        }
    }
    // addDef adds an assertion to the model.
    addDef(sec, key, value) {
        if (value === '') {
            return false;
        }
        const ast = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$assertion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Assertion"]();
        ast.key = key;
        ast.value = value;
        ast.fieldIndexMap = new Map();
        if (sec === 'r' || sec === 'p') {
            const tokens = value.split(',').map((n)=>n.trim());
            for(let i = 0; i < tokens.length; i++){
                tokens[i] = key + '_' + tokens[i];
            }
            ast.tokens = tokens;
        } else if (sec === 'm') {
            const stringArguments = value.match(/\"(.*?)\"/g) || [];
            stringArguments.forEach((n, index)=>{
                value = value.replace(n, `$<${index}>`);
            });
            value = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapeAssertion"](value);
            stringArguments.forEach((n, index)=>{
                value = value.replace(`$<${index}>`, n);
            });
            const invalidOperators = /(?<![&|])&(?!&)|(?<![&|])\|(?!\|)|&{3,}|\|{3,}/g;
            if (invalidOperators.test(value)) {
                throw new Error(`Invalid operator in matcher`);
            }
            ast.value = value;
        } else {
            ast.value = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapeAssertion"](value);
        }
        const nodeMap = this.model.get(sec);
        if (nodeMap) {
            nodeMap.set(key, ast);
        } else {
            const assertionMap = new Map();
            assertionMap.set(key, ast);
            this.model.set(sec, assertionMap);
        }
        return true;
    }
    /**
     * loadModel loads the model from model CONF file.
     * @param path the model file path
     * @param fs {@link FileSystem}
     * @deprecated {@link loadModelFromFile}
     */ loadModel(path, fs) {
        this.loadModelFromFile(path, fs);
    }
    /**
     * loadModelFromFile loads the model from model CONF file.
     * @param path the model file path
     * @param fs {@link FileSystem}
     */ loadModelFromFile(path, fs) {
        const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Config"].newConfigFromFile(path, fs);
        this.loadModelFromConfig(cfg);
    }
    // loadModelFromText loads the model from the text.
    loadModelFromText(text) {
        const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Config"].newConfigFromText(text);
        this.loadModelFromConfig(cfg);
    }
    loadModelFromConfig(cfg) {
        for(const s in sectionNameMap){
            this.loadSection(cfg, s);
        }
        const ms = [];
        requiredSections.forEach((n)=>{
            if (!this.hasSection(n)) {
                ms.push(sectionNameMap[n]);
            }
        });
        if (ms.length > 0) {
            throw new Error(`missing required sections: ${ms.join(',')}`);
        }
    }
    hasSection(sec) {
        return this.model.get(sec) !== undefined;
    }
    // printModel prints the model to the log.
    printModel() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])('Model:');
        this.model.forEach((value, key)=>{
            value.forEach((ast, astKey)=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])(`${key}.${astKey}: ${ast.value}`);
            });
        });
    }
    // buildIncrementalRoleLinks provides incremental build the role inheritance relations.
    async buildIncrementalRoleLinks(rm, op, sec, ptype, rules) {
        var _a, _b;
        if (sec === 'g') {
            await ((_b = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(ptype)) === null || _b === void 0 ? void 0 : _b.buildIncrementalRoleLinks(rm, op, rules));
        }
    }
    // buildRoleLinks initializes the roles in RBAC.
    async buildRoleLinks(rmMap) {
        const astMap = this.model.get('g');
        if (!astMap) {
            return;
        }
        for (const key of astMap.keys()){
            const ast = astMap.get(key);
            let rm = rmMap.get(key);
            if (!rm) {
                rm = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultRoleManager"](10);
                rmMap.set(key, rm);
            }
            await (ast === null || ast === void 0 ? void 0 : ast.buildRoleLinks(rm));
        }
    }
    // clearPolicy clears all current policy.
    clearPolicy() {
        this.model.forEach((value, key)=>{
            if (key === 'p' || key === 'g') {
                value.forEach((ast)=>{
                    ast.policy = [];
                });
            }
        });
    }
    // getPolicy gets all rules in a policy.
    getPolicy(sec, key) {
        var _a;
        const policy = [];
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
        if (ast) {
            policy.push(...ast.policy);
        }
        return policy;
    }
    // hasPolicy determines whether a model has the specified policy rule.
    hasPolicy(sec, key, rule) {
        var _a;
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
        if (!ast) {
            return false;
        }
        return ast.policy.some((n)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayEquals"](n, rule));
    }
    // addPolicy adds a policy rule to the model.
    addPolicy(sec, key, rule) {
        var _a;
        if (!this.hasPolicy(sec, key, rule)) {
            const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
            if (!ast) {
                return false;
            }
            const policy = ast.policy;
            const tokens = ast.tokens;
            const priorityIndex = tokens.indexOf(`${key}_priority`);
            if (priorityIndex !== -1) {
                const priorityRule = rule[priorityIndex];
                const insertIndex = policy.findIndex((oneRule)=>oneRule[priorityIndex] >= priorityRule);
                if (priorityIndex === -1) {
                    policy.push(rule);
                } else {
                    policy.splice(insertIndex, 0, rule);
                }
            } else {
                policy.push(rule);
            }
            return true;
        }
        return false;
    }
    // addPolicies adds policy rules to the model.
    addPolicies(sec, ptype, rules) {
        var _a;
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(ptype);
        if (!ast) {
            return [
                false,
                []
            ];
        }
        for (const rule of rules){
            if (this.hasPolicy(sec, ptype, rule)) {
                return [
                    false,
                    []
                ];
            }
        }
        const priorityFlag = ast.tokens.indexOf(`${ptype}_priority`) !== -1;
        if (priorityFlag) {
            rules.forEach((rule)=>{
                this.addPolicy(sec, ptype, rule);
            });
        } else {
            ast.policy = ast.policy.concat(rules);
        }
        return [
            true,
            rules
        ];
    }
    // updatePolicy updates a policy from the model
    updatePolicy(sec, ptype, oldRule, newRule) {
        var _a;
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(ptype);
        if (!ast) {
            return false;
        }
        const index = ast.policy.findIndex((r)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayEquals"](r, oldRule));
        if (index === -1) {
            return false;
        }
        const priorityIndex = ast.tokens.indexOf(`${ptype}_priority`);
        if (priorityIndex !== -1) {
            if (oldRule[priorityIndex] === newRule[priorityIndex]) {
                ast.policy[index] = newRule;
            } else {
                // this.removePolicy(sec, ptype, oldRule);
                // this.addPolicy(sec, ptype, newRule);
                throw new Error('new rule should have the same priority with old rule.');
            }
        } else {
            ast.policy[index] = newRule;
        }
        return true;
    }
    // removePolicy removes a policy rule from the model.
    removePolicy(sec, key, rule) {
        var _a;
        if (this.hasPolicy(sec, key, rule)) {
            const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
            if (!ast) {
                return false;
            }
            ast.policy = ast.policy.filter((r)=>!__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayEquals"](rule, r));
            return true;
        }
        return false;
    }
    // removePolicies removes policy rules from the model.
    removePolicies(sec, ptype, rules) {
        var _a;
        const effects = [];
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(ptype);
        if (!ast) {
            return [
                false,
                []
            ];
        }
        for (const rule of rules){
            if (!this.hasPolicy(sec, ptype, rule)) {
                return [
                    false,
                    []
                ];
            }
        }
        for (const rule of rules){
            ast.policy = ast.policy.filter((r)=>{
                const equals = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayEquals"](rule, r);
                if (equals) {
                    effects.push(r);
                }
                return !equals;
            });
        }
        return [
            true,
            effects
        ];
    }
    // getFilteredPolicy gets rules based on field filters from a policy.
    getFilteredPolicy(sec, key, fieldIndex, ...fieldValues) {
        var _a;
        const res = [];
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
        if (!ast) {
            return res;
        }
        for (const rule of ast.policy){
            let matched = true;
            for(let i = 0; i < fieldValues.length; i++){
                const fieldValue = fieldValues[i];
                if (fieldValue !== '' && rule[fieldIndex + i] !== fieldValue) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                res.push(rule);
            }
        }
        return res;
    }
    // removeFilteredPolicy removes policy rules based on field filters from the model.
    removeFilteredPolicy(sec, key, fieldIndex, ...fieldValues) {
        var _a;
        const res = [];
        const effects = [];
        let bool = false;
        if (fieldValues.length === 0) {
            return [
                false,
                effects
            ];
        }
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
        if (!ast) {
            return [
                false,
                []
            ];
        }
        for (const rule of ast.policy){
            let matched = true;
            for(let i = 0; i < fieldValues.length; i++){
                const fieldValue = fieldValues[i];
                if (fieldValue !== '' && rule[fieldIndex + i] !== fieldValue) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                bool = true;
                effects.push(rule);
            } else {
                res.push(rule);
            }
        }
        if (effects.length !== 0) {
            ast.policy = res;
        }
        return [
            bool,
            effects
        ];
    }
    // getValuesForFieldInPolicy gets all values for a field for all rules in a policy, duplicated values are removed.
    getValuesForFieldInPolicy(sec, key, fieldIndex) {
        var _a;
        const values = [];
        const ast = (_a = this.model.get(sec)) === null || _a === void 0 ? void 0 : _a.get(key);
        if (!ast) {
            return values;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayRemoveDuplicates"](ast.policy.map((n)=>n[fieldIndex]));
    }
    // getValuesForFieldInPolicyAllTypes gets all values for a field for all rules in a policy of all ptypes, duplicated values are removed.
    getValuesForFieldInPolicyAllTypes(sec, fieldIndex) {
        const values = [];
        const ast = this.model.get(sec);
        if (!ast) {
            return values;
        }
        for (const ptype of ast.keys()){
            values.push(...this.getValuesForFieldInPolicy(sec, ptype, fieldIndex));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayRemoveDuplicates"](values);
    }
    // printPolicy prints the policy to log.
    printPolicy() {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogger"])().isEnable()) {
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])('Policy:');
        this.model.forEach((map, key)=>{
            if (key === 'p' || key === 'g') {
                map.forEach((ast)=>{
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])(`key, : ${ast.value}, : , ${ast.policy}`);
                });
            }
        });
    }
    /**
     * return the field index in fieldMap, if no this field in fieldMap, add it.
     */ getFieldIndex(ptype, field) {
        var _a;
        const assertion = (_a = this.model.get('p')) === null || _a === void 0 ? void 0 : _a.get(ptype);
        if (!assertion) {
            return -1;
        }
        let index = assertion.fieldIndexMap.get(field);
        if (index) {
            return index;
        }
        const pattern = ptype + '_' + field;
        index = -1;
        for(let i = 0; i < assertion.tokens.length; i++){
            if (assertion.tokens[i] === pattern) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            return index;
        }
        assertion.fieldIndexMap.set(field, index);
        return index;
    }
    /**
     * sort policies by subject hieraichy
     */ sortPoliciesBySubjectHierarchy() {
        var _a, _b, _c;
        if (((_b = (_a = this.model.get('e')) === null || _a === void 0 ? void 0 : _a.get('e')) === null || _b === void 0 ? void 0 : _b.value) !== "subjectPriority(p_eft) || deny" /* EffectExpress.SUBJECT_PRIORITY */ ) {
            return;
        }
        (_c = this.model.get('p')) === null || _c === void 0 ? void 0 : _c.forEach((assertion, ptype)=>{
            const domainIndex = this.getFieldIndex(ptype, "dom" /* FieldIndex.Domain */ );
            const subIndex = this.getFieldIndex(ptype, "sub" /* FieldIndex.Subject */ );
            // eslint-disable-next-line
            const subjectHierarchyMap = this.getSubjectHierarchyMap(this.model.get('g').get('g').policy);
            assertion.policy.sort((policyA, policyB)=>{
                const domainA = domainIndex === -1 ? defaultDomain : policyA[domainIndex];
                const domainB = domainIndex === -1 ? defaultDomain : policyB[domainIndex];
                // eslint-disable-next-line
                const priorityA = subjectHierarchyMap.get(this.getNameWithDomain(domainA, policyA[subIndex]));
                // eslint-disable-next-line
                const priorityB = subjectHierarchyMap.get(this.getNameWithDomain(domainB, policyB[subIndex]));
                return priorityB - priorityA;
            });
        });
    }
    /**
     * Calculate the priority of each policy store in Map<string, number>
     */ getSubjectHierarchyMap(groupPolicies) {
        const subjectHierarchyMap = new Map();
        if (!groupPolicies) {
            return subjectHierarchyMap;
        }
        const policyMap = new Map();
        let domain = defaultDomain;
        groupPolicies.forEach((policy)=>{
            if (policy.length !== 2) domain = policy[this.getFieldIndex('p', "dom" /* FieldIndex.Domain */ )];
            const child = this.getNameWithDomain(domain, policy[this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ )]);
            const parent = this.getNameWithDomain(domain, policy[this.getFieldIndex('p', "obj" /* FieldIndex.Object */ )]);
            policyMap.set(child, parent);
            if (!subjectHierarchyMap.has(child)) {
                subjectHierarchyMap.set(child, 0);
            }
            if (!subjectHierarchyMap.has(parent)) {
                subjectHierarchyMap.set(parent, 0);
            }
            subjectHierarchyMap.set(child, 1);
        });
        const set = new Set();
        subjectHierarchyMap.forEach((_, key)=>{
            if (subjectHierarchyMap.get(key) !== 0) set.add(key);
        });
        while(set.size !== 0){
            for (const child of set.values()){
                this.findHierarchy(policyMap, subjectHierarchyMap, set, child);
            }
        }
        return subjectHierarchyMap;
    }
    findHierarchy(policyMap, subjectHierarchyMap, set, child) {
        set.delete(child);
        // eslint-disable-next-line
        const parent = policyMap.get(child);
        if (set.has(parent)) {
            this.findHierarchy(policyMap, subjectHierarchyMap, set, parent);
        }
        // eslint-disable-next-line
        subjectHierarchyMap.set(child, subjectHierarchyMap.get(parent) + 10);
    }
    /**
     * get full name with domain
     */ getNameWithDomain(domain, name) {
        return domain + defaultSeparator + name;
    }
}
function newModel(...text) {
    const m = new Model();
    if (text.length === 2) {
        if (text[0] !== '') {
            m.loadModelFromFile(text[0]);
        }
    } else if (text.length === 1) {
        m.loadModelFromText(text[0]);
    } else if (text.length !== 0) {
        throw new Error('Invalid parameters for model.');
    }
    return m;
}
function newModelFromFile(path, fs) {
    const m = new Model();
    if (path) {
        m.loadModelFromFile(path, fs);
    }
    return m;
}
function newModelFromString(text) {
    const m = new Model();
    m.loadModelFromText(text);
    return m;
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/model/assertion.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Assertion",
    ()=>Assertion
]);
// Copyright 2017 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/defaultRoleManager.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)");
;
;
;
class Assertion {
    /**
     * constructor is the constructor for Assertion.
     */ constructor(){
        this.key = '';
        this.value = '';
        this.tokens = [];
        this.policy = [];
        this.rm = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultRoleManager"](10);
        this.fieldIndexMap = new Map();
    }
    async buildIncrementalRoleLinks(rm, op, rules) {
        this.rm = rm;
        const count = (this.value.match(/_/g) || []).length;
        if (count < 2) {
            throw new Error('the number of "_" in role definition should be at least 2');
        }
        for (let rule of rules){
            if (rule.length < count) {
                throw new Error('grouping policy elements do not meet role definition');
            }
            if (rule.length > count) {
                rule = rule.slice(0, count);
            }
            switch(op){
                case __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd:
                    await this.rm.addLink(rule[0], rule[1], ...rule.slice(2));
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove:
                    await this.rm.deleteLink(rule[0], rule[1], ...rule.slice(2));
                    break;
                default:
                    throw new Error('unsupported operation');
            }
        }
    }
    async buildRoleLinks(rm) {
        this.rm = rm;
        const count = (this.value.match(/_/g) || []).length;
        if (count < 2) {
            throw new Error('the number of "_" in role definition should be at least 2');
        }
        for (let rule of this.policy){
            if (rule.length > count) {
                rule = rule.slice(0, count);
            }
            await this.rm.addLink(rule[0], rule[1], ...rule.slice(2));
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])(`Role links for: ${this.key}`);
        await this.rm.printRoles();
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/model/functionMap.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FunctionMap",
    ()=>FunctionMap
]);
// Copyright 2017 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/builtinOperators.js [app-route] (ecmascript)");
;
class FunctionMap {
    /**
     * constructor is the constructor for FunctionMap.
     */ constructor(){
        this.functions = new Map();
    }
    // loadFunctionMap loads an initial function map.
    static loadFunctionMap() {
        const fm = new FunctionMap();
        fm.addFunction('keyMatch', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatchFunc"]);
        fm.addFunction('keyGet', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyGetFunc"]);
        fm.addFunction('keyMatch2', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch2Func"]);
        fm.addFunction('keyGet2', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyGet2Func"]);
        fm.addFunction('keyMatch3', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch3Func"]);
        fm.addFunction('keyMatch4', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch4Func"]);
        fm.addFunction('keyMatch5', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyMatch5Func"]);
        fm.addFunction('regexMatch', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["regexMatchFunc"]);
        fm.addFunction('ipMatch', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ipMatchFunc"]);
        fm.addFunction('globMatch', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globMatch"]);
        return fm;
    }
    // addFunction adds an expression function.
    addFunction(name, func) {
        if (!this.functions.get(name)) {
            this.functions.set(name, func);
        }
    }
    // getFunctions return all functions.
    getFunctions() {
        return this.functions;
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/model/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$assertion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/assertion.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$functionMap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/functionMap.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)");
;
;
;
}),
"[project]/apps/web/node_modules/casbin/lib/esm/enforceContext.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Copyright 2023 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
__turbopack_context__.s([
    "EnforceContext",
    ()=>EnforceContext,
    "newEnforceContext",
    ()=>newEnforceContext
]);
class EnforceContext {
    constructor(rType, pType, eType, mType){
        this.pType = pType;
        this.eType = eType;
        this.mType = mType;
        this.rType = rType;
    }
}
const newEnforceContext = (index)=>{
    return new EnforceContext('r' + index, 'p' + index, 'e' + index, 'm' + index);
};
}),
"[project]/apps/web/node_modules/casbin/lib/esm/coreEnforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CoreEnforcer",
    ()=>CoreEnforcer
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$casbin$2f$expression$2d$eval$2f$dist$2f$expression$2d$eval$2e$module$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@casbin/expression-eval/dist/expression-eval.module.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/defaultEffector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/effector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$functionMap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/functionMap.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/defaultRoleManager.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/enforceContext.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/builtinOperators.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
class CoreEnforcer {
    constructor(){
        this.fm = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$functionMap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionMap"].loadFunctionMap();
        this.eft = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$defaultEffector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultEffector"]();
        this.matcherMap = new Map();
        this.defaultEnforceContext = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]('r', 'p', 'e', 'm');
        this.watcher = null;
        this.watcherEx = null;
        this.enabled = true;
        this.autoSave = true;
        this.autoBuildRoleLinks = true;
        this.autoNotifyWatcher = true;
        this.acceptJsonRequest = false;
    }
    /**
     * setFileSystem sets a file system to read the model file or the policy file.
     * @param fs {@link FileSystem}
     */ setFileSystem(fs) {
        this.fs = fs;
    }
    /**
     * getFileSystem gets the file system,
     */ getFileSystem() {
        return this.fs;
    }
    getExpression(asyncCompile, exp) {
        const matcherKey = `${asyncCompile ? 'ASYNC[' : 'SYNC['}${exp}]`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$casbin$2f$expression$2d$eval$2f$dist$2f$expression$2d$eval$2e$module$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["addBinaryOp"])('in', 1, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customIn"]);
        let expression = this.matcherMap.get(matcherKey);
        if (!expression) {
            exp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bracketCompatible"])(exp);
            expression = asyncCompile ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$casbin$2f$expression$2d$eval$2f$dist$2f$expression$2d$eval$2e$module$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compileAsync"])(exp) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$casbin$2f$expression$2d$eval$2f$dist$2f$expression$2d$eval$2e$module$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compile"])(exp);
            this.matcherMap.set(matcherKey, expression);
        }
        return expression;
    }
    /**
     * loadModel reloads the model from the model CONF file.
     * Because the policy is attached to a model,
     * so the policy is invalidated and needs to be reloaded by calling LoadPolicy().
     */ loadModel() {
        this.model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["newModelFromFile"])(this.modelPath, this.fs);
        this.model.printModel();
    }
    /**
     * getModel gets the current model.
     *
     * @return the model of the enforcer.
     */ getModel() {
        return this.model;
    }
    /**
     * setModel sets the current model.
     *
     * @param m the model.
     */ setModel(m) {
        this.model = m;
    }
    /**
     * getAdapter gets the current adapter.
     *
     * @return the adapter of the enforcer.
     */ getAdapter() {
        return this.adapter;
    }
    /**
     * setAdapter sets the current adapter.
     *
     * @param adapter the adapter.
     */ setAdapter(adapter) {
        this.adapter = adapter;
    }
    /**
     * setWatcher sets the current watcher.
     *
     * @param watcher the watcher.
     */ setWatcher(watcher) {
        this.watcher = watcher;
        watcher.setUpdateCallback(async ()=>await this.loadPolicy());
    }
    /**
     * setWatcherEx sets the current watcherEx.
     *
     * @param watcherEx the watcherEx.
     */ setWatcherEx(watcherEx) {
        this.watcherEx = watcherEx;
    }
    /**
     * setRoleManager sets the current role manager.
     *
     * @param rm the role manager.
     */ setRoleManager(rm) {
        this.rmMap.set('g', rm);
    }
    /**
     * setRoleManager sets the role manager for the named policy.
     *
     * @param ptype the named policy.
     * @param rm the role manager.
     */ setNamedRoleManager(ptype, rm) {
        this.rmMap.set(ptype, rm);
    }
    /**
     * getRoleManager gets the current role manager.
     */ getRoleManager() {
        return this.rmMap.get('g');
    }
    /**
     * getNamedRoleManager gets role manager by name.
     */ getNamedRoleManager(name) {
        return this.rmMap.get(name);
    }
    /**
     * setEffector sets the current effector.
     *
     * @param eft the effector.
     */ setEffector(eft) {
        this.eft = eft;
    }
    /**
     * clearPolicy clears all policy.
     */ clearPolicy() {
        this.model.clearPolicy();
    }
    initRmMap() {
        this.rmMap = new Map();
        const rm = this.model.model.get('g');
        if (rm) {
            for (const ptype of rm.keys()){
                this.rmMap.set(ptype, new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultRoleManager"](10));
            }
        }
    }
    sortPolicies() {
        var _a;
        (_a = this.model.model.get('p')) === null || _a === void 0 ? void 0 : _a.forEach((value, key)=>{
            const policy = value.policy;
            const tokens = value.tokens;
            if (policy && tokens) {
                const priorityIndex = tokens.indexOf(`${key}_priority`);
                if (priorityIndex !== -1) {
                    policy.sort((a, b)=>{
                        return parseInt(a[priorityIndex], 10) - parseInt(b[priorityIndex], 10);
                    });
                }
            }
        });
    }
    /**
     * loadPolicy reloads the policy from file/database.
     */ async loadPolicy() {
        this.model.clearPolicy();
        await this.adapter.loadPolicy(this.model);
        this.sortPolicies();
        this.model.sortPoliciesBySubjectHierarchy();
        if (this.autoBuildRoleLinks) {
            await this.buildRoleLinksInternal();
        }
    }
    /**
     * loadFilteredPolicy reloads a filtered policy from file/database.
     *
     * @param filter the filter used to specify which type of policy should be loaded.
     */ // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async loadFilteredPolicy(filter) {
        this.model.clearPolicy();
        this.sortPolicies();
        this.model.sortPoliciesBySubjectHierarchy();
        return this.loadIncrementalFilteredPolicy(filter);
    }
    /**
     * LoadIncrementalFilteredPolicy append a filtered policy from file/database.
     *
     * @param filter the filter used to specify which type of policy should be appended.
     */ // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async loadIncrementalFilteredPolicy(filter) {
        if ('isFiltered' in this.adapter) {
            await this.adapter.loadFilteredPolicy(this.model, filter);
        } else {
            throw new Error('filtered policies are not supported by this adapter');
        }
        this.sortPolicies();
        if (this.autoBuildRoleLinks) {
            await this.buildRoleLinksInternal();
        }
        return true;
    }
    /**
     * isFiltered returns true if the loaded policy has been filtered.
     *
     * @return if the loaded policy has been filtered.
     */ isFiltered() {
        if ('isFiltered' in this.adapter) {
            return this.adapter.isFiltered();
        }
        return false;
    }
    /**
     * savePolicy saves the current policy (usually after changed with
     * Casbin API) back to file/database.
     */ async savePolicy() {
        if (this.isFiltered()) {
            throw new Error('Cannot save a filtered policy');
        }
        const flag = await this.adapter.savePolicy(this.model);
        if (!flag) {
            return false;
        }
        if (this.watcherEx) {
            return await this.watcherEx.updateForSavePolicy(this.model);
        } else if (this.watcher) {
            return await this.watcher.update();
        }
        return true;
    }
    /**
     * enableEnforce changes the enforcing state of Casbin, when Casbin is
     * disabled, all access will be allowed by the enforce() function.
     *
     * @param enable whether to enable the enforcer.
     */ enableEnforce(enable) {
        this.enabled = enable;
    }
    /**
     * enableLog changes whether to print Casbin log to the standard output.
     *
     * @param enable whether to enable Casbin's log.
     */ enableLog(enable) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogger"])().enableLog(enable);
    }
    /**
     * enableAutoSave controls whether to save a policy rule automatically to
     * the adapter when it is added or removed.
     *
     * @param autoSave whether to enable the AutoSave feature.
     */ enableAutoSave(autoSave) {
        this.autoSave = autoSave;
    }
    /**
     * enableAutoNotifyWatcher controls whether to save a policy rule automatically notify the Watcher when it is added or removed.
     * @param enable whether to enable the AutoNotifyWatcher feature.
     */ enableAutoNotifyWatcher(enable) {
        this.autoNotifyWatcher = enable;
    }
    /**
     * enableAcceptJsonRequest determines whether to attempt parsing request args as JSON
     *
     * @param enable whether to attempt parsing request args as JSON
     */ enableAcceptJsonRequest(enable) {
        this.acceptJsonRequest = enable;
    }
    /**
     * enableAutoBuildRoleLinks controls whether to save a policy rule
     * automatically to the adapter when it is added or removed.
     *
     * @param autoBuildRoleLinks whether to automatically build the role links.
     */ enableAutoBuildRoleLinks(autoBuildRoleLinks) {
        this.autoBuildRoleLinks = autoBuildRoleLinks;
    }
    /**
     * add matching function to RoleManager by ptype
     * @param ptype g
     * @param fn the function will be added
     */ async addNamedMatchingFunc(ptype, fn) {
        const rm = this.rmMap.get(ptype);
        if (rm) {
            return await rm.addMatchingFunc(fn);
        }
        throw Error('Target ptype not found.');
    }
    /**
     * add domain matching function to RoleManager by ptype
     * @param ptype g
     * @param fn the function will be added
     */ async addNamedDomainMatchingFunc(ptype, fn) {
        const rm = this.rmMap.get(ptype);
        if (rm) {
            return await rm.addDomainMatchingFunc(fn);
        }
    }
    /**
     * buildRoleLinks manually rebuild the role inheritance relations.
     */ async buildRoleLinks() {
        return this.buildRoleLinksInternal();
    }
    /**
     * buildIncrementalRoleLinks provides incremental build the role inheritance relations.
     * @param op policy operation
     * @param ptype g
     * @param rules policies
     */ async buildIncrementalRoleLinks(op, ptype, rules) {
        let rm = this.rmMap.get(ptype);
        if (!rm) {
            rm = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$defaultRoleManager$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultRoleManager"](10);
            this.rmMap.set(ptype, rm);
        }
        await this.model.buildIncrementalRoleLinks(rm, op, 'g', ptype, rules);
    }
    async buildRoleLinksInternal() {
        for (const rm of this.rmMap.values()){
            await rm.clear();
            await this.model.buildRoleLinks(this.rmMap);
        }
    }
    *privateEnforce(asyncCompile = true, explain = false, matcher, enforceContext = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]('r', 'p', 'e', 'm'), ...rvals) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!this.enabled) {
            return true;
        }
        let explainIndex = -1;
        const functions = {};
        this.fm.getFunctions().forEach((value, key)=>{
            functions[key] = value;
        });
        const astMap = this.model.model.get('g');
        astMap === null || astMap === void 0 ? void 0 : astMap.forEach((value, key)=>{
            const rm = value.rm;
            functions[key] = asyncCompile ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateGFunction"])(rm) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$builtinOperators$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSyncedGFunction"])(rm);
        });
        let expString;
        if (!matcher) {
            expString = (_b = (_a = this.model.model.get('m')) === null || _a === void 0 ? void 0 : _a.get(enforceContext.mType)) === null || _b === void 0 ? void 0 : _b.value;
        } else {
            expString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeComments"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapeAssertion"])(matcher));
        }
        if (!expString) {
            throw new Error('Unable to find matchers in model');
        }
        const effectExpr = (_d = (_c = this.model.model.get('e')) === null || _c === void 0 ? void 0 : _c.get(enforceContext.eType)) === null || _d === void 0 ? void 0 : _d.value;
        if (!effectExpr) {
            throw new Error('Unable to find policy_effect in model');
        }
        const HasEval = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEval"])(expString);
        let expression = undefined;
        const p = (_e = this.model.model.get('p')) === null || _e === void 0 ? void 0 : _e.get(enforceContext.pType);
        const policyLen = (_f = p === null || p === void 0 ? void 0 : p.policy) === null || _f === void 0 ? void 0 : _f.length;
        const rTokens = (_h = (_g = this.model.model.get('r')) === null || _g === void 0 ? void 0 : _g.get(enforceContext.rType)) === null || _h === void 0 ? void 0 : _h.tokens;
        const rTokensLen = rTokens === null || rTokens === void 0 ? void 0 : rTokens.length;
        const effectStream = this.eft.newStream(effectExpr);
        if (policyLen && policyLen !== 0 && expString.includes(`${enforceContext.pType}_`)) {
            for(let i = 0; i < policyLen; i++){
                const parameters = {};
                if ((rTokens === null || rTokens === void 0 ? void 0 : rTokens.length) !== rvals.length) {
                    throw new Error(`invalid request size: expected ${rTokensLen}, got ${rvals.length}, rvals: ${rvals}"`);
                }
                if (this.acceptJsonRequest) {
                    // Attempt to parse each request parameter as JSON; continue with string if failed
                    rTokens.forEach((token, j)=>{
                        try {
                            parameters[token] = JSON.parse(rvals[j]);
                        } catch (_a) {
                            parameters[token] = rvals[j];
                        }
                    });
                } else {
                    rTokens.forEach((token, j)=>{
                        parameters[token] = rvals[j];
                    });
                }
                p === null || p === void 0 ? void 0 : p.tokens.forEach((token, j)=>{
                    parameters[token] = p === null || p === void 0 ? void 0 : p.policy[i][j];
                });
                if (HasEval) {
                    const ruleNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEvalValue"])(expString);
                    let expWithRule = expString;
                    for (const ruleName of ruleNames){
                        if (ruleName in parameters) {
                            const rule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapeAssertion"])(parameters[ruleName]);
                            expWithRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceEval"])(expWithRule, ruleName, rule);
                        } else {
                            throw new Error(`${ruleName} not in ${parameters}`);
                        }
                    }
                    expression = this.getExpression(asyncCompile, expWithRule);
                } else {
                    if (expression === undefined) {
                        expression = this.getExpression(asyncCompile, expString);
                    }
                }
                const context = Object.assign(Object.assign({}, parameters), functions);
                const result = asyncCompile ? yield expression(context) : expression(context);
                let eftRes;
                switch(typeof result){
                    case 'boolean':
                        eftRes = result ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate;
                        break;
                    case 'number':
                        if (result === 0) {
                            eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate;
                        } else {
                            eftRes = result;
                        }
                        break;
                    case 'string':
                        if (result === '') {
                            eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate;
                        } else {
                            eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow;
                        }
                        break;
                    default:
                        throw new Error('matcher result should only be of type boolean, number, or string');
                }
                const eft = parameters[`${enforceContext.pType}_eft`];
                if (eft && eftRes === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow) {
                    if (eft === 'allow') {
                        eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow;
                    } else if (eft === 'deny') {
                        eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Deny;
                    } else {
                        eftRes = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate;
                    }
                }
                const [res, rec, done] = effectStream.pushEffect(eftRes);
                if (rec) {
                    explainIndex = i;
                }
                if (done) {
                    break;
                }
            }
        } else {
            explainIndex = 0;
            const parameters = {};
            rTokens === null || rTokens === void 0 ? void 0 : rTokens.forEach((token, j)=>{
                parameters[token] = rvals[j];
            });
            (_j = p === null || p === void 0 ? void 0 : p.tokens) === null || _j === void 0 ? void 0 : _j.forEach((token)=>{
                parameters[token] = '';
            });
            expression = this.getExpression(asyncCompile, expString);
            const context = Object.assign(Object.assign({}, parameters), functions);
            const result = asyncCompile ? yield expression(context) : expression(context);
            if (result) {
                effectStream.pushEffect(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Allow);
            } else {
                effectStream.pushEffect(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$effector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Effect"].Indeterminate);
            }
        }
        const res = effectStream.current();
        // only generate the request --> result string if the message
        // is going to be logged.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogger"])().isEnable()) {
            let reqStr = 'Request: ';
            for(let i = 0; i < rvals.length; i++){
                if (i !== rvals.length - 1) {
                    reqStr += `${rvals[i]}, `;
                } else {
                    reqStr += rvals[i];
                }
            }
            reqStr += ` ---> ${res}`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPrint"])(reqStr);
        }
        if (explain) {
            if (explainIndex === -1) {
                return [
                    res,
                    []
                ];
            }
            return [
                res,
                ((_k = p === null || p === void 0 ? void 0 : p.policy) === null || _k === void 0 ? void 0 : _k[explainIndex]) || []
            ];
        }
        return res;
    }
    /**
     * If the matchers does not contain an asynchronous method, call it faster.
     *
     * enforceSync decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request.
     */ enforceSync(...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunSync"])(this.privateEnforce(false, false, '', enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunSync"])(this.privateEnforce(false, false, '', this.defaultEnforceContext, ...rvals));
    }
    /**
     * If the matchers does not contain an asynchronous method, call it faster.
     *
     * enforceSync decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request and the reason rule.
     */ enforceExSync(...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunSync"])(this.privateEnforce(false, true, '', enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunSync"])(this.privateEnforce(false, true, '', this.defaultEnforceContext, ...rvals));
    }
    /**
     * Same as enforceSync. To be removed.
     */ enforceWithSyncCompile(...rvals) {
        return this.enforceSync(...rvals);
    }
    /**
     * enforce decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request.
     */ async enforce(...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, false, '', enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, false, '', this.defaultEnforceContext, ...rvals));
    }
    /**
     * enforceWithMatcher decides whether a "subject" can access a "object" with
     * the operation "action" but with the matcher passed,
     * input parameters are usually: (matcher, sub, obj, act).
     *
     * @param matcher matcher string.
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request.
     */ async enforceWithMatcher(matcher, ...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, false, matcher, enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, false, matcher, this.defaultEnforceContext, ...rvals));
    }
    /**
     * enforce decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request and the reason rule.
     */ async enforceEx(...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, true, '', enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, true, '', this.defaultEnforceContext, ...rvals));
    }
    /**
     * enforceExWithMatcher decides whether a "subject" can access a "object" with
     * the operation "action" but with the matcher passed,
     *  input parameters are usually: (matcher, sub, obj, act).
     *
     * @param matcher matcher string.
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request and the reason rule.
     */ async enforceExWithMatcher(matcher, ...rvals) {
        if (rvals[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EnforceContext"]) {
            const enforceContext = rvals.shift();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, true, matcher, enforceContext, ...rvals));
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatorRunAsync"])(this.privateEnforce(true, true, matcher, this.defaultEnforceContext, ...rvals));
    }
    /**
     * batchEnforce enforces each request and returns result in a bool array.
     * @param rvals the request need to be mediated, usually an array
     *              of array of strings, can be class instances if ABAC is used.
     * @returns whether to allow the requests.
     */ async batchEnforce(rvals) {
        return await Promise.all(rvals.map((rval)=>this.enforce(...rval)));
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/internalEnforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InternalEnforcer",
    ()=>InternalEnforcer
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$coreEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/coreEnforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)");
;
;
class InternalEnforcer extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$coreEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CoreEnforcer"] {
    /**
     * addPolicyInternal adds a rule to the current policy.
     */ async addPolicyInternal(sec, ptype, rule, useWatcher) {
        if (this.model.hasPolicy(sec, ptype, rule)) {
            return false;
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            try {
                await this.adapter.addPolicy(sec, ptype, rule);
            } catch (e) {
                if (e instanceof Error && e.message !== 'not implemented') {
                    throw e;
                }
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForAddPolicy(sec, ptype, ...rule);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const ok = this.model.addPolicy(sec, ptype, rule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, [
                rule
            ]);
        }
        return ok;
    }
    // addPolicies adds rules to the current policy.
    // removePolicies removes rules from the current policy.
    async addPoliciesInternal(sec, ptype, rules, useWatcher) {
        for (const rule of rules){
            if (this.model.hasPolicy(sec, ptype, rule)) {
                return false;
            }
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            if ('addPolicies' in this.adapter) {
                try {
                    await this.adapter.addPolicies(sec, ptype, rules);
                } catch (e) {
                    if (e instanceof Error && e.message !== 'not implemented') {
                        throw e;
                    }
                }
            } else {
                throw new Error('cannot to save policy, the adapter does not implement the BatchAdapter');
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForAddPolicies(sec, ptype, ...rules);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const [ok, effects] = await this.model.addPolicies(sec, ptype, rules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, effects);
        }
        return ok;
    }
    /**
     * addPoliciesInternalEx adds rules to the current policy.
     * Unlike addPoliciesInternal, this method will filter out rules that already exist
     * and continue to add the remaining rules instead of returning false immediately.
     */ async addPoliciesInternalEx(sec, ptype, rules, useWatcher) {
        // Filter out existing rules
        const newRules = rules.filter((rule)=>!this.model.hasPolicy(sec, ptype, rule));
        // If no new rules to add, return false
        if (newRules.length === 0) {
            return false;
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            if ('addPolicies' in this.adapter) {
                try {
                    await this.adapter.addPolicies(sec, ptype, newRules);
                } catch (e) {
                    if (e instanceof Error && e.message !== 'not implemented') {
                        throw e;
                    }
                }
            } else {
                throw new Error('cannot save policy, the adapter does not implement the BatchAdapter');
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForAddPolicies(sec, ptype, ...newRules);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const [ok, effects] = await this.model.addPolicies(sec, ptype, newRules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, effects);
        }
        return ok;
    }
    /**
     * updatePolicyInternal updates a rule from the current policy.
     */ async updatePolicyInternal(sec, ptype, oldRule, newRule, useWatcher) {
        if (!this.model.hasPolicy(sec, ptype, oldRule)) {
            return false;
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            if ('updatePolicy' in this.adapter) {
                try {
                    await this.adapter.updatePolicy(sec, ptype, oldRule, newRule);
                } catch (e) {
                    if (e instanceof Error && e.message !== 'not implemented') {
                        throw e;
                    }
                }
            } else {
                throw new Error('cannot to update policy, the adapter does not implement the UpdatableAdapter');
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // In fact I think it should wait for the respond, but they implement add_policy() like this
                // error intentionally ignored
                if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const ok = this.model.updatePolicy(sec, ptype, oldRule, newRule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, [
                oldRule
            ]);
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, [
                newRule
            ]);
        }
        return ok;
    }
    /**
     * removePolicyInternal removes a rule from the current policy.
     */ async removePolicyInternal(sec, ptype, rule, useWatcher) {
        if (!this.model.hasPolicy(sec, ptype, rule)) {
            return false;
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            try {
                await this.adapter.removePolicy(sec, ptype, rule);
            } catch (e) {
                if (e instanceof Error && e.message !== 'not implemented') {
                    throw e;
                }
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForRemovePolicy(sec, ptype, ...rule);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const ok = await this.model.removePolicy(sec, ptype, rule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, [
                rule
            ]);
        }
        return ok;
    }
    // removePolicies removes rules from the current policy.
    async removePoliciesInternal(sec, ptype, rules, useWatcher) {
        for (const rule of rules){
            if (!this.model.hasPolicy(sec, ptype, rule)) {
                return false;
            }
        }
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            if ('removePolicies' in this.adapter) {
                try {
                    await this.adapter.removePolicies(sec, ptype, rules);
                } catch (e) {
                    if (e instanceof Error && e.message !== 'not implemented') {
                        throw e;
                    }
                }
            } else {
                throw new Error('cannot to save policy, the adapter does not implement the BatchAdapter');
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForRemovePolicies(sec, ptype, ...rules);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const [ok, effects] = this.model.removePolicies(sec, ptype, rules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, effects);
        }
        return ok;
    }
    /**
     * removeFilteredPolicyInternal removes rules based on field filters from the current policy.
     */ async removeFilteredPolicyInternal(sec, ptype, fieldIndex, fieldValues, useWatcher) {
        // Persist when an adapter is configured and autoSave is enabled.
        if (this.adapter && this.autoSave) {
            try {
                await this.adapter.removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues);
            } catch (e) {
                if (e instanceof Error && e.message !== 'not implemented') {
                    throw e;
                }
            }
        }
        if (useWatcher) {
            if (this.autoNotifyWatcher) {
                // error intentionally ignored
                if (this.watcherEx) {
                    this.watcherEx.updateForRemoveFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues);
                } else if (this.watcher) {
                    this.watcher.update();
                }
            }
        }
        const [ok, effects] = this.model.removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, effects);
        }
        return ok;
    }
    /**
     * get field index in model.fieldMap.
     */ getFieldIndex(ptype, field) {
        return this.model.getFieldIndex(ptype, field);
    }
    /**
     *  set index of field
     */ setFieldIndex(ptype, field, index) {
        var _a;
        const assertion = (_a = this.model.model.get('p')) === null || _a === void 0 ? void 0 : _a.get(ptype);
        assertion === null || assertion === void 0 ? void 0 : assertion.fieldIndexMap.set(field, index);
    }
    async addPolicyWithoutNotify(sec, ptype, rule) {
        if (this.model.hasPolicy(sec, ptype, rule)) {
            return false;
        }
        const ok = this.model.addPolicy(sec, ptype, rule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, [
                rule
            ]);
        }
        return ok;
    }
    async addPoliciesWithoutNotify(sec, ptype, rules) {
        for (const rule of rules){
            if (this.model.hasPolicy(sec, ptype, rule)) {
                return false;
            }
        }
        const [ok, effects] = await this.model.addPolicies(sec, ptype, rules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, effects);
        }
        return ok;
    }
    async addPoliciesWithoutNotifyEx(sec, ptype, rules) {
        const newRules = rules.filter((rule)=>!this.model.hasPolicy(sec, ptype, rule));
        if (newRules.length === 0) {
            return false;
        }
        const [ok, effects] = await this.model.addPolicies(sec, ptype, newRules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, effects);
        }
        return ok;
    }
    async updatePolicyWithoutNotify(sec, ptype, oldRule, newRule) {
        if (!this.model.hasPolicy(sec, ptype, oldRule)) {
            return false;
        }
        const ok = this.model.updatePolicy(sec, ptype, oldRule, newRule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, [
                oldRule
            ]);
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyAdd, ptype, [
                newRule
            ]);
        }
        return ok;
    }
    async removePolicyWithoutNotify(sec, ptype, rule) {
        if (!this.model.hasPolicy(sec, ptype, rule)) {
            return false;
        }
        const ok = await this.model.removePolicy(sec, ptype, rule);
        if (sec === 'g' && ok) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, [
                rule
            ]);
        }
        return ok;
    }
    async removePoliciesWithoutNotify(sec, ptype, rules) {
        for (const rule of rules){
            if (!this.model.hasPolicy(sec, ptype, rule)) {
                return false;
            }
        }
        const [ok, effects] = this.model.removePolicies(sec, ptype, rules);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, effects);
        }
        return ok;
    }
    async removeFilteredPolicyWithoutNotify(sec, ptype, fieldIndex, fieldValues) {
        const [ok, effects] = this.model.removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues);
        if (sec === 'g' && ok && (effects === null || effects === void 0 ? void 0 : effects.length)) {
            await this.buildIncrementalRoleLinks(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PolicyOp"].PolicyRemove, ptype, effects);
        }
        return ok;
    }
    async updatePoliciesWithoutNotify(sec, ptype, oldRules, newRules) {
        // Mirror the Go updatePoliciesWithoutNotify; reuse the existing internal flow.
        // Because updatePoliciesInternal isn't implemented yet, fall back to per-item updates.
        if (oldRules.length !== newRules.length) {
            throw new Error('the length of oldRules should be equal to the length of newRules');
        }
        for(let i = 0; i < oldRules.length; i++){
            const ok = await this.updatePolicyWithoutNotify(sec, ptype, oldRules[i], newRules[i]);
            if (!ok) {
                return false;
            }
        }
        return true;
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/managementEnforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ManagementEnforcer",
    ()=>ManagementEnforcer
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$internalEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/internalEnforcer.js [app-route] (ecmascript)");
;
class ManagementEnforcer extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$internalEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InternalEnforcer"] {
    /**
     * getAllSubjects gets the list of subjects that show up in the current policy.
     *
     * @return all the subjects in "p" policy rules. It actually collects the
     *         0-index elements of "p" policy rules. So make sure your subject
     *         is the 0-index element, like (sub, obj, act). Duplicates are removed.
     */ async getAllSubjects() {
        return this.getAllNamedSubjects('p');
    }
    /**
     * getAllNamedSubjects gets the list of subjects that show up in the currentnamed policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the subjects in policy rules of the ptype type. It actually
     *         collects the 0-index elements of the policy rules. So make sure
     *         your subject is the 0-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedSubjects(ptype) {
        return this.model.getValuesForFieldInPolicy('p', ptype, 0);
    }
    /**
     * getAllObjects gets the list of objects that show up in the current policy.
     *
     * @return all the objects in "p" policy rules. It actually collects the
     *         1-index elements of "p" policy rules. So make sure your object
     *         is the 1-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllObjects() {
        return this.getAllNamedObjects('p');
    }
    /**
     * getAllNamedObjects gets the list of objects that show up in the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the objects in policy rules of the ptype type. It actually
     *         collects the 1-index elements of the policy rules. So make sure
     *         your object is the 1-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedObjects(ptype) {
        return this.model.getValuesForFieldInPolicy('p', ptype, 1);
    }
    /**
     * getAllActions gets the list of actions that show up in the current policy.
     *
     * @return all the actions in "p" policy rules. It actually collects
     *         the 2-index elements of "p" policy rules. So make sure your action
     *         is the 2-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllActions() {
        return this.getAllNamedActions('p');
    }
    /**
     * GetAllNamedActions gets the list of actions that show up in the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the actions in policy rules of the ptype type. It actually
     *         collects the 2-index elements of the policy rules. So make sure
     *         your action is the 2-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedActions(ptype) {
        return this.model.getValuesForFieldInPolicy('p', ptype, 2);
    }
    /**
     * getAllRoles gets the list of roles that show up in the current policy.
     *
     * @return all the roles in "g" policy rules. It actually collects
     *         the 1-index elements of "g" policy rules. So make sure your
     *         role is the 1-index element, like (sub, role).
     *         Duplicates are removed.
     */ async getAllRoles() {
        return this.getAllNamedRoles('g');
    }
    /**
     * getAllNamedRoles gets the list of roles that show up in the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @return all the subjects in policy rules of the ptype type. It actually
     *         collects the 0-index elements of the policy rules. So make
     *         sure your subject is the 0-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedRoles(ptype) {
        return this.model.getValuesForFieldInPolicy('g', ptype, 1);
    }
    /**
     * getPolicy gets all the authorization rules in the policy.
     *
     * @return all the "p" policy rules.
     */ async getPolicy() {
        return this.getNamedPolicy('p');
    }
    /**
     * getFilteredPolicy gets all the authorization rules in the policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "p" policy rules.
     */ async getFilteredPolicy(fieldIndex, ...fieldValues) {
        return this.getFilteredNamedPolicy('p', fieldIndex, ...fieldValues);
    }
    /**
     * getNamedPolicy gets all the authorization rules in the named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return the "p" policy rules of the specified ptype.
     */ async getNamedPolicy(ptype) {
        return this.model.getPolicy('p', ptype);
    }
    /**
     * getFilteredNamedPolicy gets all the authorization rules in the named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "p" policy rules of the specified ptype.
     */ async getFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues) {
        return this.model.getFilteredPolicy('p', ptype, fieldIndex, ...fieldValues);
    }
    /**
     * getGroupingPolicy gets all the role inheritance rules in the policy.
     *
     * @return all the "g" policy rules.
     */ async getGroupingPolicy() {
        return this.getNamedGroupingPolicy('g');
    }
    /**
     * getFilteredGroupingPolicy gets all the role inheritance rules in the policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value "" means not to match this field.
     * @return the filtered "g" policy rules.
     */ async getFilteredGroupingPolicy(fieldIndex, ...fieldValues) {
        return this.getFilteredNamedGroupingPolicy('g', fieldIndex, ...fieldValues);
    }
    /**
     * getNamedGroupingPolicy gets all the role inheritance rules in the policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @return the "g" policy rules of the specified ptype.
     */ async getNamedGroupingPolicy(ptype) {
        return this.model.getPolicy('g', ptype);
    }
    /**
     * getFilteredNamedGroupingPolicy gets all the role inheritance rules in the policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "g" policy rules of the specified ptype.
     */ async getFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues) {
        return this.model.getFilteredPolicy('g', ptype, fieldIndex, ...fieldValues);
    }
    /**
     * hasPolicy determines whether an authorization rule exists.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return whether the rule exists.
     */ async hasPolicy(...params) {
        return this.hasNamedPolicy('p', ...params);
    }
    /**
     * hasNamedPolicy determines whether a named authorization rule exists.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return whether the rule exists.
     */ async hasNamedPolicy(ptype, ...params) {
        return this.model.hasPolicy('p', ptype, params);
    }
    /**
     * addPolicy adds an authorization rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async addPolicy(...params) {
        return this.addNamedPolicy('p', ...params);
    }
    /**
     * addPolicies adds authorization rules to the current policy.
     * If the rule already exists, the function returns false and the rules will not be added.
     * Otherwise the function returns true by adding the new rules.
     *
     * @param rules the "p" policy rules, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async addPolicies(rules) {
        return this.addNamedPolicies('p', rules);
    }
    /**
     * addNamedPolicy adds an authorization rule to the current named policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return succeeds or not.
     */ async addNamedPolicy(ptype, ...params) {
        return this.addPolicyInternal('p', ptype, params, true);
    }
    /**
     * addNamedPolicies adds authorization rules to the current named policy.
     * If the rule already exists, the function returns false and the rules will not be added.
     * Otherwise the function returns true by adding the new rules.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param rules the "p" policy rules.
     * @return succeeds or not.
     */ async addNamedPolicies(ptype, rules) {
        return this.addPoliciesInternal('p', ptype, rules, true);
    }
    /**
     * addPoliciesEx adds authorization rules to the current policy.
     * If a rule already exists, the function will skip it and continue to add the remaining rules.
     * The function returns true if at least one rule was added successfully.
     *
     * @param rules the "p" policy rules, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async addPoliciesEx(rules) {
        return this.addNamedPoliciesEx('p', rules);
    }
    /**
     * addNamedPoliciesEx adds authorization rules to the current named policy.
     * If a rule already exists, the function will skip it and continue to add the remaining rules.
     * The function returns true if at least one rule was added successfully.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param rules the "p" policy rules.
     * @return succeeds or not.
     */ async addNamedPoliciesEx(ptype, rules) {
        return this.addPoliciesInternalEx('p', ptype, rules, true);
    }
    /**
     * updatePolicy updates an authorization rule from the current policy.
     * If the rule not exists, the function returns false.
     * Otherwise the function returns true by changing it to the new rule.
     *
     * @return succeeds or not.
     * @param oldRule the policy will be remove
     * @param newRule the policy will be added
     */ async updatePolicy(oldRule, newRule) {
        return this.updateNamedPolicy('p', oldRule, newRule);
    }
    /**
     * updateNamedPolicy updates an authorization rule from the current named policy.
     * If the rule not exists, the function returns false.
     * Otherwise the function returns true by changing it to the new rule.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param oldRule the policy rule will be remove
     * @param newRule the policy rule will be added
     * @return succeeds or not.
     */ async updateNamedPolicy(ptype, oldRule, newRule) {
        return this.updatePolicyInternal('p', ptype, oldRule, newRule, true);
    }
    /**
     * removePolicy removes an authorization rule from the current policy.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async removePolicy(...params) {
        return this.removeNamedPolicy('p', ...params);
    }
    /**
     * removePolicies removes an authorization rules from the current policy.
     *
     * @param rules the "p" policy rules, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async removePolicies(rules) {
        return this.removeNamedPolicies('p', rules);
    }
    /**
     * removeFilteredPolicy removes an authorization rule from the current policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredPolicy(fieldIndex, ...fieldValues) {
        return this.removeFilteredNamedPolicy('p', fieldIndex, ...fieldValues);
    }
    /**
     * removeNamedPolicy removes an authorization rule from the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return succeeds or not.
     */ async removeNamedPolicy(ptype, ...params) {
        return this.removePolicyInternal('p', ptype, params, true);
    }
    /**
     * removeNamedPolicies removes authorization rules from the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param rules the "p" policy rules.
     * @return succeeds or not.
     */ async removeNamedPolicies(ptype, rules) {
        return this.removePoliciesInternal('p', ptype, rules, true);
    }
    /**
     * removeFilteredNamedPolicy removes an authorization rule from the current named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues) {
        return this.removeFilteredPolicyInternal('p', ptype, fieldIndex, fieldValues, true);
    }
    /**
     * hasGroupingPolicy determines whether a role inheritance rule exists.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return whether the rule exists.
     */ async hasGroupingPolicy(...params) {
        return this.hasNamedGroupingPolicy('g', ...params);
    }
    /**
     * hasNamedGroupingPolicy determines whether a named role inheritance rule exists.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return whether the rule exists.
     */ async hasNamedGroupingPolicy(ptype, ...params) {
        return this.model.hasPolicy('g', ptype, params);
    }
    /**
     * addGroupingPolicy adds a role inheritance rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async addGroupingPolicy(...params) {
        return this.addNamedGroupingPolicy('g', ...params);
    }
    /**
     * addGroupingPolicies adds a role inheritance rules to the current policy.
     * If the rule already exists, the function returns false and the rules will not be added.
     * Otherwise the function returns true by adding the new rules.
     *
     * @param rules the "g" policy rules, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async addGroupingPolicies(rules) {
        return this.addNamedGroupingPolicies('g', rules);
    }
    /**
     * addNamedGroupingPolicy adds a named role inheritance rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return succeeds or not.
     */ async addNamedGroupingPolicy(ptype, ...params) {
        return this.addPolicyInternal('g', ptype, params, true);
    }
    /**
     * addNamedGroupingPolicies adds named role inheritance rules to the current policy.
     * If the rule already exists, the function returns false and the rules will not be added.
     * Otherwise the function returns true by adding the new rules.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param rules the "g" policy rule.
     * @return succeeds or not.
     */ async addNamedGroupingPolicies(ptype, rules) {
        return this.addPoliciesInternal('g', ptype, rules, true);
    }
    /**
     * addGroupingPoliciesEx adds role inheritance rules to the current policy.
     * If a rule already exists, the function will skip it and continue to add the remaining rules.
     * The function returns true if at least one rule was added successfully.
     *
     * @param rules the "g" policy rules, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async addGroupingPoliciesEx(rules) {
        return this.addNamedGroupingPoliciesEx('g', rules);
    }
    /**
     * addNamedGroupingPoliciesEx adds named role inheritance rules to the current policy.
     * If a rule already exists, the function will skip it and continue to add the remaining rules.
     * The function returns true if at least one rule was added successfully.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param rules the "g" policy rules.
     * @return succeeds or not.
     */ async addNamedGroupingPoliciesEx(ptype, rules) {
        return this.addPoliciesInternalEx('g', ptype, rules, true);
    }
    /**
     * removeGroupingPolicy removes a role inheritance rule from the current policy.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async removeGroupingPolicy(...params) {
        return this.removeNamedGroupingPolicy('g', ...params);
    }
    /**
     * removeGroupingPolicies removes role inheritance rules from the current policy.
     *
     * @param rules the "g" policy rules, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async removeGroupingPolicies(rules) {
        return this.removeNamedGroupingPolicies('g', rules);
    }
    /**
     * removeFilteredGroupingPolicy removes a role inheritance rule from the current policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredGroupingPolicy(fieldIndex, ...fieldValues) {
        return this.removeFilteredNamedGroupingPolicy('g', fieldIndex, ...fieldValues);
    }
    /**
     * removeNamedGroupingPolicy removes a role inheritance rule from the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return succeeds or not.
     */ async removeNamedGroupingPolicy(ptype, ...params) {
        return this.removePolicyInternal('g', ptype, params, true);
    }
    /**
     * removeNamedGroupingPolicies removes role inheritance rules from the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param rules the "g" policy rules.
     * @return succeeds or not.
     */ async removeNamedGroupingPolicies(ptype, rules) {
        return this.removePoliciesInternal('g', ptype, rules, true);
    }
    /**
     * removeFilteredNamedGroupingPolicy removes a role inheritance rule from the current named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues) {
        return this.removeFilteredPolicyInternal('g', ptype, fieldIndex, fieldValues, true);
    }
    /**
     * UpdateGroupingPolicy updates an rule to the current named policy.
     *
     * @param oldRule the old rule.
     * @param newRule the new rule.
     * @return succeeds or not.
     */ async updateGroupingPolicy(oldRule, newRule) {
        return this.updateNamedGroupingPolicy('g', oldRule, newRule);
    }
    /**
     * updateNamedGroupingPolicy updates an rule to the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param oldRule the old rule.
     * @param newRule the new rule.
     * @return succeeds or not.
     */ async updateNamedGroupingPolicy(ptype, oldRule, newRule) {
        return this.updatePolicyInternal('g', ptype, oldRule, newRule, true);
    }
    /**
     * addFunction adds a customized function.
     * @param name custom function name
     * @param func function
     */ async addFunction(name, func) {
        this.fm.addFunction(name, func);
    }
    async selfAddPolicy(sec, ptype, rule) {
        return this.addPolicyWithoutNotify(sec, ptype, rule);
    }
    async selfAddPolicies(sec, ptype, rules) {
        return this.addPoliciesWithoutNotify(sec, ptype, rules);
    }
    async selfRemovePolicy(sec, ptype, rule) {
        return this.removePolicyWithoutNotify(sec, ptype, rule);
    }
    async selfRemovePolicies(sec, ptype, rules) {
        return this.removePoliciesWithoutNotify(sec, ptype, rules);
    }
    async selfRemoveFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
        return this.removeFilteredPolicyWithoutNotify(sec, ptype, fieldIndex, fieldValues);
    }
    async selfUpdatePolicy(sec, ptype, oldRule, newRule) {
        return this.updatePolicyWithoutNotify(sec, ptype, oldRule, newRule);
    }
    async selfUpdatePolicies(sec, ptype, oldRules, newRules) {
        return this.updatePoliciesWithoutNotify(sec, ptype, oldRules, newRules);
    }
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/enforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Enforcer",
    ()=>Enforcer,
    "newEnforcer",
    ()=>newEnforcer,
    "newEnforcerWithClass",
    ()=>newEnforcerWithClass
]);
// Copyright 2018 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$managementEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/managementEnforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/model.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/fileSystem.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$stringAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/stringAdapter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/logUtil.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
;
;
;
;
;
class Enforcer extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$managementEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ManagementEnforcer"] {
    /**
     * initWithFile initializes an enforcer with a model file and a policy file.
     * @param modelPath model file path
     * @param policyPath policy file path
     * @param lazyLoad lazyLoad whether to load policy at initial time
     */ async initWithFile(modelPath, policyPath, lazyLoad = false) {
        const a = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FileAdapter"](policyPath, this.fs);
        await this.initWithAdapter(modelPath, a, lazyLoad);
    }
    /**
     * initWithFile initializes an enforcer with a model file and a policy file.
     * @param modelPath model file path
     * @param policyString policy CSV string
     * @param lazyLoad whether to load policy at initial time
     */ async initWithString(modelPath, policyString, lazyLoad = false) {
        const a = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$stringAdapter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StringAdapter"](policyString);
        await this.initWithAdapter(modelPath, a, lazyLoad);
    }
    /**
     * initWithAdapter initializes an enforcer with a database adapter.
     * @param modelPath model file path
     * @param adapter current adapter instance
     * @param lazyLoad whether to load policy at initial time
     */ async initWithAdapter(modelPath, adapter, lazyLoad = false) {
        const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$model$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["newModelFromFile"])(modelPath, this.fs);
        await this.initWithModelAndAdapter(m, adapter, lazyLoad);
        this.modelPath = modelPath;
    }
    /**
     * initWithModelAndAdapter initializes an enforcer with a model and a database adapter.
     * @param m model instance
     * @param adapter current adapter instance
     * @param lazyLoad whether to load policy at initial time
     */ async initWithModelAndAdapter(m, adapter, lazyLoad = false) {
        if (adapter) {
            this.adapter = adapter;
        }
        this.model = m;
        this.model.printModel();
        this.initRmMap();
        if (!lazyLoad && this.adapter) {
            await this.loadPolicy();
        }
    }
    /**
     * getRolesForUser gets the roles that a user has.
     *
     * @param name the user.
     * @param domain the domain.
     * @return the roles that the user has.
     */ async getRolesForUser(name, domain) {
        const rm = this.rmMap.get('g');
        if (rm) {
            if (domain === undefined) {
                return rm.getRoles(name);
            } else {
                return rm.getRoles(name, domain);
            }
        }
        throw new Error("RoleManager didn't exist.");
    }
    /**
     * getUsersForRole gets the users that has a role.
     *
     * @param name the role.
     * @param domain the domain.
     * @return the users that has the role.
     */ async getUsersForRole(name, domain) {
        const rm = this.rmMap.get('g');
        if (rm) {
            if (domain === undefined) {
                return rm.getUsers(name);
            } else {
                return rm.getUsers(name, domain);
            }
        }
        throw new Error("RoleManager didn't exist.");
    }
    /**
     * hasRoleForUser determines whether a user has a role.
     *
     * @param name the user.
     * @param role the role.
     * @param domain the domain.
     * @return whether the user has the role.
     */ async hasRoleForUser(name, role, domain) {
        const roles = await this.getRolesForUser(name, domain);
        let hasRole = false;
        for (const r of roles){
            if (r === role) {
                hasRole = true;
                break;
            }
        }
        return hasRole;
    }
    /**
     * addRoleForUser adds a role for a user.
     * Returns false if the user already has the role (aka not affected).
     *
     * @param user the user.
     * @param role the role.
     * @param domain the domain.
     * @return succeeds or not.
     */ async addRoleForUser(user, role, domain) {
        if (domain === undefined) {
            return this.addGroupingPolicy(user, role);
        } else {
            return this.addGroupingPolicy(user, role, domain);
        }
    }
    /**
     * deleteRoleForUser deletes a role for a user.
     * Returns false if the user does not have the role (aka not affected).
     *
     * @param user the user.
     * @param role the role.
     * @param domain the domain.
     * @return succeeds or not.
     */ async deleteRoleForUser(user, role, domain) {
        if (!user) {
            throw new Error('user must not be empty');
        }
        if (!role) {
            throw new Error('role must not be empty');
        }
        if (domain === undefined) {
            return this.removeGroupingPolicy(user, role);
        } else {
            return this.removeGroupingPolicy(user, role, domain);
        }
    }
    /**
     * deleteRolesForUser deletes all roles for a user.
     * Returns false if the user does not have any roles (aka not affected).
     *
     * @param user the user.
     * @param domain the domain.
     * @return succeeds or not.
     */ async deleteRolesForUser(user, domain) {
        if (!user) {
            throw new Error('user must not be empty');
        }
        if (domain === undefined) {
            const subIndex = this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ );
            return this.removeFilteredGroupingPolicy(subIndex, user);
        } else {
            return this.removeFilteredGroupingPolicy(0, user, '', domain);
        }
    }
    /**
     * deleteUser deletes a user.
     * Returns false if the user does not exist (aka not affected).
     *
     * @param user the user.
     * @return succeeds or not.
     */ async deleteUser(user) {
        if (!user) {
            throw new Error('user must not be empty');
        }
        const subIndex = this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ );
        const res1 = await this.removeFilteredGroupingPolicy(subIndex, user);
        const res2 = await this.removeFilteredPolicy(subIndex, user);
        return res1 || res2;
    }
    /**
     * deleteRole deletes a role.
     * Returns false if the role does not exist (aka not affected).
     *
     * @param role the role.
     * @return succeeds or not.
     */ async deleteRole(role) {
        if (!role) {
            throw new Error('role must not be empty');
        }
        const subIndex = this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ );
        const res1 = await this.removeFilteredGroupingPolicy(subIndex, role);
        const res2 = await this.removeFilteredPolicy(subIndex, role);
        return res1 || res2;
    }
    /**
     * deletePermission deletes a permission.
     * Returns false if the permission does not exist (aka not affected).
     *
     * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
     * @return succeeds or not.
     */ async deletePermission(...permission) {
        if (permission.length === 0) {
            throw new Error('permission must not be empty');
        }
        return this.removeFilteredPolicy(1, ...permission);
    }
    /**
     * addPermissionForUser adds a permission for a user or role.
     * Returns false if the user or role already has the permission (aka not affected).
     *
     * @param user the user.
     * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
     * @return succeeds or not.
     */ async addPermissionForUser(user, ...permission) {
        permission.unshift(user);
        return this.addPolicy(...permission);
    }
    /**
     * deletePermissionForUser deletes a permission for a user or role.
     * Returns false if the user or role does not have the permission (aka not affected).
     *
     * @param user the user.
     * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
     * @return succeeds or not.
     */ async deletePermissionForUser(user, ...permission) {
        if (!user) {
            throw new Error('user must not be empty');
        }
        permission.unshift(user);
        return this.removePolicy(...permission);
    }
    /**
     * deletePermissionsForUser deletes permissions for a user or role.
     * Returns false if the user or role does not have any permissions (aka not affected).
     *
     * @param user the user.
     * @return succeeds or not.
     */ async deletePermissionsForUser(user) {
        if (!user) {
            throw new Error('user must not be empty');
        }
        const subIndex = this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ );
        return this.removeFilteredPolicy(subIndex, user);
    }
    /**
     * getPermissionsForUser gets permissions for a user or role.
     *
     * @param user the user.
     * @return the permissions, a permission is usually like (obj, act). It is actually the rule without the subject.
     */ async getPermissionsForUser(user) {
        const subIndex = this.getFieldIndex('p', "sub" /* FieldIndex.Subject */ );
        return this.getFilteredPolicy(subIndex, user);
    }
    /**
     * hasPermissionForUser determines whether a user has a permission.
     *
     * @param user the user.
     * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
     * @return whether the user has the permission.
     */ async hasPermissionForUser(user, ...permission) {
        permission.unshift(user);
        return this.hasPolicy(...permission);
    }
    /**
     * getImplicitRolesForUser gets implicit roles that a user has.
     * Compared to getRolesForUser(), this function retrieves indirect roles besides direct roles.
     * For example:
     * g, alice, role:admin
     * g, role:admin, role:user
     *
     * getRolesForUser("alice") can only get: ["role:admin"].
     * But getImplicitRolesForUser("alice") will get: ["role:admin", "role:user"].
     */ async getImplicitRolesForUser(name, ...domain) {
        const res = new Set();
        const q = [
            name
        ];
        let n;
        while((n = q.shift()) !== undefined){
            for (const rm of this.rmMap.values()){
                const role = await rm.getRoles(n, ...domain);
                role.forEach((r)=>{
                    if (!res.has(r)) {
                        res.add(r);
                        q.push(r);
                    }
                });
            }
        }
        return Array.from(res);
    }
    /**
     * getImplicitPermissionsForUser gets implicit permissions for a user or role.
     * Compared to getPermissionsForUser(), this function retrieves permissions for inherited roles.
     * For example:
     * p, admin, data1, read
     * p, alice, data2, read
     * g, alice, admin
     *
     * getPermissionsForUser("alice") can only get: [["alice", "data2", "read"]].
     * But getImplicitPermissionsForUser("alice") will get: [["admin", "data1", "read"], ["alice", "data2", "read"]].
     */ async getImplicitPermissionsForUser(user, ...domain) {
        const roles = await this.getImplicitRolesForUser(user, ...domain);
        roles.unshift(user);
        const res = [];
        const withDomain = domain && domain.length !== 0;
        for (const n of roles){
            if (withDomain) {
                const p = await this.getFilteredPolicy(0, n, ...domain);
                res.push(...p);
            } else {
                const p = await this.getPermissionsForUser(n);
                res.push(...p);
            }
        }
        return res;
    }
    /**
     * getImplicitResourcesForUser returns all policies that user obtaining in domain.
     */ async getImplicitResourcesForUser(user, ...domain) {
        const permissions = await this.getImplicitPermissionsForUser(user, ...domain);
        const res = [];
        for (const permission of permissions){
            if (permission[0] === user) {
                res.push(permission);
                continue;
            }
            let resLocal = [
                [
                    user
                ]
            ];
            const tokensLength = permission.length;
            const t = [];
            for (const token of permission){
                if (token === permission[0]) {
                    continue;
                }
                const tokens = await this.getImplicitUsersForRole(token, ...domain);
                tokens.push(token);
                t.push(tokens);
            }
            for(let i = 0; i < tokensLength - 1; i++){
                const n = [];
                for (const tokens of t[i]){
                    for (const policy of resLocal){
                        const t = [
                            ...policy
                        ];
                        t.push(tokens);
                        n.push(t);
                    }
                }
                resLocal = n;
            }
            res.push(...resLocal);
        }
        return res;
    }
    /**
     * getImplicitUsersForRole gets implicit users that a role has.
     * Compared to getUsersForRole(), this function retrieves indirect users besides direct users.
     * For example:
     * g, alice, role:admin
     * g, role:admin, role:user
     *
     * getUsersForRole("user") can only get: ["role:admin"].
     * But getImplicitUsersForRole("user") will get: ["role:admin", "alice"].
     */ async getImplicitUsersForRole(role, ...domain) {
        const res = new Set();
        const q = [
            role
        ];
        let n;
        while((n = q.shift()) !== undefined){
            for (const rm of this.rmMap.values()){
                const user = await rm.getUsers(n, ...domain);
                user.forEach((u)=>{
                    if (!res.has(u)) {
                        res.add(u);
                        q.push(u);
                    }
                });
            }
        }
        return Array.from(res);
    }
    /**
     * getRolesForUserInDomain gets the roles that a user has inside a domain
     * An alias for getRolesForUser with the domain params.
     *
     * @param name the user.
     * @param domain the domain.
     * @return the roles that the user has.
     */ async getRolesForUserInDomain(name, domain) {
        return this.getRolesForUser(name, domain);
    }
    /**
     * getUsersForRoleInFomain gets the users that has a role inside a domain
     * An alias for getUsesForRole with the domain params.
     *
     * @param name the role.
     * @param domain the domain.
     * @return the users that has the role.
     */ async getUsersForRoleInDomain(name, domain) {
        return this.getUsersForRole(name, domain);
    }
    /**
     * getImplicitUsersForPermission gets implicit users for a permission.
     * For example:
     * p, admin, data1, read
     * p, bob, data1, read
     * g, alice, admin
     *
     * getImplicitUsersForPermission("data1", "read") will get: ["alice", "bob"].
     * Note: only users will be returned, roles (2nd arg in "g") will be excluded.
     */ async getImplicitUsersForPermission(...permission) {
        const res = [];
        const policySubjects = await this.getAllSubjects();
        const subjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayRemoveDuplicates"])([
            ...policySubjects,
            ...this.model.getValuesForFieldInPolicyAllTypes('g', 0)
        ]);
        const inherits = this.model.getValuesForFieldInPolicyAllTypes('g', 1);
        for (const user of subjects){
            const allowed = await this.enforce(user, ...permission);
            if (allowed) {
                res.push(user);
            }
        }
        return res.filter((n)=>!inherits.some((m)=>n === m));
    }
    /**
     * getDomainsForUser gets all domains that a user has.
     */ async getDomainsForUser(user) {
        const domains = [];
        for (const rm of this.rmMap.values()){
            const domain = await rm.getDomains(user);
            domains.push(...domain);
        }
        return domains;
    }
    /**
     * getAllDomains gets all domains.
     */ async getAllDomains() {
        const domains = [];
        for (const rm of this.rmMap.values()){
            const domain = await rm.getAllDomains();
            domains.push(...domain);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayRemoveDuplicates"])(domains);
    }
}
async function newEnforcerWithClass(enforcer, ...params) {
    var _a;
    // inject the FS
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultFileSystem"])()) {
        try {
            if (typeof process !== 'undefined' && ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node)) {
                const fs = await __turbopack_context__.A("[externals]/fs [external] (fs, cjs, async loader)");
                const defaultFileSystem = {
                    readFileSync (path, encoding) {
                        return fs.readFileSync(path, {
                            encoding
                        });
                    },
                    writeFileSync (path, text, encoding) {
                        return fs.writeFileSync(path, text, encoding);
                    }
                };
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$fileSystem$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setDefaultFileSystem"])(defaultFileSystem);
            }
        } catch (ignored) {}
    }
    const e = new enforcer();
    let parsedParamLen = 0;
    if (params.length >= 1) {
        const enableLog = params[params.length - 1];
        if (typeof enableLog === 'boolean') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$logUtil$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLogger"])().enableLog(enableLog);
            parsedParamLen++;
        }
    }
    if (params.length - parsedParamLen === 2) {
        if (typeof params[0] === 'string') {
            if (typeof params[1] === 'string') {
                await e.initWithFile(params[0].toString(), params[1].toString());
            } else {
                await e.initWithAdapter(params[0].toString(), params[1], params[2] === true);
            }
        } else {
            if (typeof params[1] === 'string') {
                throw new Error('Invalid parameters for enforcer.');
            } else {
                await e.initWithModelAndAdapter(params[0], params[1]);
            }
        }
    } else if (params.length - parsedParamLen === 1) {
        if (typeof params[0] === 'string') {
            await e.initWithFile(params[0], '');
        } else {
            await e.initWithModelAndAdapter(params[0]);
        }
    } else if (params.length === parsedParamLen) {
        await e.initWithFile('', '');
    } else {
        throw new Error('Invalid parameters for enforcer.');
    }
    return e;
}
async function newEnforcer(...params) {
    return newEnforcerWithClass(Enforcer, ...params);
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/cachedEnforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CachedEnforcer",
    ()=>CachedEnforcer,
    "newCachedEnforcer",
    ()=>newCachedEnforcer
]);
// Copyright 2020 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/enforcer.js [app-route] (ecmascript)");
;
class CachedEnforcer extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Enforcer"] {
    constructor(){
        super(...arguments);
        this.enableCache = true;
        this.m = new Map();
    }
    // invalidateCache deletes all the existing cached decisions.
    invalidateCache() {
        this.m = new Map();
    }
    // setEnableCache determines whether to enable cache on e nforce(). When enableCache is enabled, cached result (true | false) will be returned for previous decisions.
    setEnableCache(enableCache) {
        this.enableCache = enableCache;
    }
    static canCache(...rvals) {
        return rvals.every((n)=>typeof n === 'string');
    }
    static getCacheKey(...rvals) {
        return rvals.join('$$');
    }
    getCache(key) {
        return this.m.get(key);
    }
    setCache(key, value) {
        this.m.set(key, value);
    }
    // enforce decides whether a "subject" can access a "object" with the operation "action", input parameters are usually: (sub, obj, act).
    // if rvals is not string , ingore the cache
    async enforce(...rvals) {
        if (!this.enableCache) {
            return super.enforce(...rvals);
        }
        let key = '';
        const cache = CachedEnforcer.canCache(...rvals);
        if (cache) {
            key = CachedEnforcer.getCacheKey(...rvals);
            const res = this.getCache(key);
            if (res !== undefined) {
                return res;
            }
        }
        const res = await super.enforce(...rvals);
        if (cache) {
            this.setCache(key, res);
        }
        return res;
    }
}
async function newCachedEnforcer(...params) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["newEnforcerWithClass"])(CachedEnforcer, ...params);
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/syncedEnforcer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SyncedEnforcer",
    ()=>SyncedEnforcer,
    "newSyncedEnforcer",
    ()=>newSyncedEnforcer
]);
// Copyright 2020 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/enforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$await$2d$lock$2f$build$2f$AwaitLock$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/await-lock/build/AwaitLock.js [app-route] (ecmascript)");
;
;
class SyncedEnforcer extends __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Enforcer"] {
    constructor(){
        super(...arguments);
        this.lock = new __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$await$2d$lock$2f$build$2f$AwaitLock$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
    }
    /**
     * setWatcher sets the current watcher.
     *
     * @param watcher the watcher.
     */ setWatcher(watcher) {
        this.watcher = watcher;
        this.watcher.setUpdateCallback(()=>this.loadPolicy());
    }
    /**
     * loadPolicy reloads the policy from file/database.
     */ async loadPolicy() {
        await this.lock.acquireAsync();
        return super.loadPolicy().finally(()=>this.lock.release());
    }
    /**
     * clearPolicy clears all policy.
     */ clearPolicy() {
        this.lock.acquireAsync().then(()=>super.clearPolicy()).finally(()=>this.lock.release());
    }
    /**
     * savePolicy saves the current policy (usually after changed with Casbin API) back to file/database.
     */ async savePolicy() {
        await this.lock.acquireAsync();
        return super.savePolicy().finally(()=>this.lock.release());
    }
    /**
     * buildRoleLinks manually rebuild the role inheritance relations.
     */ async buildRoleLinks() {
        await this.lock.acquireAsync();
        return super.buildRoleLinks().finally(()=>this.lock.release());
    }
    /**
     * If the matchers does not contain an asynchronous method, call it faster.
     *
     * enforceWithSyncCompile decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request.
     */ enforceWithSyncCompile(...rvals) {
        return super.enforceWithSyncCompile(...rvals);
    }
    /**
     * enforce decides whether a "subject" can access a "object" with
     * the operation "action", input parameters are usually: (sub, obj, act).
     *
     * @param rvals the request needs to be mediated, usually an array
     *              of strings, can be class instances if ABAC is used.
     * @return whether to allow the request.
     */ async enforce(...rvals) {
        await this.lock.acquireAsync();
        return super.enforce(...rvals).finally(()=>this.lock.release());
    }
    /**
     * getAllSubjects gets the list of subjects that show up in the current policy.
     *
     * @return all the subjects in "p" policy rules. It actually collects the
     *         0-index elements of "p" policy rules. So make sure your subject
     *         is the 0-index element, like (sub, obj, act). Duplicates are removed.
     */ async getAllSubjects() {
        return this.getAllNamedSubjects('p');
    }
    /**
     * getAllNamedSubjects gets the list of subjects that show up in the currentnamed policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the subjects in policy rules of the ptype type. It actually
     *         collects the 0-index elements of the policy rules. So make sure
     *         your subject is the 0-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedSubjects(ptype) {
        await this.lock.acquireAsync();
        return super.getAllNamedSubjects(ptype).finally(()=>this.lock.release());
    }
    /**
     * getAllObjects gets the list of objects that show up in the current policy.
     *
     * @return all the objects in "p" policy rules. It actually collects the
     *         1-index elements of "p" policy rules. So make sure your object
     *         is the 1-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllObjects() {
        return this.getAllNamedObjects('p');
    }
    /**
     * getAllNamedObjects gets the list of objects that show up in the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the objects in policy rules of the ptype type. It actually
     *         collects the 1-index elements of the policy rules. So make sure
     *         your object is the 1-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedObjects(ptype) {
        await this.lock.acquireAsync();
        return super.getAllNamedObjects(ptype).finally(()=>this.lock.release());
    }
    /**
     * getAllActions gets the list of actions that show up in the current policy.
     *
     * @return all the actions in "p" policy rules. It actually collects
     *         the 2-index elements of "p" policy rules. So make sure your action
     *         is the 2-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllActions() {
        return this.getAllNamedActions('p');
    }
    /**
     * GetAllNamedActions gets the list of actions that show up in the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return all the actions in policy rules of the ptype type. It actually
     *         collects the 2-index elements of the policy rules. So make sure
     *         your action is the 2-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedActions(ptype) {
        await this.lock.acquireAsync();
        return super.getAllNamedActions(ptype).finally(()=>this.lock.release());
    }
    /**
     * getAllRoles gets the list of roles that show up in the current policy.
     *
     * @return all the roles in "g" policy rules. It actually collects
     *         the 1-index elements of "g" policy rules. So make sure your
     *         role is the 1-index element, like (sub, role).
     *         Duplicates are removed.
     */ async getAllRoles() {
        return this.getAllNamedRoles('g');
    }
    /**
     * getAllNamedRoles gets the list of roles that show up in the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @return all the subjects in policy rules of the ptype type. It actually
     *         collects the 0-index elements of the policy rules. So make
     *         sure your subject is the 0-index element, like (sub, obj, act).
     *         Duplicates are removed.
     */ async getAllNamedRoles(ptype) {
        await this.lock.acquireAsync();
        return super.getAllNamedRoles(ptype).finally(()=>this.lock.release());
    }
    /**
     * getPolicy gets all the authorization rules in the policy.
     *
     * @return all the "p" policy rules.
     */ async getPolicy() {
        return this.getNamedPolicy('p');
    }
    /**
     * getFilteredPolicy gets all the authorization rules in the policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "p" policy rules.
     */ async getFilteredPolicy(fieldIndex, ...fieldValues) {
        return this.getFilteredNamedPolicy('p', fieldIndex, ...fieldValues);
    }
    /**
     * getNamedPolicy gets all the authorization rules in the named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @return the "p" policy rules of the specified ptype.
     */ async getNamedPolicy(ptype) {
        await this.lock.acquireAsync();
        return super.getNamedPolicy(ptype).finally(()=>this.lock.release());
    }
    /**
     * getFilteredNamedPolicy gets all the authorization rules in the named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "p" policy rules of the specified ptype.
     */ async getFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues) {
        await this.lock.acquireAsync();
        return super.getFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues).finally(()=>this.lock.release());
    }
    /**
     * getGroupingPolicy gets all the role inheritance rules in the policy.
     *
     * @return all the "g" policy rules.
     */ async getGroupingPolicy() {
        return this.getNamedGroupingPolicy('g');
    }
    /**
     * getFilteredGroupingPolicy gets all the role inheritance rules in the policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value "" means not to match this field.
     * @return the filtered "g" policy rules.
     */ async getFilteredGroupingPolicy(fieldIndex, ...fieldValues) {
        return this.getFilteredNamedGroupingPolicy('g', fieldIndex, ...fieldValues);
    }
    /**
     * getNamedGroupingPolicy gets all the role inheritance rules in the policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @return the "g" policy rules of the specified ptype.
     */ async getNamedGroupingPolicy(ptype) {
        await this.lock.acquireAsync();
        return super.getNamedGroupingPolicy(ptype).finally(()=>this.lock.release());
    }
    /**
     * getFilteredNamedGroupingPolicy gets all the role inheritance rules in the policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return the filtered "g" policy rules of the specified ptype.
     */ async getFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues) {
        await this.lock.acquireAsync();
        return super.getFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues).finally(()=>this.lock.release());
    }
    /**
     * hasPolicy determines whether an authorization rule exists.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return whether the rule exists.
     */ async hasPolicy(...params) {
        return this.hasNamedPolicy('p', ...params);
    }
    /**
     * hasNamedPolicy determines whether a named authorization rule exists.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return whether the rule exists.
     */ async hasNamedPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return super.hasNamedPolicy(ptype, ...params).finally(()=>this.lock.release());
    }
    /**
     * addPolicy adds an authorization rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async addPolicy(...params) {
        return this.addNamedPolicy('p', ...params);
    }
    /**
     * addNamedPolicy adds an authorization rule to the current named policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return succeeds or not.
     */ async addNamedPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return super.addNamedPolicy(ptype, ...params).finally(()=>this.lock.release());
    }
    /**
     * removePolicy removes an authorization rule from the current policy.
     *
     * @param params the "p" policy rule, ptype "p" is implicitly used.
     * @return succeeds or not.
     */ async removePolicy(...params) {
        return this.removeNamedPolicy('p', ...params);
    }
    /**
     * removeFilteredPolicy removes an authorization rule from the current policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredPolicy(fieldIndex, ...fieldValues) {
        return this.removeFilteredNamedPolicy('p', fieldIndex, ...fieldValues);
    }
    /**
     * removeNamedPolicy removes an authorization rule from the current named policy.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param params the "p" policy rule.
     * @return succeeds or not.
     */ async removeNamedPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return this.removePolicyInternal('p', ptype, params, true).finally(()=>this.lock.release());
    }
    /**
     * removeFilteredNamedPolicy removes an authorization rule from the current named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "p", "p2", "p3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues) {
        await this.lock.acquireAsync();
        return super.removeFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues).finally(()=>this.lock.release());
    }
    /**
     * hasGroupingPolicy determines whether a role inheritance rule exists.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return whether the rule exists.
     */ async hasGroupingPolicy(...params) {
        return this.hasNamedGroupingPolicy('g', ...params);
    }
    /**
     * hasNamedGroupingPolicy determines whether a named role inheritance rule exists.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return whether the rule exists.
     */ async hasNamedGroupingPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return super.hasNamedGroupingPolicy(ptype, ...params).finally(()=>this.lock.release());
    }
    /**
     * addGroupingPolicy adds a role inheritance rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async addGroupingPolicy(...params) {
        return this.addNamedGroupingPolicy('g', ...params);
    }
    /**
     * addNamedGroupingPolicy adds a named role inheritance rule to the current policy.
     * If the rule already exists, the function returns false and the rule will not be added.
     * Otherwise the function returns true by adding the new rule.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return succeeds or not.
     */ async addNamedGroupingPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return super.addNamedGroupingPolicy(ptype, ...params).finally(()=>this.lock.release());
    }
    /**
     * removeGroupingPolicy removes a role inheritance rule from the current policy.
     *
     * @param params the "g" policy rule, ptype "g" is implicitly used.
     * @return succeeds or not.
     */ async removeGroupingPolicy(...params) {
        return this.removeNamedGroupingPolicy('g', ...params);
    }
    /**
     * removeFilteredGroupingPolicy removes a role inheritance rule from the current policy, field filters can be specified.
     *
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredGroupingPolicy(fieldIndex, ...fieldValues) {
        return this.removeFilteredNamedGroupingPolicy('g', fieldIndex, ...fieldValues);
    }
    /**
     * removeNamedGroupingPolicy removes a role inheritance rule from the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param params the "g" policy rule.
     * @return succeeds or not.
     */ async removeNamedGroupingPolicy(ptype, ...params) {
        await this.lock.acquireAsync();
        return super.removeNamedGroupingPolicy(ptype, ...params).finally(()=>this.lock.release());
    }
    /**
     * removeFilteredNamedGroupingPolicy removes a role inheritance rule from the current named policy, field filters can be specified.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param fieldIndex the policy rule's start index to be matched.
     * @param fieldValues the field values to be matched, value ""
     *                    means not to match this field.
     * @return succeeds or not.
     */ async removeFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues) {
        await this.lock.acquireAsync();
        return super.removeFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues).finally(()=>this.lock.release());
    }
    /**
     * UpdateGroupingPolicy updates an rule to the current named policy.
     *
     * @param oldRule the old rule.
     * @param newRule the new rule.
     * @return succeeds or not.
     */ async updateGroupingPolicy(oldRule, newRule) {
        return super.updateGroupingPolicy(oldRule, newRule);
    }
    /**
     * updateNamedGroupingPolicy updates an rule to the current named policy.
     *
     * @param ptype the policy type, can be "g", "g2", "g3", ..
     * @param oldRule the old rule.
     * @param newRule the new rule.
     * @return succeeds or not.
     */ async updateNamedGroupingPolicy(ptype, oldRule, newRule) {
        return super.updateNamedGroupingPolicy(ptype, oldRule, newRule);
    }
    /**
     * add matching function to RoleManager by ptype
     * @param ptype g
     * @param fn the function will be added
     */ async addNamedMatchingFunc(ptype, fn) {
        await this.lock.acquireAsync();
        return super.addNamedMatchingFunc(ptype, fn).finally(()=>this.lock.release());
    }
    /**
     * add domain matching function to RoleManager by ptype
     * @param ptype g
     * @param fn the function will be added
     */ async addNamedDomainMatchingFunc(ptype, fn) {
        await this.lock.acquireAsync();
        return super.addNamedDomainMatchingFunc(ptype, fn).finally(()=>{
            this.lock.release();
        });
    }
}
async function newSyncedEnforcer(...params) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["newEnforcerWithClass"])(SyncedEnforcer, ...params);
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/frontend.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "casbinJsGetPermissionForUser",
    ()=>casbinJsGetPermissionForUser
]);
// Copyright 2020 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/util.js [app-route] (ecmascript)");
;
async function casbinJsGetPermissionForUser(e, user) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const obj = {};
    const m = e.getModel().model;
    let s = '';
    s += '[request_definition]\n';
    s += `r = ${(_b = (_a = m.get('r')) === null || _a === void 0 ? void 0 : _a.get('r')) === null || _b === void 0 ? void 0 : _b.value.replace(/_/g, '.')}\n`;
    s += '[policy_definition]\n';
    s += `p = ${(_d = (_c = m.get('p')) === null || _c === void 0 ? void 0 : _c.get('p')) === null || _d === void 0 ? void 0 : _d.value.replace(/_/g, '.')}\n`;
    if (((_e = m.get('g')) === null || _e === void 0 ? void 0 : _e.get('g')) !== undefined) {
        s += '[role_definition]\n';
        s += `g = ${(_g = (_f = m.get('g')) === null || _f === void 0 ? void 0 : _f.get('g')) === null || _g === void 0 ? void 0 : _g.value}\n`;
    }
    s += '[policy_effect]\n';
    s += `e = ${(_j = (_h = m.get('e')) === null || _h === void 0 ? void 0 : _h.get('e')) === null || _j === void 0 ? void 0 : _j.value.replace(/_/g, '.')}\n`;
    s += '[matchers]\n';
    s += `m = ${(_l = (_k = m.get('m')) === null || _k === void 0 ? void 0 : _k.get('m')) === null || _l === void 0 ? void 0 : _l.value.replace(/_/g, '.')}`;
    obj['m'] = s;
    const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCopy"])(await e.getPolicy());
    const groupPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCopy"])(await e.getGroupingPolicy());
    policy.forEach((item)=>{
        item.unshift('p');
    });
    groupPolicy.forEach((item)=>{
        item.unshift('g');
    });
    obj['p'] = [
        ...policy,
        ...groupPolicy
    ];
    return JSON.stringify(obj);
}
}),
"[project]/apps/web/node_modules/casbin/lib/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Copyright 2019 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$util$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/util/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/enforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$cachedEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/cachedEnforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$syncedEnforcer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/syncedEnforcer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$effect$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/effect/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$model$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/model/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$persist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/persist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$rbac$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/rbac/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$log$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/log/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$enforceContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/enforceContext.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$casbin$2f$lib$2f$esm$2f$frontend$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/casbin/lib/esm/frontend.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
];

//# sourceMappingURL=5bcb1_casbin_lib_esm_1d30d597._.js.map