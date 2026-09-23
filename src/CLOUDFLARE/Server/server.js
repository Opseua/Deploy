/* eslint-disable no-undef */

// src/CLOUDFLARE/Server/server.js

// COMPARTILHADO
await import('../../resources/@functions.js');

// FUNÇÕES
await import('../../resources/apiV2.js');

export default {

    async fetch(request) {
        let ret = { 'ret': false, }, nameFun = `SERVER`; function setRet(p1, p2, p3) { ret = globalThis.setRetRunV2({ p1, p2, p3, nameFun, }); return ret; }

        function retRes() { return [JSON.stringify(ret), { 'headers': { 'Content-Type': 'application/json', }, 'status': ret.ret ? 200 : 400, },]; }

        if (request.method !== 'POST') {
            ret = setRet(`MÉTODOS ACEITOS: POST`);
            return new Response(...retRes());
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            ret = setRet(`BODY NÃO É UM JSON VÁLIDO`);
            return new Response(...retRes());
        }

        if (!Array.isArray(body?.fun) || body.fun.length === 0) {
            ret = setRet(`INFORMAR 'fun'`);
            return new Response(...retRes());
        }

        let arr = [];
        for (let i = 0; i < body.fun.length; i++) {
            let { name, par, } = body.fun[i] || {};
            let f = globalThis[name];
            if (typeof f !== 'function') {
                arr.push({ 'idx': i, name, ...setRet(`FUNÇÃO '${name}' NÃO ENCONTRADA`), });
                continue;
            }
            try {
                let r = await f(par);
                arr.push({ 'idx': i, name, ...r, });
            } catch (e) {
                arr.push({ 'idx': i, name, 'ret': false, 'msg': `${e}`, });
            }
        }
        let retOk = arr.some((r) => r.ret);

        ret = setRet({ 'ret': retOk, 'res': arr, });
        return new Response(...retRes());
    },

};


