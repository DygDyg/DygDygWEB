// ==UserScript==
// @name         Кинопоиск kodik online
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Плагин добавляет кнопку на кинопоиск для просмотре фильмов, серриалов и аниме
// @author       ДугДуг
// @run-at       document-end
// @match        https://www.kinopoisk.ru/series/*
// @match        https://www.kinopoisk.ru/film/*

// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        window.onurlchange
// @grant        GM_addStyle
// ==/UserScript==


GM_addStyle(` #banner-kino-kodik { width: 32px; height: 128px; position: fixed; top: -60px; left: 60px; z-index: 1; cursor: pointer; transition: all 0.2s; } #banner-kino-kodik:hover { top: -50px; } `);

if (!window.onurlchange) {
    window.addEventListener('urlchange', _ => setTimeout(updateBanner, 250))
}

function removeBanner() {
    document.getElementById('banner-kino-kodik')?.remove()
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function createBanner(id, type) {
    removeBanner()
    const el = document.createElement('a')
    const nextData = document.querySelector('#__next script')?.textContent
    const link = location.pathname.split('/').filter(Boolean)
    el.id = 'banner-kino-kodik'
    el.innerHTML = '<svg viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg"><path fill="blue" d="M128,0L0,0L0,512L64,480L128,512L128,0Z" /><path fill="white" transform="matrix(1,0,0,1,-64,0)" d="M168,382C168,360.057 149.943,342 128,342C106.057,342 88,360.057 88,382C88,403.943 106.057,422 128,422L165,422L168,410L162,410L160,414L152,414C162.065,406.452 168,394.581 168,382ZM96,382C96,364.445 110.445,350 128,350C145.555,350 160,364.445 160,382C160,399.555 145.555,414 128,414C110.445,414 96,399.555 96,382ZM128,393C132.415,393 136,396.585 136,401C136,405.415 132.415,409 128,409C123.585,409 120,405.415 120,401C120,396.585 123.585,393 128,393ZM144,383C148.415,383 152,386.585 152,391C152,395.415 148.415,399 144,399C139.585,399 136,395.415 136,391C136,386.585 139.585,383 144,383ZM112,383C116.415,383 120,386.585 120,391C120,395.415 116.415,399 112,399C107.585,399 104,395.415 104,391C104,386.585 107.585,383 112,383ZM144,365C148.415,365 152,368.585 152,373C152,377.415 148.415,381 144,381C139.585,381 136,377.415 136,373C136,368.585 139.585,365 144,365ZM112,365C116.415,365 120,368.585 120,373C120,377.415 116.415,381 112,381C107.585,381 104,377.415 104,373C104,368.585 107.585,365 112,365ZM128,355C132.415,355 136,358.585 136,363C136,367.415 132.415,371 128,371C123.585,371 120,367.415 120,363C120,358.585 123.585,355 128,355Z" /></svg>';
    el.href = `//dygdyg.github.io/DygDygWEB/kodik.htm?kinopoiskID=${link[1]}`
    document.body.appendChild(el)
}

function updateBanner() {
    const link = location.pathname.split('/').filter(Boolean)

    if (!['film', 'series'].includes(link[0]) || !link[1]) {
        removeBanner()
    } else {
        createBanner(link[1], link[0])
    }
}
