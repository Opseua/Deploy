// 'code': true/200 | 'object': true | 'maxConnect'/'maxResponse': 10 | 'bodyReqRaw'/'bodyResRaw': true (body em buffer) | 'hideHeaders': false | 'defaultHeaders': false
// 'modeRedirect': 'block'/'followAndGet'(SÓ NODE!!!)
// let infApi, retApi;
// infApi = { e, 'method': 'POST', 'code': true, 'object': true, 'url': `https://ntfy.sh/AAA`, 'headers': { 'Content-Type': 'application/json', }, 'body': { 'aaa': 'bbb', }, };
// infApi = { e, 'method': 'POST', 'code': true, 'object': true, 'url': `https://ntfy.sh/AAA`, 'headers': { 'Content-Type': 'application/x-www-form-urlencoded', }, 'body': { 'key': 'val', }, };
// infApi = { e, 'method': 'POST', 'code': true, 'object': true, 'url': `https://ntfy.sh/AAA`, 'headers': { 'Content-Type': 'text/plain;charset=UTF-8', }, 'body': `Texto aqui`, };
// retApi = await api(infApi); console.log(retApi.msg);

let e = currentFile(new Error()), ee = e;
async function api(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let type = (getTypeof(globalThis.doGet) !== 'undefined'), reqE = 0, typeB = null; if (Array.isArray(inf)) { // MANTER ANTES DAS VARIÁVEIS DA 'inf'!!!
            let length = inf.length; if (length === 0) { ret['msg'] = `API: ERRO | ARRAY 'inf' VAZIA`; return ret; } let maxResult = typeof inf[0] === 'number' ? inf.shift() : length;
            maxResult = maxResult < 1 ? length - 1 : maxResult; let response, promisesArr = inf.map(p => [api, p,]); response = await (async () => {
                let arr = []; await Promise.allSettled(promisesArr.map(([f, a,], idx) => f(a).then(r => arr.push({ idx, 'ret': true, 'msg': 'OK', 'res': r, })).
                    catch(e => arr.push({ idx, 'ret': false, 'msg': `ERRO | ${e}`, })))); return arr;
            })(); response = response.slice(0, maxResult).map(x => ({ 'idx': x.idx, 'ret': x.res.ret, 'msg': x.res.msg, ...(x.res.hasOwnProperty('res') && { 'res': x.res.res, }), }));
            let retOk = response.some(v => v.ret); return { 'ret': retOk, 'msg': `API [MULTI]: ${retOk ? 'OK' : 'ERRO | ***'}`, 'res': response, };
        } let { method, url, headers = {}, body, maxConnect = 3, maxResponse = 20, object = false, controller, hideHeaders = true, bodyResRaw, bodyReqRaw, code, defaultHeaders = true, } = inf;

        // ------------------- NOVO BLOCO --------------------------
        let modeRedirect = ['block', 'followAndGet',].includes(inf.modeRedirect) && engType === 2 ? inf.modeRedirect : 'default'; if (modeRedirect === 'followAndGet' && !inf.reRunApi) {
            let redirects = [], nextUrl = url, current; while (true) {
                current = await api({ ...inf, 'modeRedirect': 'block', 'reRunApi': true, 'url': nextUrl, }); if (!current?.res) { break; } let code = current.res.code;
                let location = current.res.url; if (code < 300 || code >= 400 || !location) { break; } redirects.push({ code, 'from': nextUrl, 'to': location, }); nextUrl = location;
            } if (current?.res) { current.res.redirects = redirects; } return current;
        } // ----------------------------------------------------------

        // ❌❌❌❌❌❌❌❌❌❌❌❌ NÃO SUBIR AS LINHAS!!! (PARA SEREM VISUALIZADAS NO GOOGLE APP SCRIPT) | CHECAR SE TEM ERRO ❌❌❌❌❌❌❌❌❌❌❌❌
        reqE = !['GET', 'POST', 'PUT', 'DELETE', 'PATCH',].includes(method) ? 1 : !url ? 2 : (['POST', 'PUT', 'PATCH',].includes(method) && !body) ? 3 : 0;
        if (reqE > 0) { ret['msg'] = `API: ERRO | ${reqE === 1 ? `MÉTODOS ACEITOS 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'` : `INFORMAR O ${reqE === 2 ? `'url'` : `'body'`}`}`; return ret; }

        // REQ: HEADERS
        let req, resU, resT, resC = '', resH = {}, resB, reqOpt = { method, 'keepalive': true, }, timC = null, timR = null; if (defaultHeaders) {
            let h = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', };
            h = { ...h, 'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"', 'sec-ch-ua-platform': '"Windows"', ...headers, }; headers = h;
        } reqOpt['headers'] = headers; function cT() { if (timC) { clearTimeout(timC); } if (timR) { clearTimeout(timR); } }

        // REQ: BODY | CHECAR SE TEM ERRO
        function x1(v) { return encodeURIComponent(v); } if (!['POST', 'PUT', 'PATCH',].includes(method)) { body = false; } else {
            let bodT = getTypeof(body); if ((bodyReqRaw && bodT !== 'buffer') || (!bodyReqRaw && !['number', 'string', 'boolean', 'null', 'array', 'object',].includes(bodT))) {
                ret['msg'] = `API: ERRO | BODY TIPO '${bodT}' INVÁLIDO PARA ESSA REQUISIÇÃO`; return ret;
            } if (!bodyReqRaw) {
                let bTar = JSON.stringify(reqOpt.headers).toLowerCase(); bTar = bTar.includes('x-www-form-urlencoded') ? 1 : bTar.includes('application/json') ? 2 : 3; if (bTar < 3) {
                    if (!(bodT === 'object' || (bodT === 'array' && bTar === 2))) { if (bTar === 2) { try { JSON.parse(body); } catch { reqE = 1; } } else { body = {}; } } if (bTar === 1) {
                        if (Object.keys(body).length === 0) { reqE = 2; } else { body = Object.entries(body).map(([k, v,]) => `${x1(k)}=${x1(v)}`).join('&'); bodT = 'xxx'; }
                    } if (reqE > 0) { ret['msg'] = `API: ERRO | 'body' ${reqE === 1 ? 'NÃO É UM JSON VÁLIDO' : 'VAZIO/NÃO É OBJETO [x-www-form-urlencoded]'}`; return ret; }
                } if (['object', 'array',].includes(bodT)) { body = JSON.stringify(body); }
            } else if (eng && bodyReqRaw) { delete reqOpt['keepalive']; }
        }

        // REQ: PREPARAR (GOOGLE | CHROME/NODE/HTML)
        if (type) { reqOpt['followRedirects'] = modeRedirect !== 'block'; reqOpt['validateHttpsCertificates'] = false; reqOpt['muteHttpExceptions'] = true; } else {
            reqOpt['redirect'] = modeRedirect === 'block' ? 'manual' : 'follow'; reqOpt['rejectUnauthorized'] = false; controller = controller || new AbortController();
            reqOpt['signal'] = controller.signal;
        } if (body) { reqOpt[type ? 'payload' : 'body'] = body; }

        // → REQ: PROCESSAR (GOOGLE | CHROME/NODE) | LIMPAR TIMEOUT (CHROME/NODE)
        if (type) { try { req = UrlFetchApp.fetch(url, reqOpt); } catch (c) { reqE = 3; ret['msg'] = c; } } else {
            async function fetchComTimeout() {
                let cnt = false; return new Promise((resolve) => {
                    timC = setTimeout(() => { if (!cnt) { controller.abort(); cT(); reqE = 1; resolve(false); } }, (maxConnect * 1000)); fetch(url, reqOpt).then(async req => {
                        cnt = true; clearTimeout(timC); timR = setTimeout(() => { controller.abort(); cT(); reqE = 2; resolve(false); }, (maxResponse * 1000));
                        let resBOk = await req[bodyResRaw ? 'arrayBuffer' : 'text']();
                        if (bodyResRaw) { if (eng) { resBOk = new Uint8Array(resBOk); } else if (bodyResRaw) { resBOk = Buffer.from(resBOk); } }
                        cT(); resolve({ 'cod': req.status, 'url': req.url, 'hea': req.headers, 'bod': resBOk, });
                    }).catch(err => { cT(); if (err.name === 'AbortError') { return; } reqE = 3; ret['msg'] = err; resolve(false); });
                });
            } req = await fetchComTimeout();
        }

        // RES: CHECAR SE TEM ERRO
        if (reqE === 1 || reqE === 2) { ret['msg'] = `API: ERRO | TEMPO MÁXIMO DE ${reqE === 1 ? 'CONEXÃO' : 'RESPOSTA'} ATINGIDO`; return ret; }
        else if (reqE > 0) { ret['msg'] = `API: ERRO | AO PROCESSAR REQUISIÇÃO → ${ret.msg}`; return ret; } let keyValLowCase = v => typeof v === 'string' ? v.toLowerCase() : v;

        try { // RES: PROCESSAR CODE/BODY/HEADERS/URL (GOOGLE | CHROME/NODE) | CHECAR SE TEM ERRO
            resC = req.cod || req.getResponseCode(); resB = type ? req.getContentText() : req.bod; resH = {}; (type ? Object.entries(req.getAllHeaders()) :
                [...req.hea,]).forEach(([k, v,]) => resH[keyValLowCase(k)] = v); // resU = req.url || resH['X-Final-Url']; resT = resU && new URL(resU).origin;

            // ------------------- NOVO BLOCO --------------------------
            let loc = modeRedirect === 'block' && resH['location'] ? resH['location'] : null; if (loc) { resU = new URL(loc, req.url).href; }
            else { resU = req.url || resH['X-Final-Url']; } resT = resU && new URL(resU).origin; delete resH['X-Final-Url'];
            // ------------------- NOVO BLOCO --------------------------

            delete resH['X-Final-Url'];
        } catch (c) { reqE = 4; ret['msg'] = c; } if (reqE > 0) { ret['msg'] = `API: ERRO | AO PROCESSAR CODE/URL/HEADERS/BODY → ${ret.msg}`; return ret; }

        // → RES: FAZER O PARSE DO BODY (SE NECESSÁRIO)
        if (resH['content-type']?.includes('application/json')) { typeB = false; if (object) { try { let t = JSON.parse(resB); resB = t; typeB = true; } catch { } } }

        if (!code || resC === 200 || resC === code) {
            ret['msg'] = 'API: OK';
            ret['ret'] = true;
        } else {
            ret['msg'] = `API: ERRO | CÓDIGO DE RETORNO INVÁLIDO '${resC}'`;
        }
        ret['res'] = {
            'code': resC,
            'object': typeB, // true → OBJETO | false → JSON | null → OUTRO TIPO
            'host': resT,
            'url': resU,
            'redirects': [],
            ...(!hideHeaders && { 'headers': resH, }), // ADICIONAR HEADERS SE NECESSÁRIO
            'body': resB,
        };

    } catch (catchErr) {
        if (inf.ignoreErr) { ret['msg'] = `API: ERRO | CHAMADA PELA 'regexE'`; }
        else { let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res']; }
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['api'] = api;


// infApi = [
//     0, // ESPERAR APENAS PELAS x PRIMEIRAS REQUISIÇÕES CONCLUÍDAS OU 0 PARA TODAS
//     { e, 'method': 'GET', 'code': true, 'object': true, 'url': `https://fakeresponder.com/?sleep=3000&status=200`, 'headers': { 'Content-Type': 'application/json', }, 'maxConnect': 4, },
//     { e, 'method': 'GET', 'code': true, 'object': true, 'url': `https://fakeresponder.com/?sleep=100&status=200`, 'headers': { 'Content-Type': 'application/json', }, 'maxConnect': 2, },
//     { e, 'method': 'GET', 'code': true, 'object': true, 'url': `https://fakeresponder.com/?sleep=5000&status=200`, 'headers': { 'Content-Type': 'application/json', }, 'maxConnect': 1, },
// ];

// fetch('http://www.cepdobrasil.com.br/rio-de-janeiro/rua-maria-da-silva.html', { 'headers': {}, 'body': null, 'method': 'GET', })
//     .then(res => { console.log('RES CODE:', res.status); console.log('RES HEADERS:', [...res.headers.entries(),]); return res.text(); })
//     .then(body => { console.log('RES BODY:', body); }).catch(error => { console.error('RESPONSE error:', error); });

// PUT → atualiza tudo | PATCH → atualiza apenas uma parte {{{ CRIAR WEBHOOK https://webhook.site/ }}} http://www.msftconnecttest.com/redirect
// https://fakeresponder.com/?sleep=3000&status=401 | https://postman-echo.com/delay/3 | https://postman-echo.com/status/401
// https://postman-echo.com/get?foo1=bar1&foo2=bar2
// https://httpbin.org/delay/3 | https://httpbin.org/status/401 | https://httpstat.us/200?sleep=5000

// REDIRECIONAMENTO
// https://postman-echo.com/redirect-to?url=https://www.google.com
// https://httpbin.org/redirect-to?url=https://www.google.com


