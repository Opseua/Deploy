/* global resourcePrepare */
/* global FileReader */

let debug = false, infOk, routesCache; debug = true;
async function serverPreRun(inf = {}) { // gCnpHKjkwihhUd 
    let nameFun = `serverPreRun`; console.log(nameFun);
    try {

        let [, hash, password, secureVar,] = inf.res; inf = { 'master': inf.master, 'res': { hash, password, secureVar, }, ...inf, }; infOk = inf;
        if (debug) { console.log(`🔰`, `\nCONFIG     → ${password}`, `\nSECURE VAR → ${secureVar}`, `\nARQUIVOS   → ${hash}${secureVar}`); }

        // IMPORTAR E EXECUTAR SERVER
        let retResourceImport = await resourceImport({ 'imports': { 'resources': [{ 'filePath': `src/server.js`, },], }, }); console.log(retResourceImport);
        serverRun({ ...infOk, });

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}

// CHROME | NODE
globalThis['serverPreRun'] = serverPreRun;

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

async function resourceImport({ endpoint, currentProject = `ExtensionV3`, imports = { 'resources': [], }, attempsMax = 11, attempsDelay = 30, }) {
    let localEndpoint = 'http://127.0.0.1:4321'; endpoint = endpoint === undefined ? infOk?.master?.endpoint : endpoint; let endpointOriginal = endpoint, endpointIsNull = endpoint === null, endpointIsTrue = endpoint === true;
    let isGitHub = typeof endpointOriginal === 'string' && endpointOriginal.toLowerCase().includes('git'); endpoint = endpointIsTrue ? localEndpoint : (endpointIsNull ? localEndpoint : endpoint ? endpoint : false);
    let delay = (s) => new Promise(r => setTimeout(r, s * 1000)); let resources = {}; globalThis[`_resources`] = resources;

    routesCache = routesCache || {}; let now = Math.trunc(Date.now() / 1000); if ((endpointIsTrue || isGitHub) && (!routesCache.body || (now - routesCache.tim) > 60)) {
        try {
            let routesUrl = `${isGitHub ? endpoint : `${localEndpoint}/Deploy`}/routes.json`;

            console.log(routesUrl);

            let routesRes = await fetch(routesUrl); let routesBody;
            try { routesBody = await routesRes.json(); } catch { throw new Error('routes.json INVÁLIDO'); } if (!routesRes.ok) { throw new Error('routes.json NÃO ENCONTRADO'); }
            routesBody = isGitHub ? routesBody : (routesBody.data ? JSON.parse(routesBody.data) : routesBody); routesCache = { 'tim': now, 'body': routesBody, };
        } catch (catchErr) {
            return { 'ret': false, 'msg': `RESOURCE IMPORT: ERRO | ${catchErr.message}`, 'res': imports, };
        }
    }

    let version = null; if (endpointIsTrue || isGitHub) {
        let masterKey = infOk?.master?.master; let routesBody = routesCache?.body; version = routesBody?.master?.[masterKey]?.PROJETOS?.[currentProject]?.version;
        if (!version) { return { 'ret': false, 'msg': `RESOURCE IMPORT: ERRO | NÃO ENCONTRADO EM routes.json`, 'res': imports, }; }
    }

    async function tryImportResource(resource) {
        let { 'filePath': rawFilePath, varName = null, keepInString, } = resource; let filePath;                                 // false → disco local SEM Deploy
        if (!endpoint) { filePath = rawFilePath; } else if (endpointIsNull) { filePath = `${currentProject}/${rawFilePath}`; }   // null  → servidor local SEM Deploy
        else if (endpointIsTrue) { filePath = `Deploy/PROJETOS/${currentProject}/${version}/${rawFilePath}`; }                   // true  → servidor local COM Deploy
        else { filePath = `PROJETOS/${currentProject}/${version}/${rawFilePath}`; }                                              // GitHub → COM Deploy + versão

        let response, content, parts = filePath.split('.'), fileType = parts.pop().toLowerCase(), fileName = filePath.split('/').pop().split('.')[0]; try {
            if (!endpoint) { // [LOCAL]
                response = await fetch(chrome.runtime.getURL(filePath)); if (!response.ok) { throw new Error(response.status); }
                if (!['png', 'jpg', 'jpeg',].includes(fileType)) {
                    content = await response.text();
                } else {
                    let blob = await response.blob(); content = await new Promise(r => { let reader = new FileReader(); reader.onloadend = () => r(reader.result); reader.readAsDataURL(blob); });
                }
            } else { // [SERVIDOR/GITHUB]
                let url = `${endpoint}/${filePath}${!isGitHub && varName ? `?varName=${encodeURIComponent(varName)}` : ''}`;
                response = await fetch(url); let resBody; try { resBody = await response.json(); } catch (error) { throw new Error(`BODY INVÁLIDO (${response.status})`); }
                if (!response.ok) { throw new Error(`${resBody?.msg || 'ERRO DESCONHECIDO'}`); } content = isGitHub ? (typeof resBody === 'string' ? resBody : JSON.stringify(resBody)) : resBody.data;
            }
            let finalVarName = varName || fileName;
            if (['js', 'json',].includes(fileType)) {
                await resourcePrepare({ content, fileType, keepInString, finalVarName, });
            } else {
                resources[finalVarName] = content;
            }
            if (debug) { console.log(`✅ [${endpoint ? 'WEB' : 'LOC'}]`, filePath, varName || ''); } return true;
        } catch (catchErr) {
            if (debug) { console.log(`❌ [${endpoint ? 'WEB' : 'LOC'}]`, filePath, catchErr.message); } return false;
        }
    }

    let pendentes = [...imports.resources,]; for (let attempt = 1; attempt <= attempsMax; attempt++) {
        let falhos = []; for (let resource of pendentes) { let ok = await tryImportResource(resource); if (!ok) { falhos.push(resource); } } pendentes = falhos; if (!pendentes.length) { break; }
        if (attempt < attempsMax) { if (debug) { console.log(`⏳ [RETRY ${attempt}/${attempsMax}] ${pendentes.length} resource(s) falhou. Aguardando ${attempsDelay}s...`); } await delay(attempsDelay); }
        else { console.log(`🚫 [RETRY ESGOTADO] ${pendentes.length} resource(s) não importado(s).`); }
    }
    let ret = !pendentes.length; return { ret, 'msg': `RESOURCE IMPORT: ${ret ? 'OK' : 'ERRO'}`, ...(!ret ? { 'res': { endpoint, currentProject, 'imports': pendentes, }, } : {}), };

}

// CHROME | NODE
globalThis['resourceImport'] = resourceImport;


