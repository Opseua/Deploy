/* eslint-disable no-undef */

// src/CLOUDFLARE/src/Server/server.js

// LÓGICA DO SERVIDOR
// await import('../../../../src/src/scripts/server.js');

import '../../../../src/src/scripts/server.js';

let isInitialized = false; // Controle de Cold Start

export default {

    async fetch(request, env) {

        globalThis['env'] = env;
        if (!isInitialized) {
            if (globalThis.setupFunctions) { await globalThis.setupFunctions(); }
            isInitialized = true;
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


