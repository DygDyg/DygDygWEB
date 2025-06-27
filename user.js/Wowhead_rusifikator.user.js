// ==UserScript==
    // @name         Wowhead русификатор
    // @namespace    http://tampermonkey.net/
    // @version      1.1
    // @description  Переводит на русский описания предметов с вовхеда
    // @author       ДугДуг
    // @match        *://*/*
	// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.wowhead.com
	// @updateURL    https://dygdyg.github.io/DygDygWEB/DygDygWEB/user.js/Wowhead_rusifikator.user.js
	// @downloadURL  https://dygdyg.github.io/DygDygWEB/DygDygWEB/user.js/Wowhead_rusifikator.user.js
    // @grant        none
    // ==/UserScript==

    (function() {
        // Проверяем наличие скрипта power.js
        const hasPowerScript = Array.from(document.scripts).some(script =>
            script.src === 'https://wow.zamimg.com/widgets/power.js'
        );
        // Если скрипт power.js найден, выполняем замену ссылок
        if (hasPowerScript) {
            const links = document.querySelectorAll('a[href*="wowhead.com"]');
            links.forEach(link => {
                link.href = link.href.replace('https://www.wowhead.com', 'https://ru.wowhead.com')
                                    .replace('https://wowhead.com', 'https://ru.wowhead.com');
            });
        }
    })();
