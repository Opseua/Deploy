/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

export async function funcaoB(inf = {}) {
    let nameFun = `funcaoB`; console.log(nameFun);
    try {

        console.log('ICON', _resources['iconBlue'] ? 'iconBlue' : 'iconAqui');

        let imagemBase64 = _resources['iconBlue'] || _resources['iconAqui'];
        let title = inf.title || 'TITULO', text = inf.text || 'TEXTO';
        // chrome.notifications.create('ID_' + Date.now(), { 'type': 'basic', 'iconUrl': imagemBase64, title, 'message': text, 'priority': 2, });

        let retFuncao;
        retFuncao = await funcaoC(inf); // console.log(retFuncao);

        return { 'ret': true, 'msg': `OK: ${nameFun}`, 'res': retFuncao, };

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}



