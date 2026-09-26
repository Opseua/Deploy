/* eslint-disable no-undef */

// src/CLOUDFLARE/src/Server/server.js

let isInitialized = false;

export default {

    async fetch(request, env) {

        if (!isInitialized) {
            isInitialized = true;
            globalThis['env'] = env;
            // LÓGICA DO SERVIDOR
            await import('../../../../src/src/scripts/server.js');
        }

        // Cria um túnel de Stream (permite devolver os cabeçalhos IMEDIATAMENTE)
        let { readable, writable } = new TransformStream();
        let writer = writable.getWriter();

        // Roda a função em segundo plano sem travar o "return"
        serverHandle({
            'method': request.method,
            'url': request.url,
            'headers': Object.fromEntries(request.headers),
            'getBody': async () => {
                return await request.text();
            },
            'flushHeaders': () => { /* No CF, a resposta já é retornada com Status 200 no final do bloco */ }
        }).then(result => {
            writer.write(new TextEncoder().encode(result.body));
            writer.close();
        }).catch(err => {
            writer.write(new TextEncoder().encode(JSON.stringify({ 'ret': false, 'msg': `CF ERRO: ${err}` })));
            writer.close();
        });

        // Retorna imediatamente para evitar timeout de maxConnect
        return new Response(readable, {
            'status': 200,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    },

};


