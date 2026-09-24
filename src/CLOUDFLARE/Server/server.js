/* eslint-disable no-undef */

// src/CLOUDFLARE/Server/server.js

// COMPARTILHADO
await import('../../src/resources/@functions.js');

// LÓGICA DO SERVIDOR
await import('../../src/scripts/server.js');

// FUNÇÕES
await import('../../src/resources/apiV2.js');

export default {

    async fetch(request) {
        let { status, headers, body, } = await globalThis.serverHandle({ 'method': request.method, 'getBody': () => request.json(), });
        return new Response(body, { headers, status, });
    },

};


