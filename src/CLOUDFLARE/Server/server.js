/* eslint-disable no-undef */

// src/CLOUDFLARE/Server/server.js

// COMPARTILHADO
await import('../../resources/@functions.js');

// LÓGICA DO SERVIDOR
await import('../../scripts/server.js');

// FUNÇÕES
await import('../../resources/apiV2.js');

export default {

    async fetch(request) {
        let { status, headers, body, } = await globalThis.serverHandle({ 'method': request.method, 'getBody': () => request.json(), });
        return new Response(body, { headers, status, });
    },

};


