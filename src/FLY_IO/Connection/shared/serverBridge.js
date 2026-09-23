/* eslint-disable custom/regraA */

// serverBridge.js
import http from 'http'; import { WebSocketServer } from 'ws'; await import('./clientV2.js');

function retReturn({ ret, msg, res, tag = TAG, label, } = {}) { ret = !!ret; return { ret, 'msg': `${tag}${label ? ` [${label}]` : ''}: ${ret ? 'OK' : 'ERRO'}${msg ? ` | ${msg}` : ''}`, ...(res && { res, }), }; }

// ------------------------------------ NATS: CONECTAR
let client = await clientCreate({ 'identification': 'BRIDGE', 'servers': [{ 'label': 'LOC', },], });
globalThis['client'] = client; client.messageReceived = messageReceived; await new Promise(r => setTimeout(r, 50)); console.log('');

// NATS: MONITORAR MENSAGENS RECEBIDAS
async function messageReceived({ obj, objMsg, }) {
    let { label, maxAwait, identification, destination, message, } = objMsg; console.log(`___RECEBIDA___ [${label}] <${maxAwait}> (EM: ${identification} | DE: ${destination}) |`, message, '\n'); message = undefined;

    // PROCESSAR MENSAGEM
    message = await bridgeNewMessageInAvanced(objMsg);

    // ---------------------------------------------------------- ENVIAR RESPOSTA (SE NECESSÁRIO) ----------------------------------------------------------
    if (maxAwait > 0 && message !== undefined) {
        let retMessageSend = await messageSend({ obj, message, }); console.log('___FIM__get___', retMessageSend, '\n');
    }
}

// ------------------------------------ LÓGICA BRIDGE

let PORT = 8887, PSW = 'SENHA_AQUI', TAG = 'SERVER BRIDGE', clients = {}; function newId() { return Math.random().toString(36).slice(2, 10).toUpperCase(); }

function clientAdd({ identification, type, ws = null, }) {
    if (!clients[identification]) { clients[identification] = { type, ws, 'pending': new Map(), }; } else if (type === 'ws') { clients[identification].ws = ws; clients[identification].type = 'ws'; }
}
function clientRemove(identification) { delete clients[identification]; }
function clientSend({ identification, payload, }) {
    let c = clients[identification]; if (!c) { return false; } if (c.type === 'ws' && c.ws?.readyState === 1) { c.ws.send(JSON.stringify(payload)); return true; }
    if (c.type === 'http' && c.resolve) { c.resolve(payload); return true; } return false;
}

// BRIDGE RECEBENDO MENSAGEM DO AVANCED → encaminhar para LEGACY
async function bridgeNewMessageInAvanced(objMsg) {
    let { label, maxAwait, identification, destination, message, messageId, } = objMsg; let destId = destination.replace('BRIDGE_', ''); let mid = messageId || newId();
    if (!messageId && !clients[destId]) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, 'tag': TAG, label, }); }
    let payload = retReturn({ 'ret': true, 'msg': `MENSAGEM RECEBIDA`, 'res': { label, maxAwait, identification, 'messageId': mid, message, }, });
    if (maxAwait <= 0) { clientSend({ 'identification': destId, payload, }); return retReturn({ 'ret': true, 'msg': `MENSAGEM ENVIADA`, 'tag': TAG, label, }); }
    // aguarda resposta do legacy (com timeout)
    return new Promise(resolve => {
        let timer = setTimeout(() => { clients[destId]?.pending.delete(mid); resolve(retReturn({ 'msg': `NÃO RESPONDEU '${destId}'`, 'tag': TAG, label, })); }, maxAwait * 1000);
        clients[destId].pending.set(mid, (resp) => { clearTimeout(timer); resolve(resp); }); clientSend({ 'identification': destId, payload, });
    });
}

