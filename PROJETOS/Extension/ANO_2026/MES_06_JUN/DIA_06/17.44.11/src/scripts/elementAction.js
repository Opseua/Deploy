// → NO FINAL DO ARQUIVO

let funString; async function runElementAction(inf = {}) {
    if (!funString) { funString = elementAction.toString(); }
    let { e, paramsArr, urlTarget, page, } = inf;
    let promise = paramsArr.map(parOk => eng ? chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': { 'newAction': true, ...parOk, }, })
        : page.evaluate(async (fun, pars) => (await (new Function('return ' + fun)())(pars)), funString, { 'newAction': true, ...parOk, })); return await Promise.race(promise);

} globalThis['runElementAction'] = runElementAction;



async function elementAction(inf = {}) {
    let paramId = inf.paramId || 'xx', maxElements = Number(inf.element?.maxElements) || 10, indexTarget = (inf.element?.indexTarget !== undefined) ? inf.element.indexTarget : -1;
    let element = inf.element || {}, maxAwaitMil = element.maxAwaitMil || 50; function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    function getElementXPath(el) {
        let parts = []; while (el && el.nodeType === Node.ELEMENT_NODE) {
            let index = 1, sibling = el.previousSibling; while (sibling) { if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === el.nodeName) { index++; } sibling = sibling.previousSibling; }
            parts.unshift(el.nodeName.toLowerCase() + (index > 1 ? `[${index}]` : '')); el = el.parentNode;
        } return '/' + parts.join('/');
    } async function simulateTyping(el, texto, intervalo = 50, teclaFinal = null) {
        let valorAtual = ''; for (let i = 0; i < texto.length; i++) {
            let char = texto[i]; el.dispatchEvent(new KeyboardEvent('keydown', { 'key': char, 'bubbles': true, })); el.dispatchEvent(new KeyboardEvent('keypress', { 'key': char, 'bubbles': true, }));
            valorAtual += char; el.value = valorAtual; el.dispatchEvent(new Event('input', { 'bubbles': true, })); el.dispatchEvent(new KeyboardEvent('keyup', { 'key': char, 'bubbles': true, })); await sleep(intervalo);
        } el.dispatchEvent(new Event('change', { 'bubbles': true, })); if (teclaFinal === 'ENTER') {
            el.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter', 'bubbles': true, })); el.dispatchEvent(new KeyboardEvent('keypress', { 'key': 'Enter', 'bubbles': true, }));
            el.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter', 'bubbles': true, }));
        }
    } function getAllElementsIncludingShadowDOM(root = document) {
        let result = []; let walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) { let node = walker.currentNode; result.push(node); if (node.shadowRoot) { result.push(...getAllElementsIncludingShadowDOM(node.shadowRoot)); } } return result;
    } function getRelativeElements(el, direction = 0) {
        if (!el || typeof el !== 'object' || !('nodeType' in el)) { return []; } if (direction === 1) { return el.parentElement ? [el.parentElement,] : []; }
        if (direction === -1) { return el.children ? Array.from(el.children) : []; } return [el,];
    }

    async function elementSearch(inf = {}, maxAwaitMil = 5000, checkInterval = 250) {
        let inicio = Date.now(); function aplicarFiltros(elementos) {
            let encontrados = elementos;
            // XPATH
            if (inf.xpath) {
                let xpathResult = document.evaluate(inf.xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                encontrados = []; for (let i = 0; i < xpathResult.snapshotLength; i++) { encontrados.push(xpathResult.snapshotItem(i)); }
            }
            // TAG / ATRIBUTO NOME / ATRIBUTO VALOR / CONTEUDO
            if (inf.tag || inf.properties?.length || inf.content) {
                encontrados = encontrados.filter(el => {
                    let ok = true; if (inf.tag) { ok = el.tagName.toLowerCase() === inf.tag.toLowerCase(); } if (ok && inf.properties?.length) {
                        ok = inf.properties.every(p => { return (!p.attributeName || el.hasAttribute(p.attributeName)) && (!p.attributeValue || Array.from(el.attributes).some(a => a.value.includes(p.attributeValue))); });
                    } if (ok && inf.content) { let termo = inf.content.toLowerCase(); ok = (el.textContent || '').toLowerCase().includes(termo) || (el.value || '').toLowerCase().includes(termo); } return ok;
                });
            }
            // --- DIREÇÃO (-1 SOBRE PARA O PAI | +1 ACESSO OS FILHOS)
            if (inf.direction) { encontrados = encontrados.flatMap(el => getRelativeElements(el, inf.direction)); }
            return encontrados;
        }
        return await new Promise(resolve => {
            let intervalo = setInterval(() => {
                let todos = getAllElementsIncludingShadowDOM(); let resultados = aplicarFiltros(todos); if (resultados.length > 0 || Date.now() - inicio >= maxAwaitMil) { clearInterval(intervalo); resolve(resultados); }
            }, checkInterval);
        });
    }

    let elementos = [], resultados = [], actions = inf.actions || [], allBody = actions.some(a => a.action === 'bodyIncludes' || a.action === 'getBody');
    if (allBody) { elementos = [document.body,]; } else { elementos = await elementSearch(element, maxAwaitMil); }
    if ((!elementos || elementos.length === 0) && !allBody) { return [{ 'ret': false, 'msg': `ELEMENT ACTION: ERRO | NÃO ENCONTRADO/NÃO APARECEU A TEMPO (${paramId})`, },]; }

    // AÇÕES
    if (indexTarget > -1) { elementos = [elementos[indexTarget],]; } else if (indexTarget === '>') { elementos = [elementos[elementos.length - 1],]; } elementos = elementos.slice(0, maxElements || elementos.length);
    for (let el of elementos) {
        for (let [idx, valueOk,] of actions.entries()) {
            let { action, elementValue, elementIndex, attribute, time, text, textId, lowerCase, attributesNames = [], attributesValues = [], } = valueOk;
            try {
                if (!el.isConnected) { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | ELEMENTO NÃO ESTÁ MAIS NO DOM (${paramId})`, }); continue; }
                // -------------------

                if (action === 'elementGetXpath') {
                    resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': getElementXPath(el), });

                } else if (action === 'elementClick') {
                    if (el.tagName.toLowerCase() === 'input') { let t = el.type.toLowerCase(); if (t === 'button' || t === 'submit' || t === 'checkbox' || t === 'radio') { el.click(); } else { el.focus(); } }
                    else { el.click(); } resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });

                } else if (action === 'elementGet') {
                    resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': el.outerHTML || el.textContent || '', });

                } else if (action === 'elementGetValue') {
                    resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': el.type === 'checkbox' ? el.checked : (el.value?.trim() ? el.value : el.textContent?.trim()), });

                } else if (action === 'attributeGetValue') {
                    if (attribute) { resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': el.getAttribute(attribute), }); }
                    else { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | INFORMAR O 'attribute' (${paramId})`, }); }

                } else if (action === 'elementSetValue') {
                    if (elementValue) {
                        let ehComboFake = el.tagName.toLowerCase() === 'button' && el.getAttribute('role') === 'combobox'; if (ehComboFake) {
                            try {
                                el.click(); await sleep(500); /* espera abrir dropdown */ await simulateTyping(el, `${elementValue}`, 50, 'ENTER');
                                resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });
                            } catch (err) { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO AO DEFINIR VALOR (${paramId}) → ${err.message}`, }); }
                        } else if ('value' in el) {
                            el.focus(); el.value = elementValue; el.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'a', 'bubbles': true, }));
                            el.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'a', 'bubbles': true, })); el.dispatchEvent(new Event('input', { 'bubbles': true, }));
                            el.dispatchEvent(new Event('change', { 'bubbles': true, })); el.blur(); resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });
                        } else { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | ELEMENTO NÃO ACEITA INPUT (${paramId})`, }); }
                    } else { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | INFORMAR O 'elementValue' (${paramId}) `, }); }

                } else if (action === 'awaitMil') {
                    await sleep(time || 1000); resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });

                } else if (action === 'elementHover') {
                    let event = new MouseEvent('mouseover', { 'bubbles': true, 'cancelable': true, 'view': window, }); el.dispatchEvent(event);
                    resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });

                } else if (action === 'getBody') {
                    resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': (el.textContent || ''), }); break;

                } else if (action === 'bodyIncludes') {
                    let inicio = Date.now(), encontrou = false; while ((Date.now() - inicio) < maxAwaitMil) {
                        let body = (el.textContent || ''); if (lowerCase) { body = body.toLowerCase(); } if (body.includes(text.toLowerCase())) { encontrou = true; break; } await sleep(250);
                    } if (encontrou) { resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK | TEXTO ENCONTRADO (${paramId})`, 'res': textId || text, }); }
                    else { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | TEXTO NÃO ENCONTRADO/NÃO APARECEU A TEMPO (${paramId})`, }); }

                } else if (action === 'elementScrollIntoView') {
                    el.scrollIntoView({ 'behavior': 'smooth', 'block': 'center', 'inline': 'nearest', }); resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, });

                } else if (action === 'elementSelectOption') {
                    let errOption = false; if (el.tagName.toLowerCase() === 'select') {
                        if (elementValue !== undefined) { // SELECIONAR POR [VALOR]
                            let option = Array.from(el.options).find(o => o.value === elementValue);
                            if (option) { el.value = option.value; el.dispatchEvent(new Event('input', { 'bubbles': true, })); el.dispatchEvent(new Event('change', { 'bubbles': true, })); }
                            else { errOption = `Valor não encontrado (${paramId})`; }
                        } else if (elementIndex !== undefined) { // SELECIONAR POR [ÍNDICE]
                            if (elementIndex >= 0 && elementIndex < el.options.length) {
                                el.selectedIndex = elementIndex; el.dispatchEvent(new Event('input', { 'bubbles': true, })); el.dispatchEvent(new Event('change', { 'bubbles': true, }));
                            } else { errOption = `Índice não encontrado (${paramId})`; }
                        } else { errOption = `Informar 'elementValue' ou 'elementIndex' (${paramId})`; }
                    } else { errOption = `Elemento não é <select> (${paramId})`; } if (errOption) { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | ${errOption}`, }); }
                    else { resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, }); }

                } else if (action === 'elementGetProperties') {
                    let props = {}; for (let attr of el.attributes) {
                        let nomeOk = attributesNames.includes(attr.name); let valorOk = attributesValues.includes(attr.value);
                        if ((attributesNames.length === 0 && attributesValues.length === 0) || nomeOk || valorOk) { props[attr.name] = attr.value; }
                    } resultados.push({ 'ret': true, 'msg': `ELEMENT ACTION [${action}]: OK (${paramId})`, 'res': props, });

                } else {
                    // ------------------------------------------------------------------------------------------------------------------------
                    resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | AÇÃO INVÁLIDA (${paramId})`, });
                    // ------------------------------------------------------------------------------------------------------------------------
                }

                // -------------------

            } catch (err) { resultados.push({ 'ret': false, 'msg': `ELEMENT ACTION [${action}]: ERRO | (${paramId}) ${err.message}`, }); }
        }

    }

    // @@@ NOVO BLOCO
    if (!!inf.newAction) { if (resultados.length === 0) { resultados = [[],]; } else { resultados = [resultados,]; } } // REMOVER ISSO NO FUTURO E RETIRAR 'retExeS = retExeS[0]' DA 'chromeActions'
    // @@@ NOVO BLOCO

    return resultados;

}

// CHROME | NODE
globalThis['elementAction'] = elementAction;



// let params, res, urlTarget = '*c6bank.my.site.com*', page;

// // ------------------------------------------------ ELEMENTO: BUSCAR ------------------------------------------------

// // PELO XPATH
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'xpath': `/html/body/div[4]/div[2]/div/div[1]/div/div/c-c6-business-highlights/div/div[1]/c-c6-business-highlights-information/lightning-card/article/div[2]/slot/div[1]/div[2]/p`,
//     }, 'actions': [{ 'action': `elementGetXpath`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // PELA TAG + ATRIBUTO NOME + ATRIBUTO VALOR + CONTEÚDO
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'tag': `lightning-formatted-date-time`, // 'content': `Enviar`,
//         'direction': +1, 'maxElements': 2, 'properties': [{ 'attributeName': `c-c6businesshighlightsinformation_c6businesshighlightsinformation`, 'attributeValue': ``, },],
//     }, 'actions': [{ 'action': `elementGetValue`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // BODY COMPLETO
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000,
//     }, 'actions': [{ 'action': `getBody`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // BODY INCLUI
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000,
//     }, 'actions': [{ 'action': `bodyIncludes`, 'text': `<br>BRA`, 'lowerCase': true, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ------------------------------------------------ ELEMENTO: AÇÃO ------------------------------------------------

// // ELEMENTO: PEGAR
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'xpath': `/html/body/div[4]/div[1]/div/div/div/div/div[3]/div[2]/div/div/div/div/nav/ul/li[6]/a`,
//     }, 'actions': [{ 'action': `elementGet`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: CLICAR
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'xpath': `/html/body/div[4]/div[1]/div/div/div/div/div[3]/div[2]/div/div/div/div/nav/ul/li[6]/a`,
//     }, 'actions': [{ 'action': `elementClick`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: PEGAR ATRIBUTO
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'xpath': `/html/body/div[4]/div[1]/div/div/div/div/div[3]/div[2]/div/div/div/div/nav/ul/li[6]/a`,
//     }, 'actions': [{ 'action': `attributeGetValue`, 'attribute': `role`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: PEGAR PROPRIEDADES (ATRIBUTO NOME E ATRIBUTO VALOR)
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'tag': `label`, 'content': `Relevance`,
//         'directionA': +1, 'maxElements': 1, 'indexTargetA': 2, 'properties': [
//             { 'attributeName': `class`, 'attributeValue': `field-label`, },
//         ],
//     }, 'actions': [{ 'action': `elementGetProperties`, 'attributesNames': ['for',], 'attributesValues': ['field-label',], },],
// }; res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: DEFINIR VALOR
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'tag': 'input',
//         'properties': [{ 'attributeName': `placeholder`, 'attributeValue': `Pesquisar`, }, { 'attributeName': `class`, 'attributeValue': `search-input search-input--right`, },],
//     }, 'actions': [{ 'action': `elementSetValue`, 'elementValue': `123`, }, { 'action': `awaitMil`, 'time': 1500, }, { 'action': `elementSetValue`, 'elementValue': `456`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: PASSAR O MOUSE
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'tag': `p`,
//         'properties': [
//             { 'attributeName': `c-c6businesshighlightsinformation_c6businesshighlightsinformation`, 'attributeValue': ``, },
//             { 'attributeName': `class`, 'attributeValue': `slds-truncate slds-text-link hover-cursor`, },
//         ],
//     }, 'actions': [{ 'action': `elementHover`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: ROLAR ATÉ ELE
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'content': `Mostrar todas as atividades`, 'indexTarget': '>', // OU NÚMERO
//     }, 'actions': [{ 'action': `elementScrollIntoView`, },],
// }; // res = await runElementAction({ e, urlTarget, page, 'paramsArr': [params,], }); res = res?.res || res; console.log(res);

// // ELEMENTO: SELECIONAR OPÇÃO
// params = {
//     'paramId': `TESTE`, 'element': {
//         'maxAwaitMil': 1000, 'content': `Seleciona a opção`,
//     }, 'actions': [{ 'action': `elementSelectOption`, 'elementValue': 'Opção aqui', /* OU */ 'elementIndex': 2, },],
// };  // res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);


