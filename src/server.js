/* eslint-disable custom/regraA */

import os from 'os'; import { spawn } from 'child_process'; import { chmodSync, existsSync } from 'fs'; import { Socket } from 'net';

let engName = os.platform()?.startsWith('win') ? 'WINDOWS' : 'LINUX'; let _loadedScripts = new Set(), fileWindows; if (engName === 'WINDOWS') { fileWindows = process.env.fileWindows.replaceAll('\\', '/'); }

// ── Inicia um executável ──────────────────────────────
function startBin({ label, win, linux, args = [], }) {
    let bin = engName === 'WINDOWS' ? win : linux; if (engName === 'LINUX' && existsSync(linux)) { chmodSync(linux, 0o755); } let proc = spawn(bin, args, { 'stdio': 'inherit', });
    proc.on('exit', (code) => { console.error(`[${label}] saiu com código ${code}`); process.exit(code); }); console.log(`[${label}] iniciado`); return proc;
}

// ── Importa um script JS ──────────────────────────────
async function startScript({ label, path, }) {
    try { await import(path); _loadedScripts.add(label); console.log(`[${label}] iniciado`); } catch (catchErr) { console.error(`[${label}] erro:`, catchErr.message); process.exit(1); }
}

// ── Checa se processo está rodando ───────────────────
async function isProcessRunning(name) {
    if (engName === 'WINDOWS') {
        return new Promise((resolve) => {
            let proc = spawn('cmd', ['/c', 'tasklist',], { 'stdio': ['ignore', 'pipe', 'ignore',], }); let out = ''; proc.stdout.on('data', (d) => out += d.toString());
            proc.on('exit', () => resolve(out.toLowerCase().includes(name.toLowerCase())));
        });
    } let { readdir, readFile, } = await import('fs/promises'); try {
        let pids = await readdir('/proc');
        for (let pid of pids) { if (!/^\d+$/.test(pid)) { continue; } try { let cmd = await readFile(`/proc/${pid}/cmdline`, 'utf8'); if (cmd.toLowerCase().includes(name.toLowerCase())) { return true; } } catch { } }
    } catch { } return false;
}

// ── Checa se porta está em uso ────────────────────────
function isPortOpen(port) {
    return new Promise((resolve) => {
        let s = new Socket(); s.setTimeout(1000); s.once('connect', () => { s.destroy(); resolve(true); }); s.once('error', () => { s.destroy(); resolve(false); });
        s.once('timeout', () => { s.destroy(); resolve(false); }); s.connect(port, '127.0.0.1');
    });
}

// ── Aguarda tudo e notifica ───────────────────────────
async function waitAndNotify({ executables = [], ports = [], scripts = [], }) {
    console.log('[notify] aguardando serviços...'); while (true) {
        await new Promise(r => setTimeout(r, 3000)); let execChecks = await Promise.all(executables.map(isProcessRunning)); let portChecks = await Promise.all(ports.map(isPortOpen));
        let scriptChecks = scripts.map(s => _loadedScripts.has(s)); console.log('[notify]', JSON.stringify({
            'executables': Object.fromEntries(executables.map((e, i) => [e, execChecks[i],])), 'ports': Object.fromEntries(ports.map((p, i) => [p, portChecks[i],])),
            'scripts': Object.fromEntries(scripts.map((s, i) => [s, scriptChecks[i],])),
        })); if (execChecks.every(Boolean) && portChecks.every(Boolean) && scriptChecks.every(Boolean)) {
            if (engName === 'LINUX') { fetch(`https://ntfy.sh/${process.env.NTFY_CHANNEL}/publish?title=Deploy&message=Conclu%C3%ADdo%20(${engName})`).catch(() => { }); } console.log('[notify] ✅ TUDO PRONTO'); break;
        }
    }
}

