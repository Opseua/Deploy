// → NO FINAL DO ARQUIVO

let e = currentFile(new Error()), ee = e; let shaMed = {};
async function tabActions(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { filters = {}, actions = [], firstFind, urlIfNotExist, incognitoIfNotExist, } = inf;

        // PEGAR INFORMAÇÕES DA(s) ABA(s) | TIPO DE VARIÁVEL | COMPARTILHAR ÁUDIO DA ABA
        let c = chrome.tabs, w = chrome.windows, arrWin = ['minimized', 'normal', 'maximized', 'fullscreen',]; async function getTabs(inf = {}) {
            let tabs = await new Promise(resolve => {
                c.query({ 'windowType': 'normal', }, async tabsOk => {
                    let allTabs = await Promise.all(tabsOk.map(t => new Promise(resTab => {
                        w.get(t.windowId, win => {
                            let d = dateHour(t.lastAccessed).res; d = `${d.yea}_${d.mon}_${d.day}-${d.hou}.${d.min}.${d.sec}`; let stream = shaMed[t.id];
                            try { if (stream) { stream.getAudioTracks().some(a => a.readyState === 'live'); } } catch { stream = false; } resTab({
                                'id': t.id, 'active': t.active, 'pinned': t.pinned, 'index': t.index, 'sharedMedia': !!stream, 'focused': win.focused, 'state': win.state, 'status': t.status,
                                'incognito': t.incognito, 'audible': t.audible, 'frozen': t.frozen, 'windowId': t.windowId, 'lastAccessed': d, 'title': t.title, 'url': t.url,
                            });
                        });
                    }))); resolve(allTabs);
                });
            }); tabs = tabs.filter(t => Object.entries(inf).every(([k, v,]) => {
                if (v === null || v === undefined) { return true; } if (['title', 'url',].includes(k)) { return regex({ e, 'pattern': `${v}`, 'text': t[k], }).ret; }
                if (k === 'sharedMedia') { return t.sharedMedia === v; } if (k === 'focused' || k === 'state') { return t[k] === v; } return t[k] === v;
            })); return tabs;
        } function sStop(id) { delete shaMed[id]; chromeActions({ 'action': 'badge', 'text': '', }); } async function waitForTabLoad(id) {
            let p = new Promise(resolve => { let i = setInterval(async () => { let x = await getTabs({ id, }); if (!x.length || x[0].status === 'complete') { clearInterval(i); resolve(); } }, 500); });
            let timeoutPromise = new Promise(resolve => { setTimeout(() => { resolve(); }, 15000); }); return Promise.race([p, timeoutPromise,]);
        } function varType(arr) { return arr.reduce((o, [types, key, value,]) => { o[key] = types.includes(typeof value) ? value : null; return o; }, {}); } async function sharedMediaRun({ sharedMedia, id, } = {}) {
            if (!sharedMedia && shaMed[id]) { shaMed[id].getTracks().forEach(t => t.stop()); sStop(id); } else if (sharedMedia && !shaMed[id]) {
                let tabsAct = await getTabs({ 'active': true, 'focused': true, }); if (!tabsAct.some(v => v.id === id)) { logConsole({ e, ee, 'txt': `ABA: ALVO ERRADO!`, }); return; }
                let stream = await new Promise(resolve => { chrome.tabCapture.capture({ 'audio': true, 'video': false, }, s => { if (chrome.runtime.lastError || !s) { resolve(false); } else { resolve(s); } }); });
                if (!stream) { logConsole({ e, ee, 'txt': `ABA: SEM PERMISSÃO!`, }); } else { chromeActions({ 'action': 'badge', 'text': 'ON', 'color': '#040404ff', }); shaMed[id] = stream; }
            }
        }

        // PREPARAR CHAVES → FILTROS E AÇÕES
        let flt = filters; flt = varType([
            [['boolean',], 'active', flt.active,], [['boolean',], 'pinned', flt.pinned,], [['number',], 'index', flt.index,], [['boolean',], 'sharedMedia', flt.sharedMedia,], [['boolean',], 'focused', flt.focused,],
            [['string',], 'state', flt.state,], [['boolean',], 'incognito', flt.incognito,], [['string',], 'title', flt.title,], [['string',], 'url', flt.url,], [['number',], 'id', flt.id,],
        ]);
        let atn = Object.assign({}, ...actions); atn = varType([
            [['boolean',], 'active', atn.active,], [['boolean',], 'pinned', atn.pinned,], [['number',], 'index', atn.index,], [['boolean',], 'sharedMedia', atn.sharedMedia,], [['boolean',], 'focused', atn.focused,],
            [['string',], 'state', atn.state,], [['string',], 'title', atn.title,], [['boolean', 'string',], 'url', atn.url,],
            [['boolean',], 'awaitComplete', atn.awaitComplete,], [['boolean',], 'close', atn.close,], [['number',], 'awaitMil', atn.awaitMil,],
        ]);

        // ABA(s): BUSCAR E FILTRAR | ABA: ABRIR [ABRIR JANELA SE NÃO EXISTIR E ESPERAR x] (SE NECESSÁRIO) {O ALVO SEMPRE É A JANELA FOCADA DEPENDENDO DO incognito TRUE OU FALSE}
        let u = urlIfNotExist, t, res = [], tabsFound = await getTabs(flt); if (typeof u === 'string' && !u.includes('://')) { u = `https://${u}`; } if (tabsFound.length === 0 && u && typeof u === 'string') {
            let obj = { 'url': u, 'active': !!atn.active, }; async function winCreate(incognito) { return new Promise(r => w.create({ incognito, }, r)); } async function wins(target) { // PEGAR ID DAS JANELAS
                let t = target, x = await new Promise(r => w.getAll({ 'windowTypes': ['normal',], }, r)); if (t === undefined || !x?.length) { return x; } t = t === null || t === undefined ? x.find(w => w.focused)
                    : t === true ? x.find(w => w.focused && w.incognito) || x.find(w => w.incognito) : x.find(w => w.focused && !w.incognito) || x.find(w => !w.incognito); return t ? [t,] : [];
            } let win = await wins(incognitoIfNotExist); win = win?.[0]?.id; if (!win) { let x = await winCreate(!!incognitoIfNotExist); t = x.tabs[0]; await new Promise(r => c.update(t.id, obj, r)); }
            else { t = await new Promise(r => c.create({ ...obj, 'windowId': win, }, r)); } tabsFound.push(t);
        }

        let change = atn.active !== null || atn.pinned !== null || atn.index !== null || atn.sharedMedia !== null || atn.focused !== null || atn.state !== null || atn.title !== null || (tabsFound.length > 0 && atn.url);
        change = change || atn.awaitComplete !== null || atn.close !== null || atn.awaitMil !== null; for (let [idx, value,] of tabsFound.entries()) {
            let { id, url, windowId, } = value; if (firstFind === true && idx > 0) { break; } else if (firstFind === false && idx === 0) { continue; } if (change) {
                for (let [/*idx2*/, value2,] of actions.entries()) {
                    let [key, val,] = Object.entries(value2)[0]; if (val === null) { continue; }
                    // → [ativa/fixada/focada/estado]
                    let x = ['active', 'pinned',].includes(key) ? c : (key === 'focused' || (key === 'state' && arrWin.includes(val))) ? w : false;
                    if (x) { await new Promise(r => x.update(['active', 'pinned',].includes(key) ? id : windowId, { ...(atn[key] !== null ? { [key]: atn[key], } : {}), }, r)); }
                    // → [índice]
                    if (key === 'index') { await new Promise(resolve => c.move(id, { 'index': val, }, resolve)); }
                    // → [compartilhar mídia]
                    if (key === 'sharedMedia') { await sharedMediaRun({ 'sharedMedia': val, id, }); }
                    // → [título]
                    if (key === 'title' && !url?.includes('chrome://version')) { await new Promise(resolve => { c.executeScript(id, { 'code': `document.title = ${JSON.stringify(val)};`, }, () => resolve()); }); }
                    // → [navegar/regarregar]
                    if (key === 'url') { if (typeof val === 'string') { c.update(id, { 'url': `https://${val.replace(/^https?:\/\//, '')}`, }); } else { c.reload(id, { 'bypassCache': false, }); } }
                    // → [esperar terminar de carregar]
                    if (key === 'awaitComplete') { await waitForTabLoad(id); }
                    // → [awaitMil]
                    if (key === 'awaitMil') { await new Promise(r => { setTimeout(r, val); }); }
                    // → [fechar]
                    if (key === 'close') { await new Promise(resolve => c.remove(id, resolve)); continue; }
                }
            }
            // PEGAR INFORMAÇÃO DA ABA
            res.push(...(await getTabs({ id, })));
        }

        if (tabsFound.length === 0) {
            ret['msg'] = `TAB SEARCH: ERRO | ABA NAO ENCONTRADA APÓS O FILTRO`;
        } else {
            ret['ret'] = true;
            ret['msg'] = `TAB SEARCH: OK`;
            ret['res'] = res;
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['tabActions'] = tabActions;


// // [url]: {SE EXITE} ('true' → reload), ('www.bing.com' → navegate)
// // [firstFind] {VÁRIOS RESULTADOS} → ('true' PRIMEIRO INDICE DA ARRAY), ('false' ÚLTIMO INDICE DA ARRAY) | [focused] {ABA EM FOCO} | [state] → 'minimized', 'normal', 'maximized', 'fullscreen'
// let infTabActions, retTabActions;
// infTabActions = {
//     // 'urlIfNotExist': 'www.google.com',
//     // 'incognitoIfNotExist': true,
//     // 'firstFind': true,
//     'filters': {
//         // 'active': true,
//         // 'pinned': true,
//         // 'index': 1,
//         // 'sharedMedia': true,
//         // 'focused': true,
//         // 'state': 'maximized', // 'minimized'/'normal'/'maximized'/'fullscreen'
//         // 'incognito': true,
//         // 'title': '*YouTube*',
//         // 'url': '*www.google.com*',
//         // 'id': 12345678,
//     },
//     'actions': [
//         // { 'active': true, },
//         // { 'pinned': true, },
//         // { 'index': 2, },
//         // { 'sharedMedia': true, },
//         // { 'focused': true, },
//         // { 'state': 'maximized', }, // 'minimized'/'normal'/'maximized'/'fullscreen'
//         // { 'title': '*google*', },
//         // { 'url': true, },
//         // { 'awaitComplete': true, },
//         // { 'close': true, },
//         // { 'awaitMil': 1500, }, // ***
//     ],
// };
// retTabActions = await tabActions(infTabActions); console.log(retTabActions);


