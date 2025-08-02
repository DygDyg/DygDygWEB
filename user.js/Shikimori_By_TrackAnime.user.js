// ==UserScript==
// @name         Shikimori By TrackAnime
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Добавляет кнопку перехода на сайт track-anime.dygdyg.ru
// @author       ДугДуг
// @match        https://shikimori.one/*
// @icon         https://dygdyg.github.io/DygDygWEB/user.js/Shikimori_By_TrackAnime.user.png
// @grant        GM_addStyle
// ==/UserScript==



function load() {
    const id = window.location.pathname.split('/').at(-1).split('-').at(0)
    const tr_link = document.createElement("div")
    document.body.querySelector('.c-about').prepend(tr_link);
    tr_link.innerHTML = `
    <div class="line" style="margin-bottom: 5px;">
<div class="value"><a class="ta_link b-tag bubbled-processed"
        data-href="" data-predelay="350"
        href="https://track-anime.dygdyg.ru/?shikimori_id=${id}"><span class="genre-en">URL</span><span class="genre-ru">Перейти на track-anime</span></a></div>
</div>
`

};


setInterval(() => {
if (document.body.querySelector('.c-about') && !document.querySelector('.ta_link')){
    load()
}
}, 1000);