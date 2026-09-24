// client.js
async function connect({ wsconnect, servers, label, room, onConnect, onDisconnect = () => { }, onReconnect = () => { }, } = {}) {
    let firstResolve; let lastLog = null; let ready = new Promise(r => firstResolve = r); let tag = `[${label}] (${room})`;
    function diff() { let now = Date.now(); let d = lastLog ? `+${((now - lastLog) / 1000).toFixed(1)}s` : ''; lastLog = now; return d; }

    (async () => {
        let nc;
        try {
            nc = await wsconnect({
                servers, 'name': room, 'reconnect': true, 'maxReconnectAttempts': -1, 'reconnectTimeWait': (5 * 1000),
                'waitOnFirstConnect': false, 'noAsyncTraces': true, 'pingInterval': (10 * 1000), 'maxPingOut': 2,
            });
        } catch (err) { console.log(`⚠️ ${tag} catch`, err.message); if (firstResolve) { firstResolve(); firstResolve = null; } return; }

        console.log(`🟢 ${tag}`); onConnect(nc); if (firstResolve) { firstResolve(); firstResolve = null; } reconnect({ nc, tag, onDisconnect, onReconnect, 'diff': () => diff(), });
        nc.closed().then((err) => { if (err) { console.log(`⚠️ ${tag} fechou com erro`, err.message); } });
    })();

    return ready;
}

async function reconnect({ nc, tag, onDisconnect, onReconnect, diff, }) {
    (async () => {
        let connected = true;
        for await (let status of nc.status()) {
            switch (status.type) {
                case 'disconnect':
                    console.log(`🟡 ${tag}`, diff()); if (!connected) { break; } connected = false; onDisconnect(); break;
                case 'reconnect':
                    if (connected) { break; } connected = true; console.log(`🟢 ${tag}`); onReconnect(); break;
                case 'staleConnection': console.log(`🟣 ${tag} ping sem resposta`); break;
                case 'error': console.log(`⚠️ ${tag} erro`); break;
            }
        }
    })();
}

globalThis['clientV2'] = { connect, reconnect, };