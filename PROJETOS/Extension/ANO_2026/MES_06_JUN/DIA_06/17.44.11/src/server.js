let startup = new Date(); globalThis['firstFileCall'] = new Error(); await import('./resources/@export.js'); let e = firstFileCall, ee = e;

// import { connect, JSONCodec } from 'https://cdn.jsdelivr.net/npm/nats.ws@1.27.0/esm/nats.js';

async function serverRun(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        await logConsole({ e, ee, 'txt': `**************** SERVER **************** [${startupTime(startup, new Date())}]`, });




        // let nc;
        // try {
        //     nc = await connect({ 'servers': 'ws://127.0.0.1:8080', });

        //     // 1. Feedback imediato de sucesso
        //     console.log(`✅ Conectado ao NATS: ${nc.getServer()}`);
        //     console.log(`ID da Conexão: ${nc.info?.client_id}`);

        //     // 2. Monitorar mudanças de estado (Desconexão, Erros, etc)
        //     (async () => {
        //         for await (let s of nc.status()) {
        //             console.warn(`🔄 Status da Conexão: ${s.type}`, s.data || '');
        //         }
        //     })();

        // } catch (err) {
        //     console.error('❌ Erro detalhado:', err);
        // }

        // let jc = JSONCodec();
        // let meuId = 'chrome-ext';

        // // O restante do seu código (subscrições e funções)...

        // // Função para enviar do Chrome
        // async function enviarParaNode(texto) {
        //     let res = await nc.request('cliente.node-pc.prioridade', jc.encode({
        //         'id': crypto.randomUUID(),
        //         'remetente': meuId,
        //         'corpo': texto,
        //     }), { 'timeout': 30000, });
        //     console.log('Resposta do Node:', jc.decode(res.data));
        // }




        // z_testElementActionV2({}); return;
        // tryRatingComplete({}); return; // TESTES

        if (gW?.userChrome?.includes('opseua@')) {
            // TESTES APENAS NO USUARIO_0

            // await import(`./scripts/libs/socket.io.js`); globalThis['_ioClient'] = io; // EXPORTADO GLOBALMENTE: [SIM] | TIPO: [DEFAULT]
            // await import(`./scripts/libs/socket.io-stream.js`); globalThis['_socketStream'] = self.ss; // EXPORTADO GLOBALMENTE: [SIM] | TIPO: [DEFAULT]
            // globalThis['_crypto'] = await import(`./scripts/libs/crypto-es.js`); // EXPORTADO GLOBALMENTE: [SIM] | TIPO: [ESM]

            // import('./connections/typeNats/app.js');
            // await sleepRun((999 * (60 * 1000)));

        }

        // IMPEDIR 'serverRun' DE PROSSEGUIR (A CADA x MINUTOS)
        async function notRun() { await sleepRun((5 * (60 * 1000))); await notRun(); }
        if (['NOTE_HP', 'AWS',].includes(gW.devMaster) || isModeIncognito) { logConsole({ e, ee, 'txt': `❌❌❌ IGNORANDO EXECUÇÃO DO server.js ❌❌❌`, }); await notRun(); }

        // RESETAR BADGE
        chromeActions({ e, 'action': 'badge', 'text': '', });

        // ATALHO PRESSIONADO
        chrome.commands.onCommand.addListener(async function (...inf) {
            let [shortcut,] = inf; try {
                if (shortcut === 'shortcut_1') { commands({ 'type': shortcut, 'origin': 'chrome', }); } else { logConsole({ e, ee, 'txt': `AÇÃO DO ATALHO NÃO DEFINIDA`, }); }
                // chrome.tabs.executeScript({
                //     code: `(function () {
                //             function pw(j, pw, ph, u) {let w = (pw / 100) * j.top.screen.width, h = (ph / 100) * j.top.screen.height; 
                //             let y = j.top.outerHeight / 2 + j.top.screenY - (h / 2), x = j.top.outerWidth / 2 + j.top.screenX - (w / 2);
                //             return j.open(u, '', 'width=' + w + ',height=' + h + ',top=' + y + ',left=' + x); }; pw(globalThis, 30, 35, 'http://127.0.0.1:1234/?act=page&roo=&mes=0'); })();`
                // });
            } catch (catchErr) { await regexE({ inf, 'e': catchErr, }); }
        });

        // *************************

        // CLIENT (NÃO POR COMO 'await'!!!) [MANTER NO FINAL]
        await sleepRun(50); client({ e, }); await sleepRun(1000);

        // REINICIAR EXTENSÃO | CHECAR SE O BOT DA INDICAÇÃO ESTÁ PREPARADO
        // setTimeout(() => { tabActions({ 'filters': { 'url': gO.inf.WebScraper_Extension.url, }, 'actions': [{ 'sharedMedia': false, },], }); console.log('sharedMedia: OFF'); }, 20000); // TESTES
        if ((`${gW.devGet[0]}`).includes('ESTRELAR_')) {
            logConsole({ e, ee, 'txt': `ACIONADO → REINICIAR EXTENSÃO | CHECAR SE O BOT DA INDICAÇÃO ESTÁ PREPARADO`, });
            scheduleRun('00:00'); let delay = (1 * 60 * 1000); // delay = 15000; // ← TESTES
            setInterval(async () => { indicationCheck({}); }, delay); // A CADA x MINUTO(s)
        }

        // MANTER ORDEM DA ABA (TryRating)
        if (gW?.userChrome?.includes('3@gmail.com')) {
            logConsole({ e, ee, 'txt': `MONITOR DE ABAS ATIVADO`, }); async function enforceTabOrder() {
                let arr = ['try', 'rat', 'ing',], TAB_URL = `${arr[0]}${arr[1]}${arr[2]}.com`, B = chrome.tabs, W = chrome.windows, isMoving = false; let moveTab = (tabId, index, retries = 0) => {
                    if (retries >= 10) { isMoving = false; return; } B.move(tabId, { index, }, () => {
                        let error = chrome.runtime.lastError; if (error) {
                            let msg = error.message; if (msg.includes('The tab was closed') || msg.includes('No tab with id')) { isMoving = false; return; }
                            if (msg.includes('Tabs cannot be edited')) { setTimeout(() => moveTab(tabId, index, retries + 1), 200); } else { isMoving = false; }
                        } else { isMoving = false; }
                    });
                };
                let checkAndMove = () => {
                    if (isMoving) { return; } isMoving = true; W.getCurrent({ 'populate': false, }, (win) => {
                        if (!win) { return (isMoving = false); } B.query({ 'windowId': win.id, }, (tabs) => {
                            let targetTab = tabs.find(t => t.url.includes(TAB_URL) && !t.pinned); if (!targetTab) { return (isMoving = false); } let pinnedCount = tabs.filter(t => t.pinned).length;
                            let targetIndex = pinnedCount; if (targetTab.index !== targetIndex) { setTimeout(() => moveTab(targetTab.id, targetIndex), 50); } else { isMoving = false; }
                        });
                    });
                }; let tabListener = () => { if (!isMoving) { checkAndMove(); } }; B.onCreated.addListener(tabListener);
            } enforceTabOrder();
        }

        ret['ret'] = true;
        ret['msg'] = `SERVER: OK`;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}
// TODAS AS FUNÇÕES PRIMÁRIAS DO 'server.js' / 'serverC6.js' / 'serverJsf.js' DEVEM SE CHAMAR 'serverRun'!!!
serverRun();


