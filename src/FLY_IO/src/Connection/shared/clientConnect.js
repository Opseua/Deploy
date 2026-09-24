// clientConnect.js
async function clientConnect({ wsconnect, servers, label, identification, onDisconnect = () => { }, onReconnect = () => { }, onConnect, } = {}) {
    let firstResolve; let lastLog = null; let ready = new Promise(r => firstResolve = r); let tag = `[${label}] (${identification})`;

    function diff() {
        let now = Date.now(); let d = lastLog ? `+${((now - lastLog) / 1000).toFixed(1)}s` : ''; lastLog = now; return d;
    }

    (async () => {
        if (firstResolve) { firstResolve(); firstResolve = null; }

        let nc;
        try {
            nc = await wsconnect({
                servers, 'name': identification,
                'reconnect': true,
                'maxReconnectAttempts': -1,
                'reconnectTimeWait': (5 * 1000), // TENTAR SE RECONECAR A CADA x SEGUNDOS APÓS QUEDA
                'waitOnFirstConnect': false,
                'noAsyncTraces': true,
                'pingInterval': (10 * 1000), // ENVIAR PINGA A CADA x SEGUNDOS
                'maxPingOut': 2, // SE x PINGs FICAREM SEM RESPOSTA → DESCONECTA
            });
        } catch (err) {
            console.log(`⚠️ ${tag} catch`, err.message);
            return;
        }

        console.log(`🟢 ${tag}`);
        onConnect(nc);

        (async () => {
            let connected = true;
            for await (let status of nc.status()) {
                switch (status.type) {
                    case 'disconnect':
                        console.log(`🟡 ${tag}`, diff());
                        if (!connected) { break; }
                        connected = false;
                        onDisconnect();
                        break;
                    case 'reconnect':
                        if (connected) { break; }
                        connected = true;
                        lastLog = null;
                        console.log(`🟢 ${tag}`);
                        onReconnect();
                        break;
                    case 'staleConnection':
                        console.log(`🟣 ${tag} ping sem resposta`);
                        break;
                    case 'error':
                        console.log(`⚠️ ${tag} erro`);
                        break;
                }
            }
        })();

        nc.closed().then((err) => {
            if (err) { console.log(`⚠️ ${tag} fechou com erro`, err.message); }
        });
    })();

    return ready;
}

globalThis['clientConnect'] = clientConnect;


