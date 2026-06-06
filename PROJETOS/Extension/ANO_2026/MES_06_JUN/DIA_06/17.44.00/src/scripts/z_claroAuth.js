let e, ee; if (!process?.argv) { e = currentFile(new Error()), ee = e; }
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
else if (!globalThis['firstFileCall']) {
    let argv = process?.argv || [], nErr = new Error(); globalThis['firstFileCall'] = nErr; await import('../resources/@export.js'); e = firstFileCall, ee = e; let runCleCon = console.log;
    function clearConsole() { if ((typeof chrome !== 'undefined')) { console.clear(); } else { let p = process.stdout; p.write('\u001b[2J\u001b[0;0H'); p.write('\x1Bc'); } } let msgQtd = 0;
    console.log = (...a) => { runCleCon.apply(console, a); msgQtd++; if (msgQtd >= (30 * 1000)) { clearConsole(); msgQtd = 0; console.log('CONSOLE LIMPO!\n'); } }; clearConsole();

    let infClaroAuth;
    infClaroAuth = { /* 'macRouter': `4c:12:65:3a:a6:4a`, */ 'macMy': `c0:4a:00:3c:f1:12`, 'key': `a8f03257474db0df9c0427c3ff416799`, }; // TP-LINK
    // infClaroAuth = { 'macRouter': `ea:20:e2:f7:a5:6a`, 'macMy': `84:37:d5:ad:99:35`, 'key': `c97e72ac1369606a6c01512259172232`, }; // GALAXY
    // infClaroAuth = { 'macRouter': `${macRouter}`, 'macMy': `f0:03:8c:54:e1:a4`, }; // [189] NOTE-HP
    // infClaroAuth = { 'macRouter': `${macRouter}`, 'macMy': `BC:F1:71:89:29:B1`, }; // [189] NOTE-ACER

    (async () => { while (true) { await z_claroAuth({ 'argv': argv.slice(2), ...infClaroAuth, }); await sleepRun((5 * (60 * 1000))); } })();
} //

