// let infTryRatingComplete, retTryRatingComplete;
// infTryRatingComplete = { e, 'textPrompt': 'https://URL_EVIDENCIA_AQUI', };
// retTryRatingComplete = await tryRatingComplete(infTryRatingComplete); console.log(retTryRatingComplete);

// IMPORTAR OBJETOS
let obj = {}, imp = ['z_HitApp_ERT', 'Search20', 'BroadMatchRatings',];
for (let [index, v,] of imp.entries()) { let key = `opt_${v}`; await import(`../objects/tryRating/${key}.js`); obj[v] = globalThis[`${key}`]; delete globalThis[`${key}`]; }

let lastRunning = 0; let timChe = 90_000; setInterval(() => {
    if (lastRunning > 0 && Date.now() - lastRunning > timChe) { console.log('FUNCAO NÃO FOI CONCLUIDA'); notification({ e, 'duration': 2, 'icon': `iconRed`, 'title': `TryRating PAROU!`, 'ntfy': true, }); }
}, timChe);

let e = currentFile(new Error()), ee = e;
async function tryRatingComplete(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `TRYRATING COMPLETE`; e = inf.e || e; function setRet(p1, p2, p3) { ret = setRetRun({ p1, p2, p3, nameFun, }); return ret; }
    try {
        lastRunning = Date.now();

        let { origin = 'html', textPrompt = ' ', startSec = Math.trunc(Date.now() / 1000), } = inf; thisIgnore = origin;

        let arr = ['try', 'rat', 'ing', 'app', 'sur', 'vey', 'rat', 'e',], urlTarget = `*https://www.${arr[0]}${arr[1]}${arr[2]}.com/${arr[3]}/${arr[4]}${arr[5]}/${arr[6]}${arr[7]}*`;
        let hitApp, params, resDOM, retNam, retFun, hitAdd = {}, baseFiles = `${fileProjetos}/Sniffer/logs/Plataformas`, hitSubmit = { 'response': 'yyy', 'comment': 'yyy', };
        let parsFuncs = { e, params, hitSubmit, hitAdd, }, confTask = (await configStorage({ e, 'action': 'get', 'key': 'platform_tryRating', })).res || {};
        let addNot = { e, 'duration': 2, 'icon': `iconRed`, 'title': `TryRating Complete`, 'ntfy': false, }, mapChars = { 'space': ' ', 'breakLine': '\n', };
        let clearParams = (obj) => { let keep = ['async', 'container', 'index', 'lists',]; return obj ? Object.fromEntries(Object.entries(obj).filter(([k,]) => keep.includes(k))) : {}; }; let compareScores = (cur, rule) => {
            let op = rule.match(/[<>!=]+/)[0]; let target = parseInt(rule.replace(op, ''));
            switch (op) { case '>=': return cur >= target; case '<=': return cur <= target; case '>': return cur > target; case '<': return cur < target; case '==': case '=': return cur === target; default: return true; }
        }; function notRun(text, ico) { notification({ ...addNot, text, 'icon': ico || addNot.icon, }); } function xxx(txt) { notRun(`Erro ao capturar nome do hitApp e ERT [${txt}]`); } hitApp = `z_HitApp_ERT`;

        // ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
        // urlTarget = '*2-GET_TASK-blindNao*';
        // urlTarget = '*3-SEND_TASK-blindNao*';
        // confTask.body = `${baseFiles}/TryRating/ANO_2026/MES_04_ABR/DIA_06/23.06.32.457-GET-LookAroundBlueLine.txt`;
        // confTask.body = `${baseFiles}/z_OUTROS/TryRating/Search20/2-GET_TASK-blindNao.txt`;
        // ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌

        // PEGAR NOME E TEMPO MÉDIO DO HITAPP | DEFINIR OBJ COM INFORMAÇÕES DO HITAPP
        params = obj[hitApp]; if (!params) { notRun(`Sem OBJ 'opt_${hitApp}'`); return ret; } resDOM = await runElementActionV2({ e, urlTarget, 'params': clearParams(params), }); if (!resDOM.ret) { xxx(1); return ret; }
        let infHitApp = ['hitApp', 'ert',].reduce((acc, key, i) => {
            let val = resDOM?.res?.lists?.[i]?.elements?.[0]?.res?.actions?.[0]?.res?.[0] || null; acc[key] = val;
            if (key === 'ert' && val) { let m = val.match(/(\d+)\s+m/) || [0, 0,], s = val.match(/(\d+)\s+s/) || [0, 0,]; acc.ertSec = (parseInt(m[1]) * 60) + parseInt(s[1]) || null; } return acc;
        }, {}); if (!Object.values(infHitApp).every(val => val !== null)) { xxx(2); return ret; } hitApp = infHitApp.hitApp.replace(/[^a-zA-Z0-9]/g, ''); let { ert, ertSec, } = infHitApp; thisIgnore = ert;
        params = obj[hitApp]; if (!params) { notRun(`Sem OBJ 'opt_${hitApp}'`); return ret; } if (!ertSec > 20) { notRun(`ERT inválido!!! '${ertSec}'`); return ret; }// console.log(`${hitApp} | ${ert} | ${ertSec}`);
        if (!confTask.body && urlTarget.includes('_TASK-')) { confTask.body = `${baseFiles}/z_OUTROS/TryRating/${hitApp}/${urlTarget.replaceAll('*', '')}.txt`; } // ← PATH DO BODY (SE NECESSÁRIO)

        // PEGAR JULGAMENTOS
        resDOM = await runElementActionV2({ e, urlTarget, 'params': clearParams(params), }); if (!resDOM.ret) { notRun(`Erro ao capturar julgamento(s)`); return ret; }
        let lists = resDOM.res.lists; let finalJudgeIdx = lists.findIndex(l => l.label.toLowerCase().includes(params.add.label1.toLowerCase())); let allJudgesElements = lists[finalJudgeIdx]?.elements || [];
        let indicesTotal = Array.from(allJudgesElements.keys()); let indicesAvaliar = allJudgesElements.map((el, i) => {
            let actionTarget = el.res?.actions?.find(a => a.msg.toLowerCase().includes(params.add.label2.toLowerCase())); return (actionTarget && actionTarget.ret) ? i : -1;
        }).filter(i => i !== -1); let judgeCompleteArr = params.add.judgeComplete.map(v => v.toLowerCase()); let indicesPendentes = indicesAvaliar.filter(i => {
            let el = allJudgesElements[i]; let actionTarget = el.res.actions.find(a => a.msg.toLowerCase().includes(params.add.label2.toLowerCase()));
            let val = (actionTarget.res?.[0] || '').toLowerCase(); return !judgeCompleteArr.some(word => val.includes(word));
        }); let indicesConcluidos = indicesAvaliar.filter(i => !indicesPendentes.includes(i)); thisIgnore = indicesTotal; thisIgnore = indicesConcluidos; // console.log(`TOTAL: [ ${indicesTotal.join(', ')} ]`);
        // console.log(`AVALIAR: [ ${indicesAvaliar.join(', ')} ]`); console.log(`PENDENTE: [ ${indicesPendentes.join(', ')} ]`); console.log(`CONCLUÍDO: [ ${indicesConcluidos.join(', ')} ]`);
        if (indicesPendentes.length === 0) { notRun(`Nenhum julgamento pendente`, `iconPurple`); return ret; }

        // ⚠️➡️⚙️ PROCESSAR TEXTO DO PROMPT COM LINK DE EVIDÊNCIA
        if (hitApp === 'Search20') { retNam = `fun${hitApp}___1___`; retFun = await params[retNam]({ ...parsFuncs /* ###*/, textPrompt, }); if (!retFun.ret) { notRun(`Erro na ${retNam}`); return ret; } }

        for (let realIdx of indicesPendentes) {
            let judgeData = { 'parts': {}, 'scores': {}, }; let oldBlock = null; let judgeID = params.lists.reduce((acc, config, lIdx) => {
                if (config.add.judgeProcessIdentification) {
                    let element = lists[lIdx].elements.length > 1 ? lists[lIdx].elements[realIdx] : lists[lIdx].elements[0]; let val = element?.res?.actions?.[0]?.res?.[0]; if (val && val !== false) { acc.push(val.toString()); }
                } return acc;
            }, []).join(`' | '`).replaceAll('\n', ', '); judgeID = `'${judgeID}'`; thisIgnore = judgeID; clearConsole(); console.log(`JUDGE ${judgeID}`);

            for (let [lIdx, config,] of params.lists.entries()) {
                let { label = '___SEM_LABEL___', add, } = config; if (add.judgeProcessIgnore === 'SKIP') { continue; }
                let element = lists[lIdx].elements.length > 1 ? lists[lIdx].elements[realIdx] : lists[lIdx].elements[0]; if (!element || !element.ret) { continue; } for (let action of element.res.actions) {
                    if (!action.ret) { continue; } let response = add.optionsType === 'array' ? action.res : action.res[0]; let currentOption = 'default';
                    let result = add.options?.find(opt => { if (add.optionsType === 'array') { return Array.isArray(response) && opt.option.every((v, i) => v === response[i]); } return opt.option === response; })?.result;

                    // ⚠️➡️⚙️ RESPOSTA: COM CRITÉRIO (MANTER ANTES!!!)
                    if (hitApp === 'Search20') {
                        retNam = `fun${hitApp}___2___`; retFun = await params[retNam]({ ...parsFuncs /* ###*/, label, response, currentOption, });
                        if (!retFun.ret) { notRun(`Erro na ${retNam}`); return ret; } currentOption = retFun.res.currentOption || currentOption;
                    }

                    let targetObj = result?.[currentOption], value = targetObj?.value, scoreEnd = targetObj?.scoreEnd, scores = targetObj?.scores || []; // console.log(`*** '${label}'\n→→→ '${value || response}'`);

                    // RESPOSTA: DEFINIR (MANTER DEPOIS!!!)
                    if (add.judgeProcessIgnore === 'ONLY_GET_RESPONSE') {
                        hitAdd[label] = value || response;
                        if ([`BroadMatchRatings`,].includes(hitApp) && label === 'RESPOSTA') {

                            retNam = `fun${hitApp}___1___`; retFun = await params[retNam]({ e, params, hitSubmit, hitAdd, });
                            if (!retFun.ret) { notification({ ...addNot, 'text': `Erro na função do hitApp`, }); return ret; }

                            console.log(`${hitSubmit.response}\n\n${hitSubmit.comment}`); notification({ ...addNot, 'text': `Finalizado!`, 'icon': `iconGreen`, }); let paramsNew;

                            paramsNew = {
                                'async': true, 'lists': [
                                    {
                                        'label': 'RESPOSTA_INPUT', 'searchs': [{
                                            'type': 'attributes', 'values': [
                                                { 'type': 'tag', 'value': 'div', }, { 'type': 'attribute', 'name': 'class', 'value': 'extra-wrapper', },
                                                { 'type': 'attribute', 'name': 'data-cy', 'value': 'cy-extra-wrapper-Variant', },
                                            ],
                                        },], 'actions': [{ 'type': 'elementSetValue', 'value': hitSubmit.response, }, { 'type': 'await', 'value': 750, },],
                                    },

                                    {
                                        'label': 'RESPOSTA_INPUT', 'searchs': [{
                                            'type': 'attributes', 'values': [
                                                { 'type': 'tag', 'value': 'textarea', }, { 'type': 'attribute', 'name': 'type', 'value': 'text', },
                                                { 'type': 'attribute', 'name': 'data-cy', 'value': 'cy-field-Comments_Box', }, { 'type': 'attribute', 'name': 'class', 'value': 'form-control', },
                                            ],
                                        },], 'actions': [{ 'type': 'elementSetValue', 'value': hitSubmit.comment, },],
                                    },
                                ],
                            }; await runElementActionV2({ e, urlTarget, 'params': paramsNew, });

                            let awaitOk = sleepDynamic({ 'minSec': 47, 'maxSec': 55, startSec, }); console.log(`DELAY IA: ${awaitOk.delay} | AWAIT: ${awaitOk.await} | ENDED: ${dateHour(awaitOk.delay + awaitOk.await).res}`);
                            await sleepRun(awaitOk.await * 1000); console.log(`MANDAR!`); paramsNew = {
                                'lists': [
                                    {
                                        'label': 'ENVIAR', 'searchs': [{
                                            'type': 'attributes', 'values': [{ 'type': 'tag', 'value': 'button', }, { 'type': 'attribute', 'name': 'class', 'value': 'ml-2 btn btn-success text-white', },],
                                        },], 'actions': [{ 'type': 'elementClick', 'label': 'SUBMIT', },],
                                    },
                                ],
                            }; await runElementActionV2({ e, urlTarget, 'params': paramsNew, });

                            return ret;

                        }
                        continue;
                    }

                    if (!result || value === '___MISSING_RESPONSE___') { notRun(`Responder '${label}'`); return ret; } if (value === '___IGNORE___') { continue; } for (let [index, sItem,] of scores.entries()) {
                        let sk = sItem.scoreKey || add.scoreKey; let sVal = sItem.scoreVal; if (sk && sVal) {
                            if (judgeData.scores[sk] === undefined) { judgeData.scores[sk] = 0; } let valNum = parseInt(sVal.slice(1));
                            if (sVal[0] === '+') { judgeData.scores[sk] += valNum; } else if (sVal[0] === '-') { judgeData.scores[sk] -= valNum; } else { judgeData.scores[sk] = valNum; }
                        }
                    } if (scoreEnd) {
                        let skPai = add.scoreKey; let tempScore = judgeData.scores[skPai] || 0; for (let [eleIdx, scanConfig,] of params.lists.entries()) {
                            if (eleIdx === lIdx) { continue; } let element = lists[eleIdx].elements.length > 1 ? lists[eleIdx].elements[realIdx] : lists[eleIdx].elements[0]; if (!element || !element.ret) { continue; }
                            for (let scanAction of element.res.actions) {
                                let sCap = scanConfig.add.optionsType === 'array' ? scanAction.res : scanAction.res[0]; let sMatch = scanConfig.add.options?.find(opt => {
                                    if (scanConfig.add.optionsType === 'array') { return Array.isArray(sCap) && opt.option.every((v, i) => v === sCap[i]); } return opt.option === sCap;
                                })?.result; let sObjArr = sMatch?.['default']?.scores || []; for (let [index, ssItem,] of sObjArr.entries()) {
                                    if (ssItem.scoreKey === skPai && ssItem.scoreVal) {
                                        let ssValNum = parseInt(ssItem.scoreVal.slice(1)); if (ssItem.scoreVal[0] === '+') { tempScore += ssValNum; } else if (ssItem.scoreVal[0] === '-') { tempScore -= ssValNum; }
                                    }
                                }
                            }
                        } if (!compareScores(tempScore, scoreEnd)) { notRun(`Justificar '${label}'`); return ret; }
                    }

                    // MONTAR COMENTÁRIO
                    if ([`Search20`,].includes(hitApp)) {
                        let pre = '', suf = ''; add.addResultFinal?.forEach(af => { let c = (mapChars[af.textStart || af.textEnd] || '').repeat(af.qtd); if (af.textStart) { pre += c; } else { suf += c; } });
                        let breakLine = (oldBlock !== null && oldBlock !== add.block) ? '\n' : ''; oldBlock = add.block; judgeData.parts[add.resultFinalIndex] = `${breakLine}${pre}${value}${suf}`;
                    }
                }
            }

            if ([`Search20`,].includes(hitApp)) { hitSubmit.comment = Object.keys(judgeData.parts).sort((a, b) => Number(a) - Number(b)).map(k => judgeData.parts[k]).join(''); }
            break; // MANTER PARA PROCESSAR APENAS 1 JULGAMENTO PENDENTE POR VEZ!!!
        }

        // ⚠️➡️⚙️ CORREÇÕES (SE NECESSÁRIO)
        if (hitApp === 'Search20') { retNam = `fun${hitApp}___3___`; retFun = await params[retNam]({ ...parsFuncs /* ###*/, confTask, }); if (!retFun.ret) { notRun(`Erro na ${retNam}`); return ret; } }

        // VALIDAÇÃO SE O COMENTÁRIO NÃO CONTÉM ALGO DO OBJETO
        if (hitSubmit.comment !== 'yyy') { clipboard({ e, 'action': 'set', 'value': hitSubmit.comment, }); if (hitSubmit.comment.includes(`-_-_-`)) { let xxx = 'Comentário inválido'; notRun(xxx); return setRet(xxx); } }

        notRun(`Finalizado!${hitSubmit.comment.length < 30 ? `\n${hitSubmit.comment}` : ''}`, `iconGreen`);

        ret = setRet({ 'ret': true, 'res': { 'comment': hitSubmit.comment, }, });

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return setRet(ret);
}

// CHROME | NODE
globalThis['tryRatingComplete'] = tryRatingComplete;


