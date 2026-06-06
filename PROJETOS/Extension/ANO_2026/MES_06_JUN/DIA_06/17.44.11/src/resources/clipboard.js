// let infClipboard, retClipboard;
// infClipboard = { e, 'action': 'set', 'value': `Esse é o texto`, };
// infClipboard = { e, 'action': 'get', };
// retClipboard = await clipboard(infClipboard); console.log(retClipboard);

let e = currentFile(new Error()), ee = e; let libs = { 'clipboardy': {}, };
async function clipboard(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        /* IMPORTAR BIBLIOTECA [NODE] */ if (!eng && libs['clipboardy']) { libs['clipboardy']['clipboard'] = 1; libs = await importLibs(libs, 'clipboard'); }

        let { action, value, ignoreIndent, } = inf;

        if (!['set', 'get',].includes(action)) {
            ret['msg'] = `CLIPBOARD: ERRO | INFORMAR O 'action'`;
        } else if (action === 'set' && (value === null || value === '')) {
            ret['msg'] = `CLIPBOARD: ERRO | INFORMAR O 'value'`;
        } else {
            let text;
            if (action === 'set') {
                // OBJETO INDENTADO EM TEXTO BRUTO (SE NECESSÁRIO)
                text = typeof value === 'object' ? JSON.stringify(value, null, ignoreIndent ? undefined : 2) : value;
            }

            if (!eng) {
                // *** NODE

                if (action === 'set') {
                    // AÇÃO → DEFINIR
                    _clipboard.writeSync(text);
                } else {
                    text = _clipboard.readSync();
                }
            } else {
                // *** CHROME

                // ELEMENTO TEMPORÁRIO: CRIAR
                let element = document.createElement('textarea');
                document.body.appendChild(element);
                if (action === 'set') {
                    // AÇÃO → DEFINIR
                    element.value = text;
                    element.select(); document.execCommand('copy');
                } else {
                    // AÇÃO → PEGAR
                    element.focus(); document.execCommand('paste');
                    text = element.value;

                }
                // ELEMENTO TEMPORÁRIO: DELETAR
                document.body.removeChild(element);
            }

            ret['msg'] = 'CLIPBOARD: OK';
            ret['ret'] = true;
            if (action === 'get') {
                ret['res'] = text;
            }

        }
    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['clipboard'] = clipboard;


