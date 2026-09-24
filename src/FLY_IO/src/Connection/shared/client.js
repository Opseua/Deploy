/* eslint-disable custom/regraA */

// client.js
let isChrome = typeof chrome !== 'undefined'; globalThis['isChrome'] = isChrome; let te = new TextEncoder(); function encode(str) { return te.encode(str); } let clientOk;
if (!globalThis._libNats) { let { wsconnect, } = !isChrome ? await import('@nats-io/nats-core') : await import('./libs/nats-core.js'); globalThis['_libNats'] = { wsconnect, }; await import('./clientConnect.js'); }

function retReturn({ ret, msg, res, tag = 'XXX', label, }) { ret = !!ret; return { ret, 'msg': `${tag}${label ? ` [${label}]` : ''}: ${ret ? 'OK' : 'ERRO'}${msg ? ` | ${msg}` : ''}`, ...(res && { res, }), }; }
async function messageSend({ obj, ...rest }) { if (obj?.msgInf) { return clientOk._reply({ obj, ...rest, }); } return clientOk._sendNew({ ...rest, }); } globalThis['messageSend'] = messageSend;

function clientCreate({ identification, servers = [], onDisconnect = () => { }, onReconnect = () => { }, } = {}) {
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

                            // ------------------------ NOVO BLOCO
                            if (objMsg.identification === 'BRIDGE' && objMsg.message?.ret !== undefined) { objMsg = objMsg.message.ret ? { ...objMsg, 'message': objMsg.message.res, } : objMsg.message; }
                            // ------------------------

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

    async function _sendNew({ label, destination, message, maxAwait = 0, }) {
        let tag = `MESSAGE SEND`; if (!label) { return retReturn({ 'msg': `INFORMAR 'label'`, tag, }); } if (!destination) { return retReturn({ 'msg': `INFORMAR 'destination'`, tag, }); }
        if (message === undefined) { return retReturn({ 'msg': `INFORMAR 'message'`, tag, }); } let priority = ['LOC', 'WEB',], labelFast = `FAST`;
        if (label === labelFast) { label = priority.find(l => connections[l]?.nc && !connections[l].nc.isClosed()) ?? null; if (!label) { return retReturn({ 'msg': `NENHUM LABEL <${labelFast}>`, tag, }); } }
        let conn = connections[label]; if (!conn) { return retReturn({ 'msg': `NÃO EXISTE LABEL '${label}'`, tag, }); } let { nc, } = conn;
        if (!nc || nc.isClosed()) { return retReturn({ 'msg': `NÃO CONECTADO`, tag, }); } let objMsg = { label, identification, destination, maxAwait, message, };
        destination = destination.startsWith('BRIDGE_') ? 'BRIDGE' : destination;
        try {
            if (maxAwait <= 0) {
                try {
                    await nc.request(`msg.${destination}`, encode(JSON.stringify(objMsg)), { 'timeout': 300, });
                } catch (catchErr) {
                    if (catchErr.isNoResponders?.()) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, tag, label, }); } return retReturn({ 'msg': `FALHA AO ENVIAR '${destination}'`, tag, label, });
                }
                return retReturn({ 'ret': true, 'msg': `MENSAGEM ENVIADA`, tag, label, });
            }
            let resp = await nc.request(`msg.${destination}`, encode(JSON.stringify(objMsg)), { 'timeout': maxAwait * 1000, }); let objMsgResp = JSON.parse(resp.string());
            return retReturn({ 'ret': true, 'msg': `RESPOSTA RECEBIDA`, tag, 'res': objMsgResp, label, });
        } catch (catchErr) {
            if (catchErr.isNoResponders?.()) { return retReturn({ 'msg': `NÃO EXISTE '${destination}'`, tag, label, }); } return retReturn({ 'msg': `NÃO RESPONDEU '${destination}'`, tag, label, });
        }
    }

    function _reply({ obj, message, }) {
        let tag = `MESSAGE SEND`, msgInf = obj?.msgInf, label = obj?.label; function retX({ ret, msg, }) { return retReturn({ ret, msg, tag, label, }); }
        if (!msgInf?.reply) { return retX({ 'msg': `MENSAGEM NÃO ESPERAVA RESPOSTA`, }); } let objMsg = { label, 'maxAwait': 0, identification, message, };
        try { msgInf.respond(encode(JSON.stringify(objMsg))); return retX({ 'ret': true, 'msg': `RESPOSTA ENVIADA`, }); } catch { return retX({ 'msg': `FALHA AO RESPONDER`, }); }
    }

    return { connection, _sendNew, _reply, get 'messageReceived'() { return messageReceived; }, set 'messageReceived'(fn) { messageReceived = fn; }, get 'connections'() { return connections; }, };
}

async function client() {

    clientOk = clientCreate({
        'identification': isChrome ? 'CHROME' : `NODE_${process.env.PROMPT ? 'CMD' : 'PWS'}`,
        'servers': [
            { 'label': 'LOC', },
            { 'label': 'WEB', 'host': '149.248.223.192', },
            // { 'label': 'WEB_2', 'host': 'opseua.ddns.net', },
            // { 'label': 'P2P', 'port': '4888', },
        ],
    });
    await clientOk.connection(); clientOk.messageReceived = messageReceived;

    async function messageReceived({ obj, objMsg, }) {
        let { label, maxAwait, identification, message, } = objMsg; console.log(`[${label}] <${maxAwait}> (${identification}) |`, message);

        if (!(maxAwait > 0)) {
            // MENSAGEM RECEBIDA: PRECISA DE RESPOSTA [NÃO]
            console.log(111);
        } else {
            // MENSAGEM RECEBIDA: PRECISA DE RESPOSTA [SIM]
            if (!isChrome && !process.env.PROMPT) { return; }
            let result = await messageSend({
                obj,
                'message': 'A resposta é 2!',
            });
            console.log(result, '\n');
        }
    }

    if (!isChrome && !process.env.PROMPT) {
        let delay = 3000; // delay = 100;
        setTimeout(async () => {
            let result = await messageSend({
                'label': 'FAST',
                'destination': 'NODE_CMD',
                'maxAwait': 5,
                'message': 'Quanto é 1+1?',
            });
            console.log(result);
        }, delay);
    }

}

globalThis['client'] = client;

if (!isChrome) {
    client();
}


