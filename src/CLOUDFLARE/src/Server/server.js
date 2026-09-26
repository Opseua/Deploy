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

        let { readable, writable, } = new TransformStream();
        let writer = writable.getWriter();

        serverHandle({
            'method': request.method,
            'url': request.url,
            'headers': Object.fromEntries(request.headers),
            'getBody': async () => {
                return await request.text();
            },
            'flushHeaders': () => { },
        }).then(result => {
            writer.write(new TextEncoder().encode(result.body));
            writer.close();
        }).catch(err => {
            writer.write(new TextEncoder().encode(JSON.stringify({ 'ret': false, 'msg': `SERVER ERRO: ${err}`, })));
            writer.close();
        });

        return new Response(readable, {
            'status': 200,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', },
        });

    },

};


