let mensagensPartesRecebida = {}; let minCle = gW.minClearPartsMessages * 60000; // LOOP: APAGAR PARTE ANTIGAS DAS MENSAGENS
setInterval(() => { let c = new Date().getTime(); for (let mesId in mensagensPartesRecebida) { if ((c - Number(mesId.split('_')[1])) > minCle) { delete mensagensPartesRecebida[mesId]; } } }, minCle);

let e = currentFile(new Error()), ee = e;
async function messageReceived(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { host, room, resWs, wsClients, messageId, partesRestantes = 0, message, buffer = false, origin, destination, } = inf;

        messageId = messageId === true || !messageId ? `ID_${new Date().getTime()}_${randomId({ 'characters': 3, 'notNumber': false, 'notLetter': false, })}_messageId` : messageId;
        partesRestantes = partesRestantes > -99 ? partesRestantes : 0; message = typeof message === 'object' ? JSON.stringify(message) : message; buffer = buffer ? buffer : false;
        origin = origin ? origin.replace('ws://', '') : `${host}/?roo=${room}`; destination = destination ? destination.replace('ws://', '') : 'x';

        if (wsClients) {
            // ######################################################################## RECEBIDO NO SERVIDOR ########################################################################
            let wsClientsToSend = [], erroType = 0, wsClientsArrRoom = []; for (let room in wsClients.rooms) {
                if (regex({ e, 'simple': true, 'pattern': destination, 'text': room, }) && !JSON.stringify(wsClientsArrRoom).includes(room.split('/')[1])) {
                    wsClientsArrRoom.push(room); // 'wsClientsArrRoom' USADO PARA EVITAR QUE O CLIENTE CONECTADO NO 'LOC' E 'WEB' AO MESMO TEMPO RECEBA A MENSAGEM NOS DOIS
                    wsClientsToSend = wsClientsToSend.concat(Array.from(wsClients.rooms[room]));
                }
            } erroType = wsClientsToSend.length === 0 ? `DESTINO INVÁLIDO` : (regex({ e, 'simple': true, 'pattern': destination, 'text': origin, }) || origin === destination) ? `DESTINO IGUAL` : 0;

            // ENVIAR: MENSAGEM STATUS → ORIGEM
            let messageOrigin = {
                'origin': 'SERVER',
                'destination': origin,
                'messageId': `${messageId}_SERVER_${partesRestantes}`,
                'buffer': false,
                'partesRestantes': 0,
                'message': { 'ret': !erroType, 'msg': !erroType ? `WS: OK` : `WS: ERRO | ${erroType} '${destination}'`, },
            }; resWs.send(JSON.stringify(messageOrigin));

            // ENVIAR: MENSAGEM REAL → DESTINO
            if (!erroType) {
                for (let [index, value,] of wsClientsToSend.entries()) {
                    try { message = JSON.parse(message); } catch { } let messageDestination = {
                        origin,
                        'destination': `${value.hostRoom}`,
                        messageId,
                        buffer,
                        partesRestantes,
                        message,
                    }; // logConsole({ e, ee, 'txt': `ENVIANDO MENSAGEM: [${index + 1}/${wsClientsToSend.length}] ${messageId} → ${messageDestination.destination}` });
                    value.send(JSON.stringify(messageDestination)); await new Promise(r => { setTimeout(r, 10); });
                }
            }
        } else {
            // ######################################################################## RECEBIDO NO CLIENTE ########################################################################
            if (!mensagensPartesRecebida[messageId]) { mensagensPartesRecebida[messageId] = { 'partes': [], }; } mensagensPartesRecebida[messageId].partes.push(message); if (partesRestantes === 0) {
                message = mensagensPartesRecebida[messageId].partes.join(''); message = buffer ? eng ? atob(message) : Buffer.from(message, 'base64') : message; let listName = 'x';
                if (messageId.includes(`SERVER`) || messageId.includes(`RET-OK`)) {
                    // RECEBIDO: RETORNO DO SERVIDOR OU RESPOSTA SENDO AGUARDADA
                    listName = `${messageId}`;
                } else {
                    // RECEBIDO: OUTRA MENSAGEM → PROCESSAR E CHAMAR A FUNÇÃO
                    listName = `${destination}`;
                }

                // ACIONAR LISTENER
                // logConsole({ e, ee, 'txt': `ACIONANDO LISTENER: '${listName}` });
                listenerAcionar(listName, { origin, messageId, message, resWs, host, room, });
            }

            // ---------------- TESTES
            // if (!messageId.includes(`SERVER`)) {
            //     logConsole({ e, ee, 'txt': `${messageId} | [${partesRestantes}] | ← TOTAL ${mensagensPartesRecebida[messageId].partes.join('').length}` });
            //     file({ 'e': e, 'action': 'write', 'path': `D:/z_CLIENTE_RECEBENDO_[${partesRestantes}]_.txt`, 'content': message });
            //     if (partesRestantes === 0) {
            //         if (buffer && eng) {
            //             let b = new Array(message.length); for (let i = 0; i < message.length; i++) { b[i] = message.charCodeAt(i); }; let l = new Blob([new Uint8Array(b)], { 'type': 'application/zip' });
            //             chrome.downloads.download({ 'url': URL.createObjectURL(l), 'filename': `D:/z_CLIENTE_RECEBENDO_[X]_COMPLETO.zip`, }, function () { });
            //         } else {
            //             file({ 'e': e, 'action': 'write', 'path': `D:/z_CLIENTE_RECEBENDO_[X]_COMPLETO.${buffer ? 'jpg' : 'txt'}`, 'content': message });
            //         }
            //     }
            // }
            // ----------------
        }
    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['messageReceived'] = messageReceived;


