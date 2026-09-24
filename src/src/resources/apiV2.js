// src/resources/apiV2.js

let nameFun = `apiV2`, dispatcher;
async function apiV2(inf = {}) {
    let ret = { 'ret': false, }, hides = inf.hides || []; function setRet(p1, p2) { ret = setRetRunV2({ p1, p2, nameFun, hides, }); return ret; } let retHelper;
    try {
        function paramsObj(val, type, char = '&') { // CONVERTER OBJETO PARA urlencoded E VICE-VERSA
            if (type === 'object') { return Object.entries(val).map(([k, v,]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join(char); }
            return Object.fromEntries(val.split('?').pop().split(char).filter(p => p.includes('=')).map(p => p.split(/=(.*)/s).slice(0, 2).map(decodeURIComponent)));
        }

        let rulesApiV2 = {
            'parTypes': ['object',], 'keys': {
                'method': { 'required': true, 'types': ['string',], 'values': ['GET', 'POST', 'PUT', 'DELETE', 'PATCH',], }, 'url': { 'required': true, 'types': ['string',], },
                'headers': { 'types': ['object',], 'default': {}, }, 'body': { 'types': ['object', 'string', 'array', 'buffer',], }, 'maxConnect': { 'types': ['number',], 'default': 5, },
                'maxResponse': { 'types': ['number',], 'default': 20, }, 'object': { 'types': ['boolean',], 'default': true, }, 'hideHeaders': { 'types': ['boolean',], 'default': true, },
                'bodyReqRaw': { 'types': ['boolean',], }, 'bodyResRaw': { 'types': ['boolean',], }, 'code': { 'types': ['number', 'boolean', 'array',], 'default': [200, 201, 204,], },
                'defaultHeaders': { 'types': ['boolean',], 'default': true, }, 'modeRedirect': { 'types': ['string',], 'values': ['block', 'followAndGet',], },
                'reRunApi': { 'types': ['boolean',], }, 'signal': { 'types': ['object',], },
            },
        };

        // VÁRIAS REQUISIÇÕES
        if (Array.isArray(inf)) {
            let list = [...inf,], all = typeof list[0] === 'number' ? list.shift() === 0 : false; if (list.length === 0) { return setRet(`ARRAY 'inf' VAZIA`); } let need = all ?
                list.length : (typeof inf[0] === 'number' ? inf[0] : list.length); need = Math.min(need, list.length); let group = new AbortController(), res = await new Promise((resolve) => {
                    let done = [], count = 0, total = list.length, fin = () => { group.abort(); resolve(all ? done : done.filter((x) => x.ret).slice(0, need)); }; list.forEach(async (a, idx) => {
                        let r; try { r = await apiV2({ ...a, 'signal': group.signal, }); } catch (e) { r = setRetRunV2({ 'p1': `${e}`, nameFun, }); } if (group.signal.aborted) { return; }
                        done.push({ idx, 'ret': r.ret, 'msg': r.msg, ...(r.hasOwnProperty('res') && { 'res': r.res, }), }); count++; if (count === total) { return fin(); }
                        if (!all && done.filter((x) => x.ret).length >= need) { return fin(); }
                    });
                }); let retOk = res.some((x) => x.ret); return { 'ret': retOk, 'msg': `${nameFun} <multi>: ${retOk ? 'OK' : 'ERRO | ***'}`, res, };
        }

        // VALIDAÇÃO E PREPARAÇÃO DAS CHAVES DO OBJETO inf
        let retValidadePar = validatePar({ 'par': inf, 'rules': rulesApiV2, nameFun, }); if (!retValidadePar.ret) { return retValidadePar; } inf = retValidadePar.res;
        let { method, url, headers, body, maxConnect, maxResponse, object, hideHeaders, bodyReqRaw, bodyResRaw, code, defaultHeaders, modeRedirect, signal, } = inf;

        // IMPORTAR LIBS ([APENAS NODE] SE NECESSÁRIO)
        // if (['NODE',].includes(engName)) { await api_helper({ 'step': 'importLibs', }); }

        // VALIDAÇÕES INICIAIS (MÉTODO vs BODY)
        let reqE = (['POST', 'PUT', 'PATCH',].includes(method) && !body) ? 1 : 0; if (reqE > 0) { return setRet(`INFORMAR 'body'`); }

        // REDIRECIONAMENTO
        if (modeRedirect === 'followAndGet' && !inf.reRunApi) {
            let redirects = [], nextUrl = url, nextInf = { ...inf, }, current, max = 10, limit = false; while (true) {
                current = await apiV2({ ...nextInf, 'modeRedirect': 'block', 'reRunApi': true, 'url': nextUrl, 'hideHeaders': false, 'code': false, }); if (!current?.res) { break; }
                let resCode = current.res.code, location = current.res.headers?.location; if (resCode < 300 || resCode >= 400 || !location) { break; }
                if (redirects.length >= max) { limit = true; break; } location = new URL(location, nextUrl).href; redirects.push({ 'code': resCode, 'from': nextUrl, 'to': location, });
                nextUrl = location; if ([301, 302, 303,].includes(resCode) && nextInf.method !== 'GET') { nextInf = { ...nextInf, 'method': 'GET', }; delete nextInf.body; delete nextInf.bodyReqRaw; }
            } if (!current?.res) { return current; } if (limit) { return setRet(`MÁXIMO DE REDIRECIONAMENTOS`); } current.res.redirects = redirects; if (hideHeaders) { delete current.res.headers; }
            if (code !== false && !(code === true ? rulesApiV2.keys.code.default : [].concat(code)).includes(current.res.code)) { return setRet(`CÓDIGO INVÁLIDO '${current.res.code}'`); } return current;
        }

        // HEADERS
        if (defaultHeaders) {
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"', 'sec-ch-ua-platform': '"Windows"', ...headers,
            };
        }

        // PREPARAR: BODY
        let hdr = 'application/json', xxx = `text/plain;charset=UTF-8`, yyy = `x-www-form-urlencoded`, hasBody = ['POST', 'PUT', 'PATCH',].includes(method); if (!hasBody) { body = false; } else {
            let bodT = getTypeof(body), ct = Object.entries(headers).find(([k,]) => k.toLowerCase() === 'content-type')?.[1]?.toLowerCase() || ''; let isForm = ct.includes(yyy),
                isJson = ct.includes(hdr), isStruct = ['object', 'array',].includes(bodT); let allowed = bodyReqRaw ? ['buffer',] : isForm ? ['string', 'object',] : ['string', 'object', 'array',];
            if (!allowed.includes(bodT)) { return setRet(`BODY TIPO '${bodT}' INVÁLIDO NESSA REQUISIÇÃO`); } let empty = bodyReqRaw ? body.length === 0 : body === '' || (isForm &&
                Object.keys(bodT === 'object' ? body : paramsObj(body, bodT)).length === 0); if (empty) { return setRet(`'body' VAZIO${isForm ? ` [${yyy}]` : ''}`); } if (!bodyReqRaw) {
                    if (!ct) { headers = { ...headers, 'Content-Type': isStruct ? hdr : xxx, }; isJson = isStruct; } if (isForm && bodT === 'object') { body = paramsObj(body, 'object'); }
                    else if (isJson && isStruct) { body = JSON.stringify(body); } else if (isJson && bodT === 'string') { try { JSON.parse(body); } catch { return setRet(`'body' NÃO É UM JSON VÁLIDO`); } }
                    else if (bodT !== 'string') { return setRet(`BODY TIPO '${bodT}' INVÁLIDO PARA O CONTENT-TYPE '${ct}'`); }
                }
        }

        // PREPARAR: REQUISIÇÃO
        retHelper = await api_helper({ 'step': 'buildReqOpt', method, headers, body, modeRedirect, bodyReqRaw, signal, });
        if (!retHelper.ret) { return setRet(`${retHelper.msg}`); } let { reqOpt, controller, } = retHelper.res;

        // REQUISIÇÃO: EXECUTAR
        retHelper = await api_helper({ 'step': 'doRequest', url, reqOpt, maxConnect, maxResponse, controller, bodyResRaw, signal, });
        if (!retHelper.ret) { return setRet(`${retHelper.msg}`); } let { req, } = retHelper.res;

        // RESPOSTA: PROCESSAR
        let resC = req.cod, resB = req.bod, resH = req.hea, resU = req.url; let resT = resU && new URL(resU).origin, typeB = null;
        if (!bodyResRaw && resH['content-type']?.includes(hdr)) { typeB = false; if (object) { try { resB = JSON.parse(resB); typeB = true; } catch { } } }

        if (code !== false) { let codes = code === true ? rulesApiV2.keys.code.default : [].concat(code); if (!codes.includes(resC)) { return setRet(`CÓDIGO INVÁLIDO '${resC}'`); } }
        ret = setRet({
            'ret': true,
            'res': {
                'code': resC,
                'object': typeB,
                'host': resT,
                'url': resU,
                'redirects': [],
                ...(!hideHeaders && { 'headers': resH, }),
                'body': resB,
            },
        });

    } catch (catchErr) {
        if (inf.ignoreErr) { ret['msg'] = `${nameFun}: ERRO | CHAMADA PELA 'regexE'`; } else {
            // let retRegexE = await regexE({ inf, 'e': catchErr, });
            // ret['msg'] = retRegexE.res;

            console.log(catchErr);

            ret['msg'] = catchErr.stack;
            ret['ret'] = false;
            delete ret['res'];
        }
    }

    return setRet(ret);
}



// HELPER (PARA AMBIENTES DIFERENTES)
async function api_helper(inf = {}) {
    let { step, } = inf; let msg1 = 'ATINGIDO TEMPO DE CONEXÃO', msg2 = 'ATINGIDO TEMPO DE RESPOSTA';

    // IMPORTAR LIBS ([APENAS NODE] SE NECESSÁRIO)
    if (step === 'importLibs') {
        if (['NODE',].includes(engName) && !dispatcher) {
            let libs = { 'undici': { 'Agent': 1, }, }; libs = await importLibs(libs, nameFun);
            dispatcher = new libs._Agent({ 'connect': { 'rejectUnauthorized': false, }, }); // USER-AGENT COM DNS PERSONALIZADO (APENAS NODE)
        }
        return;
    }

    // --------------------------------------------------------------------------------

    if (step === 'buildReqOpt') {
        let { method, headers, body, modeRedirect, } = inf; let reqOpt = { method, headers, };
        if (['GOOGLE',].includes(engName)) {
            reqOpt = { ...reqOpt, 'followRedirects': modeRedirect !== 'block', 'validateHttpsCertificates': false, 'muteHttpExceptions': true, ...(body && { 'payload': body, }), };
        }
        if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
            let { signal, } = inf, controller = new AbortController(); reqOpt = {
                ...reqOpt, 'redirect': modeRedirect === 'block' ? 'manual' : 'follow', 'signal': controller.signal, ...(['NODE',].includes(engName) && { dispatcher, }), ...(body && { body, }),
            }; if (signal) { if (signal.aborted) { controller.abort(); } else { signal.addEventListener('abort', () => controller.abort(), { 'once': true, }); } }
            return { 'ret': true, 'res': { reqOpt, controller, }, };
        }
        return { 'ret': true, 'res': { reqOpt, }, };
    }

    if (step === 'doRequest') {
        let { url, reqOpt, maxConnect, maxResponse, controller, bodyResRaw, } = inf;
        // <GOOGLE> (NÃO DISPONÍVEL: maxConnect, maxResponse)
        if (['GOOGLE',].includes(engName)) {
            let hea = {}; let req = await UrlFetchApp.fetch(url, reqOpt); Object.entries(req.getAllHeaders()).forEach(([k, v,]) => hea[typeof k === 'string' ? k.toLowerCase() : k] = v);
            return { 'ret': true, 'res': { 'req': { 'cod': req.getResponseCode(), 'url': hea['x-final-url'] || url, hea, 'bod': req.getContentText(), }, }, };
        }
        // <EXTENSION>
        if (['EXTENSION',].includes(engName)) {
            let done = false, tim, reqId = `${Date.now()}_${Math.random()}`; let res = await new Promise((resolve) => {
                let end = (r) => { if (done) { return; } done = true; clearTimeout(tim); controller.signal.removeEventListener('abort', onAbort); resolve(r); };
                let cancel = (msg) => { sandboxRequest({ 'type': 'ABORT_FETCH', reqId, }).catch(() => { }); controller.abort(); end({ 'ret': false, msg, }); }; let onAbort = () =>
                    cancel('REQUISIÇÃO CANCELADA'); controller.signal.addEventListener('abort', onAbort, { 'once': true, }); tim = setTimeout(() => cancel(msg2), ((maxConnect + maxResponse) * 1000));
                let { signal, ...reqOptSafe } = reqOpt; sandboxRequest({ 'type': 'DO_FETCH', url, 'reqOpt': reqOptSafe, bodyResRaw, reqId, }).then((res) => {
                    if (!res.ok) { end({ 'ret': false, 'msg': `${res.error}`, }); return; } let bod = res.bod; if (bodyResRaw) { bod = new Uint8Array(bod); }
                    end({ 'ret': true, 'res': { 'req': { 'cod': res.cod, 'url': res.hea['x-final-url'] || res.url, 'hea': res.hea, bod, }, }, });
                });
            });
            return res;
        }
        // <NODE | HTML | CLOUDFLARE>
        if (['NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
            function www(bod) { bod = ['NODE',].includes(engName) ? Buffer.from(bod) : new Uint8Array(bod); return bod; } let res = await new Promise((resolve) => {
                let timC, timR; let end = (r) => { clearTimeout(timC); clearTimeout(timR); resolve(r); }; timC = setTimeout(() => { controller.abort(); end({ 'ret': false, 'msg': msg1, }); },
                    (maxConnect * 1000)); fetch(url, reqOpt).then(async (req) => {
                        clearTimeout(timC); timR = setTimeout(() => { controller.abort(); end({ 'ret': false, 'msg': msg2, }); }, (maxResponse * 1000)); let hea = {}; req.headers.forEach((v, k) =>
                            hea[typeof k === 'string' ? k.toLowerCase() : k] = v); let bod = await req[bodyResRaw ? 'arrayBuffer' : 'text'](); if (bodyResRaw) { bod = www(bod); }
                        end({ 'ret': true, 'res': { 'req': { 'cod': req.status, 'url': hea['x-final-url'] || req.url, hea, bod, }, }, });
                    }).catch((err) => { end({ 'ret': false, 'msg': `${err}`, }); });
            });
            return res;
        }
    }

    return inf.ret;
}

if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) { globalThis['apiV2'] = apiV2; }



