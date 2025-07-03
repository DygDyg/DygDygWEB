// ==UserScript==
// @name         Wowhead русификатор
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Переводит на русский описания предметов с вовхеда
// @author       ДугДуг
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.wowhead.com
// @updateURL    https://dygdyg.github.io/DygDygWEB/user.js/Wowhead_rusifikator.user.js
// @downloadURL  https://dygdyg.github.io/DygDygWEB/user.js/Wowhead_rusifikator.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==


rusification()
setInterval(() => {
   rusification()
}, 3000);
function rusification()
{
 const links = document.querySelectorAll('a[href*="wowhead.com"]:not([href*="ru.wowhead.com"])');
if (links.length == 0) return
console.log("Переведено: ", links.length)
    links.forEach(link => {
        link.href = link.href.replace(/https:\/\/(?!ru\.wowhead\.com)[^\/]*wowhead\.com/, 'https://ru.wowhead.com');
           // .replace('https://wowhead.com', 'https://ru.wowhead.com');
    });
}