// BRIDGE RECEBENDO MENSAGEM DO LEGACY → encaminhar para AVANCED ou outro LEGACY
async function bridgeNewMessageInLegacy({ label, maxAwait = 0, identification, destination, message, messageId, }) {
    if (!destination) { return retReturn({ 'msg': `INFORMAR 'destination'`, }); } let mid = messageId || newId(); let toLegacy = destination.startsWith('BRIDGE_');

    if (!toLegacy) {
        // LEGACY → AVANCED
        let result = await messageSend({ 'label': label || 'FAST', maxAwait, destination, message, }); if (result.ret && result.res) { let { message, ...rest } = result.res; result.res = { ...rest, 'messageId': mid, message, }; }
        console.log('___FIM_send___', result, '\n'); return result;
    }

    // LEGACY → LEGACY
    let destId = destination.replace('BRIDGE_', '');
    if (!clients[destId]) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, }); }
    let payload = retReturn({ 'ret': true, 'msg': `MENSAGEM RECEBIDA`, 'res': { label, maxAwait, identification, 'messageId': mid, message, }, });
    if (maxAwait <= 0) { clientSend({ 'identification': destId, payload, }); return retReturn({ 'ret': true, 'msg': `MENSAGEM ENVIADA`, }); }
    return new Promise(resolve => {
        let timer = setTimeout(() => { clients[destId]?.pending.delete(mid); resolve(retReturn({ 'msg': `NÃO RESPONDEU '${destId}'`, })); }, maxAwait * 1000);
        clients[destId].pending.set(mid, (resp) => { clearTimeout(timer); resolve(resp); }); clientSend({ 'identification': destId, payload, });
    });
}

// LEGACY RESPONDENDO (WS manda { messageId, message } sem destination)
function legacyReply({ senderIdentification, messageId, message, }) {
    for (let [index, c,] of Object.entries(clients)) {
        if (c.pending.has(messageId)) { c.pending.get(messageId)(message); c.pending.delete(messageId); return true; }
    }
    return false;
}

// ------------------------------------ HTTP + WS SERVER
let server = http.createServer(async (req, res) => {
    let url = new URL(req.url, `http://localhost`), params = url.searchParams; if (params.get('psw') !== PSW) { res.writeHead(401); return res.end(JSON.stringify(retReturn({ 'msg': `SENHA INVÁLIDA`, }))); }
    let identification = params.get('identification') || 'BRIDGE'; let body = {};
    if (req.method === 'GET') {
        try { body = JSON.parse(params.get('message') || '{}'); } catch { res.writeHead(400); return res.end(JSON.stringify(retReturn({ 'msg': `JSON INVÁLIDO`, }))); }
    } else {
        let raw = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(d)); });
        try { body = JSON.parse(raw || '{}'); } catch { res.writeHead(400); return res.end(JSON.stringify(retReturn({ 'msg': `JSON INVÁLIDO`, }))); }
    }

    res.setHeader('Content-Type', 'application/json'); let result = await bridgeNewMessageInLegacy({ ...body, identification, }); res.end(JSON.stringify(result));
});

let wss = new WebSocketServer({ server, });
wss.on('connection', (ws, req) => {
    let url = new URL(req.url, `http://localhost`), params = url.searchParams; if (params.get('psw') !== PSW) { ws.close(); return; }
    let identification = params.get('identification') || 'BRIDGE'; clientAdd({ identification, 'type': 'ws', ws, }); console.log(`[WS CONNECT] ${identification}`);

    ws.on('message', async (data) => {
        let body; try { body = JSON.parse(data.toString()); } catch { return; }
        if (body.messageId) {
            let resolved = legacyReply({ 'senderIdentification': identification, 'messageId': body.messageId, 'message': body.message, });
            if (resolved) { return; }
        }
        let result = await bridgeNewMessageInLegacy({ ...body, identification, }); ws.send(JSON.stringify(result));
    });

    ws.on('close', () => { clientRemove(identification); console.log(`[WS DISCONNECT] ${identification}`); }); ws.on('error', () => { clientRemove(identification); });
});

server.listen(PORT, () => console.log(`[${TAG}] porta ${PORT}`));


