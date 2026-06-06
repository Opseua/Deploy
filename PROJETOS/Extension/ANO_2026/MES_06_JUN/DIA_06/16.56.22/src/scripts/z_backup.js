// let retBackup = await z_backup({ 'mode': 'HIDE', }); console.log(retBackup);
// CMD → node %fileProjetos%/Extension/src/scripts/z_backup.js HIDE [OU SEM PARAMETRO}

let e, ee; if (!process?.argv) { e = currentFile(new Error()), ee = e; }
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
else if (!globalThis['firstFileCall']) {
    let argv = process?.argv || []; globalThis['firstFileCall'] = nErr; await import('../resources/@export.js'); e = firstFileCall, ee = e; let runCleCon = console.log;
    function clearConsole() { if ((typeof chrome !== 'undefined')) { console.clear(); } else { let p = process.stdout; p.write('\u001b[2J\u001b[0;0H'); p.write('\x1Bc'); } } let msgQtd = 0, nErr = new Error();
    console.log = (...a) => { runCleCon.apply(console, a); msgQtd++; if (msgQtd >= (30 * 1000)) { clearConsole(); msgQtd = 0; console.log('CONSOLE LIMPO!\n'); } }; clearConsole(); await z_backup({ 'argv': argv.slice(2), });
} //

import _fs from 'fs';
import _path from 'path';

