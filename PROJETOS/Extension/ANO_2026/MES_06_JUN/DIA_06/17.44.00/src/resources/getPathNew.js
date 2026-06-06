// {IMPORT FUNÇÕES} → DINAMICAMENTE QUANDO NECESSÁRIO | FUNÇÃO GENÉRICA (QUANDO O ENGINE ESTIVER ERRADO) * ENCAMINHAR PARA DEVICE
let qtd0 = 0; async function importFun(infOk = {}) {

    let { engOk, path, inf, } = infOk; qtd0++; let name = path.match(/([^\\/]+)(?=\.[^\\.]+$)/)[0], x = `${fileProjetos}`; if (qtd0 > 50) { console.log(`IMPORT FUN: ERRO | EM LOOP!!! '${path}'`); codeStop(); }
    let y = gW.devFunctions; if (engOk) {
        await import((eng ? `${gW.devRoot}://${y}` : `file://${x}/${y === 'NAO_DEFINIDO' ? 'Extension' : y}`) + `/${path.replace('./', '')}`); return globalThis[name](inf);
    } else {
        let retDevAndFun = await devFun({ 'e': import.meta.url, 'enc': true, 'data': { name, 'par': inf, }, }); return retDevAndFun;
    }
} globalThis['importFun'] = importFun; function getEngType() {
    let x = 'undefined'; x = typeof chrome !== x && chrome.runtime ? 1 : typeof global !== x ? 2 : typeof ScriptApp !== x ? 3 : 4; return { 'number': x, 'name': ['CHROME', 'NODE', 'GOOGLE', 'HTML',][x - 1], };
} globalThis['currentFile'] = function (err) { return err.stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)?.[0].replace(/[()]/g, ''); }; // globalThis['firstFileCall'] = currentFile(firstFileCall);

async function getPathNew(inf = {}) {
    let ret = { 'ret': false, };

    let { isInitialization, } = inf; let nd = 'NAO_ENCONTRADO', configOk, masterOk, res = {};

    if (isInitialization) {
        let y = getEngType(); let devEngNumber = y.number, devEngName = y.name;

        let devLetter = nd, devFunctions = nd, devRoot = nd, devProject = nd, devServer = { 'devServer': nd, }, fileConfig = 'src/config.json', fileMaster = 'src/master.json', config = { 'a': nd, }, devMaster = nd;
        if (eng) {
            // →→→ CHROME
            devLetter = 'D'; devFunctions = chrome.runtime.id; let z = firstFileCallNew.stack.split('\n')[1].split(`://${devFunctions}/`); devRoot = z[0].split('at ')[1];
            devProject = 'Downloads/Google Chrome%'; devServer = {
                'devServer': z[1], 'devChromeUser': (await new Promise((resolve) => { chrome.identity.getProfileUserInfo(u => { if (chrome.runtime.lastError) { resolve(null); return; } resolve(u.email || false); }); })),
            };

            // CONFIG.json
            configOk = await fetch(chrome.runtime.getURL(fileConfig)); configOk = await configOk.text(); try { configOk = JSON.parse(configOk); config = configOk; } catch { }
            await new Promise((resolve) => { chrome.storage.local.set(configOk, async () => { resolve(true); }); }); // STORAGE: DEFINIR

            // MASTER.json
            masterOk = await fetch(chrome.runtime.getURL(fileMaster)); masterOk = await masterOk.text(); try { masterOk = JSON.parse(masterOk); devMaster = masterOk.master; } catch { }

        } else {
            // →→→ NODE
            devFunctions = 'Extension'; let z = firstFileCallNew?.stack?.split('\n')?.[1]?.replaceAll('\\', '/')?.match(/(?:file:\/\/)?([a-zA-Z]:[^:]+\.js)/)?.[1] || false;
            if (z) { devLetter = z[0].toUpperCase(); devProject = z.split('/')[3]; devRoot = z.split(`/${devProject}/`)[0].split(':/')[1]; devServer = { 'devServer': z.split(`/${devProject}/`)[1], }; }

            globalThis['__fs'] = (await import('fs')); let fileConfigMaster = `${devLetter}:/${devRoot}/${devFunctions}`;

            // CONFIG.json
            configOk = await __fs.promises.readFile(`${fileConfigMaster}/${fileConfig}`, 'utf8'); try { configOk = JSON.parse(configOk); config = configOk; } catch { }

            // MASTER.json
            masterOk = await __fs.promises.readFile(`${fileConfigMaster}/${fileMaster}`, 'utf8'); try { masterOk = JSON.parse(masterOk); devMaster = masterOk.master; } catch { }

        }

        globalThis['config'] = config;
        globalThis['fileProjetos'] = `${devLetter}:/${devRoot}`;
        devServer['devServer'] = `${devServer.devServer.split('/').reverse()[0].split('.js')[0]}.js`;
        res = {
            fileConfig,
            devMaster,
            devEngNumber,
            devEngName,
            devLetter,
            devRoot,
            devFunctions,
            devProject,
            ...devServer,
        };
        globalThis['gW'] = res;
        // console.log(gW); // console.log(config);

        await import('./@functions.js');

    } else {
        // ARQUIVO DA PILHA → [PRIMEIRO]
        let pathsKeep = []; for (let [index, value,] of inf.e.stack.split('\n').entries()) { if (value.includes(gW.devRoot) && !value.includes('node_modules')) { pathsKeep.push(value); } }
        let paths = pathsKeep[0]; paths = paths.split(`${gW.devFunctions}/`)[1]; paths = paths.split(':'); let devLine = paths[1], devFile = paths[0];
        res = {
            devFile,
            devLine,
        };

    }

    ret['ret'] = true;
    ret['msg'] = `GET PATH NEW: OK`;
    ret['res'] = res;

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['getPathNew'] = getPathNew;


