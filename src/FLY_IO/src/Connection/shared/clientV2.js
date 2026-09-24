/* eslint-disable custom/regraA */

// client.js
let isChrome = typeof chrome !== 'undefined'; let te = new TextEncoder(); function encode(str) { return te.encode(str); }
if (!globalThis._libNats) { let { wsconnect, } = !isChrome ? await import('@nats-io/nats-core') : await import('./libs/nats-core.js'); globalThis['_libNats'] = { wsconnect, }; await import('./clientConnect.js'); }

function retReturn({ ret, msg, res, tag = 'XXX', label, }) { ret = !!ret; return { ret, 'msg': `${tag}${label ? ` [${label}]` : ''}: ${ret ? 'OK' : 'ERRO'}${msg ? ` | ${msg}` : ''}`, ...(res && { res, }), }; }
async function messageSend({ obj, ...rest }) { if (obj?.msgInf) { return client._reply({ obj, ...rest, }); } return client._sendNew({ ...rest, }); }

async function clientCreate({ identification, servers = [], onDisconnect = () => { }, onReconnect = () => { }, } = {}) {
    async function connection() { await Promise.all(servers.map(connectOne)); } let messageReceived = () => { }; let connections = {}; let tag = `CLIENT CREATE`;
    if (!identification) { return retReturn({ 'msg': `INFORMAR 'identification'`, tag, }); } if (!servers.length) { return retReturn({ 'msg': `INFORMAR 'servers'`, tag, }); }

    async function connectOne({ label, host, port, }) {
        return clientConnect({
            'wsconnect': _libNats.wsconnect, 'servers': `ws://${host || '127.0.0.1'}:${port || '8888'}`, label, onDisconnect, onReconnect, identification, 'onConnect': (nc) => {
                let conn = connections[label]; if (conn?.nc === nc && conn?.sub && !conn.sub.isClosed()) { return; } if (conn?.sub) { conn.sub.unsubscribe(); }
                let sub = nc.subscribe(`msg.${identification}`); connections[label] = { nc, sub, };
                (async () => {
                    try {
                        for await (let msg of sub) {
                            let objMsg; try { objMsg = JSON.parse(msg.string()); } catch { continue; }
                            if (msg.reply && !(objMsg.maxAwait > 0)) { msg.respond(encode('ok')); }
                            try {
                                messageReceived({ 'obj': { 'msgInf': msg, label, 'identification': objMsg.identification, }, objMsg, });
                            } catch (catchErr) {
                                console.log('[messageReceived error]', catchErr);
                            }
                        }
                    } catch (catchErr) {
                        console.log(`⚠️ sub encerrada [${label}]`, catchErr.message);
                    }
                })();
            },
        });
    }

    async function _sendNew({ label, destination, maxAwait = 0, message, }) {
        let tag = `MESSAGE SEND`, fast = `FAST`; if (!destination) { return retReturn({ 'msg': `INFORMAR 'destination'`, tag, }); } if (message === undefined) { return retReturn({ 'msg': `INFORMAR 'message'`, tag, }); }
        label = label || fast; if (label === fast) { label = ['LOC', 'WEB',].find(l => connections[l]?.nc && !connections[l].nc.isClosed()) ?? null; if (!label) { return retReturn({ 'msg': `NENHUM LABEL <${fast}>`, tag, }); } }
        let conn = connections[label]; if (!conn) { return retReturn({ 'msg': `NÃO EXISTE LABEL '${label}'`, tag, }); } let { nc, } = conn; if (!nc || nc.isClosed()) { return retReturn({ 'msg': `NÃO CONECTADO`, tag, }); }
        let objMsg = { label, identification, destination, maxAwait, message, }; let destinationOk = destination.startsWith('BRIDGE_') ? 'BRIDGE' : destination;
        try {
            if (maxAwait <= 0) {
                try {
                    await nc.request(`msg.${destinationOk}`, encode(JSON.stringify(objMsg)), { 'timeout': 300, });
                } catch (catchErr) {
                    if (catchErr.isNoResponders?.()) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, tag, label, }); } return retReturn({ 'msg': `FALHA AO ENVIAR '${destination}'`, tag, label, });
                }
                return retReturn({ 'ret': true, 'msg': `MENSAGEM ENVIADA`, tag, label, });
            }
            let resp = await nc.request(`msg.${destinationOk}`, encode(JSON.stringify(objMsg)), { 'timeout': maxAwait * 1000, }); let objMsgResp = JSON.parse(resp.string());
            objMsgResp['identification'] = destination; if (destinationOk === 'BRIDGE' && objMsgResp.message?.ret === false) { return { ...objMsgResp.message, }; }
            return retReturn({ 'ret': true, 'msg': `RESPOSTA RECEBIDA`, tag, 'res': objMsgResp, label, });
        } catch (catchErr) {
            if (catchErr.isNoResponders?.()) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, tag, label, }); } return retReturn({ 'msg': `NÃO RESPONDEU '${destination}'`, tag, label, });
        }
    }

    function _reply({ obj, message, }) {
        let tag = `MESSAGE SEND`; let { msgInf, label, identification, } = obj; function retX({ ret, msg, }) { return retReturn({ ret, msg, tag, label, }); }
        if (!msgInf?.reply) { return retX({ 'msg': `MENSAGEM NÃO ESPERAVA RESPOSTA`, }); } let objMsg = { label, 'maxAwait': 0, identification, message, };
        try { msgInf.respond(encode(JSON.stringify(objMsg))); return retX({ 'ret': true, 'msg': `RESPOSTA ENVIADA`, }); } catch { return retX({ 'msg': `FALHA AO RESPONDER`, }); }
    }

    await connection();
    return { connection, _sendNew, _reply, get 'messageReceived'() { return messageReceived; }, set 'messageReceived'(fn) { messageReceived = fn; }, get 'connections'() { return connections; }, };
}

globalThis['isChrome'] = isChrome;
globalThis['messageSend'] = messageSend;
globalThis['clientCreate'] = clientCreate;