// ########################### EXECUTÁVEIS
let syncthingZOutros = `${fileWindows}/PORTABLE-Syncthing/z_OUTROS`, zOutros = './src/z_OUTROS';
startBin({
    'linux': `${zOutros}/PORTABLE-frp/frps_linux_amd64`, 'args': ['-c', `${zOutros}/PORTABLE-frp/frps.toml`,], 'label': 'frps', 'win': `${syncthingZOutros}/PORTABLE-frp/frps.exe`,
});
startBin({
    'linux': `${zOutros}/PORTABLE-NATS/nats-server`, 'args': ['-c', `${zOutros}/PORTABLE-NATS/nats-server.conf`,], 'label': 'nats', 'win': `${syncthingZOutros}/PORTABLE-NATS/nats-server.exe`,
});

// ########################### SCRIPTS
startScript({ 'label': 'Connection', 'path': './Connection/server.js', });

// ########################### NOTIFY
waitAndNotify({
    'executables': [
        'nats-server',
        'frps_linux_amd64',
    ],
    // 'ports': [
    //     999
    // ],
    'scripts': [
        'Connection',
    ],
});







import http from 'http'


// ###################### HELPERS (SUBSTITUEM 'regex()' E OUTRAS GLOBALS DO SEU ECOSSISTEMA) ######################
function regexSimple({ pattern, text, }) { try { return new RegExp(pattern, 'i').test(text); } catch { return false; } }

function rangeParse(r) {
    let [t, a,] = r.split('!'); if (!a) { a = t; t = false; } let [p1, p2 = '',] = a.split(':'); let re = /^([A-Z]+)?(\d+)?$/i; let m1 = p1.match(re) || [], m2 = p2.match(re) || [];
    let c1 = m1[1]?.toUpperCase() || false, c2 = m2[1]?.toUpperCase() || false; let l1 = m1[2] ? +m1[2] : false, l2 = m2[2] ? +m2[2] : false; if (l1 && l2 && l2 < l1) { l2 = l1; }
    let tab = t || false; let colSta = c1 || false; let colEnd = c2 || false; let linSta = l1 || 1; let linEnd = l2 || false; return { tab, colSta, linSta, colEnd, linEnd, };
}

