async function funcaoC(inf = {}) {
    let nameFun = `funcaoC`; console.log(nameFun);
    try {

        return { 'ret': true, 'msg': `OK: ${nameFun}`, 'res': inf, };

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}

export { funcaoC };


