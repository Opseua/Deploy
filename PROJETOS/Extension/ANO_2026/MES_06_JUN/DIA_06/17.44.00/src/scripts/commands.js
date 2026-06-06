let e = currentFile(new Error()), ee = e;
async function commands(inf = {}) {
  let ret = { 'ret': false, }; e = inf.e || e;
  try {
    let { type, /*origin,*/ } = inf;

    let textPrompt;
    if (type === 'shortcut_1') {
      let retChromeActions = await chromeActions({ e, 'action': 'prompt', 'title': `NOME DO COMANDO`, });

      if (!retChromeActions.ret) {
        return retChromeActions;
      } else {
        textPrompt = retChromeActions.res;
      }
    }

    let textPromptLower = textPrompt.toLowerCase();
    if (textPromptLower === 'zz' || textPromptLower === 'xx' || textPromptLower === 'cc' || ['http://', 'https://', 'www.',].some(a => textPromptLower.includes(a))) {

      textPrompt = !textPrompt.includes('/maps/place/') ? textPrompt : textPrompt.match(/^.*?@-?[\d.]+,-?[\d.]+/)[0];

      // COMPLETAR JULGAMENTO
      tryRatingComplete({ e, 'origin': 'prompt', textPrompt, });

    } else if ((/^(?:[^\t]*\t){4}[^\t]*$/).test(textPrompt)) {

      // INDICAÇÃO AUTOMÁTICA
      clientInputChrome({ 'lead': textPrompt, 'origin': 'ATALHO', });

    }

    ret['msg'] = `COMMANDS: OK`;
    ret['ret'] = true;

  } catch (catchErr) {
    let retRegexE = await regexE({ inf, 'e': catchErr, }); ret['msg'] = retRegexE.res; ret['ret'] = false; delete ret['res'];
  }

  return { ...({ 'ret': ret.ret, }), ...(ret.msg && { 'msg': ret.msg, }), ...(ret.hasOwnProperty('res') && { 'res': ret.res, }), };
}

// CHROME | NODE
globalThis['commands'] = commands;