async function z_backup(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    let err, show = true, zzz = '!fileExtension!/src/scripts/BAT/fileMsg.ahk', yyy = { e, 'withCmd': true, };
    let xxx = `hide`.toLowerCase(); if ((inf?.argv?.some(v => v?.toLowerCase()?.includes(xxx))) || (inf?.mode?.toLowerCase() === xxx)) { show = false; }
    try {
        let n = `%nircmd%`, s = `sendkeypress lwin`, w = `wait 1500`, { yea, mon, day, hou, min, monNam, } = dateHour().res; let retDateHour = `ANO_${yea}-MES_${mon}_${monNam}-DIA_${day}-HORA_${hou}.${min}`;
        let backupDestination = `${fileProjetos}/z_OUTROS/BACKUPS/${gW.devMaster}/${retDateHour}`, c, p = backupDestination;

        let fJoinOk = (...args) => _path.join(...args);

        function checkPathMatch(target, pattern, isDir, isFullRelPath) {
            let clean = pattern.replace(/^!/, '').toLowerCase().replace(/\\/g, '/'); let mustBeDir = clean.endsWith('/') || clean.endsWith('/*') || clean.endsWith('/**');
            let search = clean.replace(/\/\*\*?$/, '').replace(/\/$/, ''); if (search.startsWith('/')) { search = search.substring(1); } let regexStr = search.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
            let regexOk = new RegExp('^' + regexStr + '$', 'i'); let pathWindows = isFullRelPath ? target.replace(/\\/g, '/') : _path.basename(target); pathWindows = pathWindows.replace(/\/$/, '');
            if (!regexOk.test(pathWindows)) { return false; } if (mustBeDir && !isDir) { return false; } return true;
        }

        function isPathExcluded(relPath, isDir, excludes) {
            for (let patEntry of excludes) {
                if (Array.isArray(patEntry)) {
                    let mEx = false, mExc = false;
                    for (let sub of patEntry) { if (sub.startsWith('!')) { if (checkPathMatch(relPath, sub, isDir, true)) { mEx = true; } } else if (checkPathMatch(relPath, '!' + sub, isDir, true)) { mExc = true; } }
                    if (mEx && !mExc) { return true; }
                } else if (checkPathMatch(relPath, patEntry, isDir, true)) { return true; }
            } return false;
        }

        function copyItem(src, normBase, destRoot) {
            let rel = src.replace(normBase, ''); let dest = fJoinOk(destRoot, rel); let isDir = _fs.statSync(src).isDirectory(); if (isDir) { if (!_fs.existsSync(dest)) { _fs.mkdirSync(dest, { 'recursive': true, }); } }
            else { let dir = _path.dirname(dest); if (!_fs.existsSync(dir)) { _fs.mkdirSync(dir, { 'recursive': true, }); } _fs.copyFileSync(src, dest); } console.log(`📦 ${rel}`);
        }

        async function executeBackup({ backupPath, backupName, patternsIncludes, patternsExcludes, backupDestination, }) {
            let normBase = backupPath.replace(/\\/g, '/'); if (normBase.endsWith('/')) { normBase = normBase.slice(0, -1); } let destRoot = fJoinOk(backupDestination, backupName); let approved = [];

            function processAndCopy(fullPath) { if (approved.includes(fullPath)) { return; } approved.push(fullPath); copyItem(fullPath, normBase, destRoot); }

            function expand(dir, recursive) {
                let items = _fs.readdirSync(dir); for (let item of items) {
                    let full = fJoinOk(dir, item).replace(/\\/g, '/'); let isDir = _fs.statSync(full).isDirectory(); let rel = full.replace(normBase + '/', ''); if (isPathExcluded(rel, isDir, patternsExcludes)) {
                        console.log(`❌ /${rel}`);
                        continue;
                    } processAndCopy(full); if (isDir && recursive) { expand(full, true); }
                }
            }

            function walk(currentDir, segments, isRecursive, isOneLevel) {
                let [currentPart, ...remainingParts] = segments; let isLastPart = remainingParts.length === 0; let items = _fs.readdirSync(currentDir); for (let item of items) {
                    let full = fJoinOk(currentDir, item).replace(/\\/g, '/'); let isDir = _fs.statSync(full).isDirectory(); let rel = full.replace(normBase + '/', ''); if (isPathExcluded(rel, isDir, patternsExcludes)) {
                        console.log(`❌ /${rel}`);
                        continue;
                    } if (currentPart === '*') { processAndCopy(full); if (isDir && isRecursive) { expand(full, true); } continue; } if (item.toLowerCase() === currentPart.toLowerCase()) {
                        if (isLastPart) { processAndCopy(full); if (isDir) { if (isRecursive) { expand(full, true); } else if (isOneLevel) { expand(full, false); } } }
                        else if (isDir) { walk(full, remainingParts, isRecursive, isOneLevel); }
                    }
                }
            }

            console.log(`--- [BACKUP: ${backupName}] ---\n`);
            for (let pat of patternsIncludes) {
                let isRecursive = pat.endsWith('/**'), isOneLevel = pat.endsWith('/*'); let searchPath = pat.replace(/\/\*\*?$/, '').replace(/\/$/, '');

                console.log(pat, isRecursive, isOneLevel, searchPath);

                if (searchPath.startsWith('/')) { searchPath = searchPath.substring(1); } let segments = searchPath.split('/').filter(v => v);
                if (segments.length === 0 && (isRecursive || isOneLevel)) { expand(normBase, isRecursive); } else { walk(normBase, segments, isRecursive, isOneLevel); }
            }
        }

        let rules = {
            'backupDestination': `${backupDestination}`,
            'backups': [

                // {
                //     'backupName': 'PROJETOS', 'backupPath': `${fileProjetos}`,
                //     'patternsIncludes': [
                //         // '/Chat/*', '/Chat/src/**',
                //         '/Connection/*', '/Connection/src/**',
                //         '/Extension/*', '/Extension/src/**',
                //         '/ExtensionV3/*', '/ExtensionV3/src/**',
                //         '/Sniffer/*', '/Sniffer/src/**', // '/Sniffer/logs/Plataformas/TryRating/ANO_2026/*',
                //         '/WebScraper/*', '/WebScraper/src/**',
                //     ],
                //     'patternsExcludes': [
                //         '!/**/.git/', '!/**/.libs/', '!/**/.venv/', '!/**/node_modules/', '!/**/__pycache__/', '!/**/har_and_cookies/',
                //         '!/**/logs/', // ['!/**/logs/', '/Sniffer/logs/',],
                //         '!/**/teste/', '!/**/*teste/', '!/**/teste*/', '!/**/*teste*/', '!/**/teste.*/', '!/**/*teste.*/', '!/**/teste*.*/', '!/**/*teste*.*/',
                //         '!/**/desktop.ini', '!/**/src - Copia/', '!/**/others/',
                //     ],
                // },

                {
                    'backupName': 'WINDOWS', 'backupPath': `${fileWindows}`,
                    'patternsIncludes': [
                        // '/BAT/RECORRENTES/**',
                        // '/BAT/RUN_PORTABLE/z_OUTROS/**',
                        // '/BAT/z_ICONES/**',
                        // '/BAT/clearTemp.bat', '/BAT/firewallAllowBlockDelete.ps1',

                        '/BAT/rdpDisconnect.bat',

                        // '/PORTABLE-z_SetPath/**',
                    ],
                    'patternsExcludes': [
                        // '!/**/desktop.ini', '!/**/*.exe',
                    ],
                },

                // {
                //     'backupName': 'MENU_INICIAR', 'backupPath': `${process.env.AppData}/Microsoft/Windows/Start Menu/Programs`,
                //     'patternsIncludes': [
                //         '/**',
                //     ],
                //     'patternsExcludes': [
                //         '!/**/desktop.ini',
                //     ],
                // },

            ],
        };

        for (let bkp of rules.backups) { await executeBackup({ ...bkp, 'backupDestination': rules.backupDestination, }); }
        await commandLine({ ...yyy, 'awaitFinish': true, 'command': `${show ? `${n} ${s} & ${n} ${w} & ` : ''}${n} savescreenshotfull "${p}/screenshot.png"${show ? ` & ${n} ${s}` : ''}`, });

        await new Promise(r => { setTimeout(r, 500); }); console.log(`ZIPANDO...`); c = `!fileWindows!/PORTABLE-WinRAR/z_OUTROS/PORTABLE-7-Zip/App/7-Zip64/7z.exe`;
        c = await commandLine({ e, 'awaitFinish': true, 'command': `"${c}" a -tzip "${p}.zip" "${p}/*"`, });
        if (!c.ret) { err = `ERRO | AO ZIPAR`; ret['msg'] = `BACKUP: ${err}`; console.log(err); commandLine({ ...yyy, 'command': `${zzz} "${err}"`, }); } else if (!(await file({ e, 'action': 'del', 'path': p, })).ret) {
            err = `ERRO | AO APAGAR PASTA ANTIGA`; ret['msg'] = `BACKUP: ${err}`; console.log(err); if (show) { commandLine({ ...yyy, 'command': `${zzz} "${err}"`, }); }
        } else { p = p.split('/').pop(); p = `CONCLUIDO → '${p}.zip'`; console.log(p); if (show) { commandLine({ ...yyy, 'command': `${zzz} "${p}"`, }); } ret['res'] = p; ret['msg'] = `BACKUP: OK`; ret['ret'] = true; }

    } catch (catchErr) {
        err = `ERRO | AO FAZER BACKUPS`; console.log(err, '\n', catchErr); if (show) { commandLine({ ...yyy, 'command': `${zzz} "${err}"`, }); }
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['z_backup'] = z_backup;


