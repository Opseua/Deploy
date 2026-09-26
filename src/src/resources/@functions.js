// src/src/resources/@functions.js

// DETECÇÃO DE AMBIENTE [0: UNKNOWN | 1: EXTENSION | 2: NODE | 3: GOOGLE | 4: HTML | 5: CLOUDFLARE]
function getEngType() {
    let x = 'undefined'; x = typeof chrome !== x && chrome.runtime ? 1 : typeof global !== x && typeof WebSocketPair === x ? 2 : typeof ScriptApp !== x ? 3 : typeof window !== x && typeof window.document
        !== x ? 4 : typeof navigator !== x && navigator.userAgent === 'Cloudflare-Workers' ? 5 : 0; return { 'engType': x, 'engName': ['UNKNOWN', 'EXTENSION', 'NODE', 'GOOGLE', 'HTML', 'CLOUDFLARE',][x], };
}
let { engType, engName, } = getEngType(); globalThis['engType'] = engType; globalThis['engName'] = engName;

// ---------------------------------------------------------------------------------------------------------------

// LIBS
import { Blowfish } from '../../../src/src/scripts/libs/blowfish.js';

// FUNÇÕES
await import('../../../src/src/resources/apiV2.js');

// ---------------------------------------------------------------------------------------------------------------

function getTypeof(v) { // 'number' / 'nan' / 'string' / 'boolean' / 'null' / 'undefined' / 'array' / 'object' / 'buffer' / 'function' / 'date' / 'set' / 'map' / 'regexp' / 'error' → getTypeof(false)
    let t = typeof v; return (t !== 'object') ? ((t === 'number') ? (Number.isNaN(v) ? 'nan' : 'number') : t) : (v === null) ? 'null' :
        ((engType === 2 ? (Buffer.isBuffer(v)) : v instanceof Uint8Array) ? 'buffer' : (Array.isArray(v)) ? 'array' : (v instanceof Error) ? 'error' : (v instanceof Date) ? 'date' : (v instanceof Set) ?
            'set' : (v instanceof Map) ? 'map' : (v instanceof RegExp) ? 'regexp' : 'object');
}

function setRetRunV2({ p1, p2, nameFun, retRes = false, hides = [], }) {
    let act = null, msg = null, obj = p1?.constructor === Object ? p1 : (p2?.constructor === Object ? p2 : {}); if (Array.isArray(p1)) { [act, msg,] = p1; } else if (typeof p1 === 'string') { msg = p1; }
    let s = obj.ret ? 'OK' : 'ERRO'; msg = msg ? `${nameFun}${act ? ` [${act}]` : ''}: ${s} | ${msg}` : (obj.msg || `${nameFun}${act ? ` [${act}]` : ''}: ${s}`); let r = { 'ret': !!obj.ret, msg, };
    if ((r.ret || retRes) && obj.hasOwnProperty('res')) { r.res = obj.res; if (hides.length && obj.res?.constructor === Object) { r.res = { ...obj.res, }; hides.forEach((k) => delete r.res[k]); } } return r;
}

