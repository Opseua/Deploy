// src/FLY_IO/src/Server/server.js

import http from 'http';

globalThis['env'] = process.env; // MANTES ANTES DO IMPORT!!!

// LÓGICA DO SERVIDOR
await import('../../../../src/src/scripts/server.js');

let PORT = 5555;

let server = http.createServer(async (req, res) => {

    try {

        let { status, headers, body, } = await serverHandle({
            'method': req.method,
            'url': req.url,
            'headers': req.headers,
            'getBody': async () => {
                let chunks = [];
                for await (let c of req) { chunks.push(c); }
                return Buffer.concat(chunks).toString('utf-8');
            },
        });

        res.writeHead(status, headers); res.end(body);

    } catch (e) {
        res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ 'ret': false, 'msg': `SERVER: ERRO | ${e}`, }));
    }

});

server.listen(PORT, () => { console.log(`SERVER HTTP RODANDO NA PORTA ${PORT}`); });


