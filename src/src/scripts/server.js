// src/scripts/server.js

async function serverHandle({ method, getBody, } = {}) {
    let ret = { 'ret': false, }, nameFun = `SERVER`; function setRet(p1, p2, p3) { ret = globalThis.setRetRunV2({ p1, p2, p3, nameFun, 'retRes': true, }); return ret; }

    function retRes() { return { 'status': ret.ret ? 200 : 400, 'headers': { 'Content-Type': 'application/json', }, 'body': JSON.stringify(ret), }; }

    if (method !== 'POST') { ret = setRet(`MÉTODOS ACEITOS: POST`); return retRes(); }

    let body; try { body = await getBody(); } catch (e) { ret = setRet(`BODY NÃO É UM JSON VÁLIDO`); return retRes(); }

    // IDENTIFICAR O FORMATO DO BODY
    if (getTypeof(body) !== 'object') { ret = setRet(`BODY DEVE SER {'name','par'} OU {'funs': [{'name','par'}]}`); return retRes(); }

    let isArr = Array.isArray(body.funs); let list = isArr ? body.funs : [body,]; if (list.length === 0) { ret = setRet(`INFORMAR AO MENOS UMA FUNÇÃO`); return retRes(); }

    // EXECUTAR
    let runOne = async (value, idx) => {
        let { name, retInf, par, } = value || {}; let nameFun = name || 'XXX';

        let rulesFun = { 'keys': { 'name': { 'required': true, 'types': ['string',], }, 'par': { 'required': true, 'types': ['object', 'array'], }, }, };
        let retValidadePar = validatePar({ 'par': value, 'rules': rulesFun, nameFun, }); if (!retValidadePar.ret) { return { idx, ...retValidadePar, }; }

        let fun = globalThis[name], retFun;
        if (typeof fun !== 'function') {
            retFun = globalThis.setRetRunV2({ 'p1': `FUNÇÃO NÃO ENCONTRADA '${name}'`, nameFun, });
        } else {
            try {
                if (retInf) {
                    retFun = await fun(par);
                } else {
                    // SEM AGUARDAR: dispara e ignora o resultado (erros assíncronos não derrubam o servidor)
                    Promise.resolve(fun(par)).catch(() => { });
                    retFun = globalThis.setRetRunV2({ 'p2': { 'ret': true, }, nameFun, });
                }
            } catch (e) { retFun = globalThis.setRetRunV2({ 'p1': `${e}`, nameFun, }); }
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

    return retRes();
}

globalThis['serverHandle'] = serverHandle;


