/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

async function serverRun(inf = {}) { // gCnpHKjkwihhUd 
    let nameFun = `serverRun`; console.log(nameFun);
    try {

        let imports = {
            'resources': [
                { 'filePath': `src/funcaoA.js`, },

                { 'filePath': `src/funcaoB.js`, },
                { 'filePath': `src/media/iconBlue.png`, 'varNameAAA': 'iconAqui', },

                { 'filePath': `src/funcaoC.js`, },

                { 'filePath': 'src/config.json', 'varNameAAA': 'newName', 'keepInStringAAA': true, },
            ],
        };
        await resourceImport({ imports, });

        let retFun;
        retFun = await funcaoA({});
        console.log(retFun);

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}

globalThis['serverRun'] = serverRun;


