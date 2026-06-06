globalThis['firstFileCall'] = new Error(); await import('./resources/@export.js'); let e = firstFileCall, ee = e;
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function clearConsole() { if ((typeof chrome !== 'undefined')) { console.clear(); } else { let p = process.stdout; p.write('\u001b[2J\u001b[0;0H'); p.write('\x1Bc'); } } let msgQtd = 0;
let runCleCon = console.log; console.log = (...a) => { runCleCon.apply(console, a); msgQtd++; if (msgQtd >= (30 * 1)) { clearConsole(); msgQtd = 0; console.log('CONSOLE LIMPO!\n'); } }; clearConsole();
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

import https from 'node:https';

let token = '7bac1577-b42c-4478-af95-ebaf9b059b59-4ef73dd7-f10f-4ef2-b157-627fb8871d11';

let request = (path, method = 'GET', queryParams = {}) => {
    // Converte o objeto para string de consulta (ex: ?key=value&a=b)
    // eslint-disable-next-line no-undef
    let searchParams = new URLSearchParams(queryParams).toString();
    let fullPath = searchParams ? `${path}?${searchParams}` : path;

    let options = {
        'hostname': 'api.cnpja.com',
        'path': fullPath,
        method,
        'headers': {
            'Authorization': token,
        },
    };

    return new Promise((resolve, reject) => {
        let req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`Erro ${res.statusCode} ao fazer ${method} em ${fullPath}`));
                }
                try {
                    resolve(data ? JSON.parse(data) : null);
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
};

let cleanupLists = async () => {
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 15);

    try {
        let response = await request('/list', 'GET', { 'limit': 999, });
        let records = response.records || [];
        let count = 0;

        for (let [index, list,] of records.entries()) {
            let dateTarget = new Date(list.created);
            if (dateTarget < thirtyDaysAgo) {
                console.log(`🗑️ Removendo lista: ${list.title} (${list.id})`);
                await request(`/list/${list.id}`, 'DELETE');
                count++;
            }
        }

        console.log(`\n✅ Sucesso: ${count} listas removidas.`);
    } catch (error) {
        console.error('❌ Falha no processo:', error.message);
    }
};

await cleanupLists();