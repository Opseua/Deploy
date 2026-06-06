// let infMessageSend, retMessageSend, message;
// message = { 'fun': [{ 'securityPass': gW.securityPass, 'retInf': true, 'name': 'notification', 'par': { 'duration': 3, 'title': 'TITULO', 'text': 'TEXTO', }, },], };
// infMessageSend = { 'destination': '127.0.0.1:1234/?roo=DESTINO_AQUI', 'message': `${message}`, 'secondsAwait': 0, };
// retMessageSend = await messageSend(infMessageSend); console.log(retMessageSend);

let e = currentFile(new Error()), ee = e; let wsServerLoc = null, wsServerWeb = {};
async function messageSend(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { resWs = false, messageId = true, secondsAwait = 0, destination = 'x', origin = false, message = {}, } = inf;

        messageId = messageId === true || !messageId ? `ID_${new Date().getTime()}_${randomId({ 'characters': 3, 'notNumber': false, 'notLetter': false, })}_messageId` : messageId.replace('_RET-TRUE', '_RET-OK');
        let retAwaitTimeout, listenerName, messageOk, buffer, chunkSize = gW.kbPartsMessage * 1024; if (typeof message === 'object') {
            messageOk = JSON.stringify(message); buffer = messageOk.includes(`"type":"Buffer"`) && messageOk.includes(`"data":[`) && !messageOk.includes(`"ret"`);
            messageOk = buffer ? Buffer.from(message).toString('base64') : messageOk;
        } else { buffer = false; messageOk = message; } let messageLength = messageOk.length, totalChunks = Math.ceil(messageLength / chunkSize);
        secondsAwait = !messageOk.includes('"retInf":true') ? 0 : secondsAwait > 0 ? secondsAwait : gW.secRetConnection; // → TEMPO PADRÃO SE NÃO FOR INFORMADO
        messageId = secondsAwait === 0 ? `${messageId}` : `${messageId}_RET-TRUE`;

        let locWeb = destination.includes('127.0.0.1') ? '[LOC]' : '[WEB]'; if (!resWs) { // PEGAR 'ws' (CASO NÃO TENHA SIDO PASSADO)
            if (!/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d{4})/.test(destination)) { ret['msg'] = `MESSAGE SEND: ERRO | 'destination' NÃO É UM IP E PORTA VÁLIDO`; return ret; } else {
                let hostOnly = destination.split('/')[0]; resWs = (locWeb === '[LOC]' && wsServerLoc) ? wsServerLoc : (locWeb === '[WEB]' && wsServerWeb[hostOnly]) ? wsServerWeb[hostOnly] : false; if (!resWs) {
                    let retLA = await listenerAcionar(`getWs_${hostOnly}`, { 'a': 'a', }); if (!retLA) { ret['msg'] = `MESSAGE SEND: ERRO | NÃO ACHOU O OBJETO 'ws' ${locWeb} (${hostOnly})`; return ret; }
                    resWs = retLA; if (locWeb === '[LOC]') { wsServerLoc = resWs; } else { wsServerWeb[hostOnly] = resWs; }
                }
            }
        } let host = resWs.host, room = resWs.room; destination = destination ? destination.replace('ws://', '') : 'x'; origin = origin || `${host}/?roo=${room}`; message = messageOk;

        // LISTENER DE RESPOSTA: DEFINIR (SE NECESSÁRIO)
        if (secondsAwait > 0) { listenerName = `${messageId.replace('_RET-TRUE', '_RET-OK')}`; retAwaitTimeout = awaitTimeout({ secondsAwait, listenerName, }); }

        // PREPARAR MENSAGEM: ÚNICA OU EM PARTES
        let messageParts = []; for (let i = 0; i < totalChunks; i++) {
            let start = i * chunkSize, end = Math.min(start + chunkSize, messageLength), chunk = message.slice(start, end);
            messageParts.push({ origin, destination, messageId, buffer, 'partesRestantes': totalChunks - i - 1, secondsAwait, 'message': chunk, });
            // ---------------- TESTES
            // logConsole({ e, ee, 'txt': `${messageId} | [${totalChunks - i - 1}] | → TOTAL ${JSON.stringify(messageParts).length} | DE ${start} ATÉ ${end}` });
            // ----------------
        }

        // ENVIAR MENSAGEM(s)
        enviarMensagem({ resWs, 'big': !(totalChunks === 1), 'message': messageParts, });

        // LISTENER DE RESPOSTA: MONITORAR (SE NECESSÁRIO)
        if (secondsAwait > 0) {
            retAwaitTimeout = await retAwaitTimeout; retAwaitTimeout = retAwaitTimeout.ret ? retAwaitTimeout.res : retAwaitTimeout;
            retAwaitTimeout = retAwaitTimeout.message ? JSON.parse(retAwaitTimeout.message) : retAwaitTimeout;
            ret['ret'] = retAwaitTimeout.ret;
            ret['msg'] = retAwaitTimeout.msg || 'MENSAGEM VAZIA';
            ret['res'] = retAwaitTimeout.res || undefined;
        } else {
            ret['ret'] = true;
            ret['msg'] = 'MESSAGE SEND: OK';
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

let filaBigFalse = [], filaBigTrue = [], sending = false; function enviarMensagem(inf = {}) {
    let { resWs, big, message, } = inf; if (big) { if (Array.isArray(message)) { filaBigTrue.push(...message); } else { filaBigTrue.push(message); } }
    else if (Array.isArray(message)) { filaBigFalse.push(...message); } else { filaBigFalse.push(message); } if (!sending) { sending = true; enviarMensagens({ resWs, }); }
} function processarFilas() {
    if (filaBigFalse.length > 0) { return { 'big': false, 'value': filaBigFalse.shift(), }; }
    else if (filaBigTrue.length > 0) { return { 'big': true, 'value': filaBigTrue.shift(), }; } else { return { 'big': false, 'value': false, }; }
} async function enviarMensagens(inf = {}) {
    while (true) {
        let { resWs, } = inf; let { big, value, } = processarFilas(); if (!value) { sending = false; break; } let { messageId, partesRestantes, secondsAwait, } = value; let message = JSON.stringify(value);
        secondsAwait = secondsAwait === 0 ? gW.secRetConnection / 2 : secondsAwait / 2;

        // LISTENER DE STATUS: DEFINIR
        let retAwaitTimeout, listenerName = `${messageId}_SERVER_${partesRestantes}`; retAwaitTimeout = awaitTimeout({ secondsAwait, listenerName, });

        // ENVIAR MENSAGEM
        resWs.send(message);

        // ---------------- TESTES
        // logConsole({ e, ee, 'txt': `[${(filaBigFalse.length + filaBigTrue.length).toString().padStart(2, '0')}] | ENVIADA ${big ? 'GRANDE' : 'PEQUENA'} ${messageId}` });
        // file({ 'e': e, 'action': 'write', 'functionLocal': false, 'path': `D:/z_CLIENTE_ENVIANDO_[${partesRestantes}]_.txt`, 'content': message });
        // ----------------

        // LISTENER DE STATUS: MONITORAR
        retAwaitTimeout = await retAwaitTimeout;

        retAwaitTimeout = retAwaitTimeout.ret ? JSON.parse(retAwaitTimeout.res.message) : { 'ret': false, 'msg': `TIMEOUT_EXPIROU | MENSAGEM STATUS DO SERVIDOR`, };
        if (!retAwaitTimeout.ret || partesRestantes === 0 && secondsAwait === 0) {
            let listenerName = `${messageId.replace('_RET-TRUE', '_RET-OK').split('_SERVER_')[0]}`; listenerAcionar(listenerName, retAwaitTimeout);
            // REMOVER MENSAGENS COM ERROS DE RETORNO
            filaBigFalse = filaBigFalse.filter(item => item.messageId !== messageId); filaBigTrue = filaBigTrue.filter(item => item.messageId !== messageId);
        }
    }
}

// CHROME | NODE
globalThis['messageSend'] = messageSend;