// 'code': true/200/[200,201,204] | 'object': false | 'maxConnect'/'maxResponse': 10 | 'bodyReqRaw'/'bodyResRaw': true (body em buffer) | 'hideHeaders': false | 'defaultHeaders': false
// 'modeRedirect': 'block'/'followAndGet'

// NODE
// import fs from 'fs';

// let infApi, retApi;
// infApi = { 'method': 'GET', 'url': `https://i-p.show/?format=json`, };
// infApi = { 'method': 'GET', 'url': `https://i.imgur.com/9BwUhA7.jpeg`, 'bodyResRaw': true, };
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': `Texto aqui`, };
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': { 'keyA': 'valA', 'keyB': 'valB', }, };
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': `keyA=valueA&keyB=valueB`, 'headers': { 'Content-Type': 'application/x-www-form-urlencoded', }, };
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': { 'keyA': 'valA', 'keyB': 'valB', }, 'headers': { 'Content-Type': 'application/x-www-form-urlencoded', }, };
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': fs.readFileSync(`image.png`), 'bodyReqRaw': true, };
// infApi = [
//     0, // ESPERAR APENAS PELAS x PRIMEIRAS REQUISIÇÕES RETORNADAS (ret true) OU 0 PARA TODAS (ret true E false)
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/3`, 'maxConnect': 6, }, // ret: true [2]
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/1`, 'maxConnect': 4, }, // ret: true [0]
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/5`, 'maxConnect': 3, }, // ret: false [1]
// ];

// retApi = await apiV2(infApi);
// if (!infApi.bodyResRaw) { console.log(JSON.stringify(retApi, null, 2)); } else { console.log(retApi.msg); fs.writeFileSync('image.png', retApi.res.body); }