async function z_claroAuth(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { /* macRouter, */ macMy, key, } = inf;

        let infApi, retApi, url, retBase64, apiPars = { e, 'object': true, 'maxConnect': 10, 'maxResponse': 10, }, msg, type = 2, pars, session, macMyClear;

        let resultado = await verificarStatusAutenticacao({ 'autenticate': (2.5 * 3600), 'validate': (5 * 60), }); if (resultado === 0 && gW.authClaro) { await logConsole({ e, ee, 'txt': `🔰 JÁ AUTENTICADO/VALIDADO`, }); return; }

        // https://www.clarowifi.com.br/clarowifi/?f=c2Vzc2lvbjpOT0tJQTc3NTA6cmpvbmV0Y29tbXVuaXR5Y29tYnI6YzA0YTAwM2NmMTEyOmE4ZjAzMjU3NDc0ZGIwZGY5YzA0MjdjM2ZmNDE2Nzk5&p=88&network_key=netwifi-rjo&user_id=c0:4a:00:3c:f1:12&otl=1&ap=58:72:c9:93:f2:a3
        // https://www.clarowifi.com.br/clarowifi/?f=c2Vzc2lvbjpOT0tJQTc3NTA6cmpvbmV0Y29tbXVuaXR5Y29tYnI6YzA0YTAwM2NmMTEyOmE4ZjAzMjU3NDc0ZGIwZGY5YzA0MjdjM2ZmNDE2Nzk5&p=88&network_key=netwifi-rjo&user_id=c0:4a:00:3c:f1:12&otl=1   &ap=4c:12:65:34:cf:d6

        // https://www.clarowifi.com.br/clarowifi/home/

        // VALIDAR CONEXÃO
        gW.authClaro = true; url = `https://www.gstatic.com/generate_204`; // url = `http://google.com`; url = `http://142.250.190.147/generate_204`; url = `http://www.msftconnecttest.com/redirect`; url = `https://i-p.show/?plain=true`;
        retApi = await api({ ...apiPars, 'method': 'GET', url, 'hideHeaders': false, }); url = retApi?.res?.url;
        console.log(url || retApi?.res?.host || retApi.msg);
        type = url?.includes('gstatic') || url?.includes('google') || url?.includes('msftconnecttest') || url?.includes('msn') || url?.includes('http') ? 1 : url?.includes('claro') ? 2 : 3;
        await logConsole({ e, ee, 'txt': `REQ: 1 <VALIDAR CONEXÃO> → ${type === 1 ? `COM INTERNET` : type === 2 ? `GERANDO SESSÃO... (CONECTADO NO WI-FI: SIM)` : 'SEM INTERNET'}`, }); if (type === 3) { return retApi; }

        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // GERAR SESSÃO (CONECTADO NO WI-FI: SIM) [SE NECESSÁRIO]
        if (type === 2) {
            pars = paramsObj(url);
            macMy = pars.user_id; // macRouter = pars.ap;
            retBase64 = await base64({ e, ...{ 'action': `decode`, 'text': `${pars.f}`, }, });
            session = retBase64.res;
        }
        macMy = macMy.toLowerCase(); macMyClear = macMy.replaceAll(':', ''); // macRouter = macRouter.toLowerCase();
        if (type === 2) {
            key = session.split(`${macMyClear}:`)[1];
            await logConsole({ e, ee, 'txt': `URL:          ${url}\nSESSÃO [ENC]: ${pars.f}\nSESSÃO [DEC]: ${session}\nMY MAC:       ${macMy}\nMY ROUTER:    {macRouter}\nKEY:          ${key}`, });
        }
        // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        // AUTENTICAÇÃO/VALIDAÇÃO
        if (resultado === 1) {
            url = `https://api-nomad.netcombowifi.com.br/portal/authenticate/community`; // AUTENTICAR (COM USUÁRIO E SENHA)
        } else {
            url = `https://api-nomad.netcombowifi.com.br/portal/community/otl`; // VALIDAR (COM SESSÃO VÁLIDA)
        }

        session = `session:NOKIA7750:rjonetcommunitycombr:${macMyClear}:${key}`;
        retBase64 = await base64({ e, ...{ 'action': `encode`, 'text': `${session}`, }, });
        session = retBase64.res;
        infApi = {
            ...apiPars, 'method': 'POST', url, 'hideHeaders': false, 'body': { 'login': `${gW.par9}`, 'password': `${gW.par10}`, },
            'headers': { 'Content-Type': 'application/json', 'p': 'PROF_NOMAD_CUSTOM', 'type': 'CLARO_RESIDENCIAL', 'session': `${session}`, },
        };
        retApi = await api(infApi);
        type = !retApi.ret || ![200,].includes(retApi?.res?.code) ? -1 : -2;
        console.log(type === -1 ? JSON.stringify(retApi) : '');
        await logConsole({ e, ee, 'txt': `REQ: 2 <${resultado === 1 ? '🔑 AUTENTICAÇÃO' : '✅ VALIDAÇÃO'}> → ${type === -1 ? `ERR (CODE: ${retApi?.res?.code})` : 'OK'}`, }); if (type === -1) { return retApi; }

        // NAVEGAR
        url = `https://api-nomad.netcombowifi.com.br/portal/community/navigate`;
        infApi = {
            ...apiPars, 'method': 'POST', url, 'hideHeaders': false, 'body': {},
            'headers': { 'Content-Type': 'application/json', 'session': `${session}`, 'Authorization': `Bearer ${retApi.res.body.data.nomadToken}`, },
        };
        retApi = await api(infApi);
        type = !(retApi?.res?.body?.code === 'SUCCESS') ? -1 : -2;
        console.log(type === -1 ? JSON.stringify(retApi) : '');
        await logConsole({ e, ee, 'txt': `REQ: 3 <NAVEGAR> → ${type === -1 ? `ERR` : `LIBERADO!${retApi?.res?.body.endTime ? ` → ${retApi?.res?.body.endTime}` : ''}`}`, }); if (type === -1) { return retApi; }

        ret['msg'] = `CLARO AUTH: OK`;
        ret['ret'] = true;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

import { promises as fs } from 'fs';

async function verificarStatusAutenticacao(config) {
    let caminhoArquivo = './logs/claroAuth.json'; let agora = Math.floor(Date.now() / 1000); let dados = { 'ultimaAutenticacao': 0, 'ultimaValidacao': 0, }; let acao = 0;
    try { dados = JSON.parse(await fs.readFile(caminhoArquivo, 'utf-8')); } catch (e) { }
    if (agora - dados.ultimaAutenticacao >= config.autenticate) { dados.ultimaAutenticacao = dados.ultimaValidacao = agora; acao = 1; }
    else if (agora - dados.ultimaValidacao >= config.validate) { dados.ultimaValidacao = agora; acao = 2; }
    if (acao > 0) { await fs.writeFile(caminhoArquivo, JSON.stringify(dados)); } return acao;
}

// CHROME | NODE
globalThis['z_claroAuth'] = z_claroAuth;


