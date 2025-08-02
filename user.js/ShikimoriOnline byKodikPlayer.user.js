// ==UserScript==
// @name         Shikimori Online by kodik player
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Добавляет кодик плеер на шикимори
// @author       ДугДуг
// @match        https://shikimori.one/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikimori.one
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
#kodik {
    width: 100%;
    aspect-ratio: 16/9;
}
`)


function load() {
		const id = window.location.pathname.split('/').at(-1).split('-').at(0)
		const kodik = document.createElement("div")

		kodik.innerHTML = `<iframe src="//kodik.info/find-player?shikimoriID=${id}&camrip=false" frameborder="0" id="kodik" AllowFullScreen allow="autoplay *; fullscreen *"></iframe>`



		document.body.querySelector('.c-about').appendChild(kodik);
};


setInterval(() => {
	if (document.querySelector('.c-about') !== null && document.querySelector('#kodik') == null) {
		load()
	}
}, 500);