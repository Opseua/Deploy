// src/scripts/server.js

function retRes(ret) { return { 'status': ret.ret ? 200 : 400, 'headers': { 'Content-Type': 'application/json', }, 'body': JSON.stringify(ret), }; }
async function serverHandle({ method, url, /* headers, */ getBody, } = {}) {
    let ret = { 'ret': false, }, nameFun = `SERVER`; function setRet(p1, p2, p3) { ret = setRetRunV2({ p1, p2, p3, nameFun, 'retRes': true, }); return ret; }

    if (method === 'OPTIONS') { return { 'status': 204, 'headers': { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*', }, 'body': '', }; }
    if (url.includes('favicon.ico')) { return { 'status': 204, 'headers': {}, 'body': '', }; } if (method !== 'POST') { ret = setRet(`MÉTODOS ACEITOS: POST`); return retRes(ret); }

    // BODY: PROCESSAR R IDENTIFICAR O FORMATO
    let body = ''; try { body = await getBody(); } catch (e) { } if (!body || body.trim() === '') { ret = setRet(`BODY VAZIO OU INEXISTENTE`); return retRes(ret); }
    try { body = JSON.parse(body); } catch (e) { ret = setRet(`BODY NÃO É UM JSON VÁLIDO`); return retRes(ret); }
    if (getTypeof(body) !== 'object') { ret = setRet(`BODY DEVE SER {'name','par'} OU {'funs': [{'name','par'}]}`); return retRes(ret); }

    // BODY: CHECAR OBJETO
    let isArr = Array.isArray(body.funs); let list = isArr ? body.funs : [body,]; if (list.length === 0) { ret = setRet(`INFORMAR AO MENOS UMA FUNÇÃO`); return retRes(ret); }

    // EXECUTAR
    let runOne = async (value, idx) => {
        value = value || {}; let name = value.name || 'XXX';

        let rulesFun = {
            'keepOnly': true,
            'keys': {
                'name': { 'required': true, 'types': ['string',], },
                'retInf': { 'types': ['boolean',], 'default': true, },
                'par': { 'required': true, 'types': ['object', 'array',], },
            },
        };
        let retValidadePar = validatePar({ 'par': value, 'rules': rulesFun, 'nameFun': name, }); if (!retValidadePar.ret) { return { idx, ...retValidadePar, }; } value = retValidadePar.res;
        let { retInf, par, } = value;

        let fun = globalThis[name], retFun;
        if (getTypeof(fun) !== 'function') {
            retFun = setRetRunV2({ 'p1': `FUNÇÃO NÃO ENCONTRADA '${name}'`, 'nameFun': name, });
        } else {
            try {
                if (retInf) {
                    // ESPERAR RETORNO: SIM
                    retFun = await fun(par);
                } else {
                    // ESPERAR RETORNO: NÃO
                    (async () => fun(par))().catch(() => { }); retFun = setRetRunV2({ 'p2': { 'ret': true, }, 'nameFun': name, });
                }
            } catch (e) { retFun = setRetRunV2({ 'p1': `${e}`, 'nameFun': name, }); }
        }
        return { idx, ...retFun, };
    };

    let arr = [];
    if (body.promiseAll) {
        await Promise.all(list.map(async (value, idx) => { arr.push(await runOne(value, idx)); }));
    } else {
        for (let [idx, value,] of list.entries()) { arr.push(await runOne(value, idx)); }
    }

    // BODY ERA ARRAY → { ret, msg, res: [...] } | BODY ERA OBEJTO → retorno da função direto
    if (isArr) { ret = setRet({ 'ret': arr.every((r) => r.ret), 'res': arr, }); } else { ret = arr[0]; delete ret.idx; }

    return retRes(ret);
}

globalThis['serverHandle'] = serverHandle;


