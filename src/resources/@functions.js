// @functions.js

// DETECÇÃO DE AMBIENTE [1: CHROME | 2: NODE | 3: GOOGLE | 4: HTML | 5: CLOUDFLARE]
function getEngType() {
    let x = 'undefined'; x = typeof chrome !== x && chrome.runtime ? 1 : typeof global !== x && typeof WebSocketPair === x ? 2 : typeof ScriptApp !== x ? 3 : typeof window !== x && typeof window.document
        !== x ? 4 : typeof navigator !== x && navigator.userAgent === 'Cloudflare-Workers' ? 5 : 0; return { 'engType': x, 'engName': ['UNKNOWN', 'EXTENSION', 'NODE', 'GOOGLE', 'HTML', 'CLOUDFLARE',][x], };
}

function getTypeof(v) { // 'number' / 'nan' / 'string' / 'boolean' / 'null' / 'undefined' / 'array' / 'object' / 'buffer' / 'function' / 'date' / 'set' / 'map' / 'regexp' / 'error' → getTypeof(false)
    let t = typeof v; return (t !== 'object') ? ((t === 'number') ? (Number.isNaN(v) ? 'nan' : 'number') : t) : (v === null) ? 'null' :
        ((engType === 2 ? (Buffer.isBuffer(v)) : v instanceof Uint8Array) ? 'buffer' : (Array.isArray(v)) ? 'array' : (v instanceof Error) ? 'error' : (v instanceof Date) ? 'date' : (v instanceof Set) ?
            'set' : (v instanceof Map) ? 'map' : (v instanceof RegExp) ? 'regexp' : 'object');
}

function setRetRunV2({ p1, p2, nameFun, }) {
    let act = null, msg = null, obj = p1?.constructor === Object ? p1 : (p2?.constructor === Object ? p2 : {}); if (Array.isArray(p1)) { [act, msg,] = p1; }
    else if (typeof p1 === 'string') { msg = p1; } let status = obj.ret ? 'OK' : 'ERRO'; msg = msg ? `${nameFun}${act ? ` [${act}]` : ''}: ${status} | ${msg}`
        : (obj.msg || `${nameFun}${act ? ` [${act}]` : ''}: ${status}`); let r = { 'ret': !!obj.ret, msg, }; if (r.ret && obj.hasOwnProperty('res')) { r.res = obj.res; } return r;
}

let { engType, engName, } = getEngType();

if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
    globalThis['getEngType'] = getEngType; globalThis['getTypeof'] = getTypeof; globalThis['setRetRunV2'] = setRetRunV2; globalThis['engType'] = engType; globalThis['engName'] = engName;
}


