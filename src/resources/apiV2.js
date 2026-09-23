let dispatcher;

async function apiV2(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `APIv2`; function setRet(p1, p2, p3) { ret = setRetRunV2({ p1, p2, p3, nameFun, }); return ret; } let retHelper;
    try {
        // 1) suporte a array de requisições em paralelo (não depende de ambiente)
        if (Array.isArray(inf)) {
            let length = inf.length; if (length === 0) { return setRet(`ARRAY 'inf' VAZIA`); } let maxResult = typeof inf[0] === 'number' ? inf.shift() : length;
            maxResult = maxResult < 1 ? length - 1 : maxResult;
            let response = await (async () => {
                let arr = [];
                await Promise.allSettled(inf.map((a, idx) => apiV2(a).then((r) => arr.push({ idx, ...setRet({ 'ret': true, 'res': r, }), })).catch((e) => arr.push({ idx, ...setRet(`${e}`), }))));
                return arr;
            })();
            response = response.slice(0, maxResult).map((x) => ({ 'idx': x.idx, 'ret': x.res.ret, 'msg': x.res.msg, ...(x.res.hasOwnProperty('res') && { 'res': x.res.res, }), }));
            let retOk = response.some((v) => v.ret); return { 'ret': retOk, 'msg': `${nameFun} <multi>: ${retOk ? 'OK' : 'ERRO | ***'}`, 'res': response, };
        }

        // 2) importar libs necessárias (ex: undici no Node)
        if (['NODE',].includes(engName)) { await api_helper({ 'step': 'importLibs', }); }

        let { method, url, headers = {}, body, maxConnect = 3, maxResponse = 20, object = true, hideHeaders = true, bodyResRaw, bodyReqRaw, code = true, defaultHeaders = true, modeRedirect, } = inf;
        modeRedirect = ['block', 'followAndGet',].includes(modeRedirect) ? modeRedirect : 'default';

        // 3) modo followAndGet — loop de redirecionamento manual, aplicável em qualquer ambiente
        if (modeRedirect === 'followAndGet' && !inf.reRunApi) {
            let redirects = [], nextUrl = url, current;
            while (true) {
                current = await apiV2({ ...inf, 'modeRedirect': 'block', 'reRunApi': true, 'url': nextUrl, }); if (!current?.res) { break; } let resCode = current.res.code, location = current.res.url;
                if (resCode < 300 || resCode >= 400 || !location) { break; } redirects.push({ 'code': resCode, 'from': nextUrl, 'to': location, }); nextUrl = location;
            }
            if (current?.res) { current.res.redirects = redirects; } return current;
        }

        // 4) validações genéricas
        let reqE = !['GET', 'POST', 'PUT', 'DELETE', 'PATCH',].includes(method) ? 1 : !url ? 2 : (['POST', 'PUT', 'PATCH',].includes(method) && !body) ? 3 : 0;
        if (reqE > 0) { return setRet(`${reqE === 1 ? `MÉTODOS ACEITOS 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'` : `INFORMAR O ${reqE === 2 ? `'url'` : `'body'`}`}`); }

        // 5) montar headers padrão
        if (defaultHeaders) {
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"', 'sec-ch-ua-platform': '"Windows"', ...headers,
            };
        }

        // 6) montar body (não depende de ambiente)
        function x1(v) { return encodeURIComponent(v); }
        if (!['POST', 'PUT', 'PATCH',].includes(method)) { body = false; } else {
            let bodT = getTypeof(body);
            if ((bodyReqRaw && bodT !== 'buffer') || (!bodyReqRaw && !['number', 'string', 'boolean', 'null', 'array', 'object',].includes(bodT))) {
                return setRet(`BODY TIPO '${bodT}' INVÁLIDO PARA ESSA REQUISIÇÃO`);
            }
            if (!bodyReqRaw) {
                let bTar = JSON.stringify(headers).toLowerCase(); bTar = bTar.includes('x-www-form-urlencoded') ? 1 : bTar.includes('application/json') ? 2 : 3;
                // sem Content-Type definido + body objeto/array → assume JSON e injeta o header
                if (bTar === 3 && ['object', 'array',].includes(bodT)) { headers = { ...headers, 'Content-Type': 'application/json', }; bTar = 2; }
                if (bTar < 3) {
                    if (!(bodT === 'object' || (bodT === 'array' && bTar === 2))) { if (bTar === 2) { try { JSON.parse(body); } catch { reqE = 1; } } else { body = {}; } }
                    if (bTar === 1) { if (Object.keys(body).length === 0) { reqE = 2; } else { body = Object.entries(body).map(([k, v,]) => `${x1(k)}=${x1(v)}`).join('&'); bodT = 'xxx'; } }
                    if (reqE > 0) { return setRet(`'body' ${reqE === 1 ? 'NÃO É UM JSON VÁLIDO' : 'VAZIO/NÃO É OBJETO [x-www-form-urlencoded]'}`); }
                }
                if (['object', 'array',].includes(bodT)) { body = JSON.stringify(body); }
            }
        }

        // 7) montar reqOpt específico do ambiente
        retHelper = await api_helper({ 'step': 'buildReqOpt', method, headers, body, modeRedirect, bodyReqRaw, });
        if (!retHelper.ret) { return setRet(`${retHelper.msg}`); } let { reqOpt, controller, } = retHelper.res;

        // 8) executar requisição específica do ambiente
        retHelper = await api_helper({ 'step': 'doRequest', url, reqOpt, maxConnect, maxResponse, controller, bodyResRaw, });
        if (!retHelper.ret) { return setRet(`${retHelper.msg}`); } let { req, } = retHelper.res;

        // 9) parse da resposta (genérico — já normalizado pelo doRequest)
        let resC = req.cod, resB = req.bod, resH = req.hea, resU = req.url; let resT = resU && new URL(resU).origin, typeB = null;
        if (!bodyResRaw && resH['content-type']?.includes('application/json')) { typeB = false; if (object) { try { resB = JSON.parse(resB); typeB = true; } catch { } } }

        if (!code || resC === 200 || resC === code) {
            ret = setRet({ 'ret': true, });
        } else {
            ret = setRet({ 'msg': `CÓDIGO DE RETORNO INVÁLIDO '${resC}'`, });
        }
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


// API_HELPER — concentra TODA a lógica específica de ambiente
async function api_helper(inf = {}) {
    let { step, } = inf;

    if (step === 'importLibs') {
        if (['NODE',].includes(engName) && !dispatcher) {
            let libs = { 'undici': { 'Agent': 1, }, }; libs = await importLibs(libs, 'api'); dispatcher = new libs._Agent({ 'connect': { 'rejectUnauthorized': false, }, });
        }
        return;
    }

    if (step === 'buildReqOpt') {
        let { method, headers, body, modeRedirect, bodyReqRaw, } = inf; let reqOpt = { method, headers, };
        if (['GOOGLE',].includes(engName)) {
            reqOpt = { ...reqOpt, 'followRedirects': modeRedirect !== 'block', 'validateHttpsCertificates': false, 'muteHttpExceptions': true, ...(body && { 'payload': body, }), };
        }
        if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
            let controller = new AbortController();
            reqOpt = {
                ...reqOpt, ...(!(['EXTENSION',].includes(engName) && bodyReqRaw) && !['CLOUDFLARE',].includes(engName) && { 'keepalive': true, }),
                'redirect': modeRedirect === 'block' ? 'manual' : 'follow', 'signal': controller.signal, ...(['NODE',].includes(engName) && { dispatcher, }), ...(body && { body, }),
            };
            return { 'ret': true, 'res': { reqOpt, controller, }, };
        }
        return { 'ret': true, 'res': { reqOpt, }, };
    }

    if (step === 'doRequest') {
        let { url, reqOpt, maxConnect, maxResponse, controller, bodyResRaw, } = inf;
        // GOOGLE: sem timeout de conexão/resposta (UrlFetchApp não suporta)
        if (['GOOGLE',].includes(engName)) {
            let hea = {}; let req = await UrlFetchApp.fetch(url, reqOpt); Object.entries(req.getAllHeaders()).forEach(([k, v,]) => hea[typeof k === 'string' ? k.toLowerCase() : k] = v);
            return { 'ret': true, 'res': { 'req': { 'cod': req.getResponseCode(), 'url': hea['x-final-url'] || url, hea, 'bod': req.getContentText(), }, }, };
        }
        // EXTENSION
        if (['EXTENSION',].includes(engName)) {
            let cnt = false;
            let res = await new Promise((resolve) => {
                let timC = setTimeout(() => { if (!cnt) { controller.abort(); resolve({ 'ret': false, 'msg': `TEMPO MÁXIMO DE CONEXÃO ATINGIDO`, }); } }, (maxConnect * 1000));
                let { signal, ...reqOptSafe } = reqOpt; // signal não é clonável via postMessage
                sandboxRequest({ 'type': 'DO_FETCH', url, 'reqOpt': reqOptSafe, bodyResRaw, }).then((result) => {
                    cnt = true; clearTimeout(timC);
                    if (!result.ok) { resolve({ 'ret': false, 'msg': `${result.error}`, }); return; }
                    let bod = result.bod;
                    if (bodyResRaw) { bod = new Uint8Array(bod); }
                    resolve({ 'ret': true, 'res': { 'req': { 'cod': result.cod, 'url': result.hea['x-final-url'] || result.url, 'hea': result.hea, bod, }, }, });
                });
            });
            return res;
        }
        // NODE / HTML / CLOUDFLARE: timeout de conexão + resposta via setTimeout/AbortController
        if (['NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) {
            let cnt = false;
            let res = await new Promise((resolve) => {
                let timC = setTimeout(() => { if (!cnt) { controller.abort(); resolve({ 'ret': false, 'msg': `TEMPO MÁXIMO DE CONEXÃO ATINGIDO`, }); } }, (maxConnect * 1000));
                fetch(url, reqOpt).then(async (req) => {
                    cnt = true; clearTimeout(timC); let timR = setTimeout(() => { controller.abort(); resolve({ 'ret': false, 'msg': `TEMPO MÁXIMO DE RESPOSTA ATINGIDO`, }); }, (maxResponse * 1000));
                    let hea = {}; req.headers.forEach((v, k) => hea[typeof k === 'string' ? k.toLowerCase() : k] = v); let bod = await req[bodyResRaw ? 'arrayBuffer' : 'text']();
                    if (bodyResRaw) { bod = ['NODE',].includes(engName) ? Buffer.from(bod) : new Uint8Array(bod); } clearTimeout(timR);
                    resolve({ 'ret': true, 'res': { 'req': { 'cod': req.status, 'url': hea['x-final-url'] || req.url, hea, bod, }, }, });
                }).catch((err) => {
                    clearTimeout(timC); if (err.name === 'AbortError') { return; } resolve({ 'ret': false, 'msg': `${err}`, });
                });
            });
            return res;
        }
    }

    return inf.ret; // fallback (não deveria ser atingido — todo step retorna explicitamente acima)
}

if (['EXTENSION', 'NODE', 'HTML', 'CLOUDFLARE',].includes(engName)) { globalThis['apiV2'] = apiV2; }



// 'code': false/200 | 'object': false | 'maxConnect'/'maxResponse': 10 | 'bodyReqRaw'/'bodyResRaw': true (body em buffer) | 'hideHeaders': false | 'defaultHeaders': false
// 'modeRedirect': 'block'/'followAndGet'

// NODE
// import { readFile, writeFile } from 'fs/promises';

// let infApi, retApi;
// infApi = { 'method': 'GET', 'url': `https://i-p.show/?format=json`, }; // OK
// infApi = { 'method': 'GET', 'url': `https://i.imgur.com/9BwUhA7.jpeg`, 'bodyResRaw': true, }; // OK
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'body': { 'key': 'val', }, }; // OK
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'headers': { 'Content-Type': 'application/x-www-form-urlencoded', }, 'body': { 'key': 'val', }, }; // OK
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'headers': { 'Content-Type': 'text/plain;charset=UTF-8', }, 'body': `Texto aqui`, }; // OK
// infApi = { 'method': 'POST', 'url': `https://ntfy.sh/AAA`, 'headers': {}, 'body': await readFile(`image.png`), 'bodyReqRaw': true, }; // OK
// infApi = [ // OK
//     0, // ESPERAR APENAS PELAS x PRIMEIRAS REQUISIÇÕES CONCLUÍDAS OU 0 PARA TODAS
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/3`, 'maxConnect': 6, }, // ret: true
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/1`, 'maxConnect': 4, }, // ret: true
//     { 'method': 'GET', 'url': `https://postman-echo.com/delay/5`, 'maxConnect': 3, }, // ret: false
// ];

// retApi = await apiV2(infApi);
// if (!infApi.bodyResRaw) { console.log(JSON.stringify(retApi, null, 2)); } else { console.log(retApi.msg); await writeFile('image.png', retApi.res.body); }


