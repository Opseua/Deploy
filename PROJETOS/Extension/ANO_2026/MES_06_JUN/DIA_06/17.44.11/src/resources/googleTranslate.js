// let infGoogleTranslate, retGoogleTranslate;
// infGoogleTranslate = { e, 'source': 'auto', 'target': 'pt', 'text': `Hi, what your name?`, };
// retGoogleTranslate = await googleTranslate(infGoogleTranslate); console.log(retGoogleTranslate);

let e = currentFile(new Error()), ee = e; let libs = { 'cheerio': {}, };
async function googleTranslate(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        /* IMPORTAR BIBLIOTECA [NODE] */ if (libs['cheerio']) { libs['cheerio']['cheerio'] = 1; libs = await importLibs(libs, 'googleTranslate'); }

        let { source, target, text, } = inf;

        let retApi = await api({ e, 'method': 'GET', 'url': `https://translate.google.com/m?sl=${source}&tl=${target}&q=${encodeURIComponent(text)}&hl=pt-BR`, });
        if (!retApi.ret) { return retApi; } else { retApi = retApi.res; }
        let res = retApi.body;
        let retRegex = regex({ e, 'pattern': 'class="result-container">(.*?)</div>', 'text': res, });
        if (!retRegex.ret) {
            return ret;
        }
        let dom, $;
        if (eng) { // CHROME
            dom = new DOMParser().parseFromString(retRegex.res['3'], 'text/html').documentElement.textContent;
        } else { // NODE
            $ = _cheerio.load(retRegex.res['3']);
            dom = _cheerio.load($('body').html())('body').text();
        }
        ret['res'] = dom;
        ret['msg'] = `GOOGLE TRANSLATE: OK`;
        ret['ret'] = true;

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['googleTranslate'] = googleTranslate;


