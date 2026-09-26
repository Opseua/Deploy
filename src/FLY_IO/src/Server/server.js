// src/FLY_IO/src/Server/server.js

import http from 'http';

globalThis['env'] = process.env; // MANTES ANTES DO IMPORT!!!

// LÓGICA DO SERVIDOR
await import('../../../../src/src/scripts/server.js');

let PORT = 5555;

let server = http.createServer(async (req, res) => {

    try {

        let result = await serverHandle({
            'method': req.method,
            'url': req.url,
            'headers': req.headers,
            'getBody': async () => {
                let chunks = [];
                for await (let c of req) { chunks.push(c); }
                return Buffer.concat(chunks).toString('utf-8');
            },
            'flushHeaders': ({ status, headers, }) => {
                if (!res.headersSent) {
                    res.writeHead(status, headers);
                    res.flushHeaders();
                }
            },
        });

        if (!res.headersSent) {
            res.writeHead(result.status, result.headers);
        }
        res.end(result.body);

    } catch (e) {
        if (!res.headersSent) {
            res.writeHead(400, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
        }
        res.end(JSON.stringify({ 'ret': false, 'msg': `SERVER: ERRO | ${e}`, }));
    }

});

server.listen(PORT, () => { console.log(`SERVER HTTP RODANDO NA PORTA ${PORT}`); });


