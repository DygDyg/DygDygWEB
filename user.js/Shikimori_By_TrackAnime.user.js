// ==UserScript==
// @name         Shikimori By TrackAnime
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       ДугДуг
// @match        https://shikimori.one/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikimori.one
// @grant        GM_addStyle
// ==/UserScript==



function load() {
    const id = window.location.pathname.split('/').at(-1).split('-').at(0)
    const tr_link = document.createElement("div")
    document.body.querySelector('.c-about').prepend(tr_link);
    tr_link.innerHTML = `
    <div class="line">
<div class="value"><a class="ta_link b-tag bubbled-processed"
        data-href="" data-predelay="350"
        href="https://track-anime.github.io/?shikimori_id=${id}"><span class="genre-en">URL</span><span class="genre-ru">Перейти на track-anime</span></a></div>
</div>
`
    
};


setInterval(() => {
if (document.body.querySelector('.c-about') && !document.querySelector('.ta_link')){
    load()
}
}, 1000);