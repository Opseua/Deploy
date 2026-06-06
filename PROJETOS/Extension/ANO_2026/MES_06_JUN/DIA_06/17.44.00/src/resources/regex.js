// let infRegex, retRegex;
// infRegex = { 'pattern': `UM(*)TRES`, 'text': `UMdoisTRESquatroTRES`, };
// infRegex = { 'pattern': `UM(*)TRES`, 'text': `UM\n___doisTRESquatroTRES`, };
// infRegex = { 'pattern': `*DOIS*`, 'text': `UMDOISTRES`, 'simple': true, };
// retRegex = regex(infRegex); console.log(retRegex);

let e = currentFile(new Error()), ee = e;
function regex(inf = {}) { // NÃO POR COMO 'async'!!!
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { pattern, text, simple, } = inf;

        // ESCAPAR REGEX
        function regexEscape(t, m) {
            // [PEGAR PARTE DO TEXTO] 'CASAMENTO' → {C(.*?)TO} → 'ASAMEN'  |  [CHECAR SE TEM PARTE DO TEXTO] 'CASAMENTO' → {*ASAMENT*} → true
            if (!m) { t = t.replace(/[*.+?^${}()|[\]\\]/g, '\\$&'); } else { t = t.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'); } return t;
        }

        if (!pattern) {
            ret['msg'] = `REGEX: ERRO | INFORMAR O 'pattern'`;
        } else if (!(typeof pattern === 'string')) {
            ret['msg'] = `REGEX: ERRO | INFORMAR O 'pattern' EM STRING`;
        } else if (!text) {
            ret['msg'] = `REGEX: ERRO | INFORMAR O 'text'`;
        } else if (!(typeof text === 'string')) {
            ret['msg'] = `REGEX: ERRO | INFORMAR O 'text' EM STRING`;
        } else {
            pattern = pattern.replace('(*)', '(.*?)');
            if (pattern.includes('(.*?)')) {
                let res = {}, ok = false, patternSplit = pattern.split('(.*?)'), split1 = regexEscape(patternSplit[0]);
                let split2 = regexEscape(patternSplit[1]), result1 = text.match(`${split1}(.*?)${split2}`), result2 = text.match(`(?<=${split1})(.+)(?=${split2})`);
                let result3 = text.match(`${split1}([\\s\\S]*?)${split2}`), result4 = text.match(`(?<=${split1})([\\s\\S]+)(?=${split2})`);
                let result5 = text.match(new RegExp(split1 + '(.*?)' + split2, 'g'));
                result5 = result5 ? result5.map(function (match) { return match.replace(new RegExp(split1 + '|' + split2, 'g'), ''); }) : [];

                res['0'] = `['1'] → (-|<) @@@ ['2'] → (-|>) @@@ ['3'] → (^|<) @@@ ['4'] → (^|>) @@@ ['5'] → (-|< ALL)`;
                if (result1 && result1.length > 0) {
                    res['1'] = result1[1]; ok = true;
                } else {
                    res['1'] = `[-|<] PADRAO '${pattern}' NAO ENCONTRADO`;
                }
                if (result2 && result2.length > 0) {
                    res['2'] = result2[1]; ok = true;
                } else {
                    res['2'] = `[-|>] PADRAO '${pattern}' NAO ENCONTRADO`;
                }
                if (result3 && result3.length > 0) {
                    res['3'] = result3[1]; ok = true;
                } else {
                    res['3'] = `[^|<] PADRAO '${pattern}' NAO ENCONTRADO`;
                }
                if (result4 && result4.length > 0) {
                    res['4'] = result4[1]; ok = true;
                } else {
                    res['4'] = `[^|>] PADRAO '${pattern}' NAO ENCONTRADO`;
                }
                if (result5 && result5.length > 0) {
                    res['5'] = result5; ok = true;
                } else {
                    res['5'] = `[-|< ALL] PADRAO '${pattern}' NAO ENCONTRADO`;
                }
                if (ok) {
                    ret['msg'] = `REGEX: OK`;
                    ret['res'] = res;
                    ret['ret'] = true;
                } else {
                    ret['msg'] = `REGEX: OK | NENHUM PADRÃO ENCONTRADO`;
                }
            } else {
                pattern = regexEscape(pattern, true);
                let result = new RegExp(`^${pattern}$`).test(text);
                if (simple) {
                    return result;
                } else if (result) {
                    ret['msg'] = `REGEX: OK`;
                    ret['res'] = 'TEXTO POSSUI O PADRAO';
                    ret['ret'] = true;
                } else {
                    ret['msg'] = `REGEX: ERRO | PADRAO '${pattern}' NAO ENCONTRADO`;
                }
            }
        }

    } catch (catchErr) {
        (async () => { let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res']; })();
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['regex'] = regex;


