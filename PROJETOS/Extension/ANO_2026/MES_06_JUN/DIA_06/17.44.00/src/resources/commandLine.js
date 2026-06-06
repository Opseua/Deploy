// let infCommandLine, retCommandLine; // 'withCmd': true (CRIA OUTRO PROCESSO DO CMD)
// infCommandLine = {
//     e, // 'notBackground': true, 'awaitFinish': true, 'notAdm': true, 'withCmd': true, 'view': false, 'delay': 0, 'terminalPath': `!letter!:/PASTA 1`, 'notReplaceVars': true,
//     // ****************** NORMAL
//     // 'command': `notepad`,
//     // ****************** CMD {withCmd → true}
//     // 'command': `notepad & explorer`,
//     // ****************** (SEM ESPAÇO)
//     // 'command': `D:/ARQUIVOS/BAT.bat AAA`,
//     // 'command': `%fileWindows%/PORTABLE-Notepad++/notepad++.exe D:/AAA.txt`,
//     // 'command': `!fileProjetos!/Sniffer/src/z_OUTROS/server.vbs OFF`,
//     // ****************** (COM ESPAÇO)
//     // 'command': `"D:/ARQUIVOS/BAT.bat" "AAA BBB"`,
//     // 'command': `"%fileWindows%/PORTABLE-Notepad++/notepad++.exe" "D:/AAA BBB.txt"`,
//     // 'command': `"!fileProjetos!/Sniffer/src/z_OUTROS/server.vbs" "OFF" "FORCE_STOP"`,
//     // ****************** (MESMO PROCESSO)
//     'newMode': true, 'command': `!fileWindows!/PORTABLE-VLC/DISCO_C/Program Files/VideoLAN/VLC/vlc.exe`, // COM OS SEM ASPAS DUPLAS (A FUNÇÃO JÁ CORRIGE)
//     'args': [`D:\\ARQUIVOS\\PROJETOS\\IPTV\\logs\\Video\\#_NAO_COPIAR\\_10_22-10.06.54.511.ts`, `--meta-title=XX:XX:XX [PROV] (AAA) Telecine Action`, `--extraintf=http`, `--http-port=8081`,],
// };
// retCommandLine = await commandLine(infCommandLine); console.log(retCommandLine);

let e = currentFile(new Error()), ee = e; let libs = { 'child_process': {}, };
async function commandLine(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `COMMAND LINE`; e = inf.e || e;
    try {
        /* IMPORTAR BIBLIOTECA [NODE] */ if (libs['child_process']) { libs['child_process']['exec'] = 1; libs['child_process']['spawn'] = 1; libs = await importLibs(libs, 'commandLine'); }

        let { command, args = [], awaitFinish, notAdm, notBackground, view, delay = 0, terminalPath, withCmd = false, notReplaceVars, newMode, ignoreAddOrRemoveQuotes = false, } = inf; let res = {};
        let addOrRemoveQuotes = (txt, addOrRemove) => {
            let t = txt.trim(); let h = (t.length >= 2 && t[0] === `"` && t[t.length - 1] === `"`); if (addOrRemove) { if (h) { return t; } return `"${t}"`; } if (h) { return t.substring(1, t.length - 1); } return t;
        };

        if (!command) { ret['msg'] = `${nameFun}: ERRO | INFORMAR O 'command'`; return ret; } if (newMode) { notBackground = true; if (view === undefined) { view = true; } }

        if (!notBackground) {
            // PARAMETROS
            let ps = []; if (!view) { ps.push(`/NOCONSOLE`); } if (notAdm) { ps.push(`/NONELEVATED`); } else { ps.push(`/RUNAS`); } if (delay) { ps.push(`/DELAY=${delay}`); } if (awaitFinish) { ps.push(`/WAIT`); }
            if (terminalPath) { let ter = terminalPath; if (!ter.startsWith(`"`) || !ter.endsWith(`"`)) { ter = `"${ter}"`; } ter = ter.replace(/\//g, `\\`); ps.push(`/D=${ter}`); }

            // EXECUTAR COM CMD (EM CASOS ESPECÍFICOS)
            let includesDoubleQuotes = false; if (command.includes(`.vbs`) || command.includes(`.bat`) || command.includes(`.lnk`)) { includesDoubleQuotes = true; withCmd = true; }

            // ADICIONAR ASPAS EM VOLTA (EM CASOS ESPECÍFICOS)
            if (!withCmd || includesDoubleQuotes) { command = `"${command}"`; }

            // COMANDO FINAL
            command = `"%3_BACKGROUND%"${ps.length > 0 ? ' ' + ps.join(' ') : ''} ${withCmd ? `"cmd.exe /c ${command}"` : `${command}`}`;
        }

        // SUBSTITUIR VARIÁVEIS DE AMBIENTE (SE NÃO FOR TRUE)
        if (!notReplaceVars) {
            command = replaceVars({ 'content': command, });
        }

        if (!newMode) {
            res = await new Promise((resolve) => {
                let child = _exec(command, (error, _stdout, stderr) => {
                    resolve({ 'msg': error, 'res': stderr, });
                });
                child.stdout.on('data', () => { }); child.stderr.on('data', () => { });
            });
        } else {
            // ADICIONAR OU REMOVER ASPAS DUPLAS AO REDOR (SE NECESSÁRIO)
            if (!ignoreAddOrRemoveQuotes) {
                command = addOrRemoveQuotes(command, withCmd); for (let [index, value,] of args.entries()) { args[index] = addOrRemoveQuotes(value, withCmd); }
            }
            res = await new Promise((resolve) => {
                let child = _spawn(command, args, { 'windowsHide': !view, 'shell': withCmd, }); let error = null; // let saida = '';
                child.stdout.on('data', () => { }); child.stderr.on('data', (/* chunk */) => { /* saida += chunk.toString(); */ }); child.on('error', (err) => { error = err; });
                child.on('close', (_code, _signal) => {
                    resolve({ 'msg': error, });
                });
            });
        }

        if (res.msg) {
            ret['msg'] = `${nameFun}: ERRO | ${res.msg}`;
        } else {
            ret['msg'] = `${nameFun}: OK`;
            ret['ret'] = true;
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['commandLine'] = commandLine;


