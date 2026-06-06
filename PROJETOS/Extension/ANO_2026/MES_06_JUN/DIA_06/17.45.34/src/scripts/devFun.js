let e = currentFile(new Error()), ee = e;
async function devFun(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { enc, data, } = inf;

        if (enc) {
            // ENCAMINHAR PARA O DEVICE CERTO
            let retMessageSend, retInf = typeof data.retInf === 'boolean' ? data.retInf : data.retInf ? data.retInf : true;
            let destination = gW.devSend;
            data = { 'securityPass': gW.securityPass, retInf, 'name': data.name, 'par': data.par, };
            data.par['enc'] = true; data.par['e'] = inf.e;
            // PARA REMOVER O 'retInf' QUE NÃO É NECESSÁRIO
            delete data.par.retInf;
            let message = { 'fun': [data,], };

            // ENVIAR COMANDO PARA O DESTINO CERTO
            retMessageSend = await messageSend({ destination, message, });
            if (!retMessageSend.ret) {
                // MENSAGEM ENVIADA [NÃO]
                ret = retMessageSend;
            } else if (!data.retInf) {
                // MENSAGEM ENVIADA [SIM] | RESPOSTA NECESSÁRIA [NÃO]
                ret['ret'] = true;
                ret['msg'] = `[ENC] ${data.name}`;
            } else if (data.retInf) {
                // MENSAGEM ENVIADA [SIM] | RESPOSTA NECESSÁRIA [SIM]
                ret = JSON.parse(JSON.stringify(retMessageSend).replace('"msg":"', '"msg":"[ENC] '));
            }
        } else {
            // RECEBIDO DO WEBSOCKET
            function label(funName) { return typeof globalThis[funName] === 'function'; }
            for (let [index, value,] of data.fun.entries()) {
                let { resWs, destination, messageId, } = inf;
                let retInf = !!value.retInf, errAlert = false;
                if (value.securityPass !== gW.securityPass) {
                    errAlert = true;
                    ret['ret'] = false;
                    ret['msg'] = `DEV FUN: ERRO | SECURITYPASS INCORRETO`;
                } else if (!label(value.name)) {
                    errAlert = true;
                    ret['ret'] = false;
                    ret['msg'] = `DEV FUN: ERRO | FUNÇÃO '${value.name}' NÃO EXISTE/NÃO DISPONÍVEL NO AMBIENTE`;
                } else {
                    let name = globalThis[value.name];
                    let infName = value.par;
                    infName['retInf'] = retInf;
                    ret = await name(infName);
                }

                if (retInf) {
                    // RESPOSTA NECESSÁRIA [SIM]
                    messageSend({ destination, messageId, 'message': ret, resWs, });
                }

                if (errAlert) {
                    let text = `${ret.msg}\n\n${JSON.stringify(data)}`; logConsole({ e, ee, 'txt': `${text}`, });
                }

            }
        }
    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['devFun'] = devFun;


