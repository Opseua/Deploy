// 'functionLocal': true/CHAVE_AUSENTE → SALVA EM 'PROJETOS/Extension/src/config.json'
// 'functionLocal': false              → SALVA EM 'PROJETOS/__ProjetoAtual__/src/config.json'
// 'path': `!fileProjetos!/TESTE/arquivoConfig.json`
// 'path': `./logs/arquivoConfig.json`

// let infConfigStorage, retConfigStorage; // 'returnValueKey' → true | 'returnValueAll' → true | 'concat': true | 'key' → '*'
// infConfigStorage = { e, 'action': 'set', 'key': 'NomeDaChave', 'value': `Valor da chave`, }; // QUALQUER TIPO
// infConfigStorage = { e, 'action': 'addInArr', 'key': 'NomeDaChave', 'value': 444, }; // QUALQUER TIPO
// infConfigStorage = { e, 'action': 'addInObj', 'key': 'NomeDaChave', 'value': { 'keyNewC': 'valueC', 'keyNewD': 'valueD', }, }; // APENAS OBJETO!!!
// infConfigStorage = { e, 'action': 'get', 'key': 'NomeDaChave', };
// infConfigStorage = { e, 'action': 'del', 'key': 'NomeDaChave', };
// retConfigStorage = await configStorage(infConfigStorage); console.log(retConfigStorage);

// let cs;
// cs = await csf(['',]); cs = cs.res; // ***** CS ***** GET VALOR DO 'reg.json'
// console.log(cs);
// cs = await csf([{ 'a': 'b', },]); cs = cs.res; // ***** CS ***** SET VALOR NO 'reg.json'
// console.log(cs);

let e = currentFile(new Error()), ee = e;
async function configStorage(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { action, functionLocal = true, key, value = '#_VAZIA_#', path = gW.conf, returnValueKey = false, returnValueAll = false, concat = false, } = inf;

        let type = eng ? 'STORAGE' : 'CONFIG'; functionLocal = eng ? true : functionLocal; let acts = ['set', 'get', 'del', 'addInArr', 'addInObj',], typeValue = getTypeof(value);

        async function processJson(inf = {}) {
            let { action, key, value, config, } = inf; let ret = false, msg, res; if (eng) { // CHROME
                let dados = await new Promise((resolve) => { chrome.storage.local.get(null, async (result) => { resolve(result); }); }); config = { ...dados, ...config, };
            } let errAdd = false, temp, typeConfig;
            if (['get', 'del',].includes(action) && key !== '*' && !config[key]) {
                msg = `${type} [${action}]: ERRO | key '${key}' NÃO ENCONTRADA`;
            } else if (action === 'set') {
                // ### SET
                if (key === '*') { config = value; } else { config[key] = value; } ret = true;
            } else if (action === 'get') {
                // ### GET
                ret = true;
            } else if (action === 'del') {
                // ### DEL
                if (key === '*') { config = {}; } else { delete config[key]; } ret = true;
            } else if (action === 'addInArr') {
                // ### ADD (IN ARR)
                temp = config[key] || []; typeConfig = getTypeof(temp);
                if (typeConfig !== 'array') { errAdd = true; } else { temp.push(...(concat ? Array.isArray(value) ? value : [value,] : [value,])); config[key] = temp; ret = true; }
            } else if (action === 'addInObj') {
                // ### ADD (IN OBJ)
                temp = config[key] || {}; typeConfig = getTypeof(temp);
                if (typeConfig !== 'object') { errAdd = true; } else { temp = { ...temp, ...value, }; config[key] = temp; ret = true; }
            }
            if (errAdd) { msg = `${type} [${action}]: ERRO | TIPO INCOMPATÍVEL (CONFIG → '${typeConfig}') (value → '${typeValue}')`; } if (ret) { msg = `${type} [${action}]: OK`; res = config; } return { ret, msg, res, };
        }

        if (['addInArr', 'addInObj',].includes(action) & key === '*') { key = false; } if (path && (path.includes('!') || path.includes('%'))) { path = replaceVars({ 'content': path, }); }
        else if (path && !path.includes(':')) { path = await file({ e, 'action': 'relative', path, functionLocal, }); path = path.res[0]; }

        if (!eng && Array.isArray(inf) && inf.length === 1) { // ### CS
            inf['path'] = `${fileProjetos}/${gW.functions}/logs/reg.json`; let dt, rf = {};
            if (inf[0] === '' || inf[0] === '*') { rf = await file({ e, 'action': 'read', path, functionLocal, }); if (!rf.ret) { dt = {}; } else { dt = JSON.parse(rf.res).dt; } }
            else { dt = typeof inf[0] === 'object' ? inf[0] : { 'key': inf[0], }; } if (!rf.ret) { rf = await file({ e, 'action': 'write', path, 'content': JSON.stringify({ dt, }, null, 2), functionLocal, }); }
            ret['res'] = dt; ret['ret'] = true; ret['msg'] = 'CS: OK';
        } else if (!acts.includes(action)) {
            ret['msg'] = `${type} ERRO | INFORMAR O 'action' → [${acts}]`;
        } else if (!(getTypeof(key) === 'string' && key.trim().length > 0)) {
            ret['msg'] = `${type} [${action}]: ERRO | INFORMAR A 'key'`;
        } else if (['set', 'addInArr', 'addInObj',].includes(action) && value === '#_VAZIA_#') {
            ret['msg'] = `${type} [${action}]: ERRO | INFORMAR O 'value'`;
        } else if (((['set',].includes(action) && key === '*') || ['addInObj',].includes(action)) && typeValue !== 'object') {
            ret['msg'] = `${type} [${action}]: ERRO | 'value' NÃO É OBJETO`;
        } else {

            let config, ok, retFile = await file({ e, 'action': 'read', path, functionLocal, }); if ((['get', 'del',].includes(action) || (eng)) && !retFile.ret) { return retFile; }
            config = retFile.ret ? JSON.parse(retFile.res) : {}; ok = await processJson({ action, key, value, config, });
            if (['get', 'del',].includes(action)) { returnValueKey = false; if (action === 'get') { returnValueAll = false; } }
            if (ok.ret) {
                config = ok.res;
                if (['set', 'del', 'addInArr', 'addInObj',].includes(action)) {
                    // SALVAR AS ALTERAÇÕES
                    if (eng) {
                        // CHROME
                        await new Promise((resolve) => { chrome.storage.local.clear(async () => { resolve(true); }); }); // STORAGE: LIMPAR (É NECESSÁRIO LIMPAR!!!)
                        await new Promise((resolve) => { chrome.storage.local.set(config, async () => { resolve(true); }); }); // STORAGE: DEFINIR
                    } else {
                        // NODE
                        retFile = await file({ e, 'action': 'write', path, 'content': JSON.stringify(ok.res, null, 2), functionLocal, }); if (!retFile.ret) { return ret; }
                    }
                }
                ret['ret'] = true;
                if ((['set', 'del', 'addInArr', 'addInObj',].includes(action) && (returnValueKey || returnValueAll)) || action === 'get') {
                    key = returnValueAll ? '*' : returnValueKey ? key : key; ret['res'] = key === '*' ? config : config[key];
                }
            }
            ret['msg'] = `${ok.msg}`;
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['configStorage'] = configStorage;


