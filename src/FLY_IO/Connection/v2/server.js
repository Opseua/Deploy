import http from 'http'; import { WebSocketServer } from 'ws'; let { wsconnect, } = await import('@nats-io/nats-core');
await import('./shared/client.js'); await import('./shared/message.js');
let portBridge = 8887, ip = '127.0.0.1', port = '8888', nc, tag = `SERVER [node]`, psw = 'SENHA_AQUI', debug = 2;

await globalThis.clientV2.connect({ wsconnect, 'servers': `ws://${ip}:${port}`, 'label': 'SER', 'room': 'BRIDGE', 'onConnect': (c) => { nc = c; }, });

function socketSend(socket, msg) { if (socket.readyState === socket.OPEN) { socket.send(JSON.stringify(msg)); } }
function resWs(socket, msg, close) { socketSend(socket, { 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, }); if (close) { socket.close(4000); } }

// ── PONTE: 1 socket = 1 sala ──────────────────────────────────────────────
function registerLegacy({ room, socket, }) {
    if (!nc || nc.isClosed()) { resWs(socket, `SEM CONEXÃO NATS`, true); return; }
    globalThis.messageV2.received({
        nc, room, 'onMessage': (data) => { socketSend(socket, { 'ret': true, 'msg': `${tag}: OK`, 'res': data, }); },
    });
    socket.on('message', async (raw) => {
        try {
            let body = JSON.parse(raw.toString());
            if (body.idMessage) { globalThis.messageV2.send({ nc, room, 'message': body.message, 'idMessage': body.idMessage, }); return; } // resposta
            let result = await globalThis.messageV2.send({ nc, room, 'message': body.message, 'maxAwait': Number(body.maxAwait || 0), }); socketSend(socket, result); // mensagem nova
        } catch (catchErr) { resWs(socket, catchErr.message); }
    });
}

// ── SERVER: WS ──────────────────────────────────────────────────────────────
let wss = new WebSocketServer({ 'noServer': true, });
wss.on('connection', (socket, req) => {
    let url = new URL(req.url, `http://${ip}`); let room = url.searchParams.get('roo');
    if (!room) { return resWs(socket, `INFORMAR 'roo'`, true); } if (psw !== url.searchParams.get('psw')) { return resWs(socket, `INFORMAR 'psw'`, true); }
    if (debug > 0) { console.log(`{ON}  (${room})`); } registerLegacy({ room, socket, });
    socket.on('close', () => { if (debug > 0) { console.log(`{OFF} (${room})`); } });
});

// ── SERVER: HTTP (GET + POST, segura resposta até timeout) ──────────────────
function parseBody(req) {
    return new Promise((resolve, reject) => { let body = ''; req.on('data', c => body += c); req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); } }); req.on('error', reject); });
}
function resHttp(res, msg) { res.writeHead(200, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, })); }

let app = http.createServer(async (req, res) => {
    let url = new URL(req.url, `http://localhost`); let query = Object.fromEntries(url.searchParams);
    if (psw !== query.psw) { return resHttp(res, `INFORMAR 'psw'`); } let room = query.roo; if (!room) { return resHttp(res, `INFORMAR 'roo'`); }
    if (!nc || nc.isClosed()) { return resHttp(res, `SEM CONEXÃO NATS`); }

    let body = req.method === 'POST' ? await parseBody(req) : query; let maxAwait = Number(body.maxAwait || 0);
    let result = await globalThis.messageV2.send({ nc, room, 'message': body.message, maxAwait, });
    res.writeHead(200, { 'Content-Type': 'application/json', }); res.end(JSON.stringify(result));
});
await new Promise((resolve) => app.listen(portBridge, '0.0.0.0', resolve)); app.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)));
console.log(`🌐 [SER] ws://${ip}:${portBridge}`);


