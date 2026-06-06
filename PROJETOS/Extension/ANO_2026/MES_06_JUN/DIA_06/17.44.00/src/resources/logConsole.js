// 'write': false → NÃO ESCREVER NOS logs A MENSAGEM (ASYNC NÃO!!! DO CONTRÁRIO FICA LENTO ESPERANDO SALVAR NO ARQUIVO)
// 'breakLine': false →  NÃO ADICIONAR QUEBRA DE LINHA
// logConsole({ e, ee, 'txt': `Mensagem do console`, });

let e = currentFile(new Error());
async function logConsole(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e; let ee = inf.ee || e;
    try {
        let { txt = 'x', write = true, breakLine = true, } = inf;

        function colorConsole(inf = {}) {
            let { text, } = inf;
            // let texto
            // texto = 'NORMAL1 <amarelo>AMARELO</amarelo> NORMAL2 <azul>AZUL</azul> NORMAL3 <verde>VERDE</verde> NORMAL4 <vermelho>VERMELHO</vermelho> NORMAL5';
            // colorConsole({ 'text': texto });
            // texto = { 'A': 'B' };
            // colorConsole({ 'text': `<verde>VERDE</verde> <azul>${JSON.stringify(texto)}</azul> NORMAL1` });
            // colorConsole({ 'text': 'FIM' });
            let colors = {
                'amarelo': '\x1b[33m',
                'azul': '\x1b[34m',
                'verde': '\x1b[32m',
                'vermelho': '\x1b[31m',
                'reset': '\x1b[0m',
            };

            let textColored = text; textColored = textColored.replace(/<(\w+)>([\s\S]*?)<\/\1>/g, (match, color, data) => {
                if (color.toLowerCase() in colors) {
                    return `${colors[color.toLowerCase()]}${data}${colors.reset}`;
                } else {
                    return match;
                }
            });
            console.log(textColored);
        }

        let time = dateHour().res;
        let projectConsole = eng ? 'Chrome' : ee.split('PROJETOS/')[1].split('/')[0];
        let fileCall = ee.split('/').pop().replace('_TEMP', '');
        txt = typeof txt === 'object' ? JSON.stringify(txt) : txt;
        let { day, mon, hou, min, sec, mil, /* hou12, houAmPm, */ } = time;
        let currentDateHour = `${hou}:${min}:${sec}.${mil}`;
        let breakLineSta = breakLine ? '\n' : ' ', breakLineEnd = breakLine ? `\n${eng ? '\n' : ''}` : '';
        colorConsole({
            // FORMATO: 24 HORAS (11h, 12h, 13h, 14h...)
            'text': `<verde>→ ${day}/${mon} ${currentDateHour}</verde> <azul>${projectConsole}</azul> <amarelo>${fileCall}</amarelo>${breakLineSta}${txt}${breakLineEnd}`,
            // FORMATO: 12 HORAS (11h, 12h, 01h, 02h...)
            // 'text': `<verde>→ ${day}/${mon} ${hou12}:${min}:${sec}.${mil} ${houAmPm}</verde> <azul>${project}</azul> <amarelo>${fileCall}</amarelo>${breakLineSta}${txt}${breakLineEnd}`
        });

        if (!eng && write) {
            await log({
                // PRIMEIRO ARQUIVO EXECUTADO NO NODE 'server.js'       → [project]/logs/JavaScript/MES_11_NOV/DIA_27/12.00-12.59_log.txt
                // PRIMEIRO ARQUIVO EXECUTADO NO NODE 'serverCarro.js'  → [project]/logs/JavaScript/MES_11_NOV/DIA_27/12.00-12.59_log_Carro.txt
                // PRIMEIRO ARQUIVO EXECUTADO NO NODE 'nomeArquivo.js'  → [project]/logs/JavaScript/MES_11_NOV/DIA_27/12.00-12.59_log_nomeArquivo.txt
                e, 'folder': 'JavaScript', 'path': `log${['server', 'teste', 'logsDel', 'performanceDev',].includes(gW.cloneProject) ? '' : `_${gW.cloneProject.replace('server', '')}`}.txt`,
                'text': txt, projectConsole, fileCall, 'byHour': true, currentDateHour,
            });
        }

        ret['msg'] = `LOG CONSOLE: OK`;
        ret['ret'] = true;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['logConsole'] = logConsole;


