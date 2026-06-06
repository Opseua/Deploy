// 'functionLocal': true, 'encoding': false (CONTEUDO BUFFER) | 'latin1' [PADRÃO 'utf8'] | 'editSec': (60) SEGUNDOS: 60 / (2 * (60 * 60)) HORAS: 2 / (5 * (24 * 60 * 60)) DIAS: 5 [- OU +]
// 'ignoreEditDeep': true (NÃO USAR DATA DE EDIÇÃO PRODUNDA NAS PASTAS) | 'filesDeepFirst': true/false (ORDENAR OS ARQUIVOS PROFUNDOS PRIMEIRO)
// let infFile, retFile;
// infFile = { e, 'action': 'relative', 'path': `./PASTA/arquivo.txt`, };
// infFile = { e, 'action': 'write', 'path': `./PASTA/arquivo.txt`, 'add': true, 'content': `1234\n`, };
// infFile = { e, 'action': 'isFolder', 'path': `./PASTA/`, };
// infFile = { e, 'action': 'read', 'path': `./PASTA/arquivo.txt`, };
// infFile = { e, 'action': 'md5', 'path': `./PASTA/arquivo.txt`, };
// infFile = { e, 'action': 'copy', 'path': `./PASTA/arquivo.txt`, 'pathNew': `./PASTA/arquivoCopy.txt`, };
// infFile = { e, 'action': 'change', 'path': `./PASTA/arquivo.txt`, 'pathNew': `./PASTA/arquivo2.txt`, };
// infFile = { e, 'action': 'list', 'path': `./PASTA`, 'max': 5000, 'subFolders': 4, 'filesDeepFirst': true, 'editSec': -60, };
// infFile = { e, 'action': 'del', 'path': `./PASTA`, };
// infFile = { e, 'action': 'storage', 'path': `C:`, }; // SEMPRE COMO 'ADM'!!!
// retFile = await file(infFile); console.log(retFile);

