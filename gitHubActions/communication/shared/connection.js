// ── connection.js ─────────────────────────────────────────────────────────────
export async function connectWithRetry({ connect, servers, label, onDisconnect = () => { }, onReconnect = () => { }, onConnect, identification, } = {}) {
    let reconnectTimeout = (3 * 1000), reconnectDelay = (5 * 1000), pingInterval = (15 * 1000), maxPingOut = 2;
    let tag = `[${label}] (${identification})`; let lastLog = null; let firstResolve; let ready = new Promise(r => firstResolve = r);
    function diff() { let now = Date.now(); let d = lastLog ? `+${((now - lastLog) / 1000).toFixed(1)}s` : ''; lastLog = now; return d; }
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
    function opts() { return { servers, 'reconnect': false, 'waitOnFirstConnect': false, pingInterval, maxPingOut, 'name': identification, }; }

    (async () => {
        while (true) {
            let start = Date.now();
            try {
                let timeoutId;
                let nc = await Promise.race([
                    connect(opts()),
                    new Promise((_, rej) => { timeoutId = setTimeout(() => rej(new Error('timeout')), reconnectTimeout); }),
                ]);
                clearTimeout(timeoutId);

                console.log(`✅ ${tag}`);
                lastLog = null;
                start = 0;
                if (firstResolve) { firstResolve(); firstResolve = null; }
                onReconnect();
                onConnect(nc);
                await nc.closed();
                onDisconnect();

            } catch { }
            await wait(Math.max(0, reconnectDelay - (Date.now() - start)));
            console.log(`⚠️ ${tag} ${Math.trunc(Date.now() / 1000)}`, diff());
        }
    })();

    return ready;
}


