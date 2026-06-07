import os from 'os'; const engName = os?.platform()?.startsWith("win") ? 'WINDOWS' : 'LINUX';
import Fastify from 'fastify'; import { WebSocketServer } from 'ws'; import { connect, StringCodec } from 'nats';

const { connectWithRetry } = await import('./shared/connection.js'); let debug, portBridge = 8886, ip = '127.0.0.1', port = '8888', sc = StringCodec(), nc, tag = `SERVER [node]`, psw = 'SENHA_AQUI'
await connectWithRetry({ connect, 'servers': `nats://${ip}:${port}`, 'label': 'SER', 'onConnect': (c) => { nc = c; }, 'identification': 'BRIDGE', }); debug = 2

// ── CLIENTES LEGACY (WebSocket) ───────────────────────────────────────────────
const legacyClients = new Map(); function socketSend(socket, msg) { if (socket.readyState === socket.OPEN) { socket.send(JSON.stringify(msg)); } }

function reorderRes({ data, idMessage, isReply = false } = {}) {
    if (!data || typeof data !== 'object') { return data; }
    let { identification, maxAwait, message, ...rest } = data;
    let res = {};
    if (identification !== undefined) { res.identification = identification; }
    if (!isReply && idMessage) { res.idMessage = idMessage; }
    if (!isReply && maxAwait !== undefined) { res.maxAwait = maxAwait; }
    if (message !== undefined) { res.message = message; }
    return { ...res, ...rest, };
}

