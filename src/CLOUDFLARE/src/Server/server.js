/* eslint-disable no-undef */

// src/CLOUDFLARE/src/Server/server.js

// LÓGICA DO SERVIDOR
// await import('../../../../src/src/scripts/server.js');

// import '../../../../src/src/scripts/server.js';

let isInitialized = false; // Controle de Cold Start

export default {

    async fetch(request, env) {

        if (!isInitialized) {
            isInitialized = true;
            globalThis['env'] = env;
            await import('../../../../src/src/scripts/server.js');
            // if (globalThis.setupFunctions) { await globalThis.setupFunctions(); }
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


