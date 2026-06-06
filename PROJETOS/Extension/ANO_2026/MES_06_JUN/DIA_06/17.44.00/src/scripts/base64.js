// let infBase64, retBase64;
// infBase64 = { e, 'action': `encode`, 'text': `Olá mundo!`, };
// retBase64 = await base64(infBase64); console.log(retBase64);

// infBase64 = { e, 'action': `decode`, 'text': `${retBase64.res}`, };
// retBase64 = await base64(infBase64); console.log(retBase64);

let e = currentFile(new Error()), ee = e;
async function base64(inf = {}) {
    let ret = { 'ret': false, }, nameFun = `BASE64`; e = inf.e || e;
    try {
        let { action = false, text = false, } = inf;

        if (action !== 'encode' && action !== 'decode') { ret['msg'] = `${nameFun}: ERRO | INFORMAR O 'action'`; return ret; }
        if (text === false) { ret['msg'] = `${nameFun}: ERRO | INFORMAR O 'text'`; return ret; }
        if (!(engType > 0)) { ret['msg'] = `${nameFun}: ERRO | DEV NÃO IDENTIFICADO`; return ret; }

        if (action === 'encode') {
            // *** ENCODIFICAR
            if ([1, 4,].includes(engType)) {
                // → CHROME | HTML
                try {
                    // LATIN1 → UTF8
                    let utf8Bytes = new TextEncoder().encode(text); let binaryString = String.fromCharCode.apply(null, utf8Bytes);
                    let res = btoa(binaryString);
                    ret['res'] = `${res}`;
                } catch {
                    // ASCII
                    let res = btoa(unescape(encodeURIComponent(text)));
                    ret['res'] = `${res}`;
                }
            } else if ([2,].includes(engType)) {
                // → NODE
                let res = Buffer.from(text, 'utf8').toString('base64');
                ret['res'] = `${res}`;
            } else if ([3,].includes(engType)) {
                // → GOOGLE
                let utf8Bytes = Utilities.newBlob(text, 'text/plain;charset=utf-8').getBytes();
                let res = Utilities.base64Encode(utf8Bytes);
                ret['res'] = `${res}`;
            }
        } else if (action === 'decode') {
            // *** DECODIFICAR
            if ([1, 4,].includes(engType)) {
                // CHROME | HTML
                try {
                    // LATIN1 → UTF8
                    let binaryString = atob(text);
                    let bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    let res = new TextDecoder().decode(bytes);
                    ret['res'] = `${res}`;
                } catch {
                    // ASCII
                    let res = decodeURIComponent(escape(atob(text)));
                    ret['res'] = `${res}`;
                }
            } else if ([2,].includes(engType)) {
                // NODE
                let res = Buffer.from(text, 'base64').toString('utf8');
                ret['res'] = `${res}`;
            } else if ([3,].includes(engType)) {
                // GOOGLE
                let decodedBytes = Utilities.base64Decode(text);
                let res = Utilities.newBlob(decodedBytes).getDataAsString('UTF-8');
                ret['res'] = `${res}`;
            }
        }

        ret['msg'] = `${nameFun}: OK`;
        ret['ret'] = true;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['base64'] = base64;


