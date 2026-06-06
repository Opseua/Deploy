// let retDateHour;
// retDateHour = dateHour();                      // → DATA/HORA ATUAL
// retDateHour = dateHour(new Date());            // → DATA/HORA ATUAL (OBJ DATA)
// retDateHour = dateHour(`-60`);                 // → DATA/HORA ATUAL (- 60 SEGUNDOS)
// retDateHour = dateHour(`+60`);                 // → DATA/HORA ATUAL (+ 60 SEGUNDOS)
// retDateHour = dateHour(`00:01:30`);            // → [HOUR TO SEC] → 90
// retDateHour = dateHour(90);                    // → [SEC TO HOUR] → '00:01:30'
// retDateHour = dateHour(946695599);             // → DATA/HORA DO TIMESTAMP (SEM MILISSEGUNDOS)
// retDateHour = dateHour(946695599123);          // → DATA/HORA DO TIMESTAMP (COM MILISSEGUNDOS)
// retDateHour = dateHour(`1999*12*31*23*59*59*123`); // → DATA/HORA DO TEMPO
// retDateHour = dateHour(`31*12*1999*23*59*59*123`); // → DATA/HORA DO TEMPO
// retDateHour = dateHour(`31#12#23#59#59#123`);      // → DATA/HORA DO TEMPO (ANO ATUAL)
// console.log(retDateHour);
// let { yea, mon, day, hou, min, sec, mil, } = dateHour().res;

// let timestamp = Math.trunc(Date.now() / 1000);

