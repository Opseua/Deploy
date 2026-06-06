// let infChromeActionsNew, retChromeActionsNew;
// infChromeActionsNew = { // FILTROS # 'includeChildrens' INCLUIR OS NÃO OS ELEMENTOS FILHOS | 'useCase' CONSIDERAR OU NÃO CASE SENSITIVE
//     'tags': [
//         { 'tagName': 'div', 'includeChildrens': false, 'useCase': false, },
//     ],
//     'attributes': [
//         { 'attributeName': 'nomeDoAtributo', 'includeChildrens': false, 'useCase': false, },
//         { 'attributeName': 'name', 'attributeValue': 'nameNome*', 'includeChildrens': false, 'useCase': false, },
//     ],
//     'contents': [
//         { 'contentValue': 'DIV 2', 'includeChildrens': false, 'useCase': false, },
//     ],
// };

// // attributeGetName attributeGetValue elementGetValue elementSetValue elementClick elementGetDiv elementIsHidden elementGetPath elementHighLight
// infChromeActionsNew.action = 'elementHighLight'; infChromeActionsNew.elementValue = 'TESTE';
// infChromeActionsNew.path = '/html/body/div/div[9]'; // SELECIONAR ELEMENTO PELO PATH

// retChromeActionsNew = await chromeActions({ e, 'action': 'injectOld', 'target': `*z_HTML.html*`, 'fun': chromeActionsNew, 'funInf': infChromeActionsNew, }); console.log(retChromeActionsNew);

