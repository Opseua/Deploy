// → NO FINAL DO ARQUIVO

let e = currentFile(new Error()), ee = e; let libs = { 'cheerio': {}, };
async function tableHtmlToJson(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        /* IMPORTAR BIBLIOTECA [NODE] */ if (!eng && libs['cheerio']) { libs['cheerio']['cheerio'] = 1; libs = await importLibs(libs, 'tableHtmlToJson'); }

        let { html, mode = 'new', object = true, } = inf; let result = [];

        if (mode !== 'new') {

            // ############## REMOVER ISSO E USAR APENAS O NOVO MÉTODO ##############

            // MODO ANTIGO (NODE)
            let $ = _cheerio.load(html), headers = [], randomCol = !(mode === 1), hasHeader = $('table thead').length > 0;

            // SE CONTEM O CABEÇALHO 
            if (hasHeader) { $('table thead th').each((i, header) => { headers.push(randomCol ? `col${i + 1}` : $(header).text().trim()); }); }
            $('table tbody tr').each((index, row) => {
                let rowData = {}; $(row).find('td').each((i, cell) => { let key = hasHeader ? headers[i] : `col${i + 1}`; rowData[key] = $(cell).text().trim(); });
                if (!hasHeader && index === 0) { result.push(Object.fromEntries(Object.entries(rowData).map(([key, value,]) => [key, value,]))); } else { result.push(rowData); }
            });
            if (mode === 3) {
                let keys = Object.values(result[0]); result = result.slice(1).map(obj => { let newObj = {}; keys.forEach((key, index) => { newObj[key] = obj[`col${index + 1}`]; }); return newObj; });
            }
        } else {
            // MODO NOVO (CHROME/NODE/GOOGLE)
            let linhas = [], trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []; for (let i = 0; i < trMatches.length; i++) {
                let tr = trMatches[i], tdMatches = tr.match(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi) || [], colunas = [];
                for (let j = 0; j < tdMatches.length; j++) { let conteudo = tdMatches[j].replace(/<\/?[^>]+>/g, '').trim(); colunas.push(conteudo); } linhas.push(colunas);
            }
            // ORGANIZAR RETORNO
            function formatParsedTable(parsedData) {
                if (!Array.isArray(parsedData) || parsedData.length === 0) { return []; }
                let maxCols = 0; for (let i = 0; i < parsedData.length; i++) { if (parsedData[i].length > maxCols) { maxCols = parsedData[i].length; } }
                let headerRow = parsedData[0], headerObj = {}; for (let i = 0; i < maxCols; i++) { headerObj[`col${i + 1}`] = headerRow[i] || `col${i + 1}`; } result.push(headerObj);
                for (let i = 1; i < parsedData.length; i++) { let row = parsedData[i], obj = {}; for (let j = 0; j < maxCols; j++) { obj[`col${j + 1}`] = row[j] || ''; } result.push(obj); } return result;
            }
            result = formatParsedTable(linhas);
        }

        ret['ret'] = true;
        ret['msg'] = `HTML TO JSON: OK`;
        ret['res'] = object ? result : JSON.stringify(result);

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['tableHtmlToJson'] = tableHtmlToJson;

// let infTableHtmlToJson, retTableHtmlToJson
// infTableHtmlToJson = {
//     e,
//     // TEM O CABEÇALHO [SIM]
//     'html':
//         `
//
//     <table>
//         <thead>
//             <tr>
//                 <th>Nome</th>
//                 <th>Idade</th>
//                 <th>País</th>
//             </tr>
//         </thead>
//         <tbody>
//             <tr>
//                 <td>Amanda</td>
//                 <td>20</td>
//                 <td>Brasil</td>
//             </tr>
//             <tr>
//                 <td>Brenda</td>
//                 <td>25</td>
//                 <td>EUA</td>
//             </tr>
//             <tr>
//                 <td>Carlos</td>
//                 <td>30</td>
//                 <td>Japão</td>
//             </tr>
//         </tbody>
//     </table>
//
//     `,
// };

// infTableHtmlToJson = {
//     e,
//     // TEM O CABEÇALHO [NÃO]
//     'html':
//         `
//
//     <table>
//         <tbody>
//             <tr>
//                 <td>Amanda</td>
//                 <td>20</td>
//                 <td>Brasil</td>
//             </tr>
//             <tr>
//                 <td>Brenda</td>
//                 <td>25</td>
//                 <td>EUA</td>
//             </tr>
//             <tr>
//                 <td>Carlos</td>
//                 <td>30</td>
//                 <td>Japão</td>
//             </tr>
//         </tbody>
//     </table>
//
//     `,
// };

// retTableHtmlToJson = await tableHtmlToJson(infTableHtmlToJson); console.log(retTableHtmlToJson);


