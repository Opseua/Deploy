let e = currentFile(new Error()), ee = e; let wsServers = { 'rooms': {}, }, reconnecting = {}, timSecCon = {}, secConnect = gW.secConnect; let libs = { 'ws': {}, };
async function client(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        /* IMPORTAR BIBLIOTECA [CHROME/NODE] */ if (libs['ws']) { libs['ws'] = { 'WebSocket': 1, 'pro': 'Connection', }; libs = await importLibs(libs, 'client'); }

        // ### CONEXÃO
        function connect(inf = {}) {
            let { hostRoom, } = inf; let ws = new _WebSocket(`ws://${hostRoom}`), url = ws._url || ws.url, host = url.replace('ws://', '').split('/')[0], room = url.split(`${host}/`)[1].replace('?roo=', '');
            let locWeb = host.includes('127.0.0') ? `[LOC]` : `[WEB]`; ws['host'] = host; ws['room'] = room; ws['hostRoom'] = hostRoom; ws['locWeb'] = locWeb; ws['method'] = 'WEBSOCKET';
            function clearTimRec(event) { clearTimeout(timSecCon[hostRoom]); if (event) { setTimeout(() => { reconnect({ host, room, hostRoom, 'resWs': ws, event, }); }, 1000); } }

            // # ON OPEN
            ws.onopen = async () => {
                // LIMPAR TIMEOUT DE CONEXÃO | SALA [ADICIONAR] | ENVIAR PING DE INÍCIO DE CONEXÃO | LISTENER PARA RETORNAR O 'ws'
                clearTimRec(false); if (!wsServers.rooms[hostRoom]) { wsServers.rooms[hostRoom] = new Set(); } wsServers.rooms[hostRoom].add(ws); function getWs(inf = {}) {
                    let { host, } = inf; for (let clients of Object.values(wsServers.rooms)) { for (let ws of clients) { if (regex({ 'pattern': host, 'text': ws.host, 'simple': true, })) { return ws; } } } return null;
                } logConsole({ e, ee, 'txt': `${locWeb} OK: ${ws.host.split(':')[0]}\n'${room}'`, }); ws.send(`ping`); listenerMonitorar(`getWs_${host}`, async (/*nomeList, inf*/) => { return getWs({ host, }); });
            };

            // # ON MESSAGE
            ws.onmessage = async (data) => {
                let message = data.data.toString('utf-8'), pingPong = message === `ping` ? 1 : message === `pong` ? 2 : 0; // ÚLTIMA MENSAGEM RECEBIDA
                ws['lastMessage'] = ws.lastMessage || pingPong > 0 ? Number(dateHour().res.tim) : false; // logConsole({ e, ee, 'txt': `← CLI | ${ws.lastMessage} | ${hostRoom}` });
                if (pingPong > 0) { // RECEBIDO: 'PING' ENVIAR 'PONG'
                    if (pingPong === 2) { return; } ws.send('pong'); // logConsole({ e, ee, 'txt': `RECEBEU PING ${locWeb} '${room}'` });
                } else { // RECEBIDO: OUTRA MENSAGEM
                    try { message = JSON.parse(message); } catch { message = { message, }; } if (!message.message) { message = { message, }; }
                    if (ws.lastMessage) { ws.send(`pong`); } messageReceived({ ...message, host, room, 'resWs': ws, locWeb, });
                }
            };

            // # ON ERROR/CLOSE | TEMPO MÁXIMO DE CONEXÃO | LIMPAR TIMEOUT DE CONEXÃO
            ws.onerror = () => { clearTimRec('error'); }; ws.onclose = () => { clearTimRec('close'); }; let c = () => ws.close(); timSecCon[hostRoom] = setTimeout(() => { c(); }, secConnect * 1000);
        }

        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------

        // ### RECONEXÃO | REMOVER SERVIDOR
        function reconnect(inf = {}) {
            let { host, room, hostRoom, resWs, event, } = inf; let locWeb = host.includes('127.0.0') ? `[LOC]` : `[WEB]`; if (!reconnecting[hostRoom]) {
                reconnecting[hostRoom] = true; let secReconnect = gW.secReconnect - secConnect + 1; removeSerCli({ hostRoom, resWs, 'msg': `${locWeb} RECONECTANDO ${event}: ${host.split(':')[0]}\n${room}`, });
                setTimeout(() => { reconnecting[hostRoom] = false; connect({ hostRoom, }); }, (secReconnect * 1000) - 50); // ← MENOS SEGUNDOS DO TEMPO DE CONEXÃO
            }
        } function removeSerCli(inf = {}) {
            let { hostRoom, resWs, msg, } = inf; logConsole({ e, ee, 'txt': msg, });
            if (wsServers.rooms[hostRoom]) { wsServers.rooms[hostRoom].delete(resWs); if (wsServers.rooms[hostRoom].size === 0) { delete wsServers.rooms[hostRoom]; } }
        }

        // SERVIDORES: CONECTAR E LISTENER DE MENSAGENS RECEBIDAS → [LOC] + [WEB] (AWS) + [WEB] (Hetzner)
        let servers = [gW.devGet[0], gW.devGet[1],]; for (let [index, value,] of servers.entries()) {
            if (!value.includes('127.0.0.1') && (gW.project === 'Sniffer' || (!value.includes('USUARIO_0') && value.includes('USUARIO_')))) {
                // NÃO CONECTAR AO WEBSOCKET
            } else { connect({ 'hostRoom': value, }); listenerMonitorar(value, async (nomeList, param1) => { runLis({ nomeList, param1, }); }); }
        }

        async function runLis(inf = {}) {
            let { param1, } = inf, { messageId, message, resWs, origin, } = param1; // FUN | OTHER | MENSAGEM NÃO IDENTIFICADA
            let data = {}; try { data = JSON.parse(message); } catch { } if (data.fun) { devFun({ e, data, messageId, resWs, 'destination': origin, }); }
            else if (data.other) { logConsole({ e, ee, 'txt': `OTHER\n${JSON.stringify(data.other)}`, }); }
        }

        // LOOP: CHECAR ÚLTIMA MENSAGEM
        let secPing = gW.secPing; function lastMessageReceived() {
            for (let clientSet of Object.values(wsServers.rooms)) {
                for (let v of clientSet) {
                    function check(inf = {}) { let { lastMessage, locWeb, room, } = inf; return { 'dif': lastMessage ? Number(dateHour().res.tim) - lastMessage : -99, locWeb, room, }; }
                    let retCheck = check(v); if (retCheck.dif > (secPing - 1)) {
                        v.send('ping'); setTimeout(() => {
                            retCheck = check(v); if (retCheck.dif > (secPing - 1)) { logConsole({ e, ee, 'txt': `DESCONECTAR [PING ${retCheck.dif}] ${retCheck.locWeb} '${retCheck.room}'`, }); v.close(); }
                        }, gW.secPingTimeout * 1000);
                    }
                }
            }
        } setInterval(() => { lastMessageReceived(); }, (secPing) * 1000);

        ret['ret'] = true;
        ret['msg'] = 'CLIENT: OK';
    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }
    if (!ret.ret) {
        if (eng) { // CHROME
            configStorage({ e, 'action': 'del', 'key': 'webSocket', });
        } else { // NODE
            log({ e, 'folder': 'JavaScript', 'path': `log.txt`, 'text': `SERVER NODE: ${ret.msg}`, });
        }
    }
}

// CHROME | NODE
globalThis['client'] = client;


