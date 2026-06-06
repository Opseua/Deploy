/* global sessionStorage */

async function backgroundRun() {



    // await import('../../webRTC/client.js');
    // return;



    // EVENTOS DE INICIALIZAÇÃO
    let d = false; let v = chrome.runtime.getManifest().version; let onStartup = async ([e, p,]) => {
        d = true; sessionStorage.setItem('i', '1'); let msg = `EVENTO: ${e}`; if (e === 'INSTALAÇÃO') { msg += ` (v${v})`; } if (e === 'ATUALIZAÇÃO') { msg += ` (v${p} → v${v})`; } // console.log(msg);
    }; chrome.runtime.onInstalled.addListener(async ({ 'reason': r, 'previousVersion': p, }) => { if (r === 'install') { return onStartup(['INSTALAÇÃO',]); } onStartup([p !== v ? 'ATUALIZAÇÃO' : 'REFRESH [botão]', p,]); });
    chrome.runtime.onStartup.addListener(() => onStartup(['NAVEGADOR',])); setTimeout(() => { if (d) { return; } onStartup([sessionStorage.getItem('i') ? 'REFRESH [devTools]' : 'REATIVAÇÃO',]); }, 150);

    // REINICIALIZAÇÃO AUTOMÁTICA
    globalThis.restartCode = () => { setTimeout(() => chrome.runtime.reload(), 2000); return { 'ret': true, 'msg': 'RESTART CODE: OK', }; }; function scheduleRun(timeStr = '00:05') { // AGENDAR GATILHO
        let [hour, min,] = timeStr.split(':').map(Number), now = new Date(), next = new Date(now); next.setHours(hour, min, 0, 0); function format(ts, type = 'date') {
            let d = new Date(ts); let pad = n => String(n).padStart(2, '0'); if (type === 'diff') {
                let h = pad(Math.trunc(ts / 3600000)), m = pad(Math.trunc((ts % 3600000) / 60000)), s = pad(Math.trunc((ts % 60000) / 1000)); return `${h}:${m}:${s}`;
            } return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        } if (next.getTime() <= now.getTime()) { next.setDate(next.getDate() + 1); } console.log(`GATILHO (${format(next)}) → EM ${format(next.getTime() - now.getTime(), 'diff')}`);
        chrome.alarms.create('reloadAtTime', { 'when': next.getTime(), 'periodInMinutes': 24 * 60, }); chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'reloadAtTime') { restartCode(); } });
    } globalThis['scheduleRun'] = scheduleRun;

    globalThis['isModeIncognito'] = chrome.extension.inIncognitoContext; // DEFINIR SE O CONTEXTO É MODO ANÔNIMO | REINICIAR A EXTENSÃO
    // await new Promise((resolve) => { chrome.storage.sync.clear(async () => { /* console.log('DEL 1'); */ resolve(true); }); }); // APAGAR STORAGE [SYNC]: LIMPAR
    await new Promise((resolve) => { chrome.storage.local.clear(async () => { /* console.log('DEL 2'); */ resolve(true); }); }); // APAGAR STORAGE [LOCAL]: LIMPAR

    // **********************************
    await import('../server.js');
    // **********************************

    // #*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*

    gO.inf['WebScraper_Extension'] = { 'url': '*c6bank.my.site.com*', }; globalThis.indicationCheck = async (inf = {}) => {
        let { duration = 6, origin = '', } = inf; let add = [{ 'active': true, }, { 'focused': true, }, { 'state': 'maximized', },], fF = { 'firstFind': true, }, flt = { 'pinned': true, 'index': 0, 'incognito': false, };
        let iTA, rTA, atn = [{ 'sharedMedia': true, },], tA = { 'url': gO.inf.WebScraper_Extension.url, }, fltOk = { ...flt, }; delete fltOk['incognito']; let tAFlt = { ...tA, ...flt, };
        let xNot = { 'title': `INDICAÇÃO AUTOMÁTICA`, duration, 'icon': `iconRed`, 'ntfy': false, }; if (isModeIncognito) { notification({ 'text': `Não use no modo anônimo!`, ...xNot, }); return false; }

        // CHECAR SE A ABA EXISTE E ESTÁ FIXADA NO INDEX 0
        iTA = { ...fF, 'filters': { ...tAFlt, }, 'actions': [...(origin === 'button' ? add : []), ...atn,], }; rTA = await tabActions(iTA); // console.log(1, rTA);

        // ABA EXISTE: [SIM] (E) ESTÁ COM sharedMedia: [SIM] → NADA A FAZER
        if (rTA?.res?.[0]?.sharedMedia) { return true; }

        // ABA EXISTE: [NÃO](OU) EXISTE E ESTÁ COM sharedMedia: [NÃO] → ABRIR / ATIVAR A ABA
        iTA = {
            ...fF, 'filters': { ...tAFlt, }, 'urlIfNotExist': 'https://c6bank.my.site.com/partners/s/lead/Lead/Default', 'actions': [...add, ...atn, ...Object.entries(fltOk).map(([k, v,]) => { return { [k]: v, }; }),],
        }; rTA = await tabActions(iTA); // console.log(2, rTA);
        if (!rTA?.res?.[0]?.sharedMedia && origin !== 'button') { notification({ 'text': `Pressione o ícone da extensão até aparecer o quadrado!`, ...xNot, }); return false; } return true;
    };

    // #*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*

    // PROXY: DEFINIR
    function proxySet(ativarProxy) {
        let bypassList = [`localhost`, `127.0.0.1`, `note-*`, `192.168.*`, `${globalThis.gW.serverWeb}`,];
        let proxyHost = `${globalThis.gW.serverWeb}`; let proxyPort = 980; let proxyUser = 'Administrator'; let proxyPass = 'Pass2024PassReverse'; let directConfig = { 'mode': 'system', };
        let proxyConfig = { 'mode': 'fixed_servers', 'rules': { 'singleProxy': { 'scheme': 'http', 'host': proxyHost, 'port': proxyPort, }, bypassList, }, };
        let currentScope = isModeIncognito ? 'incognito_session_only' : 'regular'; let scopeMsg = isModeIncognito ? 'ANÔNIMO' : 'NORMAL';
        let configToApply = ativarProxy ? proxyConfig : directConfig; let actionMsg = ativarProxy ? 'Proxy ATIVADO' : 'Proxy DESATIVADO';
        chrome.proxy.settings.set({ 'value': configToApply, 'scope': currentScope, }, function () { // APLICAR NO CONTEXTO ATUAL
            if (chrome.runtime.lastError) { logConsole({ 'txt': `PROXY: [${scopeMsg}] ERRO AO APLICAR | ${chrome.runtime.lastError.message}`, }); }
            else { logConsole({ 'txt': `PROXY: [${scopeMsg}] OK | ${actionMsg}`, }); }
        }); let authListener = function (details) { // AUTENTICAÇÃO
            if (details.isProxy && details.challenger.host === proxyHost && details.challenger.port === proxyPort) {
                logConsole({ 'txt': `PROXY: [${scopeMsg}] OK | AUTENTICANDO PROXY PARA '${details.challenger.host}'`, }); return { 'authCredentials': { 'username': proxyUser, 'password': proxyPass, }, };
            } return {};
        }; if (!chrome.webRequest.onAuthRequired.hasListener(authListener)) { chrome.webRequest.onAuthRequired.addListener(authListener, { 'urls': ['<all_urls>',], }, ['blocking',]); }
    } proxySet(false);

    // #*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*

    chrome.browserAction.onClicked.addListener(async function (/*...inf*/) {
        // console.log(`EVENTO: click no ícone\n`, inf);
        indicationCheck({ 'origin': 'button', }); // ABRIR ABA DO SISTEMA E ATIVAR O COMPARTILHAMENTO DE MÍDIA
    });

    async function forceUpdate() {
        // MENUS DE CONTEXTO DO ÍCONE DA EXTENSÃO: REMOVER TODOS (NECESSÁRIO ANTES DE CRIAR POR CAUSA DO ID QUE JÁ EXISTE!!!)
        let arrIds = ['contextMenuBadge1', 'contextMenuBadge2', 'contextMenuBadge2_1', 'contextMenuBadge2_2', , 'contextMenuBadge3',];
        arrIds.forEach(id => { chrome.contextMenus.remove(id, function () { if (chrome.runtime.lastError) { } }); }); // chrome.contextMenus.removeAll(() => { }) // REMOVER TODOS DE UMA SÓ VEZ

        // MENUS DE CONTEXTO DO ÍCONE DA EXTENSÃO: CRIAR
        chrome.contextMenus.create({ 'id': `contextMenuBadge1`, 'title': '🟢 Prompt', 'contexts': ['browser_action',], });
        chrome.contextMenus.create({ 'id': `contextMenuBadge2`, 'title': '🔴 Proxy', 'contexts': ['browser_action',], });
        chrome.contextMenus.create({ 'id': `contextMenuBadge3`, 'title': '🟠 Mini Browser', 'contexts': ['browser_action',], });
        chrome.contextMenus.create({ 'id': `contextMenuBadge2_1`, 'contexts': ['browser_action',], 'type': 'radio', 'parentId': `contextMenuBadge2`, 'checked': true, 'title': `OFF`, });
        chrome.contextMenus.create({ 'id': `contextMenuBadge2_2`, 'contexts': ['browser_action',], 'type': 'radio', 'parentId': `contextMenuBadge2`, 'checked': false, 'title': `ON ${isModeIncognito ? '' : ' ⚠️'}`, });
    } forceUpdate(); // FORÇAR ATUALIZAÇÕES NO CÓDIGO E NA EXTENSÃO AO APERTAR F5 NO CONSOLE

    // -------------------- MENU DE CONTEXTO [ÍCONE DA EXTENSÃO] OU [BOTÃO DIREITO]  ---------------------------------------------------------------------
    // TIPOS DE 'contexts':
    // | ---------------- | ----------------------------------------------------------------------
    // | `all`            | Aparece em todos os contextos
    // | `page`           | Em qualquer lugar da página
    // | `selection`      | Quando o usuário seleciona texto
    // | `link`           | Quando o usuário clica com o botão direito em um link
    // | `editable`       | Em campos editáveis (input, textarea, contentEditable)
    // | `browser_action` | Ícone da extensão na barra de ferramentas do Chrome
    // | `page_action`    | Ícone da extensão na barra de ferramentas do Chrome (em páginas específicas)

    // // (Item normal)
    // chrome.contextMenus.create({ 'id': 'contextMenuBadge1', 'title': 'TÍTULO_1', 'contexts': ['browser_action',], });
    // // ------------------------------------------------------------------------------------------------------------------------------------------
    // // [Checkbox]
    // chrome.contextMenus.create({ 'id': 'contextMenuBadge2', 'title': 'TÍTULO_2', 'contexts': ['browser_action',], 'type': 'checkbox', 'checked': true, });
    // // ------------------------------------------------------------------------------------------------------------------------------------------
    // [Radio] Opção 1 | Opção 2
    // chrome.contextMenus.create({ 'id': 'contextMenuBadge2_1', 'title': 'TÍTULO_3', 'contexts': ['browser_action',], 'type': 'radio', 'checked': true, });
    // chrome.contextMenus.create({ 'id': 'contextMenuBadge2_2', 'title': 'TÍTULO_4', 'contexts': ['browser_action',], 'type': 'radio', 'checked': false, });
    // chrome.contextMenus.create({ 'id': 'item1', 'title': 'TÍTULO_5', 'contexts': ['browser_action',], 'type': 'radio', 'checked': false, });
    // // --------------------------------------------------------------------------------------------
    // // {Separador}
    // chrome.contextMenus.create({ 'type': 'separator', 'contexts': ['browser_action',], });
    // // ------------------------------------------------------------------------------------------------------------------------------------------
    // // [Submenu] Ajuda > Sobre o Google Chrome
    // chrome.contextMenus.create({ 'id': 'item2', 'title': 'TÍTULO_6', 'contexts': ['browser_action',], });
    // chrome.contextMenus.create({ 'id': 'item3', 'title': 'TÍTULO_7', 'contexts': ['browser_action',], 'parentId': 'item2', });

    // -------------------- EXECUTAR AÇÕES DO MENU DE CONTEXTO (BOTÃO DIREITO) [ÍCONE DA EXTENSÃO] OU [EM UMA PÁGINA] ------------------------------------------------
    chrome.contextMenus.onClicked.addListener(async function (...inf) {
        let [props, tab,] = inf; let { menuItemId, } = props; let { url, } = tab;
        if (menuItemId === 'contextMenuBadge1') { commands({ 'type': menuItemId, 'origin': 'chrome', }); /* MOSTRAR prompt */ }
        if (['contextMenuBadge2_1', 'contextMenuBadge2_2',].includes(menuItemId)) { proxySet(menuItemId === 'contextMenuBadge2_2'); }
        if (menuItemId === 'contextMenuBadge3') { chrome.windows.create({ url, 'type': 'popup', 'width': 400, 'height': 600, }); /* Mini Browser */ }
    });

    chrome.tabs.onUpdated.addListener(function (...inf) {
        let { /* active, */ id, /* index, pinned, selected, */ status, /* title, */ url, } = inf[2];

        // if (?url.includes('www.google.com') && status === 'complete') {
        //     console.log(`EVENTO: URL aberto e 100% carregado na aba\n`, id);
        // }

        // BAIXAR PDF COM A GUIDLINE
        if ([`/api/projectmanagement/guideline/`, `/api/catalog/datasets/`, `/tr-catalog-assets-`,].some(a => url?.toLowerCase()?.includes(a?.toLowerCase())) && status === 'complete') {
            notification({ 'title': `Baixando PDF`, 'text': `Aguarde...`, 'icon': `iconClock`, 'keepOld': true, 'ntfy': false, 'duration': 3, });
            chrome.downloads.download({ url, 'conflictAction': 'overwrite', }); chrome.tabs.remove(id);
        }
    });

    chrome.downloads.onChanged.addListener(async function (...inf) {
        let { id, state, } = inf[0]; let x = chrome.downloads; if (state?.current !== 'complete') { return; } x.search({ id, }, async function (txt) {
            if (!txt || txt.length === 0) { return; } let { byExtensionName, filename, id, url, } = txt[0]; if (byExtensionName?.includes('BOT')) {
                if (!filename?.includes('[KEEP]') && !filename?.toLowerCase()?.endsWith('.pdf')) {
                    setTimeout(function () { x.erase({ id, }); logConsole({ 'txt': `DOWNLOAD REMOVIDO DA LISTA '${filename}`, }); URL.revokeObjectURL(url); }, 5000);
                }
            }
        });
    });

    // ******************************************************************************************

    // @@@ EVENTO: ÍCONE
    // chrome.browserAction.onClicked.addListener(async function (...inf) {
    //     let { active, id, index, pinned, status, title, } = inf[0]; console.log(`EVENTO: click no ícone\n`, `ID: ${id} | ATIVA: ${active} | INDEX: ${index} | FIXADA: ${pinned} | STATUS: ${status} | TÍTULO: ${title}`, inf);
    // });

    // ******************************************************************************************

    // @@@ EVENTO: MENU DE CONTEXTO (NA PÁGINA OU ÍCONE)
    // chrome.contextMenus.onClicked.addListener(async function (...inf) {
    //     let [props, tab,] = inf; let { menuItemId, pageUrl, } = props; let { id, index, title, } = tab; let origin = pageUrl ? 'PÁGINA' : 'ÍCONE';
    //     console.log(`EVENTO: click no menu de contexto\n`, `ITEM ID: ${menuItemId} | ID ABA: ${id} | TÍTULO: ${title} | ORIGEM: ${origin}`, inf);
    // });

    // ******************************************************************************************

    // @@@ EVENTO: ATALHO
    // chrome.commands.onCommand.addListener(async function (...inf) {
    //     let [command,] = inf; console.log(`EVENTO: atalho pressionado\n`, `COMANDO: ${command}`, inf);
    // });

    // ******************************************************************************************

    // @@@ EVENTO: NOTIFICAÇÃO
    // chrome.notifications.onClicked.addListener(async function (...inf) {
    //     let [id,] = inf; console.log(`EVENTO: click na notificação\n`, `NOTIFICAÇÃO ID: ${id}`, inf);
    // });

    // chrome.notifications.onButtonClicked.addListener(async function (...inf) {
    //     let [id, buttonIndex,] = inf; console.log(`EVENTO: click no botão da notificação\n`, `NOTIFICAÇÃO ID: ${id} | BOTÃO INDEX: ${buttonIndex}`, inf);
    // });

    // chrome.notifications.onClosed.addListener(async function (...inf) {
    //     let [id, closedByUser,] = inf; console.log(`EVENTO: notificação fechada\n`, `NOTIFICAÇÃO ID: ${id} | FECHADA PELO USUÁRIO: ${closedByUser}`, inf);
    // });

    // ******************************************************************************************

    // @@@ EVENTO: ABA
    // chrome.tabs.onCreated.addListener(async function (...inf) {
    //     let { active, id, index, pinned, status, title, url, } = inf[0];
    //     console.log(`EVENTO: aba criada\n`, `ID: ${id} | ATIVA: ${active} | INDEX: ${index} | FIXADA: ${pinned} | STATUS: ${status} | TÍTULO: ${title} | URL: ${url}`, inf);
    // });

    // chrome.tabs.onUpdated.addListener(function (...inf) {
    //     let [, changeInfo, tab,] = inf; let { active, id, index, pinned, title, url, } = tab;
    //     let status = changeInfo.url ? 'INÍCIO' : (changeInfo.title && tab.status === 'loading') ? 'TÍTULO RECEBIDO' : changeInfo.status === 'complete' ? 'CONCLUÍDO' : 'FIXADA, FAVICON, REPRODUZINDO ÁUDIO ou SILENCIADA';
    //     console.log(`EVENTO: aba atualizada\n`, `ID: ${id} | ATIVA: ${active} | INDEX: ${index} | FIXADA: ${pinned} | STATUS: ${status} | TÍTULO: ${title} | URL: ${url}`, inf);
    // });

    // chrome.tabs.onActivated.addListener(async function (...inf) {
    //     let { 'tabId': id, windowId, } = inf[0]; console.log(`EVENTO: aba ativada\n`, `ID: ${id} | JANELA ID ${windowId}`, inf);
    // });

    // chrome.tabs.onRemoved.addListener(async function (...inf) {
    //     let [id, removeInfo,] = inf; let { windowId, } = removeInfo; console.log(`EVENTO: aba removida\n`, `ID: ${id} | JANELA ID ${windowId}`, inf);
    // });

    // ******************************************************************************************

    // @@@ EVENTO: MENSAGEM
    // chrome.runtime.onMessage.addListener(async function (...inf) {
    //     let [msg, sender,] = inf; let { id, url, } = sender; let action = msg?.action || 'SEM AÇÃO'; console.log(`EVENTO: mensagem recebida\n`, `AÇÃO: ${action} | ORIGEM ID: ${id} | URL: ${url}`, inf);
    // });

    // ******************************************************************************************

    // chrome.webRequest.onBeforeRequest.addListener(async function (...inf) {
    //     let { requestId, tabId, url, method, } = inf[0];
    //     if (url.includes('.com/api/survey')) { // .com/api/announcement | .com/api/survey
    //         console.log(`EVENTO: requisição iniciada\n`, requestId, tabId, method, url);
    //     }
    // }, { 'urls': ['<all_urls>',], });

    // chrome.webRequest.onCompleted.addListener(async function (...inf) {
    //     let { requestId, tabId, url, method, } = inf[0];
    //     if (url.includes('.com/api/survey') || url.includes('.com/api/announcement')) { // .com/api/announcement | .com/api/survey
    //         console.log(`EVENTO: requisição concluída\n`, requestId, tabId, method, url);
    //         let retChromeActions = await chromeActions({ 'action': 'getBody', 'target': `*.com/app/announcemen*`, }); console.log(retChromeActions);
    //         // let retFile = await file({ 'action': 'write', 'path': 'arquivoNovo.html', 'content': retChromeActions.res, }); console.log(retFile);
    //         let msgLis = { 'fun': [{ 'securityPass': gW.securityPass, 'retInf': true, 'name': 'file', 'par': { 'action': 'write', 'path': 'arquivoNovo.html', 'content': 'CASA', }, },], };
    //         let retMessageSend = await messageSend({ 'destination': `127.0.0.1:1234/?roo=SALA`, 'message': msgLis, }); console.log(retMessageSend);
    //     }
    // }, { 'urls': ['<all_urls>',], });

    // PEGAR CONTEUDO DA ABA (SÓ FUNCIONA COM AÇÃO DO USUÁRIO COM A ABA ABERTA)
    // async function tabGetContent(inf = {}) {
    //     let ret = { 'ret': false, }; try {
    //         let { id, filename, } = inf; let blob = await new Promise((resolve) => { chrome.pageCapture.saveAsMHTML({ 'tabId': id, }, (blob) => { resolve(blob); }); }); let content = await blob.text(); ret['res'] = {};
    //         if (filename) { let f = `${filename}.mhtml`; chrome.downloads.download({ 'url': `${'data:application/x-mimearchive;base64,' + btoa(content)}`, 'filename': f, }); ret['res']['filename'] = f; }
    //         ret['msg'] = `TAB GET CONTENT: OK`; ret['ret'] = true; ret['res']['content'] = `${content}`;
    //     } catch (catchErr) { ret['msg'] = catchErr.stack; ret['ret'] = false; delete ret['res']; } return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
    // } let retTabGetContent = await tabGetContent({ id, 'filename': 'aaa', }); console.log(retTabGetContent);

    // chrome.system.memory.getInfo((info) => {
    //     let totalGB = (info.capacity / 1024 / 1024 / 1024).toFixed(2); let livreGB = (info.availableCapacity / 1024 / 1024 / 1024).toFixed(2);
    //     console.log(`Total: ${totalGB} GB | Disponível: ${livreGB} GB`);
    // });

}
backgroundRun();


