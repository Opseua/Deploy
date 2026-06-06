// let infObjFilter, retObjFilter;
// let obj = { 'comida': 'carro', 'cadeira': { 'moto': 'carro', 'comida': 'carro', }, };
// infObjFilter = { e, obj, 'noCaseSensitive': true, 'keys': ['MOto',], 'filters': [{ 'includes': ['*cadeira*',], }, { 'excludes': ['*cadeira.comida*',], },], };
// infObjFilter = { e, obj, 'noCaseSensitive': true, 'values': ['CArro',], 'filters': [{ 'includes': ['*cadeira*',], }, { 'excludes': ['*cadeira.comida*',], },], };
// retObjFilter = await objFilter(infObjFilter); console.log(retObjFilter);

let e = currentFile(new Error()), ee = e;
async function objFilter(inf = {}) {
    let ret = { 'ret': false, }; e = inf.e || e;
    try {
        let { obj, noCaseSensitive, keys, values, filters, split, } = inf; let results = [];

        function search(cur, path = []) {
            if (typeof cur === 'object' && cur !== null) {
                for (let key in cur) {
                    if (cur.hasOwnProperty(key)) {
                        if (keys && Array.isArray(keys) && keys.length > 0) {
                            if ((noCaseSensitive ? keys.map(v => typeof v === 'string' ? v.toLowerCase() : v).includes(typeof key === 'string' ? key.toLowerCase() : key) : keys.includes(key))) {
                                // CHECA SE EXISTE: KEY
                                results.push({ 'key': path.concat(key).join(split || '.'), 'value': cur[key], });
                            }
                        } else if (values && Array.isArray(values) && values.length > 0) {
                            if ((noCaseSensitive ? values.map(v => typeof v === 'string' ? v.toLowerCase() : v).includes(typeof cur[key] === 'string' ? cur[key].toLowerCase() : cur[key]) : values.includes(cur[key]))) {
                                // CHECA SE EXISTE: VALUE
                                results.push({ 'key': path.concat(key).join(split || '.'), 'value': cur[key], });
                            }
                        }
                        search(cur[key], path.concat(key));
                    }
                }
            }
        }

        search(obj);

        // FILTRAR OS RESULTADOS
        function filter(inf = {}) {
            let resultsOk = [], { results, filters, } = inf;
            for (let [index, value,] of results.entries()) {
                let regexRes = [];
                for (let [index, value1,] of (filters.includes || filters.excludes).entries()) {
                    let regexRet = regex({ e, 'simple': true, 'pattern': noCaseSensitive ? value1.toLowerCase() : value1, 'text': noCaseSensitive ? value.key.toLowerCase() : value.key, });
                    regexRes.push(filters.includes ? regexRet : !regexRet);
                }
                if (regexRes.includes(true)) {
                    resultsOk.push(value);
                }
            }
            return resultsOk;
        }

        // REFILTRA OS RESULTADOS
        if (filters && Array.isArray(filters) && filters.length > 0) {
            for (let [index, value,] of filters.entries()) {
                if (value && ((value.includes && Array.isArray(value.includes) && value.includes.length > 0) || (value.excludes && Array.isArray(value.excludes) && value.excludes.length > 0))) {
                    results = filter({ results, 'filters': value, });
                }
            }
        }

        ret['ret'] = true;
        ret['msg'] = `OBJ FILTER: OK`;
        ret['res'] = [...new Map(results.map(i => [i.key, i,])).values(),]; // REMOVER DUPLICATAS

    } catch (catchErr) {
        let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
    }

    return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['objFilter'] = objFilter;


