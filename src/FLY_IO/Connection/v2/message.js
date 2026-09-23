// message.js
let enc = new TextEncoder(), dec = new TextDecoder(), maxAwaitDefault = 30; let mensagensIds = {}; let pendingReplies = new Map();

function genId() {
    let now = new Date(); let pad = (n) => String(n).padStart(2, '0'); let letters = Array.from({ 'length': 3, }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
    return `${pad(now.getMonth() + 1)}_${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, '0')}-${letters}`;
}

setInterval(() => {
    let now = Date.now(); for (let [id, { timestamp, maxAwait, },] of Object.entries(mensagensIds)) { if (now - timestamp > (maxAwait || maxAwaitDefault) * 2000) { delete mensagensIds[id]; } }
}, 10 * 1000);

// ── ENVIO ──────────────────────────────────────────────────────────────────
async function send({ nc, room, message, maxAwait = 0, idMessage, } = {}) {
    let type = idMessage ? 2 : 1; idMessage = idMessage || genId(); mensagensIds[idMessage] = { type, 'timestamp': Date.now(), maxAwait, };
    let payload = { idMessage, type, maxAwait, message, }; nc.publish(`room.${room}`, enc.encode(JSON.stringify(payload)));

    if (type === 2) { return; } if (maxAwait <= 0) { return { 'ret': true, 'msg': 'SERVER: OK | MENSAGEM ENVIADA', }; }

    return new Promise((resolve) => {
        let timer = setTimeout(() => { pendingReplies.delete(idMessage); resolve({ 'ret': false, 'msg': 'SERVER: ERRO | NÃO RESPONDEU A TEMPO', }); }, maxAwait * 1000);
        pendingReplies.set(idMessage, (resMessage) => { clearTimeout(timer); resolve({ 'ret': true, 'msg': 'SERVER: OK | RESPOSTA RECEBIDA', 'res': resMessage, }); });
    });
}

// ── RECEBIMENTO ────────────────────────────────────────────────────────────
async function received({ nc, room, onMessage, } = {}) {
    let sub = nc.subscribe(`room.${room}`);
    for await (let raw of sub) {
        let data; try { data = JSON.parse(dec.decode(raw.data)); } catch { continue; } let { idMessage, type, } = data; let registered = mensagensIds[idMessage];

        if (registered) {
            if (type === registered.type) { continue; } // ECO
            if (type === registered.type + 1) { delete mensagensIds[idMessage]; let resolver = pendingReplies.get(idMessage); if (resolver) { pendingReplies.delete(idMessage); resolver(data.message); } continue; } // RESPOSTA
            continue; // fora do esperado, ignora
        }

        if (type !== 1) { continue; } // resposta órfã/velha, ignora
        onMessage(data); // mensagem nova
    }
}

globalThis['messageV2'] = { send, received, };