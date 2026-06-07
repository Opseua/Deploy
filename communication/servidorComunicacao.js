import os from 'os';
const engName = os?.platform()?.startsWith("win") ? 'WINDOWS' : 'LINUX';

import Fastify from 'fastify'; import { WebSocketServer } from 'ws'; import { connect, StringCodec } from 'nats';

const { connectWithRetry } = await import(engName === 'WINDOWS' ? '../../Extension/webRTC/shared/connection.js' : './shared/connection.js');

let portBridge = 9877; let ip = '127.0.0.1'; let port = '4222'; let sc = StringCodec(); let nc; let tag = `SERVER [node]`; let psw = 'SENHA_AQUI'
await connectWithRetry({ connect, 'servers': `nats://${ip}:${port}`, 'label': 'SER', 'onConnect': (c) => { nc = c; }, 'identification': 'BRIDGE', });

// ── DISPATCH ──────────────────────────────────────────────────────────────────
function resDispatch(msg) { return { 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, } }
async function dispatch({ params, }) {
    if (!nc || nc.isClosed()) { return resDispatch(`SEM CONEXÃO NATS`) }
    let { destination, maxAwait = 0, } = params;
    let timeout = maxAwait > 0 ? maxAwait * 1000 : 300;
    try {
        let resp = await nc.request(`msg.${destination}`, sc.encode(JSON.stringify({ ...params, 'identification': params.identification, 'probe': maxAwait <= 0, })), { timeout, });
        if (maxAwait <= 0) { return { 'ret': true, 'msg': `${tag}: OK`, }; }
        let body = JSON.parse(sc.decode(resp.data));
        return { 'ret': true, 'msg': `${tag}: OK`, 'res': body, 'mode': params.mode, 'fileName': params.fileName, };
    } catch (err) {
        if (err.code === 'NATS_NOT_FOUND' || err.message?.includes('503')) { return resDispatch(`NÃO EXISTE '${destination}'`) }
        if (maxAwait > 0) { return resDispatch(`NÃO RESPONDEU '${destination}'`) }
        return resDispatch(`NÃO RESPONDEU AO PROBE '${destination}'`)
    }
}

// ── RESPOSTA HTTP com mode ────────────────────────────────────────────────────
function sendResult({ result, reply, }) {
    let { ret, msg, res, mode, fileName, } = result;
    if (!ret || !mode || !res) { return reply.send({ ret, msg, res, }); }
    let content = typeof res === 'string' ? res : JSON.stringify(res);
    if (mode === 'htm') {
        return reply.header('Content-Type', 'text/html; charset=utf-8').send(content);
    }
    if (mode === 'dow') {
        let now = new Date();
        let pad = (n) => String(n).padStart(2, '0');
        let defaultName = `download-${pad(now.getMonth() + 1)}_${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.txt`;
        return reply.header('Content-Type', 'application/octet-stream').header('Content-Disposition', `attachment; filename="${fileName || defaultName}"`).send(content);
    }
    return reply.send({ ret, msg, res, });
}

// ── FASTIFY (HTTP GET + POST) ─────────────────────────────────────────────────
function resHttp(res, msg) { res.send({ 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, }); }
let app = Fastify();
app.get('/', async (req, reply) => {
    try {
        if (psw !== req.query.psw) { return resHttp(reply, `INFORMAR 'psw'`) }
        let params = { 'maxAwait': Number(req.query.maxAwait || 0), ...req.query, };
        let result = await dispatch({ params, });
        sendResult({ result, reply, });
    } catch (err) {
        resHttp(reply, `${err.message}`)
    }
});
app.post('/', async (req, reply) => {
    try {
        if (psw !== req.query.psw) { return resHttp(reply, `INFORMAR 'psw'`) }
        let params = { 'maxAwait': Number(req.body.maxAwait || 0), ...req.body, 'identification': req.query.identification, };
        let result = await dispatch({ params, });
        sendResult({ result, reply, });
    } catch (err) {
        resHttp(reply, `${err.message}`)
    }
});

// ── WS SERVER ─────────────────────────────────────────────────────────────────
function resWs(res, msg, close) { res.send(JSON.stringify({ 'ret': false, 'msg': `${tag}: ERRO | ${msg}` })); if (close) { res.close(4000); } }
let wss = new WebSocketServer({ 'noServer': true, });
wss.on('connection', (socket, req) => {
    let url = new URL(req.url, `http://${ip}`);
    let identification = url.searchParams.get('identification');
    if (!identification) { return resWs(socket, `INFORMAR 'identification'`, true) }
    if (psw !== url.searchParams.get('psw')) { return resWs(socket, `INFORMAR 'psw'`, true) }
    socket.on('message', async (raw) => {
        try {
            let body = JSON.parse(raw.toString());
            let params = { ...body, identification, 'maxAwait': Number(body.maxAwait || 0), };
            let result = await dispatch({ params, });
            socket.send(JSON.stringify({ 'ret': result.ret, 'msg': result.msg, 'res': result.res, }));
        } catch (err) {
            resWs(socket, `${err.message}`)
        }
    });
});

await app.listen({ 'port': portBridge, 'host': '0.0.0.0', });
app.server.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)));
console.log(`🌐 [SER] http://${ip}:${portBridge} | ws://${ip}:${portBridge}`);


