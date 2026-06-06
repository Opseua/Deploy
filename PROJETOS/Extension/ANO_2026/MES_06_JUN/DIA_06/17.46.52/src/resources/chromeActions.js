/* eslint-disable max-len */

// → NO FINAL DO ARQUIVO

let e = currentFile(new Error()), ee = e;
async function chromeActions(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let {
            action, color, text, title, url, cookieSearch, target, elementName, elementValue, attribute,
            attributeAdd, content, tag, attributeValue, attributeValueAdd, tagFather, fun, funInf = {}, awaitElementMil, typeWindow, typeTab, newMode = false, version,
        } = inf;

        let retTabS, code = '', retExeS, tabId, divTemp;

        if (action === 'badge') {
            action = chrome.browserAction; if (!newMode) { if (color) { action.setBadgeBackgroundColor({ color, }); } if (text || text === '') { action.setBadgeText({ text, }); } } else { // ← MODO ANTIGO
                let retTabActions = await tabActions({ 'filters': {}, }); if (!retTabActions.ret) { return retTabActions; } let tabs = retTabActions.res.filter(tab => { // MODO NOVO
                    let pass = true; pass = pass && (tab.incognito === isModeIncognito); if (typeWindow && getTypeof(typeWindow) === 'string') { pass = pass && (tab[typeWindow] === true); }
                    if (typeTab && getTypeof(typeTab) === 'string') { pass = pass && (tab[typeTab] === true); } return pass;
                }); tabs.forEach(t => { let tabId = t.id; if (color) { action.setBadgeBackgroundColor({ color, tabId, }); } if (text || text === '') { action.setBadgeText({ text, tabId, }); } }); newMode = tabs.length;
            } ret['msg'] = `CHROME ACTIONS [BADGE]: OK ${newMode === false ? '' : `(${newMode})`}`; ret['ret'] = true;
        } else if (action === 'prompt') {
            let retPrompt = prompt(title ? `${title} | Digite o comando:` : `Digite o comando:`);
            if (!retPrompt) { ret['msg'] = `CHROME ACTIONS [PROMPT]: ERRO | PROMPT EM BRANCO`; } else { ret['ret'] = true; ret['msg'] = `CHROME ACTIONS [PROMPT]: OK`; ret['res'] = retPrompt; }
        } else if (action === 'cookie') {
            let cookiesPromise = new Promise((resolve) => { chrome.cookies.getAll({ url, }, cookies => { let retCookies = JSON.stringify(cookies); resolve(retCookies); }); }); let retCookies = await cookiesPromise;
            let cookie = ''; JSON.parse(retCookies).reduce((accumulator, v) => { cookie += `${v.name}=${v.value}; `; return accumulator; }, '');
            if ((cookieSearch) && !(retCookies.toString().includes(cookieSearch))) { ret['msg'] = `CHROME ACTIONS [COOKIE]: ERRO | COOKIE '${cookieSearch}' NAO CONTRADO`; }
            else { ret['ret'] = true; ret['msg'] = `CHROME ACTIONS [COOKIE]: OK`; ret['res'] = { 'array': retCookies, 'concat': cookie, }; }
        } else if (['getBody', 'attributeGetValue', 'elementGetValue', 'elementSetValue', 'elementClick', 'elementGetDivXpath', 'elementGetDiv', 'elementIsHidden', 'elementGetPath', 'injectOld', 'elementAwait', 'injectNew',].includes(action)) {
            let targetMode = (target.includes('<') || target.includes('>')) ? 'HTML' : 'INJECT';
            // →→→ ONDE EXECUTAR? HTML BRUTO FOI PASSADO (CRIAR DIV TEMPORÁRIA) | EXECUTAR NA PÁGINA (INJETANDO SCRIPT - DEFINIR ID DA ABA ALVO)
            if (targetMode === 'HTML') { divTemp = document.createElement('div'); divTemp.innerHTML = target; document.body.appendChild(divTemp); }
            else if (typeof target === 'number') { tabId = target; } else { retTabS = await tabActions({ e, 'filters': { 'url': target, }, }); if (!retTabS?.res?.[0]?.id) { return retTabS; } tabId = retTabS.res[0].id; }

            // **************************************************************************************************************************************
            function getBody() { return [document.body.outerHTML,]; } function manipulateElement({ action, elementName, elementValue, attribute, attributeAdd, content, tag, attributeValue, attributeValueAdd, }) {
                function getElePath(ele) {
                    if (!ele) { return false; } if (ele.id) { return `//*[@id=${ele.id}]`; } else if (ele.tagName === 'BODY') { return '/html/body'; } else {
                        let s = Array.from(ele.parentNode.childNodes).filter(e => e.nodeName === ele.nodeName), idx = s.indexOf(ele);
                        return getElePath(ele.parentNode) + '/' + ele.tagName.toLowerCase() + (s.length > 1 ? `[${idx + 1}]` : '');
                    }
                } // → ################ MODO SIMPLES (XPATH) | → ################ MODO AVANÇADO
                let elements; if (!(tag || attributeValue)) {
                    elements = document.evaluate(elementName, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); let elementsNew = [];
                    for (let i = 0; i < elements.snapshotLength; i++) { elementsNew.push(elements.snapshotItem(i)); } elements = elementsNew;
                } else {
                    attributeValue = attributeValue ? attributeValue.replace(/&quot;/g, '"').replace(/"/g, '\\"') : attributeValue; // FAZER SUBSTITUIÇÕES NECESSÁRIAS
                    elements = attribute ? document.querySelectorAll(`${tag ? tag : ''}[${attribute}${attributeValue ? `="${attributeValue}"` : ''}]`) : document.getElementsByTagName(tag);
                } if (elements && elements.length > 0) {
                    if (action === 'attributeGetValue') {
                        // ATRIBUTO: PEGAR VALOR
                        return Array.from(elements).map(ele => {
                            let contentOk = content ? ele.innerText.trim() === content : true;
                            if ((ele.tagName.toLowerCase() === 'label' || ele.tagName.toLowerCase() === 'span' || ele.tagName.toLowerCase() === tag.toLowerCase()) && contentOk) { return ele.getAttribute(attribute); }
                        }).filter(value => value !== undefined);
                    } else if (action === 'elementGetValue') {
                        // ELEMENTO: PEGAR VALOR
                        return Array.from(elements).map(ele => {
                            let find = false; if (!attributeAdd) { find = true; } else { find = ele.hasAttribute(attributeAdd) && ele.getAttribute(attributeAdd) === attributeValueAdd; } if (find) {
                                if (ele.tagName.toLowerCase() === 'select') { return Array.from(ele.selectedOptions).map(option => option.value); } else if (ele.tagName.toLowerCase() === 'textarea') { return ele.value; }
                                else if (ele.type === 'checkbox' || ele.type === 'radio') { return ele.checked; } else { return ele.value || ele.innerText; }
                            }
                        }).filter(value => value !== undefined);
                    } else if (action === 'elementSetValue') {
                        // ELEMENTO: DEFINIR VALOR
                        elements.forEach(ele => { if (ele.type === 'checkbox' || ele.type === 'radio') { ele.checked = elementValue; } else { ele.value = elementValue; } }); return true;
                    } else if (action === 'elementClick') {
                        // ELEMENTO: CLICAR
                        elements.forEach(ele => { ele.click(); }); return true;
                    } else if (action === 'elementGetDivXpath') {
                        // DIV: PEGAR (BRUTA)
                        return Array.from(elements).map(ele => { return ele.outerHTML; });
                    } else if (action === 'elementIsHidden') {
                        // ELEMENTO OCULTO
                        return Array.from(elements).map(ele => { return ele.hidden; });
                    } else if (action === 'elementGetPath') {
                        // ELEMENTO: PEGAR PATH
                        return Array.from(elements).map(ele => { return getElePath(ele); });
                    }
                } return `ELEMENTO_NAO_ENCONTRADO`;
            }
            // **************************************************************************************************************************************

            if (action === 'getBody') {
                // PEGAR O BODY
                fun = getBody;
            } else if (['attributeGetValue', 'elementGetValue', 'elementSetValue', 'elementClick', 'elementGetDivXpath', 'elementIsHidden', 'elementGetPath',].includes(action)) {
                // ATRIBUTO: PEGAR VALOR | ELEMENTO: PEGAR VALOR | ELEMENTO: DEFINIR VALOR | ELEMENTO: CLICAR | DIV: PEGAR (BRUTA)
                let infElementAction = { e, action, elementName, elementValue, attribute, attributeAdd, content, tag, attributeValue, attributeValueAdd, }; // INJECT | HTML RENDERIZAR
                if (targetMode === 'INJECT') { code = `(${manipulateElement.toString()})(${JSON.stringify(infElementAction)});`; } else { retExeS = manipulateElement(infElementAction); }
            } else if (action === 'elementGetDiv') {
                function elementGetDivFun(valor, tagName, attributeName, attributeValue, parentTagName) {
                    let elements = document.querySelectorAll(tagName), elementsFind = []; elements.forEach(ele => {
                        if (ele.textContent.trim() === valor) {
                            if (!attributeName || ele.getAttribute(attributeName) === attributeValue) {
                                if (tagName !== parentTagName) { if (!parentTagName || ele.parentElement.tagName.toLowerCase() === parentTagName) { elementsFind.push(ele.parentElement.outerHTML); } }
                                else { elementsFind.push(ele.outerHTML); }
                            }
                        }
                    }); return elementsFind;
                } retExeS = elementGetDivFun(content, tag, null, null, tagFather);
            } else if (action === 'elementAwait') {
                // AGUARDAR ELEMENTO
                async function funAsync(inf = {}) { // OBRIGATÓRIO TER O 'await'!!!
                    let { awaitElementMil, tag, attribute, attributeValue, } = inf; await new Promise(r => { setTimeout(r, 100); }); let start = Date.now();
                    let ret = false; while (Date.now() - start < awaitElementMil) {
                        let elements = attribute ? document.querySelectorAll(`${tag ? tag : ''}[${attribute}${attributeValue ? `="${attributeValue}"` : ''}]`) : document.getElementsByTagName(tag);
                        if (elements && elements.length > 0) { ret = true; break; } await new Promise(resolve => setTimeout(resolve, 100));
                    } chrome.runtime.sendMessage(ret);
                } code = `(${funAsync.toString()})(${JSON.stringify({ awaitElementMil, tag, attribute, attributeValue, })});`;
            } else if (action === 'injectOld') {
                // INJECT
                if (!(typeof fun === 'function')) {
                    code = fun;
                } else {
                    function addAsyncSendMessage(string) { // ADICIONAR DELAY E 'chrome.runtime.sendMessage' (SE NECESSÁRIO)
                        string = string.replace(/(\r\n|\n|\r)/gm, '#_BREAK_#'); if (!string.includes('await new Promise(r=> { setTimeout(r, 100) })')) {
                            string = string.replace(/(async function\s+\w+\s*\([^\)]*\)\s*\{)/, '$1 ;await new Promise(r=> { setTimeout(r, 100) });');
                        } if (!string.includes('chrome.runtime.sendMessage(')) { string = string.replace(/\}\s*$/, `;chrome.runtime.sendMessage(res); }`); } return string.replace(/#_BREAK_#/gm, '\n');
                    } fun = addAsyncSendMessage(fun.toString()); code = `(${fun})(${JSON.stringify(funInf)});`;
                }
            }

            if (targetMode === 'INJECT' && action !== 'injectNew') {
                // INJETAR SCRIPT E EXECUTAR | ASYNC [NÃO] | [SIM]
                if (!(action === 'elementAwait' || code?.includes('(async function'))) {
                    retExeS = await new Promise((resolve) => { chrome.tabs.executeScript(tabId, { code, }, (res) => { resolve(res[0]); }); });
                } else {
                    retExeS = await new Promise((resolve) => { let c = chrome.runtime.onMessage; chrome.tabs.executeScript(tabId, { code, }, () => { c.addListener(function l(r) { c.removeListener(l); resolve(r); }); }); });
                }
            } else if (action === 'injectNew') {
                function injectAndRun({ tabId, fun, funInf = {}, }) {
                    tabId = Number(tabId); let execId = Date.now() + Math.random().toString(36).slice(2); return new Promise((resolve, reject) => {
                        function listener(r, s) { if (r.execId === execId && s.tab?.id === tabId) { chrome.runtime.onMessage.removeListener(listener); resolve(r.data); } }
                        chrome.runtime.onMessage.addListener(listener); let code = ` (async()=>{try{let r=await(${fun.toString()})( ${JSON.stringify(funInf)} );
                chrome.runtime.sendMessage({execId:"${execId}",data:r});}catch(e){chrome.runtime.sendMessage({execId:"${execId}",data:{error:e.message}});}})();
                `; chrome.tabs.executeScript(tabId, { code, }, () => { if (chrome.runtime.lastError) { chrome.runtime.onMessage.removeListener(listener); reject(`#_DEU_ERRO_#\n\n${chrome.runtime.lastError}`); } });
                    });
                } retExeS = await injectAndRun({ 'tabId': `${tabId}`, fun, funInf, }); if (version === 2) { retExeS = retExeS; } else { retExeS = retExeS[0]; }
            }

            let r = retExeS; r = (typeof r === 'string' && r.length > 0) || (Array.isArray(r) && r.length > 0) || (typeof r === 'object' && r !== null && Object.keys(r).length > 0) || (typeof r === 'boolean' && r === true);
            if (version === 2) { r = true; }
            if (['getBody', 'attributeGetValue', 'elementGetValue', 'elementGetDivXpath', 'elementGetDiv', 'elementIsHidden', 'injectOld', 'injectNew', 'elementGetPath',].includes(action) && r) { ret['res'] = retExeS; }
            ret['msg'] = `CHROME ACTIONS [SCRIPT → ${targetMode}]: ${r ? 'OK' : 'ERRO | ELEMENTO NÃO ENCONTRADO'}`; ret['ret'] = r;

            // REMOVER DIV TEMPORÁRIA (NECESSÁRIO PARA EVITAR VALORES DUPLICADOS!!!)
            if (targetMode === 'HTML') { document.body.removeChild(divTemp); document.body.innerHTML = ''; }
        }

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['chromeActions'] = chromeActions;

// → HTML para teste em: 'D:\ARQUIVOS\PROJETOS\Extension\src\resources\z_HTML.html'

// let infChromeActions, retChromeActions;

// // ### badge | user | prompt| cookie
// infChromeActions = { e, 'action': 'badge', 'text': `OLA`, 'color': '#0ED145', };
// infChromeActions = { e, 'action': 'badge', 'text': `OLA`, 'color': '#0ED145', 'newMode': true, 'typeWindow': 'active', 'typeTab': 'focused', }; // [typeWindow/typeTab] → 'active' / 'focused'
// infChromeActions = { e, 'action': 'prompt', 'title': 'Nome do comando', };
// infChromeActions = { e, 'action': 'cookie', 'url': `https://www.google.com/`, 'cookieSearch': `__Secure-next-auth.session-token`, };

// // ************************************************************************************************************

// // ### getBody
// infChromeActions = { e, 'action': 'getBody', 'target': `*file:///*`, };

// // ************************************************************************************************************

// // ### element [MODO SIMPLES (XPATH)]
// // → ATRIBUTO: PEGAR VALOR
// infChromeActions = { e, 'action': 'attributeGetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Label"]`, 'attribute': `class`, 'content': `LABEL 4`, };

// // → ELEMENTO: PEGAR VALOR
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome1"]`, };
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Checkbox"]`, };
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Radio"]`, };
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Text"]`, };

// // → ELEMENTO: DEFINIR VALOR
// infChromeActions = { e, 'action': 'elementSetValue', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Text"]`, 'elementValue': `ISSO É UM TESTE A`, }

// // → ELEMENTO: CLICAR
// infChromeActions = { e, 'action': 'elementClick', 'target': `*file:///*`, 'elementName': `//*[@id="idNome4Button"]`, };

// // → DIV: PEGAR (BRUTA)
// infChromeActions = { e, 'action': 'elementGetDivXpath', 'target': `*file:///*`, 'elementName': `//*[@id="DivTeste"]`, };

// // ************************************************************************************************************

// // ### element [MODO AVANÇADO] | TAGS →→→ [input/select/textarea/button/div/label/span] | ATRIBUTOS →→→ [id/class/name/type/for/nomeDoAtributo] | CONTEÚDO →→→ [nomeDoConteudo]
// // → ATRIBUTO: PEGAR VALOR
// infChromeActions = { e, 'action': 'attributeGetValue', 'target': `*file:///*`, 'tag': `label`, 'attribute': `class`, 'content': `LABEL 4`, }; // (tag + atributo + conteúdo)

// // → ELEMENTO: PEGAR VALOR
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'tag': `input`, }; // (tag)
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'tag': `textarea`, 'attribute': `class`, }; // (tag + atributo)
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'attribute': `id`, 'attributeValue': `idNome1`, }; // (atributo + valor do atributo)
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'tag': `textarea`, 'attribute': `id`, 'attributeValue': `idNome1`, }; // (tag + atributo + valor do atributo)
// infChromeActions = { e, 'action': 'elementGetValue', 'target': `*file:///*`, 'tag': `textarea`, 'attribute': `id`, 'attributeValue': `idNome1`, 'attributeAdd': `class`, 'attributeValueAdd': `className1`, }; // (tag + atributo + valor do atributo + atributo2 + valor do atributo2)