function dateHour(inf) { // NÃO POR COMO 'async'!!!
    let ret = { 'ret': false, };
    try {
        let dt1;
        if (typeof inf === 'string') {
            // @@@ [STRING] @@@
            if ((/^[+-]\d+$/).test(inf)) {
                // function(`-60`) / function(`+60`) → DATA/HORA ATUAL -/+ {inf} SEGUNDOS
                dt1 = new Date(Date.now() + (Number(inf) * 1000));
            } else if ((/^\d{2,}:\d{2}:\d{2}$/).test(inf)) {
                // function(`23:30:59`) / function(`99999:30:59`) → TOTAL DE SEGUNDOS DA HORA
                let [h, m, s,] = inf.split`:`;

                ret['msg'] = `DATE HOUR [HOUR TO SEC]: OK`;
                ret['ret'] = true;
                ret['res'] = `${h * 3600 + m * 60 + +s}`;
                return ret;
            } else {
                // function('1999*12*31*23*59*59*123') /function('31*12*1999*23*59*59*123') / function('31*12*23*59*59*123') → DATA/HORA DO TEMPO ['*' QUALQUER UM ÚNICO CARACTERE]
                let m = inf.match(/^(\d{2,4})[^\d](\d{2})[^\d](\d{2,4})[^\d](\d{2})[^\d](\d{2})(?:[^\d](\d{2,3}))?(?:[^\d](\d{3}))?/);
                if (!m) {
                    // PADRÃO REGEX NÃO ENCONTRADO NA STRING (TENTAR FAZER O DATE)
                    dt1 = new Date(inf);
                } else {
                    let mil = m[7] ?? '000'; if (m[1].length === 4) { m = { 'yea': m[1], 'mon': m[2], 'day': m[3], 'hou': m[4], 'min': m[5], 'sec': m[6] ?? '00', mil, }; } // AAAA/MM/DD HH:MM:SS.MMM
                    else if (m[3].length === 4) { m = { 'yea': m[3], 'mon': m[2], 'day': m[1], 'hou': m[4], 'min': m[5], 'sec': m[6] ?? '00', mil, }; }                     // DD/MM/AAAA HH:MM:SS.MMM
                    else { m = { 'yea': new Date().getFullYear(), 'mon': m[2], 'day': m[1], 'hou': m[3], 'min': m[4], 'sec': m[5] ?? '00', 'mil': m[6] ?? '000', }; }       // DD/MM HH:MM:SS.MMM (USAR ANO ATUAL)
                    dt1 = new Date(`${m.yea}-${m.mon}-${m.day}T${m.hou}:${m.min}:${m.sec}.${m.mil}-03:00`);
                }
            }
        } else if (typeof inf === 'number') {
            // @@@ [NUMBER] @@@
            if (inf > 946695598) {
                // function(946695599) / function(946695599123) → DATA/HORA DO TIMESTAMP
                dt1 = new Date(inf > 9999999999 ? inf : inf * 1000);
            } else {
                // function(90) → [SEC TO HOUR] '00:01:30'
                let hou = Math.trunc(inf / 3600).toString().padStart(2, '0'), min = Math.trunc((inf % 3600) / 60).toString().padStart(2, '0');
                let sec = Math.min(Math.trunc(inf % 60), 59).toString().padStart(2, '0');

                ret['msg'] = `DATE HOUR [SEC TO HOUR]: OK`;
                ret['ret'] = true;
                ret['res'] = `${hou}:${min}:${sec}`;
                return ret;
            }
        } else if (Object.prototype.toString.call(inf) === '[object Date]') {
            // @@@ [OBJ DATE] @@@ function(1999-31-12T23:59:59.123Z) DATA/HORA DO TEMPO
            dt1 = new Date(inf);
        } else if (inf === undefined) {
            // PARÂMETRO VÁZIO! GERAR DATA/HORA ATUAL
            dt1 = new Date();
        }

        // RETORNAR SE A DATA FOR INVÁLIDA
        if (!(dt1 instanceof Date && !isNaN(dt1) && dt1.getFullYear() >= 1999 && dt1.getFullYear() <= 2030)) { ret['msg'] = `DATE HOUR: ERRO | DATA/TIMESTAMP INVÁLIDO`; return ret; }

        // FORÇAR (UTC-3)
        let utc = dt1.getTime() + (dt1.getTimezoneOffset() * 60000), local = new Date(utc - (3 * 60 * 60000)), hou = local.getHours(), localGetMonth = local.getMonth();
        let localGetTime = local.getTime(), x1 = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO',];
        let x2 = ['JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',];

        ret['res'] = {
            'yea': local.getFullYear().toString(),                      // ANO (1999)
            'mon': (localGetMonth + 1).toString().padStart(2, '0'),     // MÊS (01)
            'day': local.getDate().toString().padStart(2, '0'),         // DIA (01)
            'hou': hou.toString().padStart(2, '0'),                     // HORA (13)
            'hou12': (hou % 12 || 12).toString().padStart(2, '0'),      // HORA (01)
            'houAmPm': hou < 12 ? 'AM' : 'PM',                          // (AM/PM)
            'min': local.getMinutes().toString().padStart(2, '0'),      // MINUTO (01)
            'sec': local.getSeconds().toString().padStart(2, '0'),      // SEGUNDO (01)
            'mil': local.getMilliseconds().toString().padStart(3, '0'), // MILISSEGUNDOS (123)
            'tim': Math.trunc(localGetTime / 1000).toString(),          // TIMESTAMP (1234567890) [SEM MILISSEGUNDOS]
            'timMil': localGetTime.toString(),                          // TIMESTAMP (1234567890123) [COM MILISSEGUNDOS]
            'wee': Math.trunc(local.getDate() / 7).toString(),          // NÚMERO DA SEMANA NO MÊS (1)
            'dayNam': x1[local.getDay()].substring(0, 3),               // DIA (SABADO)
            'dayNamFul': x1[local.getDay()],                            // DIA (SAB) [SEM ACENTO]
            'monNam': x2[localGetMonth].substring(0, 3),                // MÊS (MAR)
            'monNamFull': x2[localGetMonth],                            // MÊS (MARCO) [SEM ACENTO]
        };
        ret['msg'] = `DATE HOUR: OK`;
        ret['ret'] = true;

    } catch (catchErr) {
        (async () => { let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res']; })();
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['dateHour'] = dateHour;


