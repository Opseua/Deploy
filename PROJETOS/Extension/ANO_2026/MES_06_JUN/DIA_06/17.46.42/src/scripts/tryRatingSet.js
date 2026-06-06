// → NO FINAL DO ARQUIVO

// IMPORTAR OBJETOS
let obj = {}, imp = ['AIGeneratedTextEvaluationPortuguese', 'BroadMatchRatings', 'Ratingoftransformedtext', 'TextErrorCategorizationptBR',];
for (let [index, v,] of imp.entries()) { let key = `act_${v}`; await import(`../objects/tryRating/${key}.js`); obj[v] = globalThis[`${key}`]; delete globalThis[`${key}`]; }

let e = currentFile(new Error()), ee = e;
async function tryRatingSet(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { hitApp = 'x', elements = [], path = false, processOk = false, rA = false, } = inf;

        // RETORNAR CASO O OBJ DO HITAPP NÃO EXISTA
        if (!obj[hitApp]) { ret['msg'] = `TRYRATING SET: ERRO | FALTA O OBJ DO HITAPP '${hitApp}'`; return ret; }

        function getValueByPath(objOk, path) {
            return path.split('.').reduce((acc, key) => { let match = key.match(/(\w+)\[(\d+)\]/); if (match) { let [, arrayKey, index,] = match; return acc[arrayKey]?.[Number(index)]; } return acc?.[key]; }, objOk);
        }

        let timeNow, timeStart = Number(dateHour().res.tim), elementsObj = obj[hitApp].elementsObj, timeSec = processOk ? 3 : obj[hitApp].timeSec;
        let target = `*${hitApp}/page_tryrating.mhtml*`; // target = '*.tryrating.*'

        // CAPTURAR INPUTS E ENVIAR PARA AI
        if (path || processOk) {
            rA = processOk;
            if (path && !processOk) {
                let retFile = await file({ e, 'action': 'read', path, }); if (!retFile.ret) { return retFile; } else { retFile = JSON.parse(retFile.res); }
                let promptText = obj[hitApp].promptText, inputs = obj[hitApp].inputs, promptQuestion = obj[hitApp].promptQuestion;

                let messagePrompt = ``; for (let [index, val,] of inputs.entries()) { let { name, path, } = val; messagePrompt = `${messagePrompt}${name}:\n${getValueByPath(retFile, path)}\n\n`; }
                messagePrompt = `${promptText}\n${messagePrompt}${promptQuestion}\n\n`; // console.log(messagePrompt); // PROMPT INICIAL | PROMPT QUESTION

                let infApi; infApi = {
                    e, 'method': 'POST', 'url': `http://127.0.0.1:8884/chat`, 'maxConnect': 10, 'object': true, 'body': { 'action': 'messageSend', 'provider': 'naga', 'chatIdA': 'chatId', 'model': 'gpt-4o-mini', messagePrompt, },
                }; rA = await api(infApi); if (!rA.ret) { return rA; } else { rA = rA.res.body; if (!rA.ret) { return rA; } else { rA = rA.res.response.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); } }
                console.log('AI →', rA.substring(0, 50));
            }

            // AÇÕES DO HITAPP
            if (hitApp === 'Ratingoftransformedtext') {
                // →→→→→→→→→→→ Ratingoftransformedtext
                processOk = ['yes_it_does',].includes(rA.toLowerCase()) ? 'yes_it_does' : ['no_it_does_not',].includes(rA.toLowerCase()) ? 'no_it_does_not' : false;
                elements = [{ 'element': 'does_the_output_meet_the_expectation', 'elements1': [{ 'element1': processOk, 'actions': [{ 'awaitFor': undefined, 'value': undefined, },], },], },];
            } else if (hitApp === 'BroadMatchRatings') {
                // →→→→→→→→→→→ BroadMatchRatings
                processOk = ['good',].includes(rA.toLowerCase()) ? 'good' : ['acceptable',].includes(rA.toLowerCase()) ? 'acceptable' : ['bad',].includes(rA.toLowerCase()) ? 'bad' : false;
                elements = [
                    { 'element': 'question_1', 'elements1': [{ 'element1': processOk, 'actions': [{ 'awaitFor': undefined, 'value': undefined, },], },], },
                    { 'element': 'comments', 'elements1': [{ 'element1': `${processOk}_${randomNumber(1, 3)}`, 'actions': [{ 'awaitFor': undefined, 'value': undefined, },], },], },
                ];
            }

            // RETORNAR SE O HITAPP ESTIVER ERRADO OU A RESPOSTA DA AI FOR INVÁLIDA
            if (!processOk) { ret['msg'] = `TRYRATING SET: ERRO | HITAPP ERRADO OU RESPOSTA INVÁLIDA`; return ret; }

            // ****************************************** ENVIAR RESPOSTA ******************************************
            elements.push({ 'element': 'submit_rating', 'elements1': [{ 'element1': 'down', 'actions': [{ 'awaitFor': undefined, 'value': undefined, },], },], });
        }

        // EXECUTAR AÇÕES [ELEMENTS POR ELEMENTS]
        for (let [index, val,] of elements.entries()) {
            // VALORES PASSADOS PARA A FUNÇÃO |  VALORES DO OBJ
            let { element, elements1, } = val; let elementObj = elementsObj[element]; console.log(`#### ELEMENTO 1 ####\n'${element}'`);
            // EXECUTAR AÇÕES [ELEMENTS1 POR ELEMENTS1]
            for (let [index3, val3,] of elements1.entries()) {
                let { element1, actions, } = val3; console.log(`  *** ELEMENTO 2 ***\n  → '${element1}'`);
                // EXECUTAR AÇÕES [ACTION POR ACTION]
                for (let [index4, val4,] of actions.entries()) {
                    // TEMPO RESTANTE
                    timeNow = Number(dateHour().res.tim); timeSec -= (timeNow - timeStart); timeStart = timeNow;
                    // DEFINIR VALORES PASSADOS OU DO OBJ
                    let element1Obj = elementObj[element1].element1Obj, actionObj = elementObj[element1].actionsObj[index4].action;
                    let awaitFor = element === 'submit_rating' ? [(timeSec - 10), timeSec,] : val4.awaitFor || elementObj[element1].actionsObj[index4].awaitFor;
                    let value = val4.value || elementObj[element1].actionsObj[index4].value, infChromeActionsNew = JSON.parse(JSON.stringify(elementsObj[element].infObj).replace(`###_REPLACE_1_###`, `${element1Obj}`));
                    await new Promise(resolve => setTimeout(resolve, randomNumber(...awaitFor) * 1000)); console.log(`    ++ AÇÃO++\n    → ${awaitFor.toString()} | ${actionObj} \n    ${value} `);
                    let infChromeActions = { e, 'action': 'injectOld', target, 'fun': chromeActionsNew, 'funInf': { ...infChromeActionsNew, ...{ 'action': actionObj, }, }, };
                    let retChromeActions = await chromeActions(infChromeActions); if (!retChromeActions.ret) { return retChromeActions; } // console.log(retChromeActions);
                }
            }
        }

        ret['ret'] = true;
        ret['msg'] = `TRYRATING SET: OK`;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['tryRatingSet'] = tryRatingSet;

// let infTryRatingSet, retTryRatingSet;
// infTryRatingSet = {
//     'hitApp': `Ratingoftransformedtext`,
//     'elements': [
//         {
//             'element': 'does_the_output_meet_the_expectation',
//             'elements1': [
//                 {
//                     'element1': 'yes_it_does',
//                     'actions': [
//                         { 'awaitFor': undefined, 'value': undefined, },
//                     ],
//                 },
//             ],
//         },
//         // ****************************************** ENVIAR RESPOSTA ******************************************
//         {
//             'element': 'submit_rating',
//             'elements1': [
//                 {
//                     'element1': 'up',
//                     'actions': [
//                         { 'awaitFor': undefined, 'value': undefined, },
//                     ],
//                 },
//             ],
//         },

//     ]
// }
// retTryRatingSet = await tryRatingSet(infTryRatingSet); console.log(retTryRatingSet);