let e = currentFile(new Error()), ee = e; let libs = { 'crypto': {}, 'child_process': {}, };
async function file(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { action = false, functionLocal = false, path = false, pathNew = false, } = inf;

        // SUBSTITUIR VARIÁVEIS DE AMBIENTE
        let retFile, pathAndPathNew = `${path || 'NADA'}#_SPLIT_#${pathNew || 'NADA'}`; pathAndPathNew = replaceVars({ 'content': pathAndPathNew, }).split('#_SPLIT_#');
        // path = pathAndPathNew[0] === 'NADA' ? false : pathAndPathNew[0]; inf.path = path; pathNew = pathAndPathNew[1] === 'NADA' ? false : pathAndPathNew[1]; inf.pathNew = pathNew;
        let formatPath = (val) => val === 'NADA' ? false : val?.replaceAll('\\', '/'); inf.path = formatPath(pathAndPathNew[0]); inf.pathNew = formatPath(pathAndPathNew[1]);

        if (!action || !['write', 'read', 'del', 'inf', 'relative', 'list', 'change', 'copy', 'md5', 'isFolder', 'storage',].includes(action)) { ret['msg'] = `FILE: ERRO | INFORMAR O 'action'`; }
        else if (typeof functionLocal !== 'boolean' && action !== 'inf' && !path.includes(':')) { ret['msg'] = `FILE: ERRO | INFORMAR O 'functionLocal'`; }
        else if (action !== 'inf' && (!path || path === '')) { ret['msg'] = `FILE: ERRO | INFORMAR O 'path'`; } else {
            function formatBytes(b, d = 2) {
                if (b === 0) { return '0 Bytes'; } let i = Math.floor(Math.log(b) / Math.log(1024)); return parseFloat((b / Math.pow(1024, i)).toFixed(d < 0 ? 0 : d)) + ' ' + ['bytes', 'KB', 'MB', 'GB',][i];
            } function typeEncoding(e) { e = e === false ? undefined : e === true || !e ? 'utf8' : e; return e; } function rawText(inf = {}) {
                let { obj, concat, } = inf; let ret = ''; try {
                    if ((/<!.* html>.*<\/html>/s.test(obj) || !(typeof obj === 'object'))) { return obj; } else {
                        let raw = ''; concat = concat || `\n\n######################################################################\n\n`;
                        for (let c in obj) { if (typeof obj[c] === 'object') { for (let sC in obj[c]) { raw += obj[c][sC] + concat; } } else { raw += obj[c] + concat; } } ret = `${JSON.stringify(obj)}\n\n\n\n${raw}`;
                    }
                } catch { } return ret;
            } // ****************************************************************************************************************************************

            async function fileRelative(inf = {}) {
                let { path, functionLocal, } = inf; let resNew = { 'ret': false, }; try {
                    let relative = path, relativeParts; function runPath(pp, par) {
                        if (pp.startsWith('./')) { pp = pp.slice(2); } else if (relative.startsWith('/')) { pp = pp.slice(1); }
                        par = par ? `${gW.root}${eng ? ':/' : ''}/${gW.functions}` : `${eng ? `` : `${gW.root}/`}${gW.project}`; let pathFull = par.split('/'); relativeParts = pp.split('/');
                        while (pathFull.length > 0 && relativeParts[0] === '..') { pathFull.pop(); relativeParts.shift(); } let retRel = pathFull.concat(relativeParts).join('/');
                        if (retRel.endsWith('/.')) { retRel = retRel.slice(0, -2); } else if (retRel.endsWith('.') || retRel.endsWith('/')) { retRel = retRel.slice(0, -1); } return retRel;
                    } let res = [`${eng && functionLocal ? '' : `${letter}:/`}${runPath(path, !!functionLocal)}`,]; resNew['ret'] = true; resNew['msg'] = `FILE [RELATIVE]: OK`; resNew['res'] = res; return resNew;
                } catch { delete resNew['res']; resNew['msg'] = `FILE [RELATIVE]: ERRO | AO CRIAR PATH RELATIVO '${path}'`; } return resNew;
            }

            async function fileWrite(inf = {}) {
                let { functionLocal, path, add = false, content, raw, encoding, } = inf; encoding = typeEncoding(encoding); let resNew = { 'ret': false, }; try {
                    if (!content || content === '') { resNew['msg'] = `FILE [WRITE]: ERRO | INFORMAR O 'content'`; } else {
                        if (raw) { content = rawText({ e, 'obj': content, }); /* RAW */ } else if (encoding && typeof content === 'object') { content = JSON.stringify(content); /* OBJETO */ }
                        if (path.includes(':')) { if (eng) { path = path.split(':/')[1]; } } else {
                            retFile = await fileRelative({ path, 'functionLocal': functionLocal && !eng, }); path = retFile.res[0];
                        } if (eng) { // CHROME | REMOVER CARACTERES NÃO ACEITOS PELO WINDOWS E DEFINIR O MÁXIMO DE 250
                            if (path.includes('%/')) { path = path.split('%/')[1]; } else if (path.includes(':')) { path = path.split(':/')[1]; } if (add) {
                                retFile = await fileRead({ path, 'functionLocal': functionLocal && !eng, }); content = `${retFile.res || ''}${content}`;
                            } let blob = new Blob([content,], { 'type': 'text/plain', }); path = path.substring(0, 250).replace(/[<>:"\\|?*]/g, ''); // 'overwrite' LIMPA | 'uniquify' ADD (1), (2)... NO FINAL
                            let downloadOptions = { 'url': URL.createObjectURL(blob), 'filename': path, 'saveAs': false, 'conflictAction': 'overwrite', }; chrome.downloads.download(downloadOptions);
                        } else { // NODE | REMOVER CARACTERES NÃO ACEITOS PELO WINDOWS E DEFINIR O MÁXIMO DE 250
                            let pathLetter = path.charAt(0); path = path.substring(0, 250).replace(/[<>:"\\|?*]/g, '').replace(pathLetter, `${pathLetter}:`); // DENTRO DE UMA PASTA (CRIAR ELA)
                            if (path.split('/').length > 2) { await _fs.promises.mkdir(fDirname(path), { 'recursive': true, }); }
                            let options = { 'flag': add ? 'a' : 'w', }; if (encoding) { options['encoding'] = encoding; } await _fs.promises.writeFile(path, content, options);
                        } resNew['ret'] = true; resNew['msg'] = `FILE [WRITE]: OK`; resNew['res'] = path;
                    }
                } catch { delete resNew['res']; resNew['msg'] = `FILE [WRITE]: ERRO | AO ESCREVER ARQUIVO '${path}'`; } return resNew;
            }

            async function fileRead(inf = {}) {
                let { functionLocal, path, encoding, } = inf; encoding = typeEncoding(encoding); let resNew = { 'ret': false, }; try {
                    let retFetch; if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; }
                    let options = path.match(/\.(jpg|jpeg|png|ico)$/) ? undefined : encoding; if (eng) { // CHROME
                        if (!functionLocal) { path = `file:///${path}`; } path = path.replace('%', ''); // ENCODIFICAR PATH *********************
                        let pathParts = path.replace('file:///', '').split(':/'); path = (path.includes('file:///') ? 'file:///' : '') + pathParts[0] + ':/' + pathParts[1].split('/').map(encodeURIComponent).join('/');
                        retFetch = await fetch(path); if (encoding === false || options === undefined) { retFetch = await retFetch.arrayBuffer(); retFetch = new Uint8Array(retFetch); }
                        else { retFetch = await retFetch.text(); if (retFetch.includes('The Chromium Authors')) { throw new Error('erro'); } }
                    } else { retFetch = await _fs.promises.readFile(path, options); /* NODE */ } resNew['ret'] = true; resNew['msg'] = `FILE [READ]: OK`; resNew['res'] = retFetch;
                } catch { delete resNew['res']; resNew['msg'] = `FILE [READ]: ERRO | AO LER ARQUIVO '${path}'`; } return resNew;
            }

            async function fileDel(inf = {}) {
                let { functionLocal, path, } = inf; let resNew = { 'ret': false, }; try {
                    if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; } async function delP(t) {
                        try {
                            let s = await _fs.promises.stat(t); if (s.isDirectory()) { let as = await _fs.promises.readdir(t); for (let a of as) { let c = fJoin(t, a); await delP(c); } await _fs.promises.rmdir(t); }
                            else { await _fs.promises.unlink(t); }
                        } catch (catchErr) { throw new Error(catchErr); }
                    } await delP(path); resNew['ret'] = true; resNew['msg'] = `FILE [DEL]: OK`; return resNew;
                } catch { delete resNew['res']; resNew['msg'] = `FILE [DEL]: ERRO | AO DELETAR '${path}'`; } return resNew;
            }

            async function fileListLegacy(inf = {}) {
                let { functionLocal, path, max, } = inf; let resNew = { 'ret': false, }; try {
                    if (!max || max === '') { resNew['msg'] = `FILE [LIST]: ERRO | INFORMAR O 'max'`; } else {
                        if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; } function getStatus(name) {
                            let status = _fs.statSync(name); status['atime'] = new Date(status.atime.getTime() - (3 * 60 * 60 * 1000)); status['mtime'] = new Date(status.mtime.getTime() - (3 * 60 * 60 * 1000));
                            status['ctime'] = new Date(status.ctime.getTime() - (3 * 60 * 60 * 1000)); status['birthtime'] = new Date(status.birthtime.getTime() - (3 * 60 * 60 * 1000)); return status;
                        } let entries = await _fs.promises.readdir(path), result = [], count = 0, isFolder, stats, size; for (let entry of entries) {
                            if (count >= max) { break; } let fullPath = fJoin(path, entry); try {
                                let md5 = false; count++; isFolder = _fs.statSync(fullPath).isDirectory(); stats = getStatus(fullPath); if (!isFolder) { size = await _fs.promises.stat(fullPath); size = size.size; }
                                if (!isFolder && size && size <= (1 * 1024 * 1024)) { retFile = await fileMd5({ 'path': fullPath, }); md5 = retFile.res; } else if (!isFolder) { md5 = `arquivo muito grande`; }
                                result.push({ 'ret': true, isFolder, 'name': entry, 'path': fullPath.replace(/\\/g, '/'), 'edit': stats.mtime.toISOString(), 'size': size ? formatBytes(size) : false, md5, });
                            } catch { result.push({ 'ret': false, 'name': entry, 'path': fullPath.replace(/\\/g, '/'), }); }
                        } let retOrder = result.sort((a, b) => { if (a.isFolder && !b.isFolder) { return -1; } else if (!a.isFolder && b.isFolder) { return 1; } else { return a.name.localeCompare(b.name); } });
                        let res = retOrder; resNew['ret'] = true; resNew['msg'] = `FILE [LIST]: OK`; resNew['res'] = res;
                    }
                } catch { delete resNew['res']; resNew['msg'] = `FILE [LIST]: ERRO | AO LISTAR '${path}'`; } return resNew;
            }

            async function fileList(inf = {}) {
                let { functionLocal, path, max, subFolders = 0, filesDeepFirst, ignoreEditDeep = false, editSec = 0, } = inf; let resNew = { 'ret': false, }; try {
                    let r = await fileListLegacy({ functionLocal, path, max, }); if (!r.ret || !r.res?.length) { return r; } let all = [...r.res,], count = all.length, folders = all.filter(f => f.isFolder), level = 0;
                    let fDF = filesDeepFirst; while (folders.length && level < subFolders && count < max) {
                        let nextFolders = []; for (let folder of folders) {
                            if (count >= max) { break; } let sub = await fileListLegacy({ functionLocal, 'path': folder.path, max, }); if (!sub.ret || !sub.res?.length) { continue; } let remaining = max - count;
                            let toAdd = sub.res.slice(0, remaining); all.push(...toAdd); count += toAdd.length; for (let f of toAdd) { if (f.isFolder) { nextFolders.push(f); } }
                        } folders = nextFolders; level++;
                    } if (!ignoreEditDeep) {
                        let fileItems = all.filter(f => !f.isFolder && f.edit); let foldersOnly = all.filter(f => f.isFolder); for (let folder of foldersOnly) {
                            let p = folder.path + '/'; let filesInFolder = fileItems.filter(f => f.path.startsWith(p)); folder.edit = filesInFolder.length ? filesInFolder.map(f => f.edit).sort().pop() : folder.edit;
                        }
                    } if (fDF === true) { all.sort((a, b) => b.path.split('/').length - a.path.split('/').length); } else if (fDF === false) { all.sort((a, b) => a.path.split('/').length - b.path.split('/').length); }
                    let filterEdit = (n, r, s) => r.filter(f => { if (!f.edit) { return false; } let t = new Date(f.edit).getTime() / 1000; return s >= 0 ? t < n - s : t > n + s; });
                    if (editSec !== 0) { all = filterEdit(Math.trunc(Date.now() / 1000) - 3 * 3600, all, (editSec)); } resNew['ret'] = true; resNew['msg'] = `FILE [LIST NEW]: OK`; resNew['res'] = all;
                } catch { delete resNew.res; resNew['msg'] = `FILE [LIST NEW]: ERRO | AO LISTAR '${path}'`; } return resNew;
            }

            async function fileChange(inf = {}) {
                let { functionLocal, path, pathNew, action, } = inf; let resNew = { 'ret': false, }; try {
                    if (!pathNew || pathNew === '') { resNew['msg'] = `FILE [${action.toUpperCase()}]: ERRO | INFORMAR O 'pathNew'`; } else {
                        pathNew = pathNew.replace(/!letter!/g, letter); if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; }
                        if (!pathNew.includes(':')) { retFile = await fileRelative({ 'path': pathNew, functionLocal, }); pathNew = retFile.res[0]; }
                        await _fs.promises.mkdir(fDirname(pathNew), { 'recursive': true, }); if (action === 'change') { await _fs.promises.rename(path, pathNew); /* MOVER */ }
                        else { await _fs.promises.copyFile(path, pathNew); /* COPIAR */ } resNew['ret'] = true; resNew['msg'] = `FILE [${action.toUpperCase()}]: OK`; resNew['res'] = pathNew;
                    }
                } catch { delete resNew['res']; resNew['msg'] = `FILE [${action.toUpperCase()}]: ERRO | AO MOVER/COPIAR ARQUIVO '${path}'`; } return resNew;
            }

            async function fileMd5(inf = {}) {
                /* IMPORTAR BIBLIOTECA [NODE] */ if (libs['crypto']) { libs['crypto']['createHash'] = 1; libs = await importLibs(libs, 'fileMd5'); }
                let { functionLocal, path, } = inf; let resNew = { 'ret': false, }; try {
                    if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; } let fileContent = await _fs.promises.readFile(path);
                    let md5 = _createHash('md5').update(fileContent).digest('hex'), res = md5; resNew['ret'] = true; resNew['msg'] = `FILE [MD5]: OK`; resNew['res'] = res;
                } catch { delete resNew['res']; resNew['msg'] = `FILE [MD5]: ERRO | AO CHECAR MD5 '${path}'`; } return resNew;
            }

            async function fileIsFolder(inf = {}) {
                let { functionLocal, path, listRead, max = 200, } = inf; let resNew = { 'ret': false, }; try {
                    if (!path.includes(':')) { retFile = await fileRelative({ path, functionLocal, }); path = retFile.res[0]; }
                    let res = _fs.statSync(path).isDirectory(); resNew['ret'] = true; if (!listRead) { resNew['ret'] = true; resNew['msg'] = `FILE [IS FOLDER]: OK`; resNew['res'] = res; } else if (res) {
                        retFile = await fileListLegacy({ e, 'action': 'list', path, max, }); resNew = retFile; // USADO SOMENTE NO 'ARQUIVOS WEB' DO SEVIDOR | É PASTA [LISTAR] | É ARQUIVO [LER]
                    } else { resNew['ret'] = true; resNew['msg'] = `FILE [IS FOLDER]: OK`; retFile = await fileRead({ path, 'functionLocal': functionLocal && !eng, }); resNew = retFile; }
                } catch { delete resNew['res']; resNew['msg'] = `FILE [IS FOLDER]: ERRO | AO CHECAR SE É PASTA '${path}'`; } return resNew;
            }

            async function fileStorage(inf = {}) {
                /* IMPORTAR BIBLIOTECA [NODE] */ if (libs['child_process']) { libs['child_process']['exec'] = 1; libs = await importLibs(libs, 'fileStorage'); }
                let { path, } = inf; let resNew = { 'ret': false, }; try {
                    let rExec = await new Promise((resolve) => { _exec(`fsutil volume diskfree ${path.replace(':', '')}:`, (err, resOk, errm) => { if (err || errm) { resolve(false); } else { resolve(resOk); } }); });
                    resNew['res'] = {}; for (let [index, value,] of rExec.split('\n').entries()) {
                        if (value.includes('Total de bytes da cota dispon') || value.includes('Total de bytes     ') || value.includes('Bytes usados     ') || value.includes('Total de bytes reservados')) {
                            let valueNew = Number(value.replace(/:  /g, ': ').trim().split(': ')[1].split(' ')[0].replace(/\./g, ''));
                            if (value.includes('Total de bytes da cota dispon')) { resNew.res['free'] = valueNew; resNew.res['freeFormated'] = formatBytes(valueNew); }
                            else if (value.includes('Total de bytes     ')) { resNew.res['total'] = valueNew; resNew.res['totalFormated'] = formatBytes(valueNew); }
                            else if (value.includes('Bytes usados     ')) { resNew.res['used'] = valueNew; resNew.res['usedFormated'] = formatBytes(valueNew); }
                            else if (value.includes('Total de bytes reservados') && resNew.res['used']) { resNew.res['used'] = resNew.res['used'] + valueNew; resNew.res['usedFormated'] = formatBytes(resNew.res['used']); }
                        }
                    } resNew['ret'] = true; resNew['msg'] = `FILE [STORAGE]: OK`;
                } catch { delete resNew['res']; resNew['msg'] = `FILE [STORAGE]: ERRO | AO OBTER INFORMAÇÕES DO DISCO '${path}'`; } return resNew;
            }

            // ****************************************************************************************************************************************
            if (action === 'write') { return await fileWrite(inf); } else if (action === 'read') { return await fileRead(inf); } else if (action === 'del' && !eng) { return await fileDel(inf); }
            else if (action === 'relative') { return await fileRelative(inf); } else if (action === 'list' && !eng) { return await fileList(inf); }
            else if (['change', 'copy',].includes(action) && !eng) { return await fileChange(inf); } else if (action === 'md5' && !eng) { return await fileMd5(inf); }
            else if (action === 'isFolder' && !eng) { return await fileIsFolder(inf); } else if (action === 'storage' && !eng) { return await fileStorage(inf); }
            ret['msg'] = `FILE: ERRO | ACTION '${action}' NÃO DISPONÍVEL NO AMBIENTE`;
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['file'] = file;


