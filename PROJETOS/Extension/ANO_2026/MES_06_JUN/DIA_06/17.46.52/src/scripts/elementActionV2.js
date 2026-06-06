// → NO FINAL DO ARQUIVO

let funString; async function runElementActionV2(inf = {}) {
    if (!funString) { funString = elementAction.toString(); } let { e, params, urlTarget, page, } = inf;
    let promise = eng ? chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementActionV3, 'funInf': { ...params, }, 'version': 2, })
        : page.evaluate(async (fun, pars) => (await (new Function('return ' + fun)())(pars)), funString, { ...params, }); return await promise;
} globalThis['runElementActionV2'] = runElementActionV2;



async function elementActionV3(inf = {}) {
    try {

        // ESCAPAR REGEX →           [PEGAR PARTE DO TEXTO] 'CASAMENTO' → {C(.*?)TO} → 'ASAMEN'  |  [CHECAR SE TEM PARTE DO TEXTO] 'CASAMENTO' → {*ASAMENT*} → true
        function regexEscape(t, m) { if (!m) { t = t.replace(/[*.+?^${}()|[\]\\]/g, '\\$&'); } else { t = t.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); } return t; }
        function sleepRun(ms) { return new Promise(r => setTimeout(r, ms)); }

        let getDeepElements = (root = document) => {
            let nodes = []; let walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            while (walker.nextNode()) { let node = walker.currentNode; nodes.push(node); if (node.shadowRoot) { nodes.push(...getDeepElements(node.shadowRoot)); } } return nodes;
        };

        let matchText = (source, pattern, isRegex) => {
            if (pattern === undefined || pattern === null) { return false; } let strPatt = String(pattern); let cleanSource = (source || '').trim().replace(/\s+/g, ' '), cleanPatt = strPatt.trim().replace(/\s+/g, ' ');
            if (!isRegex) { return cleanSource === cleanPatt; } let regexStr = '^' + regexEscape(cleanPatt, true) + '$'; return new RegExp(regexStr, 'i').test(cleanSource);
        };

        let getXpath = (element) => {
            if (!element || element.nodeType === 9) { return ''; } let tagName = element.tagName.toLowerCase();
            let siblings = element.parentNode ? Array.from(element.parentNode.childNodes).filter(n => n.nodeType === 1 && n.tagName === element.tagName) : []; let index = '';
            if (siblings.length > 1) { let ix = siblings.indexOf(element) + 1; index = `[${ix}]`; } let parentPath = getXpath(element.parentNode); return (parentPath + '/' + tagName + index);
        };

        function elementType({ ele, }) {
            // [SELECT] (custom)
            let cusSel = ele.classList?.contains('react-select-container') ? ele : ele.querySelector('.react-select-container, [class*="-singleValue"]');
            if (cusSel) { return { 'type': 'selectCustom', 'eleTarget': cusSel, }; }
            // [RADIO] (group)
            let radios = ele.querySelectorAll('input[type="radio"]'); if (radios.length > 1) { return { 'type': 'radioGroup', 'eleTarget': ele, radios, }; }
            // [INPUT] / [SELECT] / [TEXTAREA]
            let control = ['INPUT', 'SELECT', 'TEXTAREA',].includes(ele.tagName) ? ele : ele.querySelector('input, select, textarea'); if (control) {
                let tag = control.tagName; let type = control.type;
                if (tag === 'INPUT' && type === 'radio') { return { 'type': 'radioSingle', 'eleTarget': control, }; } if (tag === 'INPUT' && type === 'checkbox') { return { 'type': 'checkbox', 'eleTarget': control, }; }
                if (tag === 'SELECT') { return { 'type': 'select', 'eleTarget': control, }; } if (tag === 'TEXTAREA') { return { 'type': 'textarea', 'eleTarget': control, }; }
                if (tag === 'INPUT') { return { 'type': 'input', 'eleTarget': control, }; }
            }
            // [CONTENTEDITABLE]
            if (ele.isContentEditable) { return { 'type': 'input', 'eleTarget': ele, }; }
            return { 'type': 'unknown', 'eleTarget': ele, };
        }

        // *** Buscar elemento
        let elementSelect = (params) => {
            let { step, scopeNodes, } = params; let results = [];
            if (step.type === 'selector') {
                results = scopeNodes.filter(n => n.matches && n.matches(step.value));
            } else if (step.type === 'attributesOLD') { // ANTES DE MODIFICAR BUSCANDO POR REGEX NA tag E atributeName
                let blocks = step.values.reduce((acc, curr) => { if (curr === false) { acc.push([]); } else { acc[acc.length - 1].push(curr); } return acc; }, [[],]); let currentScope = scopeNodes;
                blocks.forEach((block, index) => {
                    if (block.length === 0) { return; } if (index > 0) { currentScope = currentScope.flatMap(parent => Array.from(parent.querySelectorAll('*'))); } currentScope = currentScope.filter(node => {
                        if (node.nodeType !== 1) { return false; } return block.every(attr => {
                            if (attr.type === 'tag') { return matchText(node.tagName.toLowerCase(), attr.value.toLowerCase(), attr.regex); } let actualValue = node.getAttribute(attr.name);
                            return node.hasAttribute(attr.name) && matchText(actualValue, attr.value, attr.regex);
                        });
                    });
                }); results = currentScope;
            } else if (step.type === 'attributes') {
                let blocks = step.values.reduce((acc, curr) => { if (curr === false) { acc.push([]); } else { acc[acc.length - 1].push(curr); } return acc; }, [[],]); let currSco = scopeNodes; blocks.forEach((block, index) => {
                    if (block.length === 0) { return; } if (index > 0) { currSco = currSco.flatMap(parent => Array.from(parent.querySelectorAll('*'))); } currSco = currSco.filter(node => {
                        if (node.nodeType !== 1) { return false; } return block.every(attr => {
                            if (attr.type === 'tag') { return matchText(node.tagName.toLowerCase(), attr.value.toLowerCase(), attr.regex); } if (attr.type === 'attribute') {
                                let attrs = Array.from(node.attributes); return attrs.some(a => {
                                    let matchName = matchText(a.name.toLowerCase(), attr.name.toLowerCase(), attr.regex); let matchVal = matchText(a.value, attr.value, attr.regex); return matchName && matchVal;
                                });
                            } return false;
                        });
                    });
                }); results = currSco;
            } else if (step.type === 'nearText') {
                let labelNodes = scopeNodes.filter(el => { let inner = el.innerText?.trim(); if (!inner) { return false; } return matchText(inner, step.value, step.regex) && el.children.length === 0; });
                labelNodes.forEach(labelNode => {
                    if (step.reverse) {
                        let current = labelNode; while (current && current !== document.body) {
                            let prev = current.previousElementSibling; if (prev) { let deepTextNode = prev.querySelector('.flex-fill, p, span, h1, h2, h3, h4, h5, h6') || prev; results.push(deepTextNode); return; }
                            current = current.parentElement;
                        }
                    } else {
                        let td = labelNode.closest('td'); if (td && td.nextElementSibling) { results.push(td.nextElementSibling); } else {
                            let next = labelNode.nextSibling; while (next) {
                                if (next.innerText?.trim() || (next.nodeType === 3 && next.textContent.trim())) { results.push(next.nodeType === 3 ? labelNode.parentElement : next); return; } next = next.nextSibling;
                            } if (labelNode.parentElement) { results.push(labelNode.parentElement); }
                        }
                    }
                });
            } else if (step.type === 'direction') {
                let firstValid = null; for (let node of scopeNodes) {
                    let target = node; for (let move of (step.values || [])) {
                        if (!target) { break; } let val = parseInt(move.value);
                        if (move.type === 'father') {
                            for (let i = 0; i < Math.abs(val); i++) { if (target.parentElement && target.parentElement !== document.body) { target = target.parentElement; } else { target = null; break; } }
                        } else if (move.type === 'children') {
                            target = (target.children && target.children[val]) ? target.children[val] : null;
                        } else if (move.type === 'brother') {
                            for (let i = 0; i < Math.abs(val); i++) { if (val < 0) { target = target.previousElementSibling; } else { target = target.nextElementSibling; } if (!target) { break; } }
                        }
                    } if (target) { firstValid = target; break; }
                } results = firstValid ? [firstValid,] : [];
            } else if (step.type === 'xpath') {
                let xpath = step.value; let resultNodes = []; let xpathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let i = 0; i < xpathResult.snapshotLength; i++) { let node = xpathResult.snapshotItem(i); if (scopeNodes.includes(node)) { resultNodes.push(node); } } results = resultNodes;
            }

            return results;
        };

        // --- EXECUÇÃO ---
        let allNodes = getDeepElements();

        // *** Processar Buscas (lists)
        let containerBody = document.body; let finalFoundElements = {}; for (let [listIdx, item,] of inf.lists.entries()) {
            finalFoundElements[listIdx] = []; let containerNodes = []; if (item.container) {
                let selector = (inf.container || {})[item.container] || item.container; containerNodes = allNodes.filter(el => el.matches && el.matches(selector));
                if (item.index !== undefined && containerNodes.length > 0) {
                    let alloIdxs = Array.isArray(item.index) ? item.index : [item.index,]; let endAllowIdxs = alloIdxs.map(i => i === '>' ? containerNodes.length - 1 : i);
                    containerNodes = containerNodes.filter((_, idx) => endAllowIdxs.includes(idx));
                }
            } else { containerNodes = [containerBody,]; } for (let containerNode of containerNodes) {
                let currentScope = allNodes.filter(node => containerNode.contains(node)); let foundInThisScope = []; let stopSearch = false;

                // for (let step of item.searchs) {
                //     foundInThisScope = elementSelect({ step, 'scopeNodes': currentScope, }); if (foundInThisScope.length === 0) { stopSearch = true; break; }
                //     currentScope = allNodes.filter(node => foundInThisScope.some(target => target.contains(node) || target === node));
                // }

                for (let step of item.searchs) {
                    if (step.awaitExist) {
                        let timeout = step.awaitvalue || 1000; let start = Date.now(); while (Date.now() - start < timeout) {
                            let latestAllNodes = getDeepElements(); let latestScope = latestAllNodes.filter(node => currentScope.some(s => s.contains(node) || s === node));
                            foundInThisScope = elementSelect({ step, 'scopeNodes': latestScope, }); if (foundInThisScope.length > 0) { break; } await sleepRun(250);
                        }
                    } else { foundInThisScope = elementSelect({ step, 'scopeNodes': currentScope, }); } if (foundInThisScope.length === 0) { stopSearch = true; break; }
                    allNodes = getDeepElements(); currentScope = allNodes.filter(node => foundInThisScope.some(target => target.contains(node) || target === node));
                }

                if (stopSearch) { finalFoundElements[listIdx].push({ 'error': true, }); } else if (item.group) { finalFoundElements[listIdx].push(foundInThisScope); } else { finalFoundElements[listIdx].push(...foundInThisScope); }
            }
        }

        // *** Executar ações
        let listResults = [];
        let processList = async (listIdx) => {
            let eConf = inf.lists[listIdx]; let targets = finalFoundElements[listIdx] || [];

            if (eConf.index !== undefined && targets.length > 0) {
                let reqIdxs = Array.isArray(eConf.index) ? eConf.index : [eConf.index,]; let finalIdxs = reqIdxs.map(i => i === '>' ? targets.length - 1 : i); targets = targets.filter((_, idx) => finalIdxs.includes(idx));
            }

            let physicalNodesResults = []; let TXT_NOT_FOUND = 'ELEMENTO NÃO ENCONTRADO', TXT_ABORT = 'ABORTADA', TXT_IGNORE = 'IGNORADA';
            if (targets.length === 0) {
                physicalNodesResults.push({ 'ret': false, 'msg': `ERRO: ${TXT_NOT_FOUND}`, });
            } else {
                let processTarget = async (rawTarget, globalIdx) => {
                    if (rawTarget && rawTarget.error) {
                        let errorActions = eConf.actions.map((action, aIdx) => ({ 'ret': false, 'msg': `ERRO: ${TXT_NOT_FOUND} (${action.label || `ACTION_${aIdx}`})`, }));
                        return { 'ret': false, 'msg': 'ERRO', 'res': { 'actions': errorActions, }, };
                    }

                    let actionsResults = []; let arrElements = Array.isArray(rawTarget) ? rawTarget : [rawTarget,]; let abortState = false;

                    for (let [actionIdx, action,] of eConf.actions.entries()) {
                        let { type, label, value, 'index': actionTargetIdx, } = action; let resData = [], actionSuccess = 1; let resEmpy = () => { resData.push('___true___'); };

                        try {
                            if (abortState) { throw new Error(abortState); } let elementsToProcess = [];

                            if (type !== 'await') {
                                if (actionTargetIdx !== undefined) {
                                    let requestedIdxs = Array.isArray(actionTargetIdx) ? actionTargetIdx : [actionTargetIdx,];
                                    let finalIdxs = requestedIdxs.map(i => i === '>' ? (eConf.group ? arrElements.length - 1 : targets.length - 1) : i); if (eConf.group) {
                                        elementsToProcess = arrElements.filter((_, idx) => finalIdxs.includes(idx));
                                        if (elementsToProcess.length === 0) { throw new Error(`INDEX MÁXIMO: ${arrElements.length - 1} [NÃO ENCONTRADO: ${JSON.stringify(actionTargetIdx)}]`); }
                                    } else if (finalIdxs.includes(globalIdx)) { elementsToProcess = [...arrElements,]; }
                                } else { elementsToProcess = [...arrElements,]; }
                            }

                            if (type !== 'await' && actionTargetIdx !== undefined && elementsToProcess.length === 0) {
                                actionSuccess = TXT_IGNORE;

                            } else if (type === 'await') {
                                // ✅✅✅ ESPERAR
                                await sleepRun(value || 500); let count = arrElements.length || 1; for (let i = 0; i < count; i++) { resEmpy(); }

                            } else if (type === 'elementGet') {
                                // ✅✅✅ ELEMENTO: PEGAR
                                let extracted = elementsToProcess.map(node => node.outerHTML || node.textContent); resData = (Array.isArray(rawTarget) && actionTargetIdx === undefined) ? extracted : extracted;

                            } else if (type === 'elementGetXpath') {
                                // ✅✅✅ ELEMENTO: PEGAR XPATH
                                let extracted = elementsToProcess.map(node => getXpath(node)); resData = (Array.isArray(rawTarget) && actionTargetIdx === undefined) ? extracted : extracted;

                            } else if (type === 'elementClick') {
                                // ✅✅✅ ELEMENTO: CLICK
                                elementsToProcess.forEach(node => {
                                    ['mousedown', 'mouseup', 'click',].forEach(evt => node.dispatchEvent(new MouseEvent(evt, { 'bubbles': true, 'cancelable': true, 'view': window, }))); resEmpy();
                                });

                            } else if (type === 'elementHoverOn') {
                                // ✅✅✅ ELEMENTO: HOVER [ON]
                                elementsToProcess.forEach(node => {
                                    ['mouseenter', 'mouseover',].forEach(evt => node.dispatchEvent(new MouseEvent(evt, { 'bubbles': true, 'cancelable': true, 'view': window, }))); resEmpy();
                                });

                            } else if (type === 'elementHoverOff') {
                                // ✅✅✅ ELEMENTO: HOVER [OFF]
                                elementsToProcess.forEach(node => {
                                    ['mouseleave', 'mouseout',].forEach(evt => node.dispatchEvent(new MouseEvent(evt, { 'bubbles': true, 'cancelable': true, 'view': window, }))); resEmpy();
                                });

                            } else if (type === 'elementGetValue') {
                                // ✅✅✅ ELEMENTO: PEGAR VALOR
                                let getLabel = (r) => (r.closest('label')?.innerText || document.querySelector(`label[for="${r.id}"]`)?.innerText || r.nextSibling?.textContent || '').trim();
                                let extracted = elementsToProcess.map(node => {
                                    let info = elementType({ 'ele': node, }); let targetEle = info.eleTarget; let eleType = info.type; let res;

                                    if (eleType === 'checkbox') {
                                        // 🟠 [CHECKBOX]
                                        res = targetEle.checked;

                                    } else if (eleType === 'select') {
                                        // 🟠 [SELECT] (default)
                                        res = action.getType === 'index' ? targetEle.selectedIndex : targetEle.value;

                                    } else if (eleType === 'selectCustom') {
                                        // 🟠 [SELECT] (custom)
                                        res = targetEle.innerText.trim();

                                    } else if (eleType === 'radioSingle') {
                                        // 🟠 [RADIO] (single) / [RADIO] (group)
                                        if (['obj', 'objArr',].includes(action.getType)) { let label = getLabel(targetEle); res = { [label]: targetEle.checked, }; } else { res = targetEle.checked; }

                                    } else if (eleType === 'radioGroup') {
                                        // 🟠 [RADIO] (group)
                                        let radios = Array.from(info.radios); if (action.getType === 'obj') { res = radios.reduce((acc, r) => { acc[getLabel(r)] = r.checked; return acc; }, {}); }
                                        else if (action.getType === 'objArr') { res = radios.map(r => ({ [getLabel(r)]: r.checked, })); }
                                        else { let radioList = radios.map(r => r.checked); res = action.getType === 'index' ? radioList.indexOf(true) : radioList; }

                                    } else if (['input', 'textarea',].includes(eleType)) {
                                        // 🟠 [INPUT] / [TEXTAREA] / [CONTENTEDITABLE]
                                        res = targetEle.value;

                                    } else {
                                        // 🟠 [NÃO IDENTIFICADO] / [TEXTO GERAL]
                                        let text = targetEle.innerText?.trim() || targetEle.textContent?.trim() || ''; let lastStep = eConf.searchs[eConf.searchs.length - 1];
                                        if (lastStep && lastStep.type === 'nearText') { let escaped = lastStep.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); text = text.replace(new RegExp(escaped, 'g'), '').trim(); }
                                        res = text.replace(/^[:\-\s\n\r]+/, '').trim();

                                    }

                                    return res;
                                });
                                resData = extracted.flat(); /* ARRAY DE ARRAY */ // resData = (Array.isArray(rawTarget) && actionTargetIdx === undefined) ? extracted : extracted;

                            } else if (type === 'elementSetValue') {
                                // ✅✅✅ ELEMENTO: DEFINIR VALOR
                                if (!('value' in action)) { throw new Error(`INFORMAR O 'value'`); }

                                elementsToProcess.forEach(node => {
                                    let info = elementType({ 'ele': node, }); let targetEle = info.eleTarget; let eleType = info.type; let val = action.value;

                                    if (eleType === 'radioSingle') {
                                        // 🟠 [RADIO] (single) → aceita: true
                                        if (val !== true) { throw new Error(`RADIO SOLITÁRIO → 'value' ACEITA true [NÃO É POSSÍVEL DESMARCAR]`); }
                                        targetEle.checked = true;['change', 'click',].forEach(evt => targetEle.dispatchEvent(new Event(evt, { 'bubbles': true, })));

                                    } else if (eleType === 'checkbox') {
                                        // 🟠 [CHECKBOX] → aceita: true/false/TOGGLE
                                        let valOk = val === 'TOGGLE' ? !targetEle.checked : val; if (typeof valOk !== 'boolean') { throw new Error(`'value' ACEITA true/false/TOGGLE`); } if (targetEle.checked !== valOk) {
                                            targetEle.click(); targetEle.checked = valOk;['input', 'change',].forEach(evt => targetEle.dispatchEvent(new Event(evt, { 'bubbles': true, })));
                                        }

                                    } else if (['input', 'textarea',].includes(eleType)) {
                                        // 🟠 [INPUT] / [TEXTAREA] / [CONTENTEDITABLE] → aceita: qualquer coisa
                                        if (targetEle.readOnly || targetEle.disabled) { throw new Error(`SOMENTE LEITURA/DESABILITADO`); } if (targetEle.isContentEditable) { targetEle.innerText = val; }
                                        else { targetEle.value = val; } targetEle.dispatchEvent(new Event('input', { 'bubbles': true, }));
                                        if (!targetEle.isContentEditable) { targetEle.dispatchEvent(new Event('change', { 'bubbles': true, })); }

                                    } else if (eleType === 'radioGroup') {
                                        // 🟠 [RADIO] (group) → aceita: valor de atributo, conteúdo ou index
                                        let radios = info.radios; let found = false; if (typeof val === 'number' || val === '>') {
                                            let targetIdx = (val === -1 || val === '>') ? radios.length - 1 : val; let radio = radios[targetIdx];
                                            if (radio) { radio.checked = true;['change', 'click',].forEach(evt => radio.dispatchEvent(new Event(evt, { 'bubbles': true, }))); found = true; }
                                            else { throw new Error(`INDEX MÁXIMO: ${radios.length - 1} [NÃO ENCONTRADO: ${val}]`); }
                                        } else {
                                            for (let radio of radios) {
                                                let labelEl = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`); let labelTxt = labelEl ? labelEl.innerText.trim() : '';
                                                if (!labelTxt) { let next = radio.nextSibling; if (next && next.nodeType === 3) { labelTxt = next.textContent.trim(); } }
                                                let attrValues = Array.from(radio.attributes).map(attr => attr.value);
                                                if (matchText(labelTxt, val, action.regex) || attrValues.some(v => matchText(v, val, action.regex))) {
                                                    radio.checked = true;['change', 'click',].forEach(evt => radio.dispatchEvent(new Event(evt, { 'bubbles': true, }))); found = true; break;
                                                }
                                            }
                                        } if (!found) { throw new Error(`[RADIO GROUP] NÃO ENCONTRADO '${val}'`); }

                                    } else if (['select', 'selectCustom',].includes(eleType)) {
                                        // 🟠 [SELECT]
                                        if (targetEle.readOnly || targetEle.disabled) { throw new Error(`SOMENTE LEITURA/DESABILITADO`); }
                                        let options = Array.from(targetEle.options || []); let tarIdx = (val === -1 || val === '>') ? options.length - 1 : val; if (typeof val === 'number' || val === '>') {
                                            if (tarIdx >= 0 && tarIdx < options.length) { targetEle.selectedIndex = tarIdx; } else { throw new Error(`INDEX MÁXIMO: ${options.length - 1} [NÃO ENCONTRADO: ${val}]`); }
                                        } else {
                                            let foundOpt = options.find(opt => matchText(opt.value, val, action.regex) || matchText(opt.text.trim(), val, action.regex));
                                            if (foundOpt) { targetEle.value = foundOpt.value; } else { throw new Error(`NÃO ENCONTRADO '${val}'`); }
                                        } targetEle.dispatchEvent(new Event('change', { 'bubbles': true, }));

                                    } else {
                                        throw new Error(`TIPO NÃO SUPORTADO ou NÃO EDITÁVEL`);
                                    }

                                    resEmpy();
                                });

                            } else {
                                throw new Error(`AÇÃO INVÁLIDA`);
                            }

                        } catch (e) {
                            actionSuccess = 0; let errorMsg = e.message; if (errorMsg === TXT_ABORT) { actionSuccess = TXT_ABORT; } else { abortState = TXT_ABORT; resData = [errorMsg,]; }
                        }

                        let statusPrefix = (typeof actionSuccess === 'string') ? actionSuccess : (actionSuccess ? 'OK' : 'ERRO');
                        let stepRet = { 'ret': !!actionSuccess && actionSuccess !== TXT_ABORT, 'msg': `${statusPrefix}: ${!actionSuccess ? `${resData[0]} ` : ''}'${type}' (${label || `ACTION_${actionIdx}`})`, };
                        if (resData.length > 0 && actionSuccess && actionSuccess !== 0) { stepRet.res = resData; } actionsResults.push(stepRet);

                    }

                    let sucess = actionsResults.every(a => a.ret); return { 'ret': sucess, 'msg': sucess ? 'OK' : 'ERRO', 'res': { 'actions': actionsResults, }, };
                };

                if (eConf.async) { for (let [tIdx, target,] of targets.entries()) { physicalNodesResults.push(await processTarget(target, tIdx)); } }
                else { physicalNodesResults = await Promise.all(targets.map((t, tIdx) => processTarget(t, tIdx))); }

            }

            return { 'label': `(${eConf.label || `LIST_${listIdx}`})`, 'elements': physicalNodesResults, };
        };

        if (inf.async) { for (let i = 0; i < inf.lists.length; i++) { listResults.push(await processList(i)); } } else { listResults = await Promise.all(inf.lists.map((_, i) => processList(i))); }
        return { 'lists': listResults, };

    } catch (e) {
        return e.stack;
    }

}

// CHROME | NODE
globalThis['elementActionV3'] = elementActionV3;



// let params, res, urlTarget, page;

// urlTarget = `*c6bank.my*`;
// params = {
//     'lists': [

//         { 'searchs': [{ 'type': 'selector', 'value': 'h1', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Razão Social', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'CNPJ', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Informações do Master', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'E-mail Comercial', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Tipo de Negócio', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Data de Fundação', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Início Relacionamento', },], 'actions': [{ 'type': 'elementGetValue', },], },
//         { 'searchs': [{ 'type': 'nearText', 'value': 'Endereço', },], 'actions': [{ 'type': 'elementGetValue', },], },

//     ],
// };

// urlTarget = '*z_HTML*';
// params = {
//     'async': true, // EXECUTAR list DE FORMA ASSÍNCRONA (SE FOR false EXECUTA TUDO DE UM SÓ VEZ). OBS: É NECESSÁRIO O { 'type': 'await', 'value': 1500 } DENTRO DO ÍNDICE DE list PARA FORÇAR A DEMORA
//     // 'container': { '1': '[data-cy^="cy-field-result_loop-"]', }, // div COM OS ELEMENTOS (ÚTIL PARA PEGAR OS 3 POIs DA Search 2.0, INCLUSIVE OS IGNORADOS). DO CONTRÁRIO SÓ RETORNA OS ELEMENTOS VISÍVEIS
//     // 'index': [0, 2,], // MANTER APENAS OS ÍNDICES ESPECIFICADOS (OS OUTROS SERÃO DESCARTADOS E NÃO VÃO VOLTAR NA RESPOSTA [SÓ FUNCIONA COM container INFORMADO])

//     'lists': [

//         {
//             'group': true, // AGRUPAR TODOS OS RESULTADOS POR list E NÃO POR elements
//             'async': true, // EXECUTAR actions DE FORMA ASSÍNCRONA
//             'label': 'TESTE_A',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → TEXTO PRÓXIMO
//                     'type': 'nearText', 'value': '*nput [checkbo*', 'regex': true,
//                 },
//                 { // → ATRIBUTOS
//                     'type': 'attributes',
//                     'values': [
//                         { 'type': 'attribute', 'name': 'id', 'value': 'idCheckbox*', 'regex': true, },
//                     ],
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → CLICAR
//                     'type': 'elementClick', 'index': [0, 2,], 'label': 'AÇÃO_A', // 'index' → EXECUTAR A AÇÃO APENAS NOS ÍNDICES INFORMADOS (OS OUTROS FICARÃO COMO 'IGNORADA')
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → CLICAR
//                     'type': 'elementClick',
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → CLICAR
//                     'type': 'elementClick',
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue',
//                 },

//                 { 'type': 'await', 'value': 750, },
//                 { 'type': 'awaitA', 'value': 750, },
//                 { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'label': 'TESTE_B',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → TEXTO PRÓXIMO
//                     'type': 'nearText', 'value': '*nput [radio] (INDEPENDENT*', 'regex': true,
//                 },
//                 { // → ATRIBUTOS
//                     'type': 'attributes',
//                     'values': [
//                         { 'type': 'attribute', 'name': 'id', 'value': 'idRadioSingle2', },
//                     ],
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue',
//                 },
//                 { // → DEFINIR VALOR
//                     'type': 'elementSetValue', 'value': true,
//                 },
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue', 'getType': 'obj/objArr', // 'getType' → RETORNAR OBJ [obj] → res: [ { "keyA": true, "keyB": false } ] | [objArr] → res: [ { "keyA": true }, { "keyB": false } ]
//                 },

//                 { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'label': 'TESTE_C',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → TEXTO PRÓXIMO
//                     'type': 'nearText', 'value': '*input [radio] (GRUP*', 'regex': true,
//                 },

//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue',
//                 },
//                 { // → DEFINIR VALOR
//                     'type': 'elementSetValue', 'value': '*ADIO 1*', 'regex': true,
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → DEFINIR VALOR
//                     'type': 'elementSetValue', 'value': 2, // 'value' → INDEX NO ELEMENTO
//                 },
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue',
//                 },
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue', 'getType': 'index', // 'getType' → RETORNAR INDEX NO ELEMENTO MARCADO EM VEZ DO VALOR
//                 },

//                 // { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'label': 'TESTE_D',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → TEXTO PRÓXIMO
//                     'type': 'nearText', 'value': '*LEMENTO: textare*', 'regex': true, 'reverse': true, // 'reverse' → ELEMENTO ALVO ESTÁ ANTES DO TEXTO PROCURADO
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → HOVER (ON)
//                     'type': 'elementHoverOn',
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → HOVER (OFF)
//                     'type': 'elementHoverOff',
//                 },

//                 { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'label': 'TESTE_E',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → SELECTOR (NÃO ACEITA REGEX)
//                     'type': 'selector',
//                     'value': '#idTextarea2',
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → DEFINIR VALOR
//                     'type': 'elementSetValue', 'value': 'Saturno',
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → DEFINIR VALOR
//                     'type': 'elementSetValue', 'value': 'Júpiter',
//                 },
//                 { // → PEGAR VALOR
//                     'type': 'elementGetValue',
//                 },

//                 { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'label': 'TESTE_F',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → ATRIBUTOS
//                     'type': 'attributes',
//                     'values': [
//                         { 'type': 'tag', 'value': 'select', },
//                         { 'type': 'attribute', 'name': 'id', 'value': 'idSelect*', 'regex': true, },
//                     ],
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → PEGAR ELEMENTO
//                     'type': 'elementGet',
//                 },
//                 { // → PEGAR XPATH
//                     'type': 'elementGetXpath',
//                 },

//                 { 'type': 'await', 'value': 750, },
//             ],
//         },

//         {
//             'index': [0, '>',], // MANTER APENAS OS ÍNDICES ESPECIFICADOS (OS OUTROS SERÃO DESCARTADOS E NÃO VÃO VOLTAR NA RESPOSTA)
//             'label': 'TESTE_G',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → ATRIBUTOS
//                     'type': 'attributes',
//                     'values': [
//                         { 'type': 'tag', 'value': 'select', },
//                         { 'type': 'attribute', 'name': 'id', 'value': 'idSelect*', 'regex': true, },
//                     ],
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → PEGAR XPATH
//                     'type': 'elementSetValue', 'value': 2, 'index': [0,],
//                 },
//                 { // → ESPERAR
//                     'type': 'await', 'value': 750,
//                 },
//                 { // → PEGAR XPATH
//                     'type': 'elementSetValue', 'value': '*ELECT 1', 'regex': true, 'index': [1,],
//                 },
//             ],
//         },

//         {
//             'label': 'TESTE_H',
//             'searchs': [ // ELEMENTO: ENCONTRAR (MÚLTIPLAS FILTRAGENS)
//                 { // → ATRIBUTOS
//                     'type': 'attributes',
//                     'values': [
//                         { 'type': 'tag', 'value': 'select', },
//                         { 'type': 'attribute', 'name': 'id', 'value': 'idSelect2', },
//                     ],
//                 },
//                 { // → DIREÇÃO
//                     'type': 'direction',
//                     'values': [
//                         { 'type': 'father', 'value': -1, }, // 'value' → QUANTOS ELEMENTOS PAI DEVEMOS SUBIR
//                         { 'type': 'children', 'value': 5, }, // 'value' → INDEX DO ELEMENTO FILHO
//                     ],
//                 },
//             ],
//             'actions': [ // ELEMENTO: AÇÕES
//                 { // → PEGAR ELEMENTO
//                     'type': 'elementGet',
//                 },
//             ],
//         },

//     ],
// };

// res = await runElementActionV2({ e, urlTarget, page, params, }); console.log(res);


