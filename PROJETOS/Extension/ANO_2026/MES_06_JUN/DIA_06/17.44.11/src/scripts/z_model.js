// let infModel, retModel
// infModel = { e, 'chaveUm': 'valorUm', 'chaveDois': 'valorDois' }
// retModel = await model(infModel); console.log(retModel)

let e = currentFile(new Error()), ee = e; let libs = { 'net': {}, };
async function model(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `MODEL`; e = inf.e || e; function setRet(p1, p2, p3) { ret = setRetRun({ p1, p2, p3, nameFun, }); return ret; }
    try {
        /* IMPORTAR BIBLIOTECA [NODE] */  if (libs['net']) { libs['net']['net'] = 1; libs = await importLibs(libs, 'serverRun [Sniffer]'); }

        let { text = 'aaa', folder = 'bbb', } = inf;

        let retRegex = regex({ e, 'pattern': `UM(.*?)TRES`, text, 'nada': folder, }); console.log(retRegex);

        ret['res'] = `resposta aqui`;
        ret['msg'] = `${nameFun}: OK`;
        ret['ret'] = true;

        // → { ret: false, msg: 'MODEL: ERRO | VALIDAÇÃO' }
        ret = setRet(`VALIDAÇÃO`);

        // → { ret: false, msg: 'MODEL [get]: ERRO | VALIDAÇÃO' }
        ret = setRet(`get`, `VALIDAÇÃO`);

        // → { ret: true, msg: 'AAA', res: 'RESULTADO' }
        ret = setRet({ 'ret': true, 'msg': 'AAA', 'res': 'RESULTADO', });

        // → { ret: true, msg: 'MODEL: OK | CONCLUÍDO', res: 'RESULTADO' }
        ret = setRet(`CONCLUÍDO`, { 'ret': true, 'res': 'RESULTADO', });

        // → { ret: false, msg: 'MODEL [get]: ERRO | VALIDAÇÃO' }
        ret = setRet('get', `VALIDAÇÃO`, { 'ret': false, });

        // → { ret: true, msg: 'MODEL [get]: OK | CONCLUÍDO', res: 'RESULTADO' }
        ret = setRet('get', `CONCLUÍDO`, { 'ret': true, 'res': 'RESULTADO', });

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return setRet(ret);
}

// CHROME | NODE
globalThis['model'] = model;


