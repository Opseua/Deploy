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

        let { status, headers, body, } = await serverHandle({
            'method': request.method,
            'url': request.url,
            'headers': Object.fromEntries(request.headers),
            'getBody': async () => {
                return await request.text();
            },
        });

        return new Response(body, { headers, status, });

    },

};


