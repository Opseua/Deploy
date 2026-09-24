// src/resources/@functions.js

// DETECÇÃO DE AMBIENTE [1: CHROME | 2: NODE | 3: GOOGLE | 4: HTML | 5: CLOUDFLARE]
function getEngType() {
    let x = 'undefined'; x = typeof chrome !== x && chrome.runtime ? 1 : typeof global !== x && typeof WebSocketPair === x ? 2 : typeof ScriptApp !== x ? 3 : typeof window !== x && typeof window.document
        !== x ? 4 : typeof navigator !== x && navigator.userAgent === 'Cloudflare-Workers' ? 5 : 0; return { 'engType': x, 'engName': ['UNKNOWN', 'EXTENSION', 'NODE', 'GOOGLE', 'HTML', 'CLOUDFLARE',][x], };
}
let { engType, engName, } = getEngType();

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

function paramsObj(s, char = `&`) {
    if (!s || typeof s !== 'string') { return {}; } let q = s.split('?').pop(); let obj = {};
    for (let p of q.split(char)) { if (!p || !p.includes('=')) { continue; } let [k, v = '',] = p.split('='); if (!k) { continue; } obj[decodeURIComponent(k)] = decodeURIComponent(v); } return obj;
}

function validatePar({ par, rules = {}, nameFun = 'validatePar', }) {
    let xxx = `TIPOS DE PARÂMETRO ACEITOS [${(rules.parTypes || []).join(', ')}]`; function setRet(p1) { return setRetRunV2({ p1, nameFun, }); } let parType = getTypeof(par);
    if (rules.parTypes?.length && !rules.parTypes.includes(parType)) { return setRet(xxx); } let keys = rules.keys || {}; let result = (parType === 'object') ? { ...par, } : par;
    function parsePath(path) { let parts = [], m, re = /([^.[\]]+)|\[(\d+)\]/g; while ((m = re.exec(path))) { parts.push(m[2] !== undefined ? Number(m[2]) : m[1]); } return parts; }
    function getPath(obj, parts) { let cur = obj; for (let p of parts) { if (cur === null || cur === undefined) { return undefined; } cur = cur[p]; } return cur; } function setPath(obj, parts, value) {
        let cur = obj; for (let i = 0; i < parts.length - 1; i++) {
            let p = parts[i], next = parts[i + 1]; if (cur[p] === null || typeof cur[p] !== 'object') { cur[p] = (typeof next === 'number') ? [] : {}; } cur = cur[p];
        } cur[parts[parts.length - 1]] = value;
    } for (let [key, rule,] of Object.entries(keys)) {
        let isNested = key.includes('.') || key.includes('['); let parts = isNested ? parsePath(key) : null; let value = isNested ? getPath(result, parts) : result[key]; if (!(value !== undefined)) {
            if (rule.required) { return setRet(`INFORMAR '${key}'`); } if (rule.hasOwnProperty('default')) {
                let def = ['object', 'array', 'map', 'set',].includes(getTypeof(rule.default)) ? structuredClone(rule.default) : rule.default;
                if (isNested) { setPath(result, parts, def); } else { result[key] = def; }
            } continue;
        } if (rule.types?.length) { let vType = getTypeof(value); if (!rule.types.includes(vType)) { return setRet(`'${key}' TIPOS ACEITOS [${rule.types.join(', ')}]`); } }
        if (rule.values?.length && !rule.values.includes(value)) { return setRet(`'${key}' VALORES ACEITOS [${rule.values.join(', ')}]`); }
    } if (rules.strict && parType === 'object') {
        let allowed = new Set([...Object.keys(keys).map((k) => parsePath(k)[0]), 'hides', 'ignoreErr',]); for (let k of Object.keys(result)) { if (!allowed.has(k)) { delete result[k]; } }
    } return setRet({ 'ret': true, 'res': result, });
}

if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
    globalThis['getEngType'] = getEngType; globalThis['getTypeof'] = getTypeof; globalThis['setRetRunV2'] = setRetRunV2; globalThis['engType'] = engType;
    globalThis['engName'] = engName; globalThis['paramsObj'] = paramsObj; globalThis['validatePar'] = validatePar;

}


