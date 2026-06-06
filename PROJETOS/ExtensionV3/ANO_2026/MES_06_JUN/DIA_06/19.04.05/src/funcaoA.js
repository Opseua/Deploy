/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

async function funcaoA(inf = {}) {
    let nameFun = `funcaoA`; console.log(nameFun);
    try {

        let abas = await chrome.tabs.query({}); console.log(abas);

        let retFun;
        retFun = await funcaoB({ 'title': 'AAA', }); // console.log(retFun);

        // console.log(_resources.configNew);

        return { 'ret': true, 'msg': `OK: ${nameFun}`, 'res': retFun, };

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}

globalThis['funcaoA'] = funcaoA;