// // → ELEMENTO: DEFINIR VALOR
// infChromeActions = { e, 'action': 'elementSetValue', 'target': `*file:///*`, 'attribute': `id`, 'attributeValue': `idNome4Text`, 'elementValue': `ISSO É UM TESTE B`, }; // (atributo + valor do atributo)

// // → ELEMENTO: CLICAR
// infChromeActions = { e, 'action': 'elementClick', 'target': `*file:///*`, 'attribute': `id`, 'attributeValue': `idNome4Button`, }; // (atributo + valor do atributo)

// // ************************************************************************************************************

// // → ELEMENTO: ESPERAR
// infChromeActions = { e, 'action': 'elementAwait', 'target': `*file:///*`, 'awaitElementMil': 5000, 'tag': `div`, 'attribute': `class`, 'attributeValue': `mktls-option mktls-show mktls-value`, }; // (tag + atributo + valor do atributo)
// infChromeActions = { e, 'action': 'elementAwait', 'target': `*file:///*`, 'awaitElementMil': 5000, 'attribute': `class`, 'attributeValue': `mktls-option mktls-show mktls-value`, }; // (atributo + valor do atributo)

// // ************************************************************************************************************

// // → ELEMENTO: PEGAR PATH
// infChromeActions = { e, 'action': 'elementGetPath', 'target': `*file:///*`, 'awaitElementMil': 5000, 'tag': `div`, 'attribute': `class`, 'attributeValue': `mktls-option mktls-show mktls-value`, }; // (tag + atributo + valor do atributo)
// infChromeActions = { e, 'action': 'elementGetPath', 'target': `*file:///*`, 'awaitElementMil': 5000, 'attribute': `class`, 'attributeValue': `mktls-option mktls-show mktls-value`, }; // (atributo + valor do atributo)

// // ************************************************************************************************************

// // → INJECT: ASYNC [NÃO]
// function funTeste(funInf) { console.log('OK', funInf); return true; }; let funInf = { 'A': 'B' };

// // → INJECT: ASYNC [SIM] (OBRIGATÓRIO O DELAY DE 100 MILISSEUNGOS NO INÍCIO!!!)
// async function funTeste(funInf) { await new Promise(r=> { setTimeout(r, 100) }); console.log('OK', funInf); funInf = true; chrome.runtime.sendMessage(funInf); }; let funInf = { 'A': 'B' };

// infChromeActions = { e, 'action': 'injectNew', 'target': `*file:///*`, 'fun': funTeste, 'funInf': funInf, };

// // ************************************************************************************************************

// // *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// retChromeActions = await chromeActions(infChromeActions); console.log(retChromeActions);


