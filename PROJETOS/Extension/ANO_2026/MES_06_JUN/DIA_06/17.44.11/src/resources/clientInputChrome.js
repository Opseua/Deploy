let e = currentFile(new Error()), ee = e; let rate = rateLimiter({ 'max': 1, 'sec': 20, });
async function clientInputChrome(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { lead = ' MARIA DA SILVA	12345678900000	itamarflp@gmail.com	21988776655	RAZAO SOCIAL AQUI ', origin = 'ATALHO', } = inf;

        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        async function logLegacy(inf = {}) {
            let { mon, monNam, day, hou, min, sec, mil, } = dateHour().res; let message = {
                'fun': [{
                    'securityPass': gW.securityPass, 'name': 'file', 'par': {
                        'action': 'write', 'path': `!fileProjetos!/WebScraper/logs/JavaScript/MES_${mon}_${monNam}/DIA_${day}/${hou}.00-${hou}.59_log_C6_clientInputChrome_${gW.devMaster}.txt`, 'add': true,
                        'content': `${inf.content.includes(' INI ') ? `\n` : ''}→ ${hou}:${min}:${sec}.${mil} [${engName}] (${origin})\n${inf.content}\n\n`,
                    },
                },],
            }; messageSend({ 'destination': `127.0.0.1:${globalThis.gW.portLoc}/?roo=${gW.devMaster}-NODE-CONNECTION-SERVER`, message, });
        }

        // VERIFICAR SE A EXTENSÃO ESTÁ PRONTA
        let retIndicationCheck = await indicationCheck({}); if (!retIndicationCheck) { ret['msg'] = `CLIENT INPUT CHROME: ERRO | EXTENSÃO NÃO ESTÁ PRONTA`; return ret; }

        // VERIFICAR SE TEM INPUT EM ANDAMENTO
        if (!rate.check().ret) {
            notification({ e, 'duration': 4, 'icon': `iconRed`, 'title': `INDICAÇÃO AUTOMÁTICA`, 'text': `Aguarde o input em andamento!`, 'ntfy': false, });
            ret['msg'] = `CLIENT INPUT CHROME: ERRO | JÁ EXISTE UM INPUT EM ANDAMENTO`; return ret;
        } else if (origin === 'ATALHO') { notification({ e, 'duration': 3, 'icon': `iconClock`, 'title': `INDICAÇÃO AUTOMÁTICA`, 'text': `Indicando, aguarde...`, 'ntfy': false, }); }

        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        let urlTarget = gO.inf.WebScraper_Extension.url; lead = lead.trim(); let campos = lead.split('\t'), administrador = campos[0], cnpj = campos[1], email = campos[2], telefone = campos[3];
        let razaoSocial = campos[4], nomes = administrador.split(' '), primeiroNome = nomes[0], sobrenome = nomes.length > 1 ? administrador.substring(administrador.indexOf(' ') + 1) : '';
        let params, elements = [], res, pageValue, txt, inputRes = '', leadPrimeiroNome = primeiroNome.trim(), leadSobrenome = sobrenome.trim();
        let leadEmail = email.trim(), leadRazaoSocial = razaoSocial.trim(), leadTelefone = (`${telefone.startsWith(`55`) ? '' : '55'}${telefone}`).trim(), leadCnpj = cnpj.trim(); async function getBody() {
            params = { 'paramId': `[P] {TELEFONE} (NOME MASTER)`, 'element': { 'maxAwaitMil': 250, 'properties': [], }, 'actions': [{ 'action': 'getBody', },], };
            let res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); return res?.res?.res || res;
        }

        // ---------------------------------
        txt = `*** INI ${leadCnpj}`; logConsole({ e, ee, 'txt': `${txt}`, }); logLegacy({ 'content': `${txt}`, });
        // ---------------------------------

        params = { // [button] 'X [fechar popup]'
            'paramId': `[button] 'X [fechar popup]'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'button',
                'properties': [{ 'attributeName': 'class', 'attributeValue': 'slds-button slds-button_icon slds-button_icon-bare', },
                { 'attributeName': 'title', 'attributeValue': 'Cancelar e fechar', }, { 'attributeName': 'type', 'attributeValue': 'button', },],
            }, 'actions': [{ 'action': 'elementClick', },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [a] 'Leads'
            'paramId': `[a] 'Leads'`, 'element': {
                'maxAwaitMil': 500, 'tag': 'a', 'content': 'Leads',
                'properties': [
                    // { 'atributoNome': 'role', 'atributoValor': 'menuitem', }, // BANCO REMOVEU
                    { 'attributeName': 'class', 'attributeValue': 'comm-navigation__top-level-item-link js-top-level-menu-item linkBtn', },
                ],
            }, 'actions': [{ 'action': 'elementClick', },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [span] 'Novo Lead'
            'paramId': `[span] 'Novo Lead'`, 'element': {
                'maxAwaitMil': 5000, 'tag': 'span', 'content': 'Novo Lead',
                'properties': [{ 'attributeName': 'class', 'attributeValue': 'label bBody', },],
            }, 'actions': [{ 'action': 'elementClick', },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        await new Promise(r => { setTimeout(r, 1500); }); // REMOVER ISSO

        params = { // [INPUT] 'Primeiro Nome'
            'paramId': `[INPUT] 'Primeiro Nome'`, 'element': {
                'maxAwaitMil': 5000, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'firstName', }, { 'attributeName': 'type', 'attributeValue': 'text', },],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadPrimeiroNome}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [INPUT] 'Sobrenome'
            'paramId': `[INPUT] 'Sobrenome'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'lastName', }, { 'attributeName': 'placeholder', 'attributeValue': 'Sobrenome', },],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadSobrenome}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [INPUT] 'Email'
            'paramId': `[INPUT] 'Email'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'Email', }, { 'attributeName': 'inputmode', 'attributeValue': 'email', },],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadEmail}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [INPUT] 'Razão Social'
            'paramId': `[INPUT] 'Razão Social'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'RazaoSocial__c', }, { 'attributeName': 'class', 'attributeValue': 'slds-input', },
                ],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadRazaoSocial}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [INPUT] 'Telefone'
            'paramId': `[INPUT] 'Telefone'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'Phone', }, { 'attributeName': 'type', 'attributeValue': 'text', },],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadTelefone}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [INPUT] 'CNPJ'
            'paramId': `[INPUT] 'CNPJ'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'input',
                'properties': [{ 'attributeName': 'part', 'attributeValue': 'input', }, { 'attributeName': 'name', 'attributeValue': 'CNPJ__c', }, { 'attributeName': 'type', 'attributeValue': 'text', },],
            }, 'actions': [{ 'action': 'elementSetValue', 'elementValue': `${leadCnpj}`, },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        params = { // [BUTTON] 'Confirmar'
            'paramId': `[BUTTON] 'Confirmar'`, 'element': {
                'maxAwaitMil': 250, 'tag': 'button', 'content': 'Confirmar',
                'properties': [{ 'attributeName': 'class', 'attributeValue': 'slds-button slds-button_neutral', }, { 'attributeName': 'type', 'attributeValue': 'button', },
                { 'attributeName': 'part', 'attributeValue': 'button', },],
            }, 'actions': [{ 'action': 'elementClick', },],
        }; res = await chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': params, }); res = res?.res || res; console.log(res);
        // await new Promise(r => { setTimeout(r, 500); }); // REMOVER ISSO

        // CHECAR SE A INDICAÇÃO FOI FEITA OU SE DEU ALGUM ERRO
        params = []; elements = [
            { 'text': 'Preencha esse campo', 'textId': 'ERRO: campo não preenchido', }, { 'text': 'Insira um endereço de email válido', 'textId': 'ERRO: email inválido', },
            { 'text': 'O formato correto para o telefone', 'textId': 'ERRO: telefone inválido', }, { 'text': 'CNPJ informado é inválido', 'textId': 'ERRO: CNPJ inválido', },
        ]; for (let [index, value,] of elements.entries()) {
            let { text, textId, } = value; params.push({ // [tag] {ALERTA DE ERRO} (CAMPOS)
                'paramId': `[tag] {ALERTA DE ERRO} (Sobrenome | Email | Telefone | Razão social | CNPJ)`,
                'element': { 'maxAwaitMil': 30000, }, 'actions': [{ 'action': 'bodyIncludes', 'text': `${text}`, 'lowerCase': false, 'textId': `${textId}`, },],
            });
        }
        params.push(
            { // [tag] {ALERTA DE ERRO} (DO TOPO APÓS PRESSIONAR O BOTÃO 'Confirmar')
                'paramId': `[tag] {ALERTA DE ERRO}`, 'element': {
                    'maxAwaitMil': 30000, 'tag': 'div', 'properties': [{ 'attributeName': 'class', 'attributeValue': 'slds-notify slds-notify_toast slds-theme_error', },],
                }, 'actions': [{ 'action': 'elementGetValue', },],
            }
        );
        params = [...params,]; res = await Promise.race(params.map(p => chromeActions({ e, 'action': 'injectNew', 'target': urlTarget, 'fun': elementAction, 'funInf': p, }))); res = res?.res || res; console.log(res);

        if (res?.res?.includes('Criação concluída') || res?.res?.includes('Informações')) {
            inputRes = `INDICAÇÃO OK`;
        } else {
            // PEGAR O BODY NOS CASOS ONDE A INDICAÇÃO NÃO FOI FEITA
            pageValue = await getBody();

            // CHECAGEM DE CAPTCHA
            if (pageValue?.includes(`Score is too low or not applicable`) || pageValue?.includes(`muito baixa ou`)) {
                inputRes = 'ERRO: CAPTCHA';
            } else if (pageValue?.includes('O formato correto para o telefone')) {
                inputRes = 'ERRO: telefone inválido';
            } else if (pageValue?.includes('CNPJ informado é inválido')) {
                inputRes = 'ERRO: CNPJ inválido';
            } else if (pageValue?.includes('Insira um endereço de email válido')) {
                inputRes = 'ERRO: email inválido';
            } else if (pageValue?.includes('Preencha esse campo')) {
                inputRes = 'ERRO: nome inválido';
            } else if (pageValue?.includes('Os seguintes campos obrigatórios devem ser preenchidos')) {
                inputRes = 'ERRO: campo não preenchido';
            } else {
                inputRes = res?.res || 'NAO_IDENTIFICADO';
            }
        }

        // ---------------------------------
        txt = `*** FIM ${leadCnpj} [INDICAÇÃO CONCLUÍDA: ${inputRes.includes('INDICAÇÃO OK') ? 'SIM' : 'NÃO'}]\n${inputRes}`; logConsole({ e, ee, txt, }); logLegacy({ 'content': txt, });
        // ---------------------------------

        rate.reset(); if (origin === 'ATALHO') {
            let inputResOk = inputRes?.includes('tente novamente.') ? `ERRO: ${inputRes.split('tente novamente.')[1]}` : inputRes?.includes('INDICAÇÃO') || inputRes?.includes('ERRO: ') ? inputRes : 'OUTRO ERRO';
            notification({ e, 'duration': 4, 'icon': `icon${inputResOk.includes('INDICAÇÃO OK') ? 'Green' : 'Red'}`, 'title': `INDICAÇÃO AUTOMÁTICA`, 'text': `Terminado → ${inputResOk}`, 'ntfy': false, });
        }

        ret['ret'] = true;
        ret['msg'] = `CLIENT INPUT CHROME: OK`;
        ret['res'] = {
            inputRes,
        };

        // // console.log(ret);
        // await new Promise(r => { setTimeout(r, 9999999); }); // TESTES

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['clientInputChrome'] = clientInputChrome;