function formattingData(values) {
    return values.map(row => row.map(v => {
        if (typeof v === 'number' && Number.isInteger(v) && String(v).length > 14) { return `'${v}`; }
        if (typeof v === 'string') { if (!isNaN(Number(v))) { return `'${v}`; } let vTemp = v.toLowerCase(); if (vTemp === 'true' || vTemp === 'false') { return `'${v}`; } } return v;
    }));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ###################### GOOGLE SHEETS NEW (VERSÃO STANDALONE — SEM 'api'/'regexE'/'configStorage'/'notification'/'logConsole') ######################
async function googleSheetsNew(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `GOOGLE SHEET NEW`;
    try {
        let { action, id, tab, range, values, lineStart = 1, lineEnd, qtdLines, destinations = [{},], searchs = [], raw, ignoreFormatting = false, attempts = 2, tabId, token, } = inf;
        let isArr = Array.isArray(range); let errAll = ''; let baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${id}`;
        let actions = ['get', 'update', 'addInLastLine', 'addInNewLine', 'deleteLine', 'copy', 'search',];

        if (!token) { ret['msg'] = `${nameFun}: ERRO | INFORMAR O 'token'`; return ret; }

        function identifyErr() {
            let err = errAll.toString(); return (err.includes('entity was not found') || err.includes('Unable to parse range') || err.includes('contains an invalid argument') || err.includes('INVALID_ARGUMENT')) ?
                `<ERR>RANGE INVÁLIDO OU INEXISTENTE` : (err.includes('not have permission') || err.includes('to edit a protected')) ? `<ERR>SEM PERMISSÃO` : err.includes(`"code":401`) ? `<ERR>TOKEN INVÁLIDO` :
                    err.includes(`Cannot delete a row that doesn't exist`) ? `<ERR>LINHA NÃO EXISTE` : err.includes(`ECONNRESE`) ? `<ERR>CONEXÃO INTERROMPIDA` : err.includes(`ENOTFOUND`) ? `<ERR>SEM CONEXÃO` :
                        (err.includes(`The service is currently unavailable`) || err.includes(`Error 502`) || err.includes(`Internal error encountered`) ||
                            err.includes(`The server encountered a temporary error and could not complete`)) ? `<ERR>API INDISPONÍVEL` : `NÃO IDENTIFICADO`;
        }

        async function _sheetNew({ method, url, body, }) {
            let r = { 'ret': false, }; try {
                let resp = await fetch(url, { method, 'headers': { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', }, 'body': body ? JSON.stringify(body) : undefined, });
                let data = await resp.json(); if (resp.ok) { r['ret'] = true; r['res'] = data; } else { errAll = JSON.stringify(data); }
            } catch (catchErr) { errAll = catchErr; } return { ...({ 'ret': r.ret, }), ...(r.hasOwnProperty('res') && { 'res': r.res, }), };
        }

        // VALIDAÇÕES
        let errPars = false; let act = actions.includes(action); if (!errPars && !act) { errPars = `'action' → [${actions}]`; } if (!errPars && !id) { errPars = `'id'`; }
        if (!errPars && !tab) { errPars = `'tab'`; } if (!errPars && ['get', 'update', 'copy',].includes(action) && (!range || isArr && range.length === 0)) { errPars = `'range'`; }
        if (!errPars && ['update', 'addInLastLine', 'addInNewLine',].includes(action) && !values) { errPars = `'values'`; } if (!errPars && action === 'deleteLine') {
            let x = !(lineStart > 0) ? `'lineStart'` : !(lineEnd > 0 || qtdLines > 0) ? `'lineEnd' OU 'qtdLines'` : !(Number(tab) > 0) ? `'tab' (number)` : false; if (x) { errPars = `${x}`; }
        } if (!errPars && action === 'copy') { for (let d of destinations) { let f = ['id', 'tab', 'range',].find(k => !d[k]); if (f) { errPars = `'${f}' DE TODOS 'destinations'`; break; } } }
        if (!errPars && action === 'search' && searchs.length === 0) { errPars = `'searchs'`; } if (errPars) { ret['msg'] = `${nameFun}${act ? ` [${action}]` : ''}: ERRO | INFORMAR ${errPars}`; return ret; }
        let ignoreRange = ['addInLastLine', 'addInNewLine', 'deleteLine',].includes(action);

        // CORRIGIR RANGE 'A:B10' → 'A1:B10'
        if (!ignoreRange) { { range = (isArr ? range : [range,]).map(v => { let r = rangeParse(v); return `${r.colSta}${r.linSta}${r.colEnd ? `:${r.colEnd}${r.linEnd || ''}` : ''}`; }); } if (!isArr) { range = range[0]; } }

        let retSheetNew;
        if (action === 'get') { // [get]
            range = isArr ? range.map(r => `${tab}!${r}`) : [`${tab}!${range}`,];
            let url = `${baseUrl}/values${isArr ? `:batchGet?ranges=${range.map(encodeURIComponent).join('&ranges=')}` : `/${range[0]}`}`; retSheetNew = await _sheetNew({ 'method': 'GET', url, });
            if (retSheetNew.ret) { ret['ret'] = true; retSheetNew = retSheetNew.res; ret['res'] = isArr ? (retSheetNew.valueRanges || []).map(v => v.values || []) : (retSheetNew.values || []); }
        } else if (action === 'update') { // [update]
            range = isArr ? range.map(r => `${tab}!${r}`) : [`${tab}!${range}`,]; let valuesArr = isArr ? values : [values,], url = `${baseUrl}/values:batchUpdate`;
            let body = { 'valueInputOption': raw ? 'RAW' : 'USER_ENTERED', 'data': range.map((r, i) => ({ 'range': r, 'values': valuesArr[i], })), }; retSheetNew = await _sheetNew({ 'method': 'POST', url, body, });
            if (retSheetNew.ret) { ret['ret'] = true; retSheetNew = retSheetNew.res; ret['res'] = { 'updatedRanges': retSheetNew.responses.map(r => r.updatedRange), }; }
        } else if (['addInLastLine', 'addInNewLine',].includes(action)) { // [addInLastLine/addInNewLine]
            range = `${tab}!A:A`; let url = `${baseUrl}/values/${range}:append?valueInputOption=${raw ? 'RAW' : 'USER_ENTERED'}${action === 'addInNewLine' ? '&insertDataOption=INSERT_ROWS' : ''}`;
            if (!ignoreFormatting) { values = formattingData(values); } let body = { values, }; retSheetNew = await _sheetNew({ 'method': 'POST', url, body, });
            if (retSheetNew.ret) { ret['ret'] = true; retSheetNew = retSheetNew.res; ret['res'] = { 'updatedRange': retSheetNew.updates.updatedRange, }; }
        } else if (action === 'deleteLine') { // [deleteLine]
            let startIndex = lineStart - 1; if (qtdLines > 0) { lineEnd = startIndex + qtdLines; } if (lineEnd <= startIndex) { ret['msg'] = `${nameFun} [${action}]: ERRO | LINHAS INVÁLIDAS`; return ret; }
            let endIndex = lineEnd; let req = [{ 'deleteDimension': { 'range': { 'sheetId': Number(tab), 'dimension': 'ROWS', startIndex, endIndex, }, }, },];
            let url = `${baseUrl}:batchUpdate`; let body = { 'requests': req, }; retSheetNew = await _sheetNew({ 'method': 'POST', url, body, });
            if (retSheetNew.ret) { ret['ret'] = true; ret['res'] = { lineStart, 'lineEnd': endIndex, 'qtdLines': endIndex - startIndex, }; }
        } else if (action === 'copy') { // [copy]
            let res = { 'updatedRanges': [], }, retOk1 = await googleSheetsNew({ 'action': 'get', id, tab, range, token, });
            if (!retOk1.ret) { ret['msg'] = `${nameFun} [${action}]: ERRO | → ${retOk1.msg}`; return ret; } for (let value of destinations) {
                let retOk2 = await googleSheetsNew({ 'action': 'update', 'id': value.id, 'tab': value.tab, 'range': value.range, 'values': retOk1.res, token, });
                if (!retOk2.ret) { ret['msg'] = `${nameFun} [${action}]: ERRO | → ${retOk2.msg}`; ret['res'] = res; return ret; } res.updatedRanges.push(retOk2.res.updatedRanges);
            } ret['ret'] = true; ret['res'] = res;
        } else if (action === 'search') { // [search] 🔍
            let rData = await googleSheetsNew({ 'action': 'get', id, tab, range, token, }); if (!rData.ret) { return rData; }

            let rParsed = rangeParse(isArr ? range[0] : range);
            let subActions = ['get', 'update', 'deleteLine',]; let tag = `<SEARCH>`;
            let searchResults = []; let allOk = true;

            for (let s of searchs) {
                let errS = !s.col ? 'col' : !s.critery ? 'critery' : !s.find ? 'find' : false;
                if (errS) { allOk = false; searchResults.push({ 'ret': false, 'msg': `${tag}: ERRO | INFORMAR '${errS.toLowerCase()}'`, }); }
                else { searchResults.push({ 'ret': true, 'msg': `${tag}: OK`, 'res': { 'founds': [], }, }); }
            }

            for (let [idx, row,] of rData.res.entries()) {
                let lineNum = rParsed.linSta + idx;
                for (let [sIdx, s,] of searchs.entries()) {
                    if (!searchResults[sIdx].ret) { continue; }

                    let colIdx = typeof s.col === 'number' ? s.col - 1 : (s.col.toUpperCase().charCodeAt(0) - 65);
                    let cellVal = String(row[colIdx] || ''); let findVal = s.find;

                    if (s.noCaseSensitive) { cellVal = cellVal.toLowerCase(); findVal = typeof findVal === 'string' ? findVal.toLowerCase() : findVal; }

                    let match = s.critery === 'regex' ? regexSimple({ 'pattern': findVal, 'text': cellVal, }) : cellVal === String(findVal);

                    if (match === true) {
                        let resActions = [];
                        for (let subAct of (s.actions || [])) {
                            let retAct, actName = subAct.action;

                            if (!actName || !subActions.includes(actName)) {
                                retAct = { 'ret': false, 'msg': `${tag}: ERRO | INFORMAR [${subActions}]`, };
                            } else if (actName === 'get') {
                                let rowRes = subAct.onlyCols ? subAct.onlyCols.map(c => {
                                    let cIdx = typeof c === 'number' ? c - 1 : (c.toUpperCase().charCodeAt(0) - 65); return row[cIdx] !== undefined ? row[cIdx] : null;
                                }) : row;
                                retAct = { 'ret': true, 'msg': `${nameFun} [get]: OK`, 'res': rowRes, };
                            } else {
                                let infAct = { ...subAct, id, raw, token, }; delete infAct.col; delete infAct.action;

                                if (actName === 'deleteLine' && !tabId) { retAct = { 'ret': false, 'msg': `${nameFun} [deleteLine]: ERRO | INFORMAR 'tabId' (NÚMERO) NO TOPO DA SEARCH`, }; }
                                else if (actName === 'update' && !subAct.col) { retAct = { 'ret': false, 'msg': `${nameFun} [update]: ERRO | INFORMAR 'col'`, }; }
                                else {
                                    let sRange = Array.isArray(subAct.col) ? subAct.col.map(c => `${c}${lineNum}`) : `${subAct.col}${lineNum}`;
                                    infAct.tab = (actName === 'deleteLine' ? tabId : tab); infAct.action = actName;
                                    if (actName === 'update') { infAct.range = sRange; } if (actName === 'deleteLine') { infAct.lineStart = lineNum; infAct.qtdLines = 1; }
                                    retAct = await googleSheetsNew(infAct);
                                }
                            }

                            if (retAct) {
                                resActions.push(retAct);
                                if (!retAct.ret) { allOk = false; searchResults[sIdx].ret = false; searchResults[sIdx].msg = `${tag}: ERRO | FALHA EM ACTIONS`; }
                            }
                        }
                        searchResults[sIdx].res.founds.push({ 'line': lineNum, 'actions': resActions, });
                    }
                }
            }

            ret['ret'] = allOk; if (!allOk) { attempts = 1; } ret['res'] = { 'searchs': searchResults, };
        }

        // TENTAR NOVAMENTE EM CASO DE ERRO
        if (ret.ret) { ret['msg'] = `${nameFun} [${action}]: OK`; } else {
            let idTabRange, text, err = identifyErr(), errOk = err.includes(`<ERR>`); err = err?.replace(`<ERR>`, '');
            if (err.includes(`TOKEN INVÁLIDO`)) { attempts = 1; } attempts--;
            idTabRange = `'${id}' '${tab}'${range ? ` '${range}'` : ''}`; text = `TENTATIVAS RESTANTES [${attempts}] → ${err}\n\n${idTabRange}`;
            console.log(`${text}${errOk ? '' : `\n\n*** ERRO SHEETS\n${errAll}`}`); // SUBSTITUI 'logConsole' | 'notification' FOI REMOVIDO (SEM ECOSSISTEMA)
            if (attempts > 0) { await sleep(3 * 1000); ret = (await googleSheetsNew({ ...inf, attempts, })); } else { ret['msg'] = `${nameFun} [${action}]: ERRO | ${err} ${idTabRange}`; }
        }

    } catch (catchErr) { ret['ret'] = false; ret['msg'] = `${nameFun}: ERRO | ${catchErr.message || catchErr}`; }
    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// ###################### SERVIDOR HTTP PURO ######################
let PORT = 5384;
let server = http.createServer((req, res) => {
    let chunks = [];
    req.on('data', (c) => { chunks.push(c); });
    req.on('end', async () => {
        let start = Date.now(), body = {}, ret;
        try {
            let raw = Buffer.concat(chunks).toString('utf-8');
            body = raw ? JSON.parse(raw) : {};
            ret = await googleSheetsNew(body);
        } catch (catchErr) { ret = { 'ret': false, 'msg': `SERVER: ERRO | ${catchErr.message || catchErr}`, }; }
        ret['ms'] = Date.now() - start;
        res.writeHead(ret.ret ? 200 : 500, { 'Content-Type': 'application/json; charset=utf-8', });
        res.end(JSON.stringify(ret));
    });
});
server.listen(PORT, () => { console.log(`SERVER FLY RODANDO NA PORTA ${PORT}`); });



