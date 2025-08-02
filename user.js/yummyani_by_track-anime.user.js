// ==UserScript==
// @name         yummyani by track-anime
// @namespace    http://tampermonkey.net/
// @version      2025-08-02
// @description  Добавляет кнопку на track-anime.dygdyg.ru на сайт yummyani.me
// @author       ДугДуг
// @match        https://site.yummyani.me/catalog/item/*

// @icon         https://www.google.com/s2/favicons?sz=64&domain=yummyani.me
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`.content-ref-ids .link.track-anime-color .logo-ref {
    height: 20px;
    width: 20px;
    background-image: url(//track-anime.dygdyg.ru/favicon.png);
}



.content-ref-ids .link.track-anime-color {
    background-color: #0d6efd;
    color: #ffffff;
}`);
 const element = document.querySelector('.content-ref-ids');
if (element) {
    element.insertAdjacentHTML('beforeend', `
        <a class="track-anime-color link" data-balloon="track-anime" data-balloon-pos="down" target="_blank" href="" aria-label="track-anime">
            <div class="track-anime logo-ref"></div>
            <span>TA</span>
        </a>
    `);
}

const button = document.querySelector('.track-anime-color')
button.href = `//track-anime.dygdyg.ru/?shikimori_id=${document.querySelector(".shikimori-color.link").href.split("/").pop()}`
