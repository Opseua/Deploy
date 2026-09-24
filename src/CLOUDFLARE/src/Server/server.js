/* eslint-disable no-undef */

// src/CLOUDFLARE/src/Server/server.js

// COMPARTILHADO
await import('../../../../src/src/resources/@functions.js');

// LÓGICA DO SERVIDOR
await import('../../../../src/src/scripts/server.js');

// FUNÇÕES
await import('../../../../src/src/resources/apiV2.js');

export default {

    async fetch(request) {
        let { status, headers, body, } = await serverHandle({ 'method': request.method, 'getBody': () => request.json(), });
        return new Response(body, { headers, status, });
    },

};