function paramsObjV2(val, type, char = '&') {
    if (type === 'object') { return Object.entries(val).map(([k, v,]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join(char); }
    return Object.fromEntries(val.split('?').pop().split(char).filter(p => p.includes('=')).map(p => p.split(/=(.*)/s).slice(0, 2).map(decodeURIComponent)));
}

function urlParse(u) {
    let m = `${u}`.match(/^([a-z][a-z0-9+.-]*:)\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i); if (!m) { return null; }
    return { 'pro': m[1].toLowerCase(), 'origin': `${m[1].toLowerCase()}//${m[2].toLowerCase()}`, 'host': m[2].toLowerCase(), 'path': m[3] || '/', 'query': m[4] || '', 'hash': m[5] || '', };
}

function urlResolve(loc, base) {
    loc = `${loc}`.trim(); if (/^[a-z][a-z0-9+.-]*:/i.test(loc)) { return loc; } let b = urlParse(base); if (!b) { return loc; } if (loc.startsWith('//')) { return `${b.pro}${loc}`; }
    if (loc.startsWith('#')) { return `${b.origin}${b.path}${b.query}${loc}`; } if (loc.startsWith('?')) { return `${b.origin}${b.path}${loc}`; } let [pathQ, hash = '',] =
        loc.split(/(?=#)/); let [p, q = '',] = pathQ.split(/(?=\?)/); let dir = p.startsWith('/') ? [] : b.path.replace(/[^/]*$/, '').split('/').filter(Boolean); let o = [...dir,];
    for (let s of p.split('/')) { if (s === '..') { o.pop(); } else if (s !== '.' && s !== '') { o.push(s); } } return `${b.origin}/${o.join('/')}${p.endsWith('/') && o.length ? '/' : ''}${q}${hash}`;
}

function cloneDeep(v, seen = new WeakMap()) {
    if (v === null || typeof v !== 'object') { return v; } if (seen.has(v)) { return seen.get(v); } if (v instanceof Date) { return new Date(v.getTime()); }
    if (v instanceof RegExp) { return new RegExp(v.source, v.flags); } if (typeof Uint8Array !== 'undefined' && v instanceof Uint8Array) { return v.slice(); }
    if (v instanceof Map) { let m = new Map(); seen.set(v, m); v.forEach((val, key) => m.set(cloneDeep(key, seen), cloneDeep(val, seen))); return m; }
    if (v instanceof Set) { let s = new Set(); seen.set(v, s); v.forEach((val) => s.add(cloneDeep(val, seen))); return s; }
    if (Array.isArray(v)) { let a = []; seen.set(v, a); v.forEach((val, i) => { a[i] = cloneDeep(val, seen); }); return a; }
    let o = {}; seen.set(v, o); for (let k of Object.keys(v)) { o[k] = cloneDeep(v[k], seen); } return o;
}

function parsePath(path) { let parts = [], m, re = /([^.[\]]+)|\[(\d+)\]/g; while ((m = re.exec(path))) { parts.push(m[2] !== undefined ? Number(m[2]) : m[1]); } return parts; }
function getPath(obj, parts) { let cur = obj; for (let p of parts) { if (cur === null || cur === undefined) { return undefined; } cur = cur[p]; } return cur; } function setPath(obj, parts, value) {
    let cur = obj; for (let i = 0; i < parts.length - 1; i++) {
        let p = parts[i], next = parts[i + 1]; if (cur[p] === null || typeof cur[p] !== 'object') { cur[p] = (typeof next === 'number') ? [] : {}; } cur = cur[p];
    } cur[parts[parts.length - 1]] = value;
} function validatePar({ par, rules = {}, nameFun = 'validatePar', }) {
    let xxx = `TIPOS DE PARÂMETRO ACEITOS [${(rules.parTypes || []).join(', ')}]`; function setRet(p1) { return setRetRunV2({ p1, nameFun, }); } let parType = getTypeof(par);
    if (rules.parTypes?.length && !rules.parTypes.includes(parType)) { return setRet(xxx); } let keys = rules.keys || {}; let result = (parType === 'object') ? { ...par, } : par;
    for (let [key, rule,] of Object.entries(keys)) {
        let isNested = key.includes('.') || key.includes('['); let parts = isNested ? parsePath(key) : null; let value = isNested ? getPath(result, parts) : result[key]; if (!(value !== undefined)) {
            if (rule.required) { return setRet(`INFORMAR '${key}'`); } if (rule.hasOwnProperty('default')) {
                let def = ['object', 'array', 'map', 'set',].includes(getTypeof(rule.default)) ? cloneDeep(rule.default) : rule.default; if (isNested) { setPath(result, parts, def); } else { result[key] = def; }
            } continue;
        } if (rule.types?.length) { let vType = getTypeof(value); if (!rule.types.includes(vType)) { return setRet(`'${key}' TIPOS ACEITOS [${rule.types.join(', ')}]`); } }
        if (rule.values?.length && !rule.values.includes(value)) { return setRet(`'${key}' VALORES ACEITOS [${rule.values.join(', ')}]`); }
    } if (rules.keepOnly && parType === 'object') {
        let allowed = new Set([...Object.keys(keys).map((k) => parsePath(k)[0]), 'hides', 'ignoreErr',]); for (let k of Object.keys(result)) { if (!allowed.has(k)) { delete result[k]; } }
    } if (rules.keepOrder && parType === 'object') {
        let ordered = {}, rootKeys = [...new Set(Object.keys(keys).map((k) => parsePath(k)[0])),]; for (let k of rootKeys) { if (result.hasOwnProperty(k)) { ordered[k] = result[k]; } }
        for (let k of Object.keys(result)) { if (!ordered.hasOwnProperty(k)) { ordered[k] = result[k]; } } result = ordered;
    } return setRet({ 'ret': true, 'res': result, });
}

function encryptDecrypt(pass, string, encrypt) {
    let a = pass, b = string, c = encrypt; try {
        let bf = new Blowfish(a, Blowfish.MODE.ECB, Blowfish.PADDING.NULL); if (c) {
            let t = new TextEncoder().encode(b), blockSize = 8, padLen = blockSize - (t.length % blockSize), padded = new Uint8Array(t.length + padLen); padded.set(t);
            let encrypted = Array.from(new Uint8Array(bf.encode(padded.buffer))).map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(''); return encrypted;
        } else {
            let m = b.trim().match(/.{1,2}/g); if (!m) { return null; } let bytes = new Uint8Array(m.map(byte => parseInt(byte, 16))); let decrypted = new TextDecoder('utf-8').decode
                (bf.decode(bytes, Blowfish.TYPE.UINT8_ARRAY)).replace(/\0+$/, ''); if (/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/.test(decrypted)) { return false; } return decrypted;
        }
    } catch { return null; }
}

if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
    // FUNÇÕES
    globalThis['getTypeof'] = getTypeof; globalThis['setRetRunV2'] = setRetRunV2; globalThis['paramsObjV2'] = paramsObjV2; globalThis['urlParse'] = urlParse; globalThis['urlResolve'] = urlResolve;
    globalThis['validatePar'] = validatePar; globalThis['encryptDecrypt'] = encryptDecrypt; globalThis['passwordRaw'] = encryptDecrypt(env.confSecurityPass, 'B89D2CEE76D850D7', false);

    // CONFIG/VARIÁVEIS (MANTER POR ÚLTIMO!!!)
    let url = `https://raw.githubusercontent.com/Opseua/Deploy/refs/heads/main/src/src/config.json.enc`;
    let retApiV2 = await apiV2({ 'method': 'GET', url, }); let config = encryptDecrypt(passwordRaw, retApiV2?.res?.body || '', false); globalThis['config'] = config === null ? {} : config;

    if (['CLOUDFLARE',].includes(engName)) {
        apiV2({ 'method': 'POST', 'url': `https://ntfy.sh/${env.NTFY_CHANNEL}?title=config.json.enc`, 'body': 'PROCESSANDO', });
    }

    // if (['NODE',].includes(engName)) {
    //     try { let { readFileSync, } = await import('fs'); config = readFileSync('src/src/config.json.enc', 'utf8'); } catch (e) { config = ``; }
    // } if (['NODE', 'CLOUDFLARE',].includes(engName)) { config = encryptDecrypt(passwordRaw, config, false); globalThis['config'] = config === null ? {} : JSON.parse(config); }
}