let e = currentFile(new Error()), ee = e;
async function chromeActionsNew(inf = {}) {
    let { tags = [], attributes = [], contents = [], action, elementValue, path = false, reFilter = [], } = inf;

    // AÇÕES | REGEX | ELEMENTOS: PEGAR PATH
    let actions = ['attributeGetName', 'attributeGetValue', 'elementGetValue', 'elementSetValue', 'elementClick', 'elementGetDiv', 'elementIsHidden', 'elementGetPath', 'elementHighLight',];
    function eleRegex(p, t, c) { if (!c) { p = p.toLowerCase(); t = t.toLowerCase(); } p = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); return new RegExp(`^${p}$`).test(t); } let res; let elements;
    function eleGetPath(ele) {
        if (ele.tagName === 'BODY') { return '/html/body'; } else {
            let s = Array.from(ele.parentNode.childNodes).filter(e => e.nodeName === ele.nodeName), idx = s.indexOf(ele);
            return eleGetPath(ele.parentNode) + '/' + ele.tagName.toLowerCase() + (s.length > 1 ? `[${idx + 1}]` : '');
        }
    }

    if (!actions.includes(action)) { res = 'PARÂMETROS INVÁLIDOS'; } else {
        if (path) {
            // ELEMENTOS: PEGAR TODOS (PATH)
            let result = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); elements = Array.from({ 'length': result.snapshotLength, }, (_, i) => result.snapshotItem(i));
        } else {
            // ELEMENTOS: PEGAR TODOS (QUERY SELECTOR)
            elements = [...document.querySelectorAll('*'),];
        }

        // ORDENAR FILTRAGEM
        let criteryOrder = Object.keys(inf).filter(value => ['tags', 'attributes', 'contents',].includes(value)), elementsTemp = elements;

        // ELEMENTOS: FILTRAR 
        criteryOrder.forEach(key => {
            let critery = key === 'tags' ? tags : key === 'attributes' ? attributes : contents;
            if (critery.length > 0) {
                elementsTemp = elementsTemp.flatMap(element => {
                    let includeChildren = false;
                    let matchesCriteria = critery.every(criterion => {
                        includeChildren = criterion.includeChildrens || false;
                        if (key === 'tags') {
                            let { tagName, useCase = false, } = criterion;
                            return !tagName || eleRegex(tagName, element.tagName, useCase);
                        }
                        if (key === 'attributes') {
                            let { attributeName, attributeValue, useCase = false, } = criterion;
                            return Array.from(element.attributes).some(attr => {
                                let matchName = !attributeName ? true : eleRegex(attributeName, attr.name, useCase);
                                let matchValue = !attributeValue ? true : eleRegex(attributeValue.replace(/&quot;/g, '"'), attr.value, useCase);
                                return matchName && matchValue;
                            });
                        }
                        if (key === 'contents') {
                            let { contentValue, useCase = false, } = criterion;
                            return !contentValue || eleRegex(contentValue, element.textContent.trim(), useCase);
                        } return true;
                    });
                    if (matchesCriteria) {
                        return includeChildren ? [element, ...Array.from(element.querySelectorAll('*')),] : [element,];
                    }
                    return [];
                });
            }
        });

        // REMOVER ELEMENTOS DUPLICADOS
        elements = Array.from(new Set(elementsTemp));

        // ELEMENTOS: AÇÃO
        async function eleAction() {
            if (action === 'attributeGetName') {
                // ATRIBUTO: PEGAR ATRIBUTO NOME 
                return elements.map(ele => { return Array.from(ele.attributes).map(attr => attr.name); });
            } else if (action === 'attributeGetValue') {
                // ATRIBUTO: PEGAR ATRIBUTO VALOR 
                return elements.map(ele => { return attributes.map(attr => { let { attributeName, } = attr; if (ele.hasAttribute(attributeName)) { return ele.getAttribute(attributeName); } }); });
            } else if (action === 'elementGetValue') {
                // ELEMENTO: PEGAR VALOR
                return elements.map(ele => {
                    let r; if (ele.tagName.toLowerCase() === 'select') { r = Array.from(ele.selectedOptions).map(option => option.value); } else if (ele.tagName.toLowerCase() === 'textarea') { r = ele.value; }
                    else if (ele.type === 'checkbox' || ele.type === 'radio') { r = { 'checked': ele.checked, 'value': ele.value, }; } else { r = ele.value || ele.innerText; } return Array.isArray(r) ? r : [r,];
                });
            } else if (action === 'elementSetValue') {
                // ELEMENTO: DEFINIR VALOR
                return elements.map(ele => { if (ele.type === 'checkbox' || ele.type === 'radio') { ele.checked = elementValue; } else { ele.value = elementValue; } return [elementValue,]; });
            } else if (action === 'elementClick') {
                // ELEMENTO: CLICAR
                return elements.map(ele => { ele.click(); return [true,]; });
            } else if (action === 'elementGetDiv') {
                // ELEMENTO: PEGAR DIV
                return elements.map(ele => { return [ele.outerHTML,]; });
            } else if (action === 'elementIsHidden') {
                // ELEMENTO: OCULTO?
                return elements.map(ele => { return [ele.hidden,]; });
            } else if (action === 'elementGetPath') {
                // ELEMENTO: PEGAR PATH
                return elements.map(ele => { return [eleGetPath(ele),]; });
            } else if (action === 'elementHighLight') {
                // ELEMENTO: DESTACAR
                async function highLight(ele) {
                    // console.log('tagName', ele.tagName, 'type', ele.type);
                    if (ele.tagName === 'INPUT' && ele.type === 'radio') {
                        let d = ele; while (d && d.tagName !== 'DIV' && d.tagName !== 'BODY') { d = d.parentElement; } if (d && d.tagName === 'DIV') {
                            let o = d.style.backgroundColor; d.style.backgroundColor = 'yellow'; await new Promise(r => { setTimeout(r, 500); }); d.style.backgroundColor = o;
                        }
                    } else { let o = ele.style.backgroundColor; ele.style.backgroundColor = 'yellow'; await new Promise(r => { setTimeout(r, 500); }); ele.style.backgroundColor = o; } return [true,];
                } let resHighLight = []; for (let index = 0; index < elements.length; index++) { let resHigLig = await highLight(elements[index]); resHighLight.push(resHigLig); } return resHighLight;
            }

        }

        // EXECUTAR AÇÃO
        if (action) { elements = await eleAction(); }

        // FILTRAR NOVAMENTE
        for (let [index, v,] of reFilter.entries()) {
            function clear(pat, arr) { return arr.filter(p => { function clear(v) { if (Array.isArray(v)) { return v.some(s => clear(s)); } return eleRegex(pat, v); } return clear(p); }); } elements = clear(v, elements);
        }

        let qtdElements = elements.length; res = !elements.flat(Infinity).some(v => v !== undefined) ? false : { qtdElements, 'res': elements, };

    }

    // return res // RETORNADO PELO 'chrome.runtime.sendMessage';

}

// CHROME | NODE
globalThis['chromeActionsNew'] = chromeActionsNew;