// ── REGISTRO DE MENSAGENS LEGACY ──────────────────────────────────────────────
const pendingMessages = new Map(); function genId() {
    let now = new Date(); let pad = (n) => String(n).padStart(2, '0'); let letters = Array.from({ length: 3 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
    return `${pad(now.getMonth() + 1)}_${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, '0')}-${letters}`;
}
setInterval(() => { let now = Date.now(); let ttl = 5 * 60 * 1000; for (let [id, { ts }] of pendingMessages) { if (now - ts > ttl) { pendingMessages.delete(id); } } }, 60 * 1000);

function registerLegacy({ identification, socket }) {
    if (!nc || nc.isClosed()) { resWs(socket, `SEM CONEXÃO NATS`, true); return; }
    if (legacyClients.has(identification)) { try { legacyClients.get(identification).sub.unsubscribe(); } catch { } }
    let sub = nc.subscribe(`msg.${identification}`); const pending = new Map(); legacyClients.set(identification, { socket, sub });

    socket.on('message', (raw) => {
        try {
            let body = JSON.parse(raw.toString()); let { idMessage, res } = body;
            if (idMessage) {
                if (!pendingMessages.has(idMessage)) { socketSend(socket, { 'ret': false, 'msg': `${tag}: ERRO | NÃO EXISTE '${idMessage}'`, }); return; }
                let { replySubject, pending, senderIdentification } = pendingMessages.get(idMessage);
                let resData = typeof res === 'object' ? res : { 'message': res };
                let reordered = reorderRes({ 'data': { 'identification': identification, ...resData, }, 'isReply': true });
                if (pending.has(replySubject)) { pending.get(replySubject)(reordered); pending.delete(replySubject); }
                pendingMessages.delete(idMessage);
            }
        } catch { }
    });

    (async () => {
        for await (let msg of sub) {
            let data; try { data = JSON.parse(sc.decode(msg.data)); } catch { continue; }
            let needsReply = data.maxAwait > 0; if (!needsReply && msg.reply) { msg.respond(sc.encode('ok')); } let idMessage = null;
            if (needsReply && msg.reply) { idMessage = genId(); pendingMessages.set(idMessage, { 'replySubject': msg.reply, 'ts': Date.now(), pending, 'senderIdentification': data.identification, }); }
            socketSend(socket, { 'ret': true, 'msg': `${tag}: OK`, 'res': reorderRes({ 'data': data, idMessage }), });
            if (!needsReply || !msg.reply) { continue; }
            await new Promise((resolve) => {
                let timer = setTimeout(() => { pendingMessages.delete(idMessage); pending.delete(msg.reply); resolve(); }, (data.maxAwait * 1000) + 500);
                pending.set(msg.reply, (res) => { clearTimeout(timer); pendingMessages.delete(idMessage); msg.respond(sc.encode(JSON.stringify(res))); resolve(); });
            });
        }
    })();
}

function unregisterLegacy(identification) {
    if (!legacyClients.has(identification)) { return; }
    try { legacyClients.get(identification).sub.unsubscribe(); } catch { }
    legacyClients.delete(identification);
}

// ── DISPATCH ──────────────────────────────────────────────────────────────────
function resDispatch(msg) { return { 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, } }
async function dispatch({ params, }) {
    if (!nc || nc.isClosed()) { return resDispatch(`SEM CONEXÃO NATS`) }
    let { destination, maxAwait = 0, } = params; let timeout = maxAwait > 0 ? maxAwait * 1000 : 300;
    try {
        let resp = await nc.request(`msg.${destination}`, sc.encode(JSON.stringify({ ...params, 'identification': params.identification, })), { timeout, });
        if (maxAwait <= 0) { return { 'ret': true, 'msg': `${tag}: OK`, }; }
        let body = JSON.parse(sc.decode(resp.data));
        let res = reorderRes({ 'data': { 'identification': params.identification, ...body, }, 'isReply': true });
        return { 'ret': true, 'msg': `${tag}: OK`, res, 'mode': params.mode, 'fileName': params.fileName, };
    } catch (err) {
        if (err.code === 'NATS_NOT_FOUND' || err.message?.includes('503')) { return resDispatch(`NÃO EXISTE '${destination}'`) }
        if (maxAwait > 0) { return resDispatch(`NÃO RESPONDEU '${destination}'`) }
        return { 'ret': true, 'msg': `${tag}: OK`, };
    }
}

// ── RESPOSTA HTTP com mode ────────────────────────────────────────────────────
function sendResult({ result, reply, }) {
    let { ret, msg, res, mode, fileName, } = result;
    if (!ret || !mode || !res) { return reply.send({ ret, msg, res, }); }
    let content = typeof res === 'string' ? res : JSON.stringify(res);
    if (mode === 'htm') { return reply.header('Content-Type', 'text/html; charset=utf-8').send(content); }
    if (mode === 'dow') {
        let now = new Date(); let pad = (n) => String(n).padStart(2, '0');
        let defaultName = `download-${pad(now.getMonth() + 1)}_${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.txt`;
        return reply.header('Content-Type', 'application/octet-stream').header('Content-Disposition', `attachment; filename="${fileName || defaultName}"`).send(content);
    }
    return reply.send({ ret, msg, res, });
}

// ── FASTIFY (HTTP GET + POST) ─────────────────────────────────────────────────
function resHttp(res, msg) { res.send({ 'ret': false, 'msg': `${tag}: ERRO | ${msg}`, }); } let app = Fastify();
app.get('/', async (req, reply) => {
    try {
        if (psw !== req.query.psw) { return resHttp(reply, `INFORMAR 'psw'`) }
        let id = req.query.identification || '?'; if (debug > 0) { console.log(`{ON}  (${id})`); }
        let params = { 'maxAwait': Number(req.query.maxAwait || 0), ...req.query, };
        let result = await dispatch({ params, }); if (debug > 0) { console.log(`{OFF} (${id})`); }
        sendResult({ result, reply, });
    } catch (err) { resHttp(reply, `${err.message}`) }
});
app.post('/', async (req, reply) => {
    try {
        if (psw !== req.query.psw) { return resHttp(reply, `INFORMAR 'psw'`) }
        let id = req.query.identification || '?'; if (debug > 0) { console.log(`{ON}  (${id})`); }
        let params = { 'maxAwait': Number(req.body.maxAwait || 0), ...req.body, 'identification': req.query.identification, };
        let result = await dispatch({ params, }); if (debug > 0) { console.log(`{OFF} (${id})`); }
        sendResult({ result, reply, });
    } catch (err) { resHttp(reply, `${err.message}`) }
});

// ── WS SERVER ─────────────────────────────────────────────────────────────────
function resWs(res, msg, close) { res.send(JSON.stringify({ 'ret': false, 'msg': `${tag}: ERRO | ${msg}` })); if (close) { res.close(4000); } }
let wss = new WebSocketServer({ 'noServer': true, });
wss.on('connection', (socket, req) => {
    let url = new URL(req.url, `http://${ip}`);
    let identification = url.searchParams.get('identification');
    if (!identification) { return resWs(socket, `INFORMAR 'identification'`, true) }
    if (psw !== url.searchParams.get('psw')) { return resWs(socket, `INFORMAR 'psw'`, true) }
    if (debug > 0) { console.log(`{ON}  (${identification})`); }
    registerLegacy({ identification, socket });
    socket.on('close', () => { unregisterLegacy(identification); if (debug > 0) { console.log(`{OFF} (${identification})`); } });
    socket.on('message', async (raw) => {
        try {
            let body = JSON.parse(raw.toString());
            if (body.idMessage) { return; }
            let params = { ...body, identification, 'maxAwait': Number(body.maxAwait || 0), };
            if (debug > 1) { console.log(`{ON}  (${identification}) →`, body.destination); }
            let result = await dispatch({ params, });
            if (debug > 1) { console.log(`{OFF} (${identification}) ←`, result.ret ? 'OK' : result.msg); }
            socketSend(socket, { 'ret': result.ret, 'msg': result.msg, 'res': result.res, });
        } catch (err) { resWs(socket, `${err.message}`) }
    });
});

await app.listen({ 'port': portBridge, 'host': '0.0.0.0', }); app.server.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)));
console.log(`🌐 [SER] http://${ip}:${portBridge} | ws://${ip}:${portBridge}`);