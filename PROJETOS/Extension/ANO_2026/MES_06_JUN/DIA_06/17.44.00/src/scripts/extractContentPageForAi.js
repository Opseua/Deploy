/* eslint-disable no-undef */

async function extractContentPageForAi(inf = {}) {

    let resolveIgnoreTags = function (ignoreTagsBase) {
        let finalIgnore = new Set(ignoreTagsBase);

        let alwaysIgnore = [
            'SCRIPT',
            'STYLE',
            'META',
            'LINK',
            'NOSCRIPT',
        ];

        for (let tag of alwaysIgnore) {
            finalIgnore.add(tag);
        }

        let conditionalTags = [
            'FORM',
            'NAV',
            'HEADER',
            'ASIDE',
            'FOOTER',
        ];

        let shouldIgnore = function (elements) {
            let totalText = 0;
            let interactive = 0;
            let semantic = 0;

            for (let el of elements) {
                let text = el.innerText || '';
                totalText += text.replace(/\s+/g, ' ').trim().length;

                interactive += el.querySelectorAll(
                    'input, textarea, select, button'
                ).length;

                semantic += el.querySelectorAll(
                    'p, h1, h2, h3, h4, h5, h6, li, article, section'
                ).length;
            }

            if (totalText < 300) {
                return true;
            }

            if (interactive > semantic * 2) {
                return true;
            }

            return false;
        };

        for (let tag of conditionalTags) {
            let elements = Array.from(document.getElementsByTagName(tag));

            if (elements.length === 0) {
                finalIgnore.add(tag);
                continue;
            }

            if (shouldIgnore(elements)) {
                finalIgnore.add(tag);
            } else {
                finalIgnore.delete(tag);
            }
        }

        let inputs = Array.from(document.getElementsByTagName('input'));

        if (inputs.length) {
            let longHidden = inputs.filter(i =>
                i.type === 'hidden' &&
                (i.value || '').length > 300
            );

            if (longHidden.length === 0) {
                finalIgnore.add('INPUT');
            } else {
                finalIgnore.delete('INPUT');
            }
        }

        return finalIgnore;
    };

    let ignoreTags = new Set([
        'STYLE',
        'BUTTON',
    ]);

    ignoreTags = resolveIgnoreTags(ignoreTags);

    let boilerplateClasses = new Set([
        'ads', 'advertisement', 'sidebar', 'widget', 'popup', 'modal', 'cookie',
    ]);

    let counters = {
        'section': 0, 'paragraph': 0, 'list': 0, 'link': 0,
        'table': 0, 'image': 0, 'blockquote': 0,
    };

    let sectionStack = [];

    let isBoilerplate = function (node) {
        let cls = '';

        if (typeof node.className === 'string') {
            cls = node.className;
        } else if (node.getAttribute) {
            cls = node.getAttribute('class') || '';
        }

        if (!cls) {
            return false;
        }

        let classes = cls.toLowerCase().split(/\s+/);
        return classes.some(c => boilerplateClasses.has(c));
    };

    let walk = function (node) {

        // ✅ TEXTO REAL — ESSENCIAL
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent.replace(/\s+/g, ' ').trim();
            if (!text) {
                return '';
            }
            return text + ' ';
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        if (ignoreTags.has(node.tagName)) {
            return '';
        }

        if (isBoilerplate(node)) {
            return '';
        }

        let tagName = node.tagName.toUpperCase();
        let section = sectionStack.length ? sectionStack[sectionStack.length - 1].id : null;
        let out = '';

        if (tagName.match(/^H[1-6]$/)) {
            let level = Number(tagName[1]);
            counters.section++;
            let id = counters.section;
            sectionStack.push({ id, level, });

            let title = '';

            for (let child of node.childNodes) {
                title += walk(child);
            }

            title = title.replace(/\s+/g, ' ').trim();

            out += '\n\n' + '#'.repeat(level) + ' [SEC-' + id + '] ' + title + '\n';
            return out;
        }

        if (tagName === 'P') {
            let text = '';
            for (let child of node.childNodes) {
                text += walk(child);
            }
            text = text.replace(/\s+/g, ' ').trim();
            if (!text) { return ''; }
            counters.paragraph++;
            return '\n**P' + counters.paragraph + (section ? '-S' + section : '') + '**: ' + text + '\n';
        }

        if (tagName === 'UL' || tagName === 'OL') {
            let items = Array.from(node.querySelectorAll('li'))
                .map(li => li.innerText.replace(/\s+/g, ' ').trim())
                .filter(Boolean)
                .map(t => (tagName === 'OL' ? '1. ' : '- ') + t)
                .join('\n');

            if (!items) { return ''; }
            counters.list++;
            return '\n**LIST' + counters.list + (section ? '-S' + section : '') + '**\n' + items + '\n';
        }

        if (tagName === 'BLOCKQUOTE') {
            let text = node.innerText.replace(/\s+/g, ' ').trim();
            if (!text) { return ''; }
            counters.blockquote++;
            return '\n> **QUOTE' + counters.blockquote + '**: ' + text + '\n\n';
        }

        if (['MAIN', 'ARTICLE', 'SECTION',].includes(tagName)) {
            out += '\n**[' + tagName + ' START' + (section ? '-S' + section : '') + ']**\n';
        }

        for (let child of node.childNodes) {
            out += walk(child);
        }

        if (['MAIN', 'ARTICLE', 'SECTION',].includes(tagName)) {
            out += '\n**[' + tagName + ' END' + (section ? '-S' + section : '') + ']**\n';
        }

        return out;
    };

    let header = '# [SITE EXTRAÍDO]\n\n';
    header += `**URL**: ${location.href}\n`;
    header += `**TÍTULO**: ${document.title}\n`;
    header += `**LINGUA**: ${document.documentElement.lang || 'pt'}\n`;
    header += `**DESCRIÇÃO**: ${document.querySelector('meta[name="description"]')?.content || ''}\n\n`;

    let content = walk(document.body)
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+\n/g, '\n')
        .trim()
        .substring(0, 50000);

    let resultados = header + content;
    console.clear(); console.log(resultados);

    resultados = [resultados,];

    // @@@ NOVO BLOCO
    if (!!inf.newAction) { if (resultados.length === 0) { resultados = [[],]; } else { resultados = [resultados,]; } } // REMOVER ISSO NO FUTURO E RETIRAR 'retExeS = retExeS[0]' DA 'chromeActions'
    // @@@ NOVO BLOCO

    return resultados;

}

// CHROME | NODE
globalThis['extractContentPageForAi'] = extractContentPageForAi;